from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from .models import Users, Expense, Budget
import jwt
import datetime
from django.conf import settings
from functools import wraps
from decimal import Decimal
from django.db import models
import requests
import json

# Create your views here.

def get_user_from_token(request):
    """Extract user object from JWT token"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        username = payload.get('username')
        if username:
            return Users.objects.get(username=username)
        return None
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    except Users.DoesNotExist:
        return None

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

class AddExpenseAPIView(APIView):
    def post(self, request):
        user = get_user_from_token(request)
        if not user:
            return Response({'success': False, 'message': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            amount = request.data.get('amount')
            description = request.data.get('description')
            category = request.data.get('category')
            date_str = request.data.get('date')
            
            # Validate required fields
            if not all([amount, description, category, date_str]):
                return Response({
                    'success': False,
                    'message': 'All fields are required: amount, description, category, date'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate amount
            try:
                amount = Decimal(str(amount))
                if amount <= 0:
                    return Response({
                        'success': False,
                        'message': 'Amount must be greater than 0'
                    }, status=status.HTTP_400_BAD_REQUEST)
            except (ValueError, TypeError):
                return Response({
                    'success': False,
                    'message': 'Invalid amount format'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate and convert date
            try:
                date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
            except (ValueError, TypeError):
                return Response({
                    'success': False,
                    'message': 'Invalid date format. Use YYYY-MM-DD'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate category
            valid_categories = [choice[0] for choice in Expense.CATEGORY_CHOICES]
            if category not in valid_categories:
                return Response({
                    'success': False,
                    'message': f'Invalid category. Must be one of: {", ".join(valid_categories)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create expense
            expense = Expense.objects.create(
                user=user,
                amount=amount,
                description=description,
                category=category,
                date=date
            )
            
            return Response({
                'success': True,
                'message': 'Expense added successfully',
                'expense': {
                    'id': expense.id,
                    'user_id': expense.user.id,
                    'username': expense.user.username,
                    'amount': str(expense.amount),
                    'description': expense.description,
                    'category': expense.category,
                    'date': expense.date.isoformat(),
                    'created_at': expense.created_at.isoformat(),
                    'updated_at': expense.updated_at.isoformat()
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error creating expense: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetExpensesAPIView(APIView):
    def get(self, request):
        user = get_user_from_token(request)
        if not user:
            return Response({'success': False, 'message': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            expenses = Expense.objects.filter(user=user)
            expenses_data = []
            
            for expense in expenses:
                expenses_data.append({
                    'id': expense.id,
                    'user_id': expense.user.id,
                    'username': expense.user.username,
                    'amount': str(expense.amount),
                    'description': expense.description,
                    'category': expense.category,
                    'date': expense.date.isoformat(),
                    'created_at': expense.created_at.isoformat(),
                    'updated_at': expense.updated_at.isoformat()
                })
            
            return Response({
                'success': True,
                'expenses': expenses_data
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error fetching expenses: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ExpenseDetailAPIView(APIView):
    def get(self, request, expense_id):
        user = get_user_from_token(request)
        if not user:
            return Response({'success': False, 'message': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            expense = Expense.objects.get(id=expense_id, user=user)
            expense_data = {
                'id': expense.id,
                'user_id': expense.user.id,
                'username': expense.user.username,
                'amount': str(expense.amount),
                'description': expense.description,
                'category': expense.category,
                'date': expense.date.isoformat(),
                'created_at': expense.created_at.isoformat(),
                'updated_at': expense.updated_at.isoformat()
            }
            return Response({
                'success': True,
                'expense': expense_data
            })
        except Expense.DoesNotExist:
            return Response({'success': False, 'message': 'Expense not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error fetching expense: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, expense_id):
        user = get_user_from_token(request)
        if not user:
            return Response({'success': False, 'message': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            expense = Expense.objects.get(id=expense_id, user=user)
            
            # Update fields if provided
            if 'amount' in request.data:
                try:
                    amount = Decimal(str(request.data['amount']))
                    if amount <= 0:
                        return Response({
                            'success': False,
                            'message': 'Amount must be greater than 0'
                        }, status=status.HTTP_400_BAD_REQUEST)
                    expense.amount = amount
                except (ValueError, TypeError):
                    return Response({
                        'success': False,
                        'message': 'Invalid amount format'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            if 'description' in request.data:
                expense.description = request.data['description']
            
            if 'category' in request.data:
                valid_categories = [choice[0] for choice in Expense.CATEGORY_CHOICES]
                if request.data['category'] not in valid_categories:
                    return Response({
                        'success': False,
                        'message': f'Invalid category. Must be one of: {", ".join(valid_categories)}'
                    }, status=status.HTTP_400_BAD_REQUEST)
                expense.category = request.data['category']
            
            if 'date' in request.data:
                try:
                    date = datetime.datetime.strptime(request.data['date'], '%Y-%m-%d').date()
                    expense.date = date
                except (ValueError, TypeError):
                    return Response({
                        'success': False,
                        'message': 'Invalid date format. Use YYYY-MM-DD'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            expense.save()
            
            expense_data = {
                'id': expense.id,
                'user_id': expense.user.id,
                'username': expense.user.username,
                'amount': str(expense.amount),
                'description': expense.description,
                'category': expense.category,
                'date': expense.date.isoformat(),
                'created_at': expense.created_at.isoformat(),
                'updated_at': expense.updated_at.isoformat()
            }
            
            return Response({
                'success': True,
                'message': 'Expense updated successfully',
                'expense': expense_data
            })
            
        except Expense.DoesNotExist:
            return Response({'success': False, 'message': 'Expense not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error updating expense: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, expense_id):
        user = get_user_from_token(request)
        if not user:
            return Response({'success': False, 'message': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            expense = Expense.objects.get(id=expense_id, user=user)
            expense.delete()
            return Response({
                'success': True,
                'message': 'Expense deleted successfully'
            })
        except Expense.DoesNotExist:
            return Response({'success': False, 'message': 'Expense not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error deleting expense: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AddBudgetAPIView(APIView):
    def post(self, request):
        user = get_user_from_token(request)
        if not user:
            return Response({'success': False, 'message': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            amount = request.data.get('amount')
            date_str = request.data.get('date')
            source = request.data.get('source')
            category = request.data.get('category')
            # Validate required fields
            if not all([amount, date_str, source, category]):
                return Response({'success': False, 'message': 'All fields are required: amount, date, source, category'}, status=status.HTTP_400_BAD_REQUEST)
            # Validate amount
            try:
                amount = Decimal(str(amount))
                if amount <= 0:
                    return Response({'success': False, 'message': 'Amount must be greater than 0'}, status=status.HTTP_400_BAD_REQUEST)
            except (ValueError, TypeError):
                return Response({'success': False, 'message': 'Invalid amount format'}, status=status.HTTP_400_BAD_REQUEST)
            # Validate and convert date
            try:
                date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
            except (ValueError, TypeError):
                return Response({'success': False, 'message': 'Invalid date format. Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)
            # Validate category
            valid_categories = [choice[0] for choice in Budget.BUDGET_CATEGORY_CHOICES]
            if category not in valid_categories:
                return Response({'success': False, 'message': f'Invalid category. Must be one of: {", ".join(valid_categories)}'}, status=status.HTTP_400_BAD_REQUEST)
            # Create budget
            budget = Budget.objects.create(
                user=user,
                amount=amount,
                date=date,
                source=source,
                category=category
            )
            return Response({
                'success': True,
                'message': 'Budget added successfully',
                'budget': {
                    'id': budget.id,
                    'user_id': budget.user.id,
                    'username': budget.user.username,
                    'amount': str(budget.amount),
                    'date': budget.date.isoformat(),
                    'source': budget.source,
                    'category': budget.category,
                    'created_at': budget.created_at.isoformat(),
                    'updated_at': budget.updated_at.isoformat()
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'success': False, 'message': f'Error creating budget: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetBudgetsAPIView(APIView):
    def get(self, request):
        user = get_user_from_token(request)
        if not user:
            return Response({'success': False, 'message': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        budgets = Budget.objects.filter(user=user).order_by('-date', '-created_at')
        budget_list = [
            {
                'id': b.id,
                'amount': str(b.amount),
                'category': b.category,
                'source': b.source,
                'date': b.date.isoformat(),
                'created_at': b.created_at.isoformat(),
                'updated_at': b.updated_at.isoformat()
            }
            for b in budgets
        ]
        return Response({'success': True, 'budgets': budget_list})

class CategoryExpenseTotalAPIView(APIView):
    def get(self, request):
        user = get_user_from_token(request)
        if not user:
            return Response({'success': False, 'message': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        category = request.query_params.get('category')
        if not category:
            return Response({'success': False, 'message': 'Category is required as a query parameter.'}, status=status.HTTP_400_BAD_REQUEST)
        now = datetime.datetime.now()
        first_day = now.replace(day=1)
        expenses = Expense.objects.filter(
            user=user,
            category=category,
            date__gte=first_day.date(),
            date__lte=now.date()
        )
        total = expenses.aggregate(total=models.Sum('amount'))['total'] or 0
        return Response({'success': True, 'category': category, 'total': str(total)})

class OpenAIExpenseSummaryAPIView(APIView):
    def post(self, request):
        api_key = getattr(settings, 'OPENAI_API_KEY', None)
        if not api_key:
            return Response({'success': False, 'message': 'OpenAI API key not configured.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        expenses = request.data.get('expenses')
        prompt = request.data.get('prompt', "Please give me a high-level summary of my expenses")
        if not expenses or not isinstance(expenses, list):
            return Response({'success': False, 'message': 'Expenses list is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Format expenses for prompt
        expense_lines = []
        for exp in expenses:
            line = f"amount: {exp.get('amount')}, category: {exp.get('category')}, date: {exp.get('date')}"
            expense_lines.append(line)
        expense_str = '   '.join(expense_lines)
        user_prompt = f"Here is my expense data:\n\nexpenses: [{expense_str}]\n\n{prompt}\n Don't ask follow up questions, just give me the summary."

        payload = json.dumps({
            "model": "gpt-4.1-nano",
            "temperature": 0.7,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a smart assistant that analyzes expense data and provides summaries."
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ]
        })
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        }
        try:
            print(payload)
            response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, data=payload)
            if response.status_code == 200:
                result = response.json()
                summary = result.get('choices', [{}])[0].get('message', {}).get('content', '')
                return Response({'success': True, 'summary': summary, 'openai_response': result})
            else:
                return Response({'success': False, 'message': 'OpenAI API error', 'details': response.text}, status=response.status_code)
        except Exception as e:
            return Response({'success': False, 'message': f'Error calling OpenAI API: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
