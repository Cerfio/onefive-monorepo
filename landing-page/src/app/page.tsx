import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function generateMetadata() {
  return {
    title: 'Onefive | La plateforme des entrepreneurs et startups',
    description: 'Onefive est la plateforme qui connecte entrepreneurs, investisseurs et experts. Trouvez des partenaires, accédez à une dataroom sécurisée et développez votre startup.',
    icons: {
      icon: [
        { url: '/favicon-192x192.png', type: 'image/png', sizes: '192x192' }, // Google primary (48x4)
        { url: '/favicon-144x144.png', type: 'image/png', sizes: '144x144' }, // Google (48x3)
        { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' }, // Google (48x2)
        { url: '/favicon-48x48.png', type: 'image/png', sizes: '48x48' }, // Google (48x1)
        { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' }, // Standard browser
        { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' }, // Standard browser
        { url: '/favicon.ico', type: 'image/x-icon', sizes: '32x32' }, // Fallback compatibility
      ],
      shortcut: '/favicon-192x192.png', // Best quality for shortcuts
      apple: [
        { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
        { url: '/favicon-144x144.png', sizes: '144x144', type: 'image/png' },
      ],
    },
    openGraph: {
      title: 'Onefive | La plateforme des entrepreneurs et startups',
      description: 'Rejoignez la communauté d\'entrepreneurs et développez votre startup avec des outils professionnels.',
      images: ['/og-image.png'],
      url: 'https://onefive.app',
      type: 'website',
    },
  };
}

export default async function RootPage() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  
  // Détecter les crawlers/bots
  const isCrawler = /bot|crawler|spider|favicon|googlebot|bingbot/i.test(userAgent);
  
  // Si c'est un crawler, servir une page statique avec les bonnes balises favicon
  if (isCrawler) {
    return (
      <html lang="fr">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Onefive | La plateforme des entrepreneurs et startups</title>
          <meta name="description" content="Onefive est la plateforme qui connecte entrepreneurs, investisseurs et experts. Trouvez des partenaires, accédez à une dataroom sécurisée et développez votre startup." />
          
          {/* FAVICON DIRECTS POUR CRAWLERS - CONFORMES GOOGLE */}
          <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
          <link rel="shortcut icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
          <link rel="icon" type="image/png" sizes="144x144" href="/favicon-144x144.png" />
          <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
          <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="192x192" href="/favicon-192x192.png" />
          <link rel="apple-touch-icon" sizes="144x144" href="/favicon-144x144.png" />
        </head>
        <body>
          <div style={{ textAlign: 'center', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
            <h1>Onefive</h1>
            <p>La plateforme des entrepreneurs et startups</p>
            <p>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/fr">Version Française</a> | {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}<a href="/en">English Version</a>
            </p>
          </div>
        </body>
      </html>
    );
  }
  
  // Pour les utilisateurs normaux, rediriger vers /fr
  redirect('/fr');
} 