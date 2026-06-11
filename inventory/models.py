from django.db import models

class Product(models.Model):
    nom = models.CharField(max_length=255)
    prix_kg = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    description = models.TextField(blank=True)
    offre_promo = models.CharField(max_length=255, blank=True, null=True)
    actif = models.BooleanField(default=True)

    def __str__(self):
        return self.nom
