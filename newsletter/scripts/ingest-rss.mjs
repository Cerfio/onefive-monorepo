#!/usr/bin/env node
/**
 * Test d’ingestion RSS : affiche un JSON structuré (stdout).
 *
 * Les flux derrière Akamai / anti-bot (Les Echos, Usine digitale, etc.) renvoient
 * souvent 403 avec le client HTTP interne de rss-parser (`https.get`). Le `fetch`
 * natif de Node (Undici) est en général accepté — on télécharge le XML via `fetch`
 * puis on parse avec `parseString`.
 *
 * Usage:
 *   pnpm install
 *   node ingest-rss.mjs <url-du-flux> [autre-url...]
 *
 * Exemple:
 *   node ingest-rss.mjs https://services.lesechos.fr/rss/les-echos-start-up.xml --limit=10
 */

import Parser from 'rss-parser';

const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

const parser = new Parser();

function refererForFeedUrl(feedUrl) {
  try {
    return new URL(feedUrl).origin + '/';
  } catch {
    return 'https://www.google.com/';
  }
}

async function fetchRssXml(feedUrl) {
  const res = await fetch(feedUrl, {
    redirect: 'follow',
    signal: AbortSignal.timeout(25_000),
    headers: {
      'User-Agent': CHROME_UA,
      Accept: 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7',
      'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      Referer: refererForFeedUrl(feedUrl),
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`.trim());
  }

  return res.text();
}

const urls = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const limit = limitArg
  ? Math.max(1, parseInt(limitArg.split('=')[1], 10) || 20)
  : 20;

if (urls.length === 0) {
  console.error(
    'Usage: node ingest-rss.mjs <feed-url> [feed-url...] [--limit=20]',
  );
  console.error(
    'Example: node ingest-rss.mjs https://services.lesechos.fr/rss/les-echos-start-up.xml --limit=10',
  );
  process.exit(1);
}

const out = [];

for (const feedUrl of urls) {
  try {
    const xml = await fetchRssXml(feedUrl);
    const feed = await parser.parseString(xml);
    const items = (feed.items ?? []).slice(0, limit).map((item) => ({
      title: item.title ?? null,
      link: item.link ?? null,
      guid: item.guid ?? null,
      pubDate: item.pubDate ?? item.isoDate ?? null,
      contentSnippet: item.contentSnippet
        ? item.contentSnippet.slice(0, 800)
        : null,
    }));

    out.push({
      ok: true,
      feedUrl,
      feedTitle: feed.title ?? null,
      feedDescription: feed.description
        ? String(feed.description).slice(0, 300)
        : null,
      itemCount: feed.items?.length ?? 0,
      itemsSampled: items.length,
      items,
    });
  } catch (err) {
    out.push({
      ok: false,
      feedUrl,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

console.log(JSON.stringify(out, null, 2));
