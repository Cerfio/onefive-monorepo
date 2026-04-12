# Newsletter OneFive — levées & deals (automatisée)

Documentation de référence pour le récap hebdomadaire / mensuel / trimestriel des levées de fonds, M&A et LBO (inspiration : anciennes lettres eCAP Partner). Objectif : **peu de temps humain** sur la collecte et le formatage, **relecture** sur la fiabilité des chiffres et noms.

## Portée produit

- **Contenu** : synthèse des opérations (entreprise, type, montant, tour le cas échéant, investisseurs / acquéreur, secteur, lien source, date).
- **Canal** : email (via stack existante `onefive-email` / fournisseur d’envoi).
- **Préférences abonné** : fréquence `semaine | mois | trimestre`, désabonnement en un clic.
- **Pages publiques légères** : préférences + désinscription (token signé dans l’URL de l’email).

## Architecture (monorepo) — choix figé

Ne pas créer un nouveau backend / frontend isolé pour la v1.

| Couche | Emplacement | Rôle |
|--------|-------------|------|
| **Données & API** | `onefive-back` | Tout le back : module dédié (ex. `newsletter`) — abonnés, préférences, tokens, éventuellement deals normalisés, endpoints consommés par la landing et le BO. Pattern Controller → Handler → Service. |
| **Pages publiques** | `landing-page` | Inscription, préférences (fréquence semaine / mois / trimestre), désinscription — URLs à utiliser dans les emails (même domaine marketing que la landing). Pas de compte utilisateur : accès par **token signé** dans le lien. |
| **BO interne** | `onefive-backoffice` | Suivi **stats** et infos opérationnelles : abonnés, exports, métriques d’envoi / d’engagement si disponibles, envoi test, éventuellement validation de brouillons. Accès **session / rôle admin** uniquement. |
| **Emails** | `onefive-email` | Templates + envoi transactionnel / campagne si centralisé ici. |
| **LLM** | `newsletter/llm/` | Prompts, schémas JSON d’extraction, notes pipeline (voir sous-dossier). |

Éviter d’utiliser `onefive-bo-landing-page` (Payload) comme base de données principale des abonnés : ce n’est pas le bon outil pour tokens, fréquences et jobs d’envoi.

## Pipeline contenu (collecte → extraction → newsletter)

1. **Ingestion** : flux RSS, alertes, URLs collectées manuellement ou semi-auto — privilégier des sources stables plutôt qu’un scraping large et fragile.
2. **Extraction** : envoi du texte (ou HTML nettoyé) à un LLM avec **sortie JSON contrainte** (voir `llm/`).
3. **Dédoublonnage** : même deal sur plusieurs articles → une entrée (règles nom + montant + date, ou similarité).
4. **Rédaction** : génération du corps d’email à partir de la liste structurée + ton éditorial OneFive.
5. **Humain dans la boucle** : courte relecture ciblée montants / investisseurs / tours.

## Modèle de données (brouillon)

Tables conceptuelles côté `onefive-back` :

- **NewsletterSubscriber** : `email`, `subscribed`, `frequency`, `preferenceToken` (hash), `createdAt`, `updatedAt`, `unsubscribedAt?`
- **NewsletterDeal** (optionnel selon MVP) : champs extraits + `sourceUrl`, `publishedAt`, statut `draft | validated | sent`

Affiner au moment de l’implémentation Prisma / migrations.

## Conformité & qualité

- Lien **source** par item ; disclaimer si résumé automatique.
- Ne pas republier des extraits longs payants ; préférer **faits courts + lien**.
- Token de préférences : **non devinable**, expiration optionnelle, invalidation au désabonnement.

## Prochaines étapes suggérées

1. Module `onefive-back` + migration minimale abonnés.
2. Endpoints publics tokenisés (GET préférences, PATCH fréquence, POST désabonnement).
3. Routes Next dans `landing-page` + liens dans les emails pointant vers ce domaine.
4. Vues / intégration API dans `onefive-backoffice` pour stats et pilotage.
5. Premier job manuel ou cron : collecte → extraction LLM → draft → envoi.
6. Itération sur prompts et schéma dans `newsletter/llm/`.

## Références internes

- Règles backend : `onefive-back/.cursorrules`
- Projet email : `onefive-email/`
