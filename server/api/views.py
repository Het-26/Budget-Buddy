from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .models import Users
import jwt
import datetime
from django.conf import settings

# Create your views here.

class BasicAPIView(APIView):
    def post(self, request):
        data = request.data
        headers = request.headers
        return Response({'message': 'Hello from Budget Buddy API!', 'data': data, 'headers': headers}, status=status.HTTP_201_CREATED)

class LoginAPIView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        exists = Users.objects.filter(username=username, password=password).exists()
        if exists:
            # Generate JWT token
            payload = {
                'username': username,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=settings.JWT_EXPIRATION_DELTA),
                'iat': datetime.datetime.utcnow()
            }
            token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
            return Response({
                'success': True,
                'message': 'Login successful',
                'token': token
            })
        else:
            return Response({'success': False, 'message': 'Invalid credentials'})

class SignUpAPIView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        if not username or not password:
            return Response({'success': False, 'message': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
        if Users.objects.filter(username=username).exists():
            return Response({'success': False, 'message': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        Users.objects.create(username=username, password=password, success=True)
        return Response({'success': True, 'message': 'Sign up successful'}, status=status.HTTP_201_CREATED)
