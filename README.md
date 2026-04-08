# Audit IT Pro — Générateur de rapports d'audit informatique

Application web Node.js pour générer des rapports d'audit informatique professionnels au format `.doc` ou `.html`.

---

## 🚀 Installation et démarrage

### Prérequis
- [Node.js](https://nodejs.org/) version 16 ou supérieure

### Étapes

```bash
# 1. Ouvrir un terminal dans ce dossier
cd audit-app

# 2. Installer les dépendances
npm install

# 3. Démarrer le serveur
npm start
```

Ouvrir ensuite votre navigateur sur : **http://localhost:3000**

---

## 📁 Structure du projet

```
audit-app/
├── server.js            ← Serveur Express (API + fichiers statiques)
├── docxGenerator.js     ← Génération du fichier .doc/.html
├── package.json         ← Dépendances Node.js
├── public/
│   ├── index.html       ← Interface web complète
│   ├── data.js          ← Chapitres et questions (modifiable indépendamment)
│   └── uploads/         ← Images uploadées (créé automatiquement)
└── README.md            ← Ce fichier
```

---

## ✨ Fonctionnalités

### Interface (5 onglets)

| Onglet | Description |
|--------|-------------|
| **Infos client** | Saisie des coordonnées, date d'audit, auditeur, référence |
| **Questionnaire** | Réponses aux questions, masquage chapitres/questions |
| **Générer** | Export .doc ou .html, charte COGEP ou mise en page simple |
| **Gérer les questions** | CRUD chapitres/questions avec drag & drop pour réordonner |
| **Paramètres** | Export/import JSON complet, remise à zéro |

### Upload d'images
Les images associées aux réponses sont uploadées sur le serveur dans `public/uploads/`. Elles sont intégrées directement dans le rapport via leur URL.

### Rapport .doc généré
- Page de garde charte COGEP Numérique (bleu marine, vert, cyan)
- Sommaire, fiche client, introduction
- Chapitres avec badges colorés (Oui/Non/Partiel/Non applicable)
- Images intégrées avec légendes
- Conclusion et recommandations automatiques
- Version simple (sans charte) disponible

---

## ⚙️ Personnalisation

Modifiez `public/data.js` pour ajouter/modifier/supprimer des chapitres et questions, sans toucher à `index.html`.

---

## 👤 Crédits

Réalisé par **Mickaël LEHAY** à l'aide de **Claude** — Anthropic.

