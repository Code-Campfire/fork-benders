from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, UserHabit, RecentVerse, StudyNote, UserProfile


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ('email', 'password', 'password_confirm')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            is_active=True
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    remember_me = serializers.BooleanField(default=False)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(email=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Email and password are required.')
        
        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'is_active', 'created_at', 'last_login')
        read_only_fields = ('id', 'created_at', 'last_login')


class HabitSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserHabit
        fields = ['id', 'habit', 'frequency', 'purpose', 'time', 'location', 'skipped']
        read_only_fields = ['id']


class RecentVerseSerializer(serializers.ModelSerializer):
    verse_text = serializers.CharField(source='verse.text', read_only=True)
    verse_reference = serializers.SerializerMethodField()
    book_name = serializers.CharField(source='book.short_name', read_only=True)

    class Meta:
        model = RecentVerse
        fields = ['id', 'verse', 'verse_text', 'verse_reference', 'book_name', 'chapter', 'last_accessed']
        read_only_fields = ['id', 'last_accessed']

    def get_verse_reference(self, obj):
        return f"{obj.book.short_name} {obj.chapter}:{obj.verse.verse_num}"


class DashboardSerializer(serializers.Serializer):
    current_habit = HabitSerializer(read_only=True, allow_null=True)
    recent_verses = RecentVerseSerializer(many=True, read_only=True)


class StudyNoteSerializer(serializers.ModelSerializer):
    """Serializer for study notes with offline sync support."""

    class Meta:
        model = StudyNote
        fields = ['id', 'verse', 'verse_reference', 'content', 'created_at', 'updated_at', 'synced_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Auto-assign the logged-in user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)



class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with nested user data."""

    email = serializers.EmailField(source='user.email', read_only=True)
    avatar = serializers.ImageField(source='user.avatar', read_only=True)
    avatar_url = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(source='user.created_at', read_only=True)
    last_login = serializers.DateTimeField(source='user.last_login', read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'email',
            'avatar',
            'avatar_url',
            'display_name',
            'default_translation',
            'review_goal_per_day',
            'notif_hour',
            'accessibility_json',
            'created_at',
            'last_login'
        ]

    def get_avatar_url(self, obj):
        """Return full URL for avatar if it exists."""
        if obj.user.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user.avatar.url)
        return None

    def validate_review_goal_per_day(self, value):
        """Validate review goal is between 1 and 100."""
        if value < 1 or value > 100:
            raise serializers.ValidationError('Review goal must be between 1 and 100.')
        return value

    def validate_notif_hour(self, value):
        """Validate notification hour is between 0 and 23."""
        if value is not None and (value < 0 or value > 23):
            raise serializers.ValidationError('Notification hour must be between 0 and 23.')
        return value