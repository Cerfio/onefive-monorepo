interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  slug: string;
  category: {
    name: string;
  };
  publishedAt: string;
  author: {
    name: string;
    image: {
      filename: string;
    };
    role: string;
  };
  readTime: string;
  views: number;
  featuredImage: {
    filename: string;
  };
  tags: {
    id: string;
    name: string;
  }[];
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
  };
}

export default Article;
