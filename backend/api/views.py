from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework import status
from django.db import connection, transaction
from django.conf import settings
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework_simplejwt.tokens import RefreshToken
from api.models import CustomUser

from datetime import timedelta
from django.conf import settings
from django.contrib.auth import login
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django_ratelimit.decorators import ratelimit
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserSerializer,
    HabitSerializer,
    RecentVerseSerializer,
    DashboardSerializer,
    StudyNoteSerializer,
    UserProfileSerializer
)
from .models import CustomUser, UserHabit, RecentVerse, Verse, Book, StudyNote, UserProfile


@api_view(['GET'])
def health_check(request):
    db_connected = False
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            db_connected = True
    except Exception as e:
        db_connected = False
    
    return Response({
        'status': 'healthy',
        'database_connected': db_connected
    })

class GoogleLoginView(APIView):
    """Verifies Google OAuth token, creates user, and returns JWTs."""

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Verify token and extract user info
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )

            email = idinfo.get('email')
            if not email:
                return Response({'error': 'Email not provided by Google'}, status=status.HTTP_400_BAD_REQUEST)

            # Create or fetch the user
            user, created = CustomUser.objects.get_or_create(email=email)
            if created:
                user.is_active = True
                user.save()

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access = str(refresh.access_token)

            # Optionally set refresh token as HttpOnly cookie
            response = Response({
                'access_token': access,
                'email': user.email
            }, status=status.HTTP_200_OK)

            response.set_cookie(
                key='refresh_token',
                value=str(refresh),
                httponly=True,
                secure=False,  # set True in production
                samesite='Lax'
            )

            return response

        except ValueError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'User registered successfully',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        remember_me = serializer.validated_data.get('remember_me', False)
        
        # Update last login
        login(request, user)
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        # Set refresh token lifetime based on remember_me
        if remember_me:
            refresh.set_exp(lifetime=timedelta(days=30))
        
        response = Response({
            'access_token': str(access_token),
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
        
        # Set refresh token as httpOnly cookie
        max_age = 30 * 24 * 60 * 60 if remember_me else 7 * 24 * 60 * 60  # 30 days or 7 days
        response.set_cookie(
            'refresh_token',
            str(refresh),
            max_age=max_age,
            httponly=True,
            secure=not settings.DEBUG,  # Use secure in production
            samesite='Lax'
        )
        
        return response
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token_view(request):
    refresh_token = request.COOKIES.get('refresh_token')
    if not refresh_token:
        return Response({'error': 'Refresh token not found'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        refresh = RefreshToken(refresh_token)
        access_token = refresh.access_token

        # Get user object from the token payload
        user_id = refresh.payload.get('user_id')
        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)

        # Rotate refresh token
        new_refresh = RefreshToken.for_user(user)
        
        response = Response({
            'access_token': str(access_token)
        }, status=status.HTTP_200_OK)
        
        # Set new refresh token as httpOnly cookie
        response.set_cookie(
            'refresh_token',
            str(new_refresh),
            max_age=7 * 24 * 60 * 60,  # 7 days default
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax'
        )
        
        return response
    except TokenError:
        return Response({'error': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        response = Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        response.delete_cookie('refresh_token')
        return response
    except Exception:
        response = Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        response.delete_cookie('refresh_token')
        return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='60/m', method='GET')
def current_habit_view(request):
    try:
        habit = UserHabit.objects.filter(user=request.user).first()

        if not habit:
            return Response(
                {'current_habit': None},
                status=status.HTTP_200_OK
            )

        serializer = HabitSerializer(habit)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': 'Server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='60/m', method='ALL')
def recent_verses_view(request):
    if request.method == 'GET':
        try:
            recent_verses = RecentVerse.objects.filter(
                user=request.user
            ).select_related('verse', 'book').order_by('-last_accessed')[:2]

            serializer = RecentVerseSerializer(recent_verses, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': 'Server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    elif request.method == 'POST':
        try:
            verse_id = request.data.get('verse_id')

            if not verse_id:
                return Response(
                    {'error': 'verse_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                verse = Verse.objects.select_related('book').get(id=verse_id)
            except Verse.DoesNotExist:
                return Response(
                    {'error': 'Verse not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            with transaction.atomic():
                recent_verse, created = RecentVerse.objects.update_or_create(
                    user=request.user,
                    book=verse.book,
                    chapter=verse.chapter,
                    defaults={
                        'verse': verse
                    }
                )

                if created:
                    user_recent_count = RecentVerse.objects.filter(user=request.user).count()

                    if user_recent_count > 2:
                        oldest = RecentVerse.objects.filter(
                            user=request.user
                        ).order_by('last_accessed').first()

                        if oldest and oldest.id != recent_verse.id:
                            oldest.delete()

            serializer = RecentVerseSerializer(recent_verse)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': 'Server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='60/m', method='GET')
def dashboard_view(request):
    try:
        habit = UserHabit.objects.filter(user=request.user).first()

        recent_verses = RecentVerse.objects.filter(
            user=request.user
        ).select_related('verse', 'book').order_by('-last_accessed')[:2]

        dashboard_data = {
            'current_habit': habit,
            'recent_verses': recent_verses
        }

        serializer = DashboardSerializer(dashboard_data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': 'Server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def study_notes(request):
    """
    Handle study notes creation and retrieval.
    POST: Create a new study note (for offline sync)
    GET: List all study notes for the user
    """
    if request.method == 'POST':
        serializer = StudyNoteSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'GET':
        notes = StudyNote.objects.filter(user=request.user).order_by('-updated_at')
        serializer = StudyNoteSerializer(notes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
def habits(request):
    if request.method == 'GET':
        habits = Habit.objects.all()
        serializer = HabitSerializer(habits, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = HabitSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class UserProfileDetailView(RetrieveUpdateAPIView):
    """
    GET: Retrieve user profile (auto-creates if doesn't exist)
    PATCH: Update user profile fields
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Auto-create profile using get_or_create."""
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='5/h', method='POST')
def change_password(request):
    """Change user password with validation."""
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    if not old_password or not new_password:
        return Response(
            {'error': 'Both old_password and new_password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verify old password
    if not user.check_password(old_password):
        return Response(
            {'error': 'Current password is incorrect'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate new password
    try:
        validate_password(new_password, user)
    except ValidationError as e:
        return Response(
            {'error': list(e.messages)},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Set new password
    user.set_password(new_password)
    user.save()

    return Response(
        {'message': 'Password changed successfully'},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='10/h', method='POST')
def upload_avatar(request):
    """Upload user avatar image."""
    avatar_file = request.FILES.get('avatar')

    if not avatar_file:
        return Response(
            {'error': 'No file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate file type
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if avatar_file.content_type not in allowed_types:
        return Response(
            {'error': 'Invalid file type. Allowed: JPEG, PNG, GIF, WEBP'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate file size (max 5MB)
    max_size = 5 * 1024 * 1024  # 5MB
    if avatar_file.size > max_size:
        return Response(
            {'error': 'File too large. Maximum size is 5MB'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Delete old avatar if exists
    if request.user.avatar:
        request.user.avatar.delete(save=False)

    # Save new avatar
    request.user.avatar = avatar_file
    request.user.save()

    # Return full URL
    avatar_url = request.build_absolute_uri(request.user.avatar.url)

    return Response(
        {
            'message': 'Avatar uploaded successfully',
            'avatar_url': avatar_url
        },
        status=status.HTTP_200_OK
    )
