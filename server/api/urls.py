from django.urls import path
from .views import BasicAPIView

urlpatterns = [
    path('basic/', BasicAPIView.as_view(), name='basic_api'),
] 