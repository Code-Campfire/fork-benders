import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class CustomUserManager(BaseUserManager):
    """Custom user manager for email-based authentication."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """Custom user model with email as the unique identifier."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, max_length=255)
    password = models.CharField(max_length=255)
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    last_login = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'custom_user'

    def __str__(self):
        return self.email


class Translation(models.Model):
    """Bible translations (KJV, NIV, etc.)."""

    code = models.CharField(max_length=50, unique=True, help_text="e.g., KJV, NIV")
    name = models.TextField(help_text="Full name like 'King James Version'")
    license = models.TextField(blank=True, help_text="e.g., public domain")
    is_public = models.BooleanField(default=True)

    class Meta:
        db_table = 'translations'

    def __str__(self):
        return f"{self.code} - {self.name}"


class UserProfile(models.Model):
    """User profile with preferences and settings."""

    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='profile'
    )
    display_name = models.TextField(null=True, blank=True, help_text="For future social features")
    default_translation = models.ForeignKey(
        Translation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="KJV by default"
    )
    review_goal_per_day = models.IntegerField(default=10, help_text="For streak/progress")
    notif_hour = models.IntegerField(
        null=True,
        blank=True,
        help_text="0-23; local notifications"
    )
    accessibility_json = models.JSONField(
        null=True,
        blank=True,
        help_text="UI preferences: font size, high contrast, etc."
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_profile'

    def __str__(self):
        return f"Profile for {self.user.email}"


class UserHabit(models.Model):
    """User habits for tracking study patterns."""

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='habits',
        db_column='user_id'
    )
    habit = models.CharField(max_length=255)
    frequency = models.CharField(max_length=255)
    purpose = models.CharField(max_length=255)
    time = models.TimeField(verbose_name='Reminder Time')
    location = models.CharField(max_length=255, default='null')
    skipped = models.BooleanField(default=False)

    class Meta:
        db_table = 'user_habit'

    def __str__(self):
        return f"{self.user.email} - {self.habit}"


class Testament(models.TextChoices):
    """Testament enum for Old Testament and New Testament."""
    OLD_TESTAMENT = 'OT', 'Old Testament'
    NEW_TESTAMENT = 'NT', 'New Testament'


class Book(models.Model):
    """Bible books with canonical ordering."""

    canon_order = models.IntegerField(help_text="1-66 for normal canon")
    name = models.TextField(help_text="e.g., 'Proverbs'")
    short_name = models.TextField(help_text="e.g., 'Prov' for compact UI")
    testament = models.CharField(
        max_length=2,
        choices=Testament.choices,
        help_text="OT or NT"
    )

    class Meta:
        db_table = 'books'
        ordering = ['canon_order']

    def __str__(self):
        return f"{self.name} ({self.short_name})"


class Verse(models.Model):
    """Individual Bible verses with text and metadata."""

    translation = models.ForeignKey(
        Translation,
        on_delete=models.CASCADE,
        related_name='verses'
    )
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        related_name='verses'
    )
    chapter = models.IntegerField()
    verse_num = models.IntegerField()
    text = models.TextField(help_text="The actual verse text")
    text_len = models.IntegerField(help_text="Text length for filtering")
    tokens_json = models.JSONField(
        null=True,
        blank=True,
        help_text="Optional pre-tokenization for cloze"
    )

    class Meta:
        db_table = 'verses'
        unique_together = [['translation', 'book', 'chapter', 'verse_num']]
        indexes = [
            models.Index(fields=['translation', 'book', 'chapter', 'verse_num']),
            models.Index(fields=['book']),
        ]

    def __str__(self):
        return f"{self.book.short_name} {self.chapter}:{self.verse_num}"


