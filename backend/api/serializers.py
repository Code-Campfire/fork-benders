from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, UserProfile


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


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model - handles study preferences."""
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'email',
            'display_name',
            'default_translation',
            'review_goal_per_day',
            'notif_hour',
            'accessibility_json',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['email', 'created_at', 'updated_at']

    def validate_review_goal_per_day(self, value):
        """Validate review_goal_per_day is between 1 and 100."""
        if value is not None and (value < 1 or value > 100):
            raise serializers.ValidationError(
                "Review goal must be between 1 and 100 verses per day."
            )
        return value

    def validate_notif_hour(self, value):
        """Validate notif_hour is between 0 and 23, or null."""
        if value is not None and (value < 0 or value > 23):
            raise serializers.ValidationError(
                "Notification hour must be between 0 and 23, or leave empty."
            )
        return value