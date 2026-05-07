from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Standart Django foydalanuvchisini kengaytiradi.
    Bu yerda qo'shimcha maydonlar qo'shamiz.
    """
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    theme = models.CharField(
        max_length=20,
        choices=[('light', 'Light'), ('dark', 'Dark'), ('system', 'System')],
        default='system'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'users'
