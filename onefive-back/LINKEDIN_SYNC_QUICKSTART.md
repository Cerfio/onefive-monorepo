# 🚀 Guide rapide - Test du scraping LinkedIn

## Étape 1 : Configuration

Créez un fichier `.env.test` dans `onefive-back/` :

```bash
cd onefive-back
nano .env.test
```

Ajoutez votre token Apify :

```bash
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

💡 **Obtenir un token Apify :**
1. Aller sur https://console.apify.com/account/integrations
2. Créer un nouveau token
3. Copier le token

## Étape 2 : Lancer le test

```bash
npm run test:apify
```

## Résultat attendu

```
🚀 Démarrage du test de scraping LinkedIn via Apify...
📍 URL cible: https://www.linkedin.com/in/yannis-coulibaly/
🎭 Actor ID: harvestapi~linkedin-profile-scraper

⏳ Lancement du scraping (cela peut prendre 1-2 minutes)...

✅ Scraping terminé avec succès ! (45.32s)
📊 Nombre de profils récupérés: 1

👤 === DONNÉES DU PROFIL ===
Nom: Yannis Coulibaly
Headline: Senior Backend Developer – French Government
LinkedIn URL: https://www.linkedin.com/in/yannis-coulibaly
...

💾 Sauvegarde du JSON complet dans ./test-output.json...
✅ JSON sauvegardé !

🎉 Test terminé avec succès !
```

## En cas d'erreur

### Erreur 401 Unauthorized
➜ Vérifier que le token Apify est correct

### Erreur de timeout
➜ Le profil LinkedIn est trop volumineux ou la connexion est lente
➜ Réessayer

### Profil non trouvé
➜ Vérifier que le profil LinkedIn est public
➜ Vérifier l'URL : doit être `https://www.linkedin.com/in/username`

## Étape 3 : Intégrer en production

Une fois le test réussi :

1. **Ajouter le token dans `.env` principal** :
```bash
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxxxxxxxxxxxx
APIFY_LINKEDIN_ACTOR_ID=harvestapi~linkedin-profile-scraper
```

2. **Générer la migration Prisma** :
```bash
npm run db:migrate
# Nom : add_linkedin_sync
```

3. **Tester l'endpoint via le frontend** :
   - Aller sur votre profil
   - Menu dropdown → "Synchroniser avec LinkedIn"
   - Entrer votre URL LinkedIn
   - Sélectionner les éléments à synchroniser

## Coûts

- **$4 pour 1000 profils** scrapés
- Mode utilisé : "Profile details no email"
- Rate limit : 1 scraping toutes les 24h par utilisateur

## Support

Pour plus d'infos, voir `onefive-back/src/linkedin-sync/README.md`







