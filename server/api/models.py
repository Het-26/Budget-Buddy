from django.db import models

# Create your models here.

class Users(models.Model):
    username = models.CharField(max_length=150)
    password = models.CharField(max_length=128, default="")  # Not secure for production
    success = models.BooleanField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} - {'Success' if self.success else 'Failure'} at {self.timestamp}"

class Expense(models.Model):
    CATEGORY_CHOICES = [
        ('Food & Dining', 'Food & Dining'),
        ('Transportation', 'Transportation'),
        ('Shopping', 'Shopping'),
        ('Entertainment', 'Entertainment'),
        ('Healthcare', 'Healthcare'),
        ('Utilities', 'Utilities'),
        ('Housing', 'Housing'),
        ('Education', 'Education'),
        ('Travel', 'Travel'),
        ('Other', 'Other'),
    ]
    
    user = models.ForeignKey(Users, on_delete=models.CASCADE, related_name='expenses')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.amount} - {self.description}"

    class Meta:
        ordering = ['-date', '-created_at']

class Budget(models.Model):
    BUDGET_CATEGORY_CHOICES = [
        ('Food & Dining', 'Food & Dining'),
        ('Transportation', 'Transportation'),
        ('Shopping', 'Shopping'),
        ('Entertainment', 'Entertainment'),
        ('Healthcare', 'Healthcare'),
        ('Utilities', 'Utilities'),
        ('Housing', 'Housing'),
        ('Education', 'Education'),
        ('Travel', 'Travel'),
        ('Other', 'Other'),
    ]
    user = models.ForeignKey(Users, on_delete=models.CASCADE, related_name='budgets')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    source = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=BUDGET_CATEGORY_CHOICES, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.amount} - {self.source} - {self.category}"

    class Meta:
        ordering = ['-date', '-created_at']

