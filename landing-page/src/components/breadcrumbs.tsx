"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";
import { BreadcrumbSchema } from "./structured-data";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const pathname = usePathname();
  
  // Si des items sont fournis, on les utilise, sinon on génère automatiquement
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname);
  
  if (breadcrumbItems.length <= 1) {
    return null; // Ne pas afficher si seulement l'accueil
  }

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems.map(item => ({
        name: item.name,
        url: `https://onefive.app${item.href}`
      }))} />
      <nav 
        aria-label="Fil d'Ariane" 
        className={`flex items-center space-x-1 text-sm text-muted-foreground mb-6 ${className}`}
      >
        <ol className="flex items-center space-x-1">
          {breadcrumbItems.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/60" />
              )}
              
              {index === breadcrumbItems.length - 1 ? (
                // Dernier élément (page actuelle) - pas de lien
                <span className="text-foreground font-medium flex items-center">
                  {index === 0 && <Home className="h-4 w-4 mr-1" />}
                  {item.name}
                </span>
              ) : (
                // Éléments intermédiaires - avec lien
                <Link 
                  href={item.href}
                  className="hover:text-foreground transition-colors flex items-center"
                >
                  {index === 0 && <Home className="h-4 w-4 mr-1" />}
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Toujours commencer par l'accueil
  breadcrumbs.push({
    name: "Accueil",
    href: "/"
  });
  
  let currentPath = "";
  
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    
    // Ignorer les locales (fr, en)
    if (i === 0 && (segments[i] === 'fr' || segments[i] === 'en')) {
      breadcrumbs[0].href = `/${segments[i]}`;
      continue;
    }
    
    // Mapper les segments vers des noms lisibles
    const name = getSegmentDisplayName(segments[i], i, segments);
    
    if (name) {
      breadcrumbs.push({
        name,
        href: currentPath
      });
    }
  }
  
  return breadcrumbs;
}

function getSegmentDisplayName(segment: string, index: number, allSegments: string[]): string | null {
  // Ignorer les locales
  if (segment === 'fr' || segment === 'en') {
    return null;
  }
  
  // Mappings spécifiques
  const mappings: Record<string, string> = {
    'blog': 'Blog',
    'about': 'À propos',
    'dataroom': 'Dataroom',
    'spotlight': 'Spotlight',
    'methodology': 'Méthodologie',
    'social-network': 'Réseau Social',
    'investment': 'Investissement',
    'community': 'Communauté',
    'press': 'Presse',
    'newsletter': 'Newsletter',
    'socials': 'Réseaux Sociaux',
    'media-kit': 'Kit Média',
    'private': 'Privé',
    'feed': 'Fil d\'actualité',
    'profile': 'Profil',
    'discussion': 'Discussion',
    'promotion': 'Promotion',
    'community-support': 'Support Communauté'
  };
  
  // Si c'est un mapping connu
  if (mappings[segment]) {
    return mappings[segment];
  }
  
  // Pour les articles de blog, on peut récupérer le titre réel
  // (nécessiterait un appel API, ici on utilise le slug formaté)
  if (allSegments.includes('blog') && index > allSegments.indexOf('blog')) {
    return formatSlugToTitle(segment);
  }
  
  // Par défaut, formatter le slug
  return formatSlugToTitle(segment);
}

function formatSlugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Breadcrumbs spécialisés pour différents types de pages
export function BlogBreadcrumbs({ 
  articleTitle, 
  category,
  locale = "fr"
}: { 
  articleTitle?: string;
  category?: string;
  locale?: string;
}) {
  const items: BreadcrumbItem[] = [
    { name: "Accueil", href: `/${locale}` },
    { name: "Blog", href: `/${locale}/blog` },
  ];
  
  if (category) {
    items.push({
      name: category,
      href: `/${locale}/blog?category=${encodeURIComponent(category)}`
    });
  }
  
  if (articleTitle) {
    items.push({
      name: articleTitle,
      href: "" // Page actuelle
    });
  }
  
  return <Breadcrumbs items={items} />;
}

export function ProductBreadcrumbs({
  productName,
  categoryName,
  locale = "fr"
}: {
  productName?: string;
  categoryName?: string;
  locale?: string;
}) {
  const items: BreadcrumbItem[] = [
    { name: "Accueil", href: `/${locale}` },
    { name: "Produits", href: `/${locale}/products` },
  ];
  
  if (categoryName) {
    items.push({
      name: categoryName,
      href: `/${locale}/products?category=${encodeURIComponent(categoryName)}`
    });
  }
  
  if (productName) {
    items.push({
      name: productName,
      href: "" // Page actuelle
    });
  }
  
  return <Breadcrumbs items={items} />;
} 