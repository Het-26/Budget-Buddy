from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# Create your views here.

class BasicAPIView(APIView):
    def post(self, request):
        data = request.data
        headers = request.headers
        return Response({'message': 'Hello from Budget Buddy API!', 'data': data, 'headers': headers}, status=status.HTTP_201_CREATED)
