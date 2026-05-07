# Foodiez Admin

## Description

Foodiez Admin est une SPA de gestion de commandes et de menu pour un restaurant. L’application utilise :

- HTML
- Tailwind CSS via CDN
- JavaScript vanilla
- JSON Server comme backend fake API

## Fonctionnalités

- Navigation SPA sans rechargement
- Dashboard moderne avec cartes de statistiques
- Gestion des commandes : affichage, filtre, recherche, changement de statut, suppression
- Gestion du menu : affichage des plats, ajout de produit, suppression de produit
- Données chargées depuis `db.json` via Fetch API
- Notifications toast pour les actions

## Installation

1. Installer JSON Server si nécessaire :

```bash
npm install -g json-server
```

2. Lancer le serveur JSON :

```bash
json-server --watch db.json --port 3000
```

3. Ouvrir `index.html` dans votre navigateur ou via un serveur local.

## API Endpoints

- `GET /orders`
- `POST /orders`
- `PATCH /orders/:id`
- `DELETE /orders/:id`
- `GET /products`
- `POST /products`
- `DELETE /products/:id`

## Notes

- Assurez-vous que JSON Server tourne sur `http://localhost:3000`
- Utilisez un navigateur récent compatible avec Fetch API
- Si vous rencontrez des problèmes de CORS, ouvrez la page via un serveur local
