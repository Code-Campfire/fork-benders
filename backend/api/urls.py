from django.urls import path
from . import views
from .views import GoogleLoginView

urlpatterns = [
    path('health/', views.health_check, name='health-check'),
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/refresh/', views.refresh_token_view, name='refresh'),
    path('auth/profile/', views.user_profile, name='user-profile'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('habits/current/', views.current_habit_view, name='current-habit'),
    path('recent-verses/', views.recent_verses_view, name='recent-verses'),
    path('study-notes/', views.study_notes, name='study-notes'),
    path('auth/google/', GoogleLoginView.as_view(), name='google-login'),
]