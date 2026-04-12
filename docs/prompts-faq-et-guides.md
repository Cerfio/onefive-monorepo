# Prompts pour la FAQ et les Guides — Page /support

Ce document contient deux prompts optimisés pour générer du contenu pour la page Support d'OneFive, basés sur une analyse complète du projet.

---

## Contexte OneFive (pour alimenter les prompts)

**OneFive** est une plateforme de networking professionnel pour l'écosystème startup. Principales fonctionnalités :

- **Authentification** : inscription (email/mot de passe), connexion OAuth (LinkedIn, Google), vérification SMS, vérification email
- **Waitlist** : système de parrainage avec ambassadeurs, statuts ACTIVE/WAITING, codes de parrainage (?ref=)
- **Profils** : expériences (max 10), éducations (max 10), bio, highlight, avatars, couvertures, synchronisation LinkedIn
- **Réseau** : connexions, followers, suggestions de profils et startups
- **Datarooms** : création, documents, groupes, permissions, invitations, analytics de consultation
- **Posts** : feed, réactions, commentaires, bookmarks
- **Discussions** : Q&A threadées, votes, upvotes, réponses imbriquées
- **Startups** : profils startup, invitations, cap tables
- **Messagerie** : messagerie instantanée avec fichiers
- **Spotlight** : découverte et recherche
- **Notifications** : temps réel
- **Référal** : parrainage, codes uniques, founding members

---

## Prompt 1 — Génération de la FAQ

```
Tu es un rédacteur expert en documentation produit pour OneFive, une plateforme de networking professionnel pour l'écosystème startup.

## Mission
Génère une liste complète de questions fréquentes (FAQ) pour la page /support d'OneFive. Chaque entrée doit suivre le format suivant :

```json
{
  "id": "string",
  "question": "string",
  "answer": "string",
  "category": "string",
  "tags": ["string"]
}
```

## Catégories à couvrir
- **authentification** : inscription, connexion, OAuth (LinkedIn, Google), vérification email/SMS, mot de passe oublié
- **waitlist** : statut WAITING vs ACTIVE, parrainage, codes de parrainage (?ref=), ambassadeurs, activation
- **profil** : modification, expériences, éducations, bio, avatar, couverture, limites (10 expériences, 10 éducations, 2000 car. bio)
- **réseau** : connexions, followers, suggestions, invitations
- **dataroom** : création, documents, groupes, permissions, invitations, analytics
- **posts** : création, réactions, commentaires, bookmarks, feed
- **discussions** : participation, votes, upvotes, réponses
- **startups** : création profil startup, invitations, cap table
- **messagerie** : envoi de messages, fichiers
- **notifications** : types, paramètres
- **référal** : code de parrainage, partage du lien, founding members
- **compte** : paramètres, sécurité, suppression

## Contraintes
1. **Ton** : professionnel, clair, orienté utilisateur final (non technique)
2. **Réponses** : 2 à 5 phrases max, actionnables (étapes concrètes)
3. **Langue** : français
4. **Cohérence** : refléter les vrais parcours et limites de l'app (ex. max 10 expériences, vérification email pour activation)
4. **Questions** : formuler comme un utilisateur réel ("Comment...", "Pourquoi...", "Puis-je...", "Que faire si...")
5. **Erreurs courantes** : inclure des FAQ sur les cas d'erreur (ex. "Mon compte est en WAITING", "Je n'ai pas reçu le code de vérification")

## Livrable
Produis un tableau JSON valide avec au moins 25 questions, réparties équitablement entre les catégories. Priorise les parcours les plus fréquents : inscription, profil, dataroom, réseau.
```

---

## Prompt 2 — Génération des Guides

```
Tu es un rédacteur expert en guides utilisateur pour OneFive, une plateforme de networking professionnel pour l'écosystème startup.

## Mission
Génère une liste de guides pratiques pour la page /support d'OneFive. Chaque guide doit suivre le format suivant :

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "category": "string",
  "duration": "string",
  "difficulty": "facile | moyen | avancé",
  "tags": ["string"],
  "sections": [
    {
      "title": "string",
      "content": "string",
      "steps": ["string"]
    }
  ]
}
```

## Types de guides à produire

### Démarrage (facile, 5–10 min)
- Guide de démarrage rapide : inscription → vérification → premier profil
- Créer et optimiser son profil en 10 minutes
- Comprendre le système de waitlist et de parrainage

### Réseau (facile à moyen, 10–15 min)
- Construire son réseau sur OneFive
- Inviter des connexions et gérer ses followers
- Découvrir des profils et startups pertinents (Spotlight)

### Datarooms (moyen, 12–20 min)
- Créer sa première dataroom
- Gérer les permissions et inviter des membres
- Exploiter les analytics de consultation

### Contenu (facile, 5–10 min)
- Publier son premier post
- Participer aux discussions et Q&A
- Utiliser les bookmarks et le feed

### Avancé (avancé, 15–25 min)
- Configurer la sécurité et les paramètres du compte
- Système de parrainage et founding members
- Intégrer OneFive dans son workflow (si API documentée)

## Contraintes
1. **Structure** : chaque guide doit avoir des sections claires avec des étapes numérotées
2. **Ton** : pédagogique, encourageant, orienté résultat
3. **Langue** : français
4. **Durée** : réaliste (ex. "5 min" pour un guide court, "15 min" pour un guide détaillé)
5. **Difficulté** : cohérente avec le contenu (débutant = facile, paramètres avancés = avancé)
6. **Actionnable** : chaque section doit permettre à l'utilisateur d'accomplir une tâche concrète

## Livrable
Produis un tableau JSON avec au moins 8 guides complets. Chaque guide doit contenir 2 à 4 sections, et chaque section 3 à 6 étapes. Les guides doivent couvrir les parcours principaux : démarrage, profil, réseau, dataroom, contenu.
```

---

## Utilisation recommandée

1. **FAQ** : Exécuter le prompt 1 une première fois, puis affiner les questions en fonction des retours support (emails, Discord) et des analytics de recherche sur la page.
2. **Guides** : Exécuter le prompt 2 pour obtenir la structure, puis enrichir le contenu avec des captures d'écran et des liens vers les pages concernées.
3. **Maintenance** : Réviser les deux contenus à chaque release majeure ou lorsqu'une nouvelle fonctionnalité est déployée.

---

## Mapping catégories FAQ ↔ filtres UI

Les catégories du prompt FAQ correspondent aux options du `Select` sur la page support :

| Catégorie prompt | Valeur `SelectItem` |
|------------------|---------------------|
| dataroom         | dataroom            |
| analytics        | analytics           |
| profil           | profil              |
| discussions      | discussions         |
| fichiers         | fichiers            |

**À ajouter** dans le composant si tu génères des FAQ pour : `authentification`, `waitlist`, `réseau`, `startups`, `messagerie`, `notifications`, `référal`, `compte`.
