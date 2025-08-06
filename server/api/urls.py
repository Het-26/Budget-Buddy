from django.urls import path
from .views import (
    BasicAPIView, 
    LoginAPIView, 
    SignUpAPIView, 
    AddExpenseAPIView, 
    GetExpensesAPIView, 
    ExpenseDetailAPIView,
    AddBudgetAPIView,
    GetBudgetsAPIView,
    CategoryExpenseTotalAPIView
)

urlpatterns = [
    path('basic/', BasicAPIView.as_view(), name='basic_api'),
    path('login/', LoginAPIView.as_view(), name='login_api'),
    path('signup/', SignUpAPIView.as_view(), name='signup_api'),
    path('add-expense/', AddExpenseAPIView.as_view(), name='add_expense_api'),
    path('expenses/', GetExpensesAPIView.as_view(), name='get_expenses_api'),
    path('expenses/<int:expense_id>/', ExpenseDetailAPIView.as_view(), name='expense_detail_api'),
    path('add-budget/', AddBudgetAPIView.as_view(), name='add_budget_api'),
    path('budgets/', GetBudgetsAPIView.as_view(), name='get_budgets_api'),
    path('category-expense-total/', CategoryExpenseTotalAPIView.as_view(), name='category_expense_total_api'),
] 