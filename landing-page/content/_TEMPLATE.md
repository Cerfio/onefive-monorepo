---
# Obligatoires
title: Lever des BSA AIR sans se faire diluer
description: >
  Ce qui apparaît dans les résultats Google et les cartes de partage.
  Vise 150-160 caractères.
category: onefive # slug d'une catégorie existante (ou son id)
author: Yannis Coulibaly # nom d'un membre de la collection Team (ou son id)
featuredImage: ./cover.png # chemin relatif à CE fichier → uploadé automatiquement
#                            (ou le filename d'un média déjà dans Payload)

# Optionnels
locale: fr # fr | en — défaut: fr
tags: [startup, levee-de-fonds] # slugs de tags existants
slug: lever-des-bsa-air # défaut: dérivé du titre (accents translittérés)
readTime: 8 min # défaut: calculé (~200 mots/min)
isFeatured: false
displayOnNavbar: false

# Pour ajouter une traduction à un article déjà publié (au lieu d'en créer un
# nouveau) : remplace category/author/featuredImage par translationOf, avec
# l'id Payload de l'article existant (affiché par le script après création).
# translationOf: 42
---

Le corps de l'article, en markdown standard. Il est converti en Lexical, le
format de l'éditeur Payload — donc il reste **entièrement éditable dans
l'admin** après création.

## Ce qui est supporté

Titres, **gras**, _italique_, [liens](https://www.onefive.app), listes,
citations, `code inline` et blocs de code, règles horizontales.

> Une citation.

- Une liste
- À puces

1. Une liste
2. Numérotée

## Utilisation

```bash
pnpm create-article content/mon-article.md --dry-run   # vérifier sans écrire
pnpm create-article content/mon-article.md             # créer un brouillon
pnpm create-article content/mon-article.md --publish   # publier directement
```

Le script a besoin de `DATABASE_URI` et `PAYLOAD_SECRET` dans `.env.local`
(plus les variables `R2_*` si l'article embarque une image de couverture à
uploader). `.env.local` est ignoré par git.
