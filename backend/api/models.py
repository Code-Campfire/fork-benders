from django.db import models


class TranslationTest(models.Model):
    """Temporary test model - DELETE when real models arrive"""
    code = models.TextField(unique=True, null=True, blank=True)
    name = models.TextField(null=True, blank=True)
    license = models.TextField(null=True, blank=True)
    is_public = models.BooleanField(default=True)

    class Meta:
        db_table = 'translations'

    def __str__(self):
        return f"{self.code}: {self.name}"


class BookTest(models.Model):
    """Temporary test model - DELETE when real models arrive"""
    TESTAMENT_CHOICES = [
        ('OT', 'Old Testament'),
        ('NT', 'New Testament'),
    ]

    canon_order = models.IntegerField(null=True, blank=True)
    name = models.TextField(null=True, blank=True)
    short_name = models.TextField(null=True, blank=True)
    testament = models.CharField(max_length=2, choices=TESTAMENT_CHOICES, null=True, blank=True)

    class Meta:
        db_table = 'books'

    def __str__(self):
        return f"{self.name} ({self.testament})"


class VerseTest(models.Model):
    """Temporary test model - DELETE when real models arrive"""
    translation = models.ForeignKey(TranslationTest, on_delete=models.CASCADE, null=True, blank=True)
    book = models.ForeignKey(BookTest, on_delete=models.CASCADE, null=True, blank=True)
    chapter = models.IntegerField(null=True, blank=True)
    verse_num = models.IntegerField(null=True, blank=True)
    text = models.TextField(null=True, blank=True)
    text_len = models.IntegerField(null=True, blank=True)
    tokens_json = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = 'verses'

    def __str__(self):
        return f"{self.book.name} {self.chapter}:{self.verse_num}"
