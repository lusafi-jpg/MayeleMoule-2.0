#include <WiFi.h>
#include <WebServer.h>
#include <PubSubClient.h>

// =========================
// WIFI AP CONFIG (Réseau Local)
// =========================
const char* ap_ssid = "MayeleMoule2.0-AP";
const char* ap_password = "password123";

// En mode AP, l'ESP32 prend par défaut l'IP 192.168.4.1
// Configure ici l'IP de la machine (PC/Serveur) qui fait tourner ton Broker MQTT local :
const char* mqtt_broker = "192.168.4.2"; 
const int mqtt_port = 1883;
const char* topic_data = "mayelemoule/donnees";
const char* topic_command = "mayelemoule/commande";

WiFiClient espClient;
PubSubClient mqttClient(espClient);
WebServer server(80);

// =========================
// VARIABLES DU MOULIN
// =========================
float quantiteMesuree = 0.0;
bool moulinEnCours = false;
String produitSelectionne = "Manioc"; // Exemple de produit local
float prixProduit = 1500.0;
unsigned long lastUpdate = 0;
unsigned long lastMqttRetry = 0;

// =========================
// MQTT CALLBACK
// =========================
void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) message += (char)payload[i];
  
  Serial.print("[MayeleMoule2.0] Commande Reçue: "); Serial.println(message);
  
  if (message.indexOf("START") >= 0) {
    moulinEnCours = true;
    Serial.println("-> DEMARRAGE DU MOULIN");
  } else if (message.indexOf("STOP") >= 0) {
    moulinEnCours = false;
    Serial.println("-> ARRET DU MOULIN");
    quantiteMesuree = 0; // Réinitialisation pour la prochaine session
  }
}

// =========================
// HTTP HANDLERS
// =========================
void handleData() {
  String json = "{";
  json += "\"device_key\":\"MAYELE_MOULE_001\",";
  json += "\"produit\":\"" + produitSelectionne + "\",";
  json += "\"quantite\":" + String(quantiteMesuree, 3) + ",";
  json += "\"etat\":\"" + String(moulinEnCours ? "RUNNING" : "STOPPED") + "\",";
  json += "\"prix\":" + String(prixProduit, 2);
  json += "}";

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
}

void handleLancer() {
  moulinEnCours = true;
  server.send(200, "text/plain", "MayeleMoule2.0 Lance");
}

void handleFermer() {
  moulinEnCours = false;
  server.send(200, "text/plain", "MayeleMoule2.0 Arrete");
}

// =========================
// SETUP
// =========================
void setup() {
  Serial.begin(115200);

  // Initialisation du Point d'accès (SoftAP)
  WiFi.softAP(ap_ssid, ap_password);
  
  Serial.println("\n--- [MayeleMoule2.0] Point d'accès Activé ---");
  Serial.print("SSID : "); Serial.println(ap_ssid);
  Serial.print("IP de l'ESP32 : "); Serial.println(WiFi.softAPIP()); // http://192.168.4.1

  // Configuration MQTT
  mqttClient.setServer(mqtt_broker, mqtt_port);
  mqttClient.setCallback(callback);

  // Routes HTTP 
  server.on("/", []() {
    server.send(200, "text/plain", "Systeme MayeleMoule2.0 Pret. Accedez a /data pour le statut.");
  });
  server.on("/data", handleData);
  server.on("/lancer", handleLancer);
  server.on("/fermer", handleFermer);
  
  server.begin();
  Serial.println("🌐 Serveur HTTP Local Démarré");
}

// =========================
// LOOP
// =========================
void loop() {
  // Gestion fluide des requêtes HTTP
  server.handleClient();

  // Reconnexion MQTT non-bloquante (toutes les 5 secondes)
  if (!mqttClient.connected()) {
    unsigned long now = millis();
    if (now - lastMqttRetry > 5000) {
      lastMqttRetry = now;
      Serial.print("[MQTT] Tentative de connexion au Broker local (");
      Serial.print(mqtt_broker); Serial.println(")...");
      
      if (mqttClient.connect("MayeleMoule_ESP32_Client")) {
        Serial.println("✓ MQTT Connecté au Broker Local !");
        mqttClient.subscribe(topic_command);
      } else {
        Serial.println("✗ Échec de connexion MQTT (Vérifie ton broker local)");
      }
    }
  } else {
    mqttClient.loop();
  }

  // Simulation du capteur de pesée en temps réel
  if (moulinEnCours) {
    if (millis() - lastUpdate > 1000) {
      quantiteMesuree += 0.050; // Simulation de +50g par seconde
      lastUpdate = millis();
      
      String payload = "{\"device\":\"MayeleMoule2.0\",\"produit\": \"" + produitSelectionne + "\", \"quantite\": " + String(quantiteMesuree, 3) + ", \"etat\": \"RUNNING\"}";
      
      if (mqttClient.connected()) {
        mqttClient.publish(topic_data, payload.c_str());
        Serial.println("[MQTT] Publication : " + payload);
      } else {
        Serial.println("[Local Simulation] MQTT déconnecté : " + payload);
      }
    }
  }
}