class StudyNote(models.Model):
    """User notes on verses for study and reflection."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='study_notes'
    )
    verse = models.ForeignKey(
        Verse,
        on_delete=models.CASCADE,
        related_name='study_notes',
        null=True,
        blank=True
    )
    verse_reference = models.CharField(
        max_length=255,
        blank=True,
        help_text="Human-readable reference like 'John 3:16'"
    )
    content = models.TextField(help_text="The user's note content")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    synced_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Last time this was synced from client"
    )

    class Meta:
        db_table = 'study_notes'
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', '-updated_at']),
            models.Index(fields=['verse']),
        ]

    def __str__(self):
        return f"Note by {self.user.email} on {self.verse_reference or 'general'}"


class Deck(models.Model):
    """Collection of verses for study."""

    name = models.TextField(help_text="Display title of deck")
    is_public = models.BooleanField(default=True)
    owner = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='decks',
        help_text="null = curated/public system deck"
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'decks'
        indexes = [
            models.Index(fields=['owner']),
            models.Index(fields=['is_public', 'id']),
        ]

    def __str__(self):
        return self.name


class DeckVerse(models.Model):
    """Many-to-many join table for verses in decks with ordering."""

    deck = models.ForeignKey(
        Deck,
        on_delete=models.CASCADE,
        related_name='deck_verses'
    )
    verse = models.ForeignKey(
        Verse,
        on_delete=models.CASCADE,
        related_name='deck_verses'
    )
    sort_order = models.IntegerField()

    class Meta:
        db_table = 'deck_verses'
        unique_together = [['deck', 'verse']]
        indexes = [
            models.Index(fields=['deck', 'sort_order']),
        ]

    def __str__(self):
        return f"{self.deck.name} - {self.verse}"


class UserVerseState(models.Model):
    """Spaced repetition state for each user-verse pair."""

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='verse_states'
    )
    verse = models.ForeignKey(
        Verse,
        on_delete=models.CASCADE,
        related_name='user_states'
    )
    ease = models.FloatField(default=2.5, help_text="Higher = grows intervals faster")
    interval = models.IntegerField(default=0, help_text="Spacing in days")
    due_at = models.DateTimeField(default=timezone.now)
    repetitions = models.IntegerField(
        default=0,
        help_text="Count of consecutive successful reviews"
    )
    lapses = models.IntegerField(default=0, help_text="Count of failures")
    last_grade = models.IntegerField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_verse_state'
        unique_together = [['user', 'verse']]
        indexes = [
            models.Index(fields=['user', 'due_at']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.verse}"


class ReviewMode(models.TextChoices):
    """Review mode types."""
    CLOZE = 'cloze', 'Cloze'
    RECALL = 'recall', 'Recall'
    LISTEN = 'listen', 'Listen'


class ReviewLog(models.Model):
    """Append-only history of practice attempts for analytics."""

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='review_logs'
    )
    verse = models.ForeignKey(
        Verse,
        on_delete=models.CASCADE,
        related_name='review_logs'
    )
    ts = models.DateTimeField(default=timezone.now, help_text="When the attempt happened")
    mode = models.CharField(
        max_length=10,
        choices=ReviewMode.choices,
        help_text="cloze, recall, or listen"
    )
    grade = models.IntegerField(help_text="0-5 or 0/1")
    deck = models.ForeignKey(
        Deck,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='review_logs',
        help_text="null for global queue"
    )
    duration_ms = models.IntegerField(help_text="For speed charts")
    response_json = models.JSONField(
        null=True,
        blank=True,
        help_text="e.g., {blanks:[{i:3, guess:'discretion', ok:true}]}"
    )

    class Meta:
        db_table = 'review_logs'
        unique_together = [['user', 'verse', 'ts']]
        indexes = [
            models.Index(fields=['user', 'ts']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.verse} at {self.ts}"


class RecentVerse(models.Model):
    """Tracks recently viewed verses, max 2 per user with different book/chapter."""

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='recent_verses'
    )
    verse = models.ForeignKey(
        Verse,
        on_delete=models.CASCADE,
        related_name='recent_verse_entries'
    )
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        help_text="Denormalized for faster queries"
    )
    chapter = models.IntegerField(help_text="Denormalized for faster queries")
    last_accessed = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'recent_verses'
        unique_together = [['user', 'book', 'chapter']]
        indexes = [
            models.Index(fields=['user', 'last_accessed']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.book.short_name} {self.chapter}"
