import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { SITE_URL } from "@/lib/site";

export async function GET() {
  try {
    const payload = await getPayloadClient();

    // Récupérer toutes les releases
    const data = await payload.find({
      collection: "releases",
      limit: 100,
      sort: "-date",
      depth: 1,
    });

    // Générer le XML du feed RSS
    const host = SITE_URL;

    let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Onefive - Changelog</title>
  <link>${host}/changelog</link>
  <description>Latest updates and improvements to the Onefive platform</description>
  <atom:link href="${host}/api/changelog/rss" rel="self" type="application/rss+xml" />
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
`;

    // Ajouter chaque release comme un item
    data.docs.forEach((release: any) => {
      const pubDate = new Date(release.date).toUTCString();
      const changesContent = (release.changes || [])
        .map(
          (change: any) =>
            `<p><strong>${change.type.charAt(0).toUpperCase() + change.type.slice(1)}:</strong> ${change.title}</p>
         <p>${change.description}</p>`
        )
        .join("");

      rss += `
  <item>
    <title>${release.version} - ${release.summary}</title>
    <link>${host}/changelog#${release.version}</link>
    <guid isPermaLink="false">${release.id}</guid>
    <pubDate>${pubDate}</pubDate>
    <description><![CDATA[
      <h2>${release.summary}</h2>
      ${changesContent}
    ]]></description>
  </item>`;
    });

    rss += `
</channel>
</rss>`;

    // Retourner le RSS avec le bon Content-Type
    return new NextResponse(rss, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error("Error generating RSS:", error);
    return NextResponse.json(
      { error: "Failed to generate RSS feed" },
      { status: 500 }
    );
  }
}
