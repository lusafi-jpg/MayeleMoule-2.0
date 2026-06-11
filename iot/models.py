from django.db import models
from inventory.models import Product
from sales.models import Command

class ESP32Data(models.Model):
    produit = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    quantite_mesuree = models.DecimalField(max_digits=10, decimal_places=3)
    etat_moulin = models.CharField(max_length=20, choices=(('RUNNING', 'En cours'), ('STOPPED', 'Arrêté')))
    timestamp = models.DateTimeField(auto_now_add=True)
    commande = models.ForeignKey(Command, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Data {self.timestamp} - {self.quantite_mesuree}kg"
