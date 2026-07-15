import { notFound } from "next/navigation";

// A URL matching no route resolves its 404 at the root, where the layout has no
// <html>/<body> and no locale — so /en/nope fell through to Next's bare default
// instead of [locale]/not-found.tsx. Catching the unmatched path inside the
// locale segment and calling notFound() from there hands it to that file, with
// the layout's document, fonts and translations already around it.
// Specific routes win over a catch-all, so this only ever sees the leftovers.
export default function CatchAllNotFound() {
  notFound();
}
