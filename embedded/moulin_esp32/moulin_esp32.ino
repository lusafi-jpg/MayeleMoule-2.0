#include <WiFi.h>
#include <WebServer.h>
#include <PubSubClient.h>

// =========================
// WIFI & MQTT CONFIG
// =========================
const char* ssid = "VOTRE_RESEAU_WIFI";
const char* password = "VOTRE_MOT_DE_PASSE";

// Replace with your computer's IP for MQTT if in local network
// Or use a public broker for testing as we did in Django
const char* mqtt_broker = "broker.emqx.io"; 
const int mqtt_port = 1883;
const char* topic_data = "moulin/donnees";
const char* topic_command = "moulin/commande";

WiFiClient espClient;
PubSubClient mqttClient(espClient);
WebServer server(80);

// =========================
// MOULIN VARIABLES
// =========================
float quantiteMesuree = 0.0;
bool moulinEnCours = false;
String produitSelectionne = "Aucun";
int produitIdSelectionne = 1; // Default
float prixProduit = 0.0;
unsigned long lastUpdate = 0;

// =========================
// MQTT CALLBACK
// =========================
void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) message += (char)payload[i];
  
  Serial.print("Command Received: "); Serial.println(message);
  
  // Logic to handle START/STOP/SELECT from Backend/Mobile
  if (message.indexOf("START") >= 0) {
    moulinEnCours = true;
    Serial.println("Moulin: DEMARRAGE");
  } else if (message.indexOf("STOP") >= 0) {
    moulinEnCours = false;
    Serial.println("Moulin: ARRET");
    
    // Publish the STOPPED state so the backend creates a Sale
    String stopPayload = "{\"produit_id\": " + String(produitIdSelectionne) + ", \"quantite\": " + String(quantiteMesuree, 3) + ", \"etat\": \"STOPPED\"}";
    mqttClient.publish(topic_data, stopPayload.c_str());
    
    quantiteMesuree = 0; // Reset for next use
  } else if (message.indexOf("SELECT") >= 0) {
    // Basic extraction of produit_id from JSON (e.g., {"action": "SELECT", "produit_id": 2})
    int idx = message.indexOf("\"produit_id\":");
    if (idx >= 0) {
      produitIdSelectionne = message.substring(idx + 13).toInt();
      Serial.print("Moulin: PRODUIT "); Serial.print(produitIdSelectionne); Serial.println(" SELECTIONNE");
    }
  }
}

// =========================
// HTTP HANDLERS (Inspired by User Snippet)
// =========================
void handleData() {
  String json = "{";
  json += "\"device_key\":\"MOULIN_001\",";
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
  server.send(200, "text/plain", "Moulin Lance");
}

void handleFermer() {
  moulinEnCours = false;
  
  String stopPayload = "{\"produit_id\": " + String(produitIdSelectionne) + ", \"quantite\": " + String(quantiteMesuree, 3) + ", \"etat\": \"STOPPED\"}";
  if (mqttClient.connected()) {
      mqttClient.publish(topic_data, stopPayload.c_str());
  }
  quantiteMesuree = 0;
  
  server.send(200, "text/plain", "Moulin Arrete");
}

// =========================
// SETUP
// =========================
void setup() {
  Serial.begin(115200);

  // WiFi Client (STA) Mode
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("Connexion au WiFi ");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("WiFi connecte. IP: "); Serial.println(WiFi.localIP());

  // MQTT Setup
  mqttClient.setServer(mqtt_broker, mqtt_port);
  mqttClient.setCallback(callback);

  // HTTP Routes
  server.on("/", []() {
    server.send(200, "text/plain", "Moulin System Ready. Access /data for status.");
  });
  server.on("/data", handleData);
  server.on("/lancer", handleLancer);
  server.on("/fermer", handleFermer);
  
  server.begin();
  Serial.println("🌐 HTTP & MQTT System Ready");
}

// =========================
// LOOP
// =========================
void loop() {
  server.handleClient();

  if (!mqttClient.connected()) {
    // Reconnect MQTT (non-blocking simulation)
    if (mqttClient.connect("ESP32_Moulin_Client")) {
      mqttClient.subscribe(topic_command);
    }
  }
  mqttClient.loop();

  // Simulate weight measurement if running
  if (moulinEnCours) {
    if (millis() - lastUpdate > 1000) {
      quantiteMesuree += 0.05; // Simulate 50g per second
      lastUpdate = millis();
      
      // Publish to MQTT for Backend real-time update
      String payload = "{\"produit_id\": " + String(produitIdSelectionne) + ", \"quantite\": " + String(quantiteMesuree, 3) + ", \"etat\": \"RUNNING\"}";
      mqttClient.publish(topic_data, payload.c_str());
    }
  }
}
