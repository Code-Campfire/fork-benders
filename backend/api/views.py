from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection


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