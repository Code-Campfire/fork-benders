from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, UserHabit, RecentVerse


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
        fields = ['id', 'habit', 'frequency', 'purpose', 'day', 'time', 'reminder']
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