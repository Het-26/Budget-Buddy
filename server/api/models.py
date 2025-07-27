from django.db import models

# Create your models here.

class Users(models.Model):
    username = models.CharField(max_length=150)
    password = models.CharField(max_length=128, default="")  # Not secure for production
    success = models.BooleanField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} - {'Success' if self.success else 'Failure'} at {self.timestamp}"
