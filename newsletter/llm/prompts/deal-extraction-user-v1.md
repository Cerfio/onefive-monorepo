# Prompt utilisateur — Extraction de deal v1
# À compléter dynamiquement avec le contenu de l'article.

Voici le titre et l'extrait d'un article de presse économique.

---
**URL** : {sourceUrl}
**Date** : {publishedAt}
**Titre** : {title}

**Extrait** :
{contentSnippet}
---

Extrais les informations de l'opération financière (si présente) et renvoie le JSON `NewsletterDeal`.
Si l'article ne décrit pas d'opération financière (levée, M&A, LBO), renvoie `null`.
