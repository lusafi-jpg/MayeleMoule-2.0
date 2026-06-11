import paho.mqtt.client as mqtt
import json
from django.conf import settings

# MQTT Settings
MQTT_BROKER = "192.168.4.2"  # Local broker as per user's ESP code
MQTT_PORT = 1883
MQTT_TOPIC_DATA = "moulin/donnees"
MQTT_TOPIC_COMMAND = "moulin/commande"

def on_connect(client, userdata, flags, rc, properties=None):
    print(f"Connected with result code {rc}")
    client.subscribe(MQTT_TOPIC_DATA)

def on_message(client, userdata, msg):
    from .models import ESP32Data
    from inventory.models import Product
    
    try:
        payload = json.loads(msg.payload.decode())
        print(f"Received message: {payload}")
        
        # Example payload: {"produit_id": 1, "quantite": 2.5, "etat": "RUNNING"}
        produit_id = payload.get('produit_id')
        quantite = payload.get('quantite')
        etat = payload.get('etat')
        
        produit = Product.objects.filter(id=produit_id).first()
        
        ESP32Data.objects.create(
            produit=produit,
            quantite_mesuree=quantite,
            etat_moulin=etat
        )
        
        # If the mill has stopped, create a Sale
        if etat == "STOPPED" and produit and quantite > 0:
            from sales.models import Sale
            Sale.objects.create(
                produit=produit,
                quantite_kg=quantite,
                prix_unitaire=produit.prix_kg
            )
    except Exception as e:
        print(f"Error processing MQTT message: {e}")

def send_command(action, produit_nom=None, produit_id=None):
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    payload = {"action": action}
    if produit_nom:
        payload["produit"] = produit_nom
    if produit_id:
        payload["produit_id"] = produit_id
    client.publish(MQTT_TOPIC_COMMAND, json.dumps(payload))
    client.disconnect()

def start_mqtt():
    try:
        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        client.on_connect = on_connect
        client.on_message = on_message
        
        # Connect with a short timeout to avoid hanging the server
        client.connect(MQTT_BROKER, MQTT_PORT, 10)
        client.loop_start()
        print(f"✓ MQTT Loop started (Broker: {MQTT_BROKER})")
    except Exception as e:
        print(f"✗ MQTT Connection Failed: {e}. The server will continue to run without real-time updates.")
