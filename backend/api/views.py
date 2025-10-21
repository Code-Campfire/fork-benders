from datetime import timedelta
from django.conf import settings
from django.contrib.auth import login
from django.db import connection
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer, UserProfileSerializer
from .models import CustomUser, UserProfile


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
        
        # Rotate refresh token
        new_refresh = RefreshToken.for_user(refresh.payload.get('user_id'))
        
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


class UserProfileDetailView(generics.RetrieveUpdateAPIView):
    """
    GET: Retrieve current user's profile
    PATCH/PUT: Update current user's profile preferences
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Get or create profile for the authenticated user
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile