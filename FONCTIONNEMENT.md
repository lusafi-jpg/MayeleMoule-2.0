# 📖 FONCTIONNEMENT — MayeleMoule 2.0
### Plateforme IoT de gestion de moulin à grain

---

## 🏗️ Architecture Générale

```
┌─────────────────┐        WiFi / MQTT         ┌────────────────────┐
│   ESP32 (Moulin)│ ◄─────────────────────────► │  Backend Django    │
│  (Embarqué)     │        HTTP REST             │  (API REST)        │
└─────────────────┘                             └────────────────────┘
                                                         ▲
                                                         │ HTTP Fetch
                                                         ▼
                                                ┌────────────────────┐
                                                │  Frontend React    │
                                                │  (Interface Web)   │
                                                └────────────────────┘
```

L'application est composée de **3 couches** :

| Couche      | Technologie          | Rôle                              |
|-------------|----------------------|-----------------------------------|
| Embarqué    | ESP32 + Arduino (C++) | Contrôle physique du moulin       |
| Backend     | Python / Django      | API REST + logique métier + BDD   |
| Frontend    | React.js + Vite      | Interface utilisateur web         |

---

## 1. 🤖 L'ESP32 — Le cerveau du moulin

**Fichier :** `embedded/moulin_esp32/moulin_esp32.ino`

L'ESP32 est un microcontrôleur Wi-Fi installé physiquement sur le moulin. Il joue le rôle de **pont entre le monde physique et le monde numérique**.

### Ce qu'il fait :

- **Se connecte au Wi-Fi** au démarrage avec le SSID et le mot de passe configurés
- **Mesure la quantité** de grain moulue (simulation de 50g/seconde quand le moulin tourne)
- **Publie les données en temps réel** sur le broker MQTT (topic : `moulin/donnees`) en JSON :
  ```json
  {"produit_id": 1, "quantite": 1.250, "etat": "RUNNING"}
  ```
- **Écoute les commandes** venant du backend (topic : `moulin/commande`) :
  - `START` → démarre le moulin
  - `STOP` → arrête et envoie la quantité finale
  - `SELECT` → change le produit sélectionné

- **Expose aussi des routes HTTP** locales pour contrôle direct :
  - `GET /data` → retourne l'état JSON en temps réel
  - `GET /lancer` → démarre le moulin
  - `GET /fermer` → arrête le moulin

### Protocoles utilisés :
- **MQTT** : pour la communication bi-directionnelle en temps réel avec Django
- **HTTP** : pour les requêtes directes depuis le réseau local

---

## 2. ⚙️ Le Backend Django — L'API & la base de données

**Dossier :** `config/`, `inventory/`, `sales/`, `iot/`, `accounts/`

Le backend est une **API REST** construite avec Django Rest Framework. Il gère toute la logique métier, la base de données, et la communication MQTT.

### Applications Django :

#### 📦 `inventory` — Gestion des produits
- **Modèle `Product`** : chaque produit a un nom, un prix au kg, une image, une description, et un statut promo.
- **Endpoint :** `GET /api/products/` → liste tous les produits actifs

#### 💰 `sales` — Ventes et commandes
- **Modèle `Sale`** : enregistre chaque vente (produit, quantité, total, date)
  - Le `total` est calculé automatiquement = `quantité × prix_kg`
- **Modèle `Command`** : enregistre chaque commande envoyée au moulin (START/STOP/SELECT)
- **Endpoints spéciaux :**
  - `POST /api/commands/start_mill/` → démarre le moulin + envoie commande MQTT
  - `POST /api/commands/stop_mill/` → arrête le moulin + envoie commande MQTT
  - `POST /api/commands/select_product/` → sélectionne un produit + notifie l'ESP32
  - `GET /api/sales/stats/` → statistiques de ventes (jour / mois / année)

#### 📡 `iot` — Données IoT en temps réel
- **Modèle `ESP32Data`** : chaque message MQTT reçu est sauvegardé (produit, quantité, état, timestamp)
- **`mqtt.py`** : gère la connexion MQTT (broker : `broker.emqx.io`)
  - À la réception d'une donnée `STOPPED` → crée automatiquement une **vente**
- **Endpoint :** `GET /api/iot-data/` → historique des mesures ESP32

---

## 3. 🌐 Le Frontend React — L'interface utilisateur

**Dossier :** `frontend/src/`

L'interface web est construite en **React 19 + Vite**. Elle permet à l'opérateur du moulin de tout contrôler depuis un navigateur.

### Fonctionnalités de l'interface :

| Section          | Description                                                   |
|------------------|---------------------------------------------------------------|
| **Catalogue**    | Affiche tous les produits actifs avec images, prix et promos  |
| **Contrôle**     | Boutons START / STOP pour lancer ou arrêter le moulin         |
| **Temps réel**   | Affiche la quantité en cours et l'état du moulin              |
| **Statistiques** | Tableau de bord avec ventes du jour, du mois, de l'année      |
| **Historique**   | Liste des ventes effectuées                                   |

### Technologies utilisées :
- `axios` → pour les requêtes HTTP vers l'API Django
- `framer-motion` → pour les animations fluides
- `lucide-react` → pour les icônes

---

## 4. 🔄 Flux de données — De A à Z

Voici ce qui se passe lors d'une session complète :

```
1. L'opérateur ouvre l'interface React (http://localhost:5173)
        ↓
2. Le frontend charge les produits depuis l'API Django
   → GET /api/products/
        ↓
3. L'opérateur sélectionne un produit (ex: Maïs)
   → POST /api/commands/select_product/ {produit: "Maïs", produit_id: 2}
   → Django publie sur MQTT : {"action": "SELECT", "produit_id": 2}
   → L'ESP32 reçoit et mémorise le produit sélectionné
        ↓
4. L'opérateur clique sur START
   → POST /api/commands/start_mill/ {produit: "Maïs"}
   → Django publie sur MQTT : {"action": "START"}
   → L'ESP32 démarre le moulin, commence à mesurer
        ↓
5. Pendant la mouture (chaque seconde) :
   → L'ESP32 publie : {"produit_id": 2, "quantite": 0.050, "etat": "RUNNING"}
   → Django reçoit, sauvegarde dans ESP32Data
   → Le frontend affiche la quantité en temps réel
        ↓
6. L'opérateur clique sur STOP
   → POST /api/commands/stop_mill/
   → Django publie : {"action": "STOP"}
   → L'ESP32 arrête le moulin, publie la quantité totale finale
   → Django reçoit le message STOPPED :
       ✅ Crée une entrée ESP32Data (état: STOPPED)
       ✅ Crée automatiquement une vente (Sale) avec le total calculé
        ↓
7. Le tableau de bord se met à jour avec la nouvelle vente
   → GET /api/sales/stats/
```

---

## 5. 🗄️ Base de données

SQLite (`db.sqlite3`) — simple et locale (pas besoin d'installer un serveur DB).

| Table          | Contenu                                              |
|----------------|------------------------------------------------------|
| `Product`      | Catalogue des produits (maïs, fonio, mil, etc.)      |
| `Sale`         | Toutes les ventes effectuées                         |
| `Command`      | Historique des commandes START/STOP/SELECT           |
| `ESP32Data`    | Toutes les mesures temps réel reçues de l'ESP32      |

---

## 6. 📡 Communication MQTT

| Topic             | Sens           | Contenu                              |
|-------------------|----------------|--------------------------------------|
| `moulin/donnees`  | ESP32 → Django | `{produit_id, quantite, etat}`       |
| `moulin/commande` | Django → ESP32 | `{action, produit, produit_id}`      |

**Broker :** `broker.emqx.io` (public, port 1883)

---

## 7. 🔐 Comptes & Authentification

**Dossier :** `accounts/`

Le système intègre un module de gestion des utilisateurs Django. Les ventes et commandes sont liées à l'utilisateur connecté.

---

> 📌 **Résumé** : L'opérateur contrôle le moulin depuis l'interface web → Django transmet les ordres à l'ESP32 via MQTT → l'ESP32 exécute et renvoie les mesures → Django enregistre les données et génère les ventes automatiquement.
