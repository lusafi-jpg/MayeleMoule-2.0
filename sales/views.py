from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from django.utils import timezone
from .models import Sale, Command
from .serializers import SaleSerializer, CommandSerializer
from iot.mqtt import send_command
from inventory.models import Product

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer

    @action(detail=False, methods=['get'])
    def stats(self, request):
        now = timezone.now()
        
        # Ventes du jour
        sales_day = Sale.objects.filter(date_vente__date=now.date())
        total_day = sales_day.aggregate(total=Sum('total'))['total'] or 0
        
        # Ventes du mois
        sales_month = Sale.objects.filter(date_vente__year=now.year, date_vente__month=now.month)
        total_month = sales_month.aggregate(total=Sum('total'))['total'] or 0
        
        # Ventes de l'année
        sales_year = Sale.objects.filter(date_vente__year=now.year)
        total_year = sales_year.aggregate(total=Sum('total'))['total'] or 0
        
        return Response({
            "ventaire_jour": total_day,
            "ventaire_mois": total_month,
            "ventaire_annee": total_year
        })

class CommandViewSet(viewsets.ModelViewSet):
    queryset = Command.objects.all()
    serializer_class = CommandSerializer

    @action(detail=False, methods=['post'])
    def start_mill(self, request):
        produit_nom = request.data.get('produit')
        command = Command.objects.create(action='START', produit_selectionne=produit_nom, utilisateur=request.user)
        send_command('START', produit_nom)
        return Response(CommandSerializer(command).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def stop_mill(self, request):
        command = Command.objects.create(action='STOP', utilisateur=request.user)
        send_command('STOP')
        return Response(CommandSerializer(command).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def select_product(self, request):
        produit_nom = request.data.get('produit')
        produit_id = request.data.get('produit_id')
        
        if not produit_id and produit_nom:
            p = Product.objects.filter(nom__iexact=produit_nom).first()
            if p:
                produit_id = p.id
            else:
                produit_id = 1 # Default fallback
                
        command = Command.objects.create(action='SELECT', produit_selectionne=produit_nom, utilisateur=request.user)
        send_command('SELECT', produit_nom=produit_nom, produit_id=produit_id)
        return Response(CommandSerializer(command).data, status=status.HTTP_201_CREATED)
