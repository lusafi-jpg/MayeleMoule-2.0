from django.db import models
from django.conf import settings
from inventory.models import Product

class Sale(models.Model):
    produit = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='ventes')
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    quantite_kg = models.DecimalField(max_digits=10, decimal_places=3)
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    date_vente = models.DateTimeField(auto_now_add=True)
    etat_paiement = models.CharField(max_length=50, default='payé')

    def save(self, *args, **kwargs):
        if not self.total:
            self.total = self.quantite_kg * self.prix_unitaire
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Vente {self.id} - {self.produit.nom}"

class Command(models.Model):
    ACTION_CHOICES = (
        ('START', 'LANCER'),
        ('STOP', 'FERMER'),
        ('SELECT', 'LISTE PRODUITS'),
    )
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    produit_selectionne = models.CharField(max_length=255, blank=True, null=True)
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    etat_execution = models.CharField(max_length=50, default='en attente')

    def __str__(self):
        return f"Commande {self.action} - {self.timestamp}"
