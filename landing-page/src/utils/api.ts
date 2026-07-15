import { unstable_cache as cache } from "next/cache";
import { getPayloadClient } from "@/lib/payload";

export const getArticle = cache(
  async (slug: string, locale = "fr") => {
    const payload = await getPayloadClient();

    const data = await payload.find({
      collection: "articles",
      // The listing filters on status but this did not, so a draft was fully
      // readable at its URL — rendered, with indexable metadata. Not linked
      // anywhere, but a guessed or shared URL was enough.
      where: {
        and: [{ slug: { equals: slug } }, { status: { equals: "published" } }],
      },
      locale: locale as never,
      depth: 2,
      limit: 1,
    });

    if (!data.docs || data.docs.length === 0) {
      return null;
    }

    return data.docs[0];
  },
  ["article-by-slug"],
  { revalidate: 3600 }
);
