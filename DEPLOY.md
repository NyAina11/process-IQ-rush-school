# Procédure de Mise à Jour (Serveur Hetzner)

Pour appliquer les corrections et synchroniser votre environnement local avec la production, suivez ces étapes simples une fois que vous avez poussé (push) votre code sur Git.

## 1. Mettre à jour le code sur le serveur
Connectez-vous à votre serveur via SSH, allez dans le dossier du projet et récupérez les changements :
```bash
git pull origin main
```

## 2. Relancer les conteneurs avec le nouveau Build
Cette commande va reconstruire le frontend avec les bonnes variables et synchroniser le backend avec votre fichier `.env` :
```bash
docker-compose up -d --build
```

---

## Pourquoi ces changements sont importants ?
- **Base de données** : Le serveur utilise maintenant la `MONGODB_URI` définie dans votre `.env`. Si vous utilisez Atlas, les données seront enfin les mêmes qu'en local.
- **Variables d'environnement** : Toutes vos clés (Gemini, DocuSign, etc.) sont maintenant chargées automatiquement dans le backend.
- **Stabilité** : Nginx est configuré pour ne plus couper les connexions lors de la génération de longs documents PDF.
- **Health Checks** : Le backend attend maintenant que la base de données soit prête avant de démarrer, évitant des crashs au lancement.

> [!IMPORTANT]
> Assurez-vous que votre fichier `.env` sur le serveur Hetzner contient bien toutes les clés nécessaires (copiez votre `.env` local sur le serveur si besoin).
