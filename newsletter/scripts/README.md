# Scripts de test — collecte newsletter

## RSS

```bash
cd newsletter/scripts
pnpm install
node ingest-rss.mjs "https://URL_DU_FLUX_RSS" --limit=15
```

Le script utilise **`fetch` (Node)** + en-têtes type navigateur + `Referer` sur l’origine du flux. Ça évite les **403** qu’on avait avec le client HTTP interne de `rss-parser` sur des sites protégés (Akamai), par ex. **Les Echos** et **L’Usine digitale** :

```bash
node ingest-rss.mjs "https://services.lesechos.fr/rss/les-echos-start-up.xml" --limit=10
```

Le résultat part sur **stdout** (JSON). Tu peux rediriger vers un fichier :

```bash
node ingest-rss.mjs "https://example.com/feed/" > out/sample.json
```

Aucun lien avec la base OneFive : uniquement pour valider les flux et le rendu des champs avant d’industrialiser.
