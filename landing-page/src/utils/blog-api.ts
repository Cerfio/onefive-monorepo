const BASE_URL =
  typeof window !== "undefined" ? "" : "https://onefive.app";

// Récupérer les articles de blog avec filtrage
export async function getArticles({
  category = "",
  tag = "",
  author = "",
  featured = false,
  limit = 10,
  page = 1,
  navbar = false,
  locale = "fr",
} = {}) {
  try {
    let url = `${BASE_URL}/api/blog?limit=${limit}&locale=${locale}&page=${page}`;

    if (category && category !== "All") {
      url += `&category=${encodeURIComponent(category)}`;
    }

    if (tag) {
      url += `&tag=${encodeURIComponent(tag)}`;
    }

    if (author) {
      url += `&author=${encodeURIComponent(author)}`;
    }

    if (featured) {
      url += "&featured=true";
    }

    if (navbar) {
      url += "&navbar=true";
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch blog articles");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching articles:", error);
    throw error;
  }
}

// Récupérer un article spécifique par son slug
export async function getArticleBySlug(slug: string, locale = "fr") {
  try {
    const response = await fetch(`${BASE_URL}/api/blog/${slug}?locale=${locale}`);

    if (!response.ok) {
      throw new Error("Failed to fetch article");
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching article ${slug}:`, error);
    throw error;
  }
}

// Récupérer les catégories de blog
export async function getBlogCategories() {
  try {
    const response = await fetch(`${BASE_URL}/api/blog/categories`);

    if (!response.ok) {
      throw new Error("Failed to fetch blog categories");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

// Récupérer les tags de blog
export async function getBlogTags() {
  try {
    const response = await fetch(`${BASE_URL}/api/blog/tags`);

    if (!response.ok) {
      throw new Error("Failed to fetch blog tags");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }
}

// Incrémenter le nombre de vues d'un article
export async function incrementArticleViews(slug: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/blog/${slug}/views`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to increment article views");
    }

    return response.json();
  } catch (error) {
    console.error("Error incrementing article views:", error);
    // Nous capturons l'erreur mais ne la propageons pas pour ne pas bloquer l'UX
    return { success: false };
  }
}

// Récupérer les auteurs (membres de l'équipe qui sont auteurs)
export async function getBlogAuthors() {
  try {
    const response = await fetch(`${BASE_URL}/api/blog/authors`);

    if (!response.ok) {
      throw new Error("Failed to fetch blog authors");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching authors:", error);
    throw error;
  }
} 