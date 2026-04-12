export async function getArticle(slug: string, locale = "fr") {
  const response = await fetch(
    `${process.env.PAYLOAD_URL}/api/articles?where[slug][equals]=${encodeURIComponent(slug)}&depth=2&locale=${locale}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${process.env.PAYLOAD_API_KEY}`,
      },
      next: { revalidate: 3600 },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch article: ${slug}`);
  }

  const data = await response.json();

  if (!data.docs || data.docs.length === 0) {
    return null;
  }

  return data.docs[0];
}
