from django.urls import path
from .views import BasicAPIView, LoginAPIView, SignUpAPIView

urlpatterns = [
    path('basic/', BasicAPIView.as_view(), name='basic_api'),
    path('login/', LoginAPIView.as_view(), name='login_api'),
    path('signup/', SignUpAPIView.as_view(), name='signup_api'),
] 