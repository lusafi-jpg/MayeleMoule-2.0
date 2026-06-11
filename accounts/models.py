from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('artisan', 'Artisan'),
        ('client', 'Client'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='client')
    nom = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
