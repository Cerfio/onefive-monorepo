# LLM — newsletter OneFive

Espace pour tout ce qui concerne **l’extraction et la structuration** du contenu (pas l’envoi d’email ni la base abonnés).

## Contenu prévu ici

| Élément | Description |
|---------|-------------|
| `prompts/` | Prompts système / utilisateur versionnés (extraction article → JSON, dédoublonnage, rédaction newsletter). |
| `schemas/` | Schémas JSON (ou Zod / JSON Schema) pour la sortie LLM : deal unifié, liste d’erreurs, etc. |
| `examples/` | Exemples d’entrées / sorties attendues pour régressions de prompt. |

## Principes

- **v1 France** : prompts et schémas doivent permettre d’étiqueter le **marché principal** du deal (ex. `primaryCountry: "FR"`) et d’ignorer ou déprioriser les opérations sans lien France quand la source est ambiguë.
- **Sortie structurée** : forcer un JSON avec champs fixes (`company`, `dealType`, `amount`, `currency`, `round`, `investors`, `sector`, `summary`, `sourceUrl`, `primaryCountry`, `confidence`…).
- **Séparer** extraction factuelle et rédaction marketing : deux appels ou deux sections de prompt si besoin.
- **Traçabilité** : conserver `model`, version de prompt et hash du texte source pour debug.

## Hors scope de ce dossier

- Code Nest / Next : reste dans `onefive-back` et les apps front.
- Secrets API : uniquement variables d’environnement / gestionnaire de secrets du déploiement.

Les fichiers `prompts/` et `schemas/` peuvent être ajoutés au fil de l’implémentation ; ce README sert de convention d’emplacement.
