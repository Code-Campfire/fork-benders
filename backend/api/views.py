from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.db import connection
from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework_simplejwt.tokens import RefreshToken
from api.models import CustomUser



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
                'access': access,
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