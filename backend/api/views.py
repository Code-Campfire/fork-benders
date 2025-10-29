from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.db import connection, transaction
from django.conf import settings
from django.core.exceptions import ValidationError
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
    StudyNoteSerializer
)
from .models import CustomUser, UserHabit, RecentVerse, Verse, Book, StudyNote


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
