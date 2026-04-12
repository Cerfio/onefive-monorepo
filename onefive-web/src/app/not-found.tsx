'use client';

import { ArrowLeft, ArrowRight, MessageChatCircle, SearchLg, User01, Settings01 } from '@untitledui/icons';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { Button } from '@/components/base/buttons/button';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icons';
import { BackgroundPattern } from '@/components/shared-assets/background-patterns';
import '@/styles/not-found.css';

// Types pour améliorer la lisibilité
interface NotFoundMessage {
  fr: string;
  en: string;
}

interface Link {
  title: string;
  subtitle: string;
  icon: any; // Using any for icon component type to avoid type conflicts
  cta: string;
  href: string;
}

// Liste de 100 messages 404 bilingues orientés entrepreneuriat
const notFoundMessages: NotFoundMessage[] = [
  {
    fr: 'La page a pivoté vers un nouveau business model.',
    en: 'The page pivoted to a new business model.',
  },
  {
    fr: 'Cette page est en pleine levée de fonds, repassez plus tard.',
    en: 'This page is fundraising, please come back later.',
  },
  {
    fr: 'La page a été rachetée par un concurrent.',
    en: 'The page was acquired by a competitor.',
  },
  {
    fr: 'La page est partie pitcher son projet à des investisseurs.',
    en: 'The page went to pitch its project to investors.',
  },
  { fr: 'La page a rejoint un incubateur secret.', en: 'The page joined a secret incubator.' },
  {
    fr: 'La page est en brainstorming pour trouver sa mission.',
    en: 'The page is brainstorming to find its mission.',
  },
  {
    fr: 'La page a été supprimée lors d’un hackathon.',
    en: 'The page was deleted during a hackathon.',
  },
  {
    fr: 'La page cherche encore son product-market fit.',
    en: 'The page is still searching for its product-market fit.',
  },
  {
    fr: 'La page est en pleine session de networking.',
    en: 'The page is in a networking session.',
  },
  {
    fr: 'La page a été mise en stand-by par le board.',
    en: 'The page was put on hold by the board.',
  },
  {
    fr: 'La page a été absorbée dans une fusion-acquisition.',
    en: 'The page was absorbed in a merger-acquisition.',
  },
  {
    fr: 'La page est en train de rédiger son pitch deck.',
    en: 'The page is writing its pitch deck.',
  },
  {
    fr: 'La page a été envoyée en mission d’exploration du marché.',
    en: 'The page was sent on a market exploration mission.',
  },
  {
    fr: 'La page est en pleine session de design thinking.',
    en: 'The page is in a design thinking session.',
  },
  {
    fr: 'La page a été oubliée dans un sprint agile.',
    en: 'The page was forgotten in an agile sprint.',
  },
  { fr: 'La page est en train de pivoter vers le B2B.', en: 'The page is pivoting to B2B.' },
  {
    fr: 'La page a été mise en pause pour cause de burn-out.',
    en: 'The page is on pause due to burnout.',
  },
  {
    fr: 'La page est en pleine levée de fonds en cryptomonnaie.',
    en: 'The page is raising funds in cryptocurrency.',
  },
  {
    fr: 'La page a été supprimée par un stagiaire trop zélé.',
    en: 'The page was deleted by an overzealous intern.',
  },
  {
    fr: 'La page est en train de rédiger son business plan.',
    en: 'The page is writing its business plan.',
  },
  {
    fr: 'La page a été envoyée en séminaire de motivation.',
    en: 'The page was sent to a motivation seminar.',
  },
  {
    fr: 'La page est en pleine session de growth hacking.',
    en: 'The page is in a growth hacking session.',
  },
  {
    fr: 'La page a été perdue dans un pivot stratégique.',
    en: 'The page got lost in a strategic pivot.',
  },
  {
    fr: 'La page est en train de chercher son marché cible.',
    en: 'The page is looking for its target market.',
  },
  {
    fr: 'La page a été mise en veille par le CTO.',
    en: 'The page was put to sleep by the CTO.',
  },
  {
    fr: 'La page est en pleine session de feedback utilisateur.',
    en: 'The page is in a user feedback session.',
  },
  {
    fr: 'La page a été envoyée en mission Lean Startup.',
    en: 'The page was sent on a Lean Startup mission.',
  },
  {
    fr: 'La page est en train de négocier avec des business angels.',
    en: 'The page is negotiating with business angels.',
  },
  {
    fr: 'La page a été absorbée dans un pivot disruptif.',
    en: 'The page was absorbed in a disruptive pivot.',
  },
  {
    fr: 'La page est en pleine session de mentoring.',
    en: 'The page is in a mentoring session.',
  },
  {
    fr: 'La page a été supprimée lors d’un refactoring sauvage.',
    en: 'The page was deleted during a wild refactoring.',
  },
  {
    fr: 'La page est en train de chercher son modèle économique.',
    en: 'The page is looking for its business model.',
  },
  {
    fr: 'La page a été envoyée en bootcamp d’innovation.',
    en: 'The page was sent to an innovation bootcamp.',
  },
  {
    fr: 'La page est en pleine session de co-création.',
    en: 'The page is in a co-creation session.',
  },
  {
    fr: 'La page a été supprimée lors d’un hackathon nocturne.',
    en: 'The page was deleted during a night hackathon.',
  },
  { fr: 'La page est en train de pivoter vers le SaaS.', en: 'The page is pivoting to SaaS.' },
  {
    fr: 'La page a été mise en stand-by pour cause de roadmap surchargée.',
    en: 'The page was put on hold due to an overloaded roadmap.',
  },
  {
    fr: 'La page est en pleine session de brainstorming.',
    en: 'The page is in a brainstorming session.',
  },
  {
    fr: 'La page a été supprimée par le product owner.',
    en: 'The page was deleted by the product owner.',
  },
  {
    fr: 'La page est en train de chercher son market fit.',
    en: 'The page is looking for its market fit.',
  },
  {
    fr: 'La page a été envoyée en séminaire de team building.',
    en: 'The page was sent to a team building seminar.',
  },
  {
    fr: 'La page est en pleine session de prototypage rapide.',
    en: 'The page is in a rapid prototyping session.',
  },
  {
    fr: 'La page a été supprimée lors d’un merge conflict.',
    en: 'The page was deleted during a merge conflict.',
  },
  {
    fr: 'La page est en train de chercher des early adopters.',
    en: 'The page is looking for early adopters.',
  },
  {
    fr: 'La page a été mise en pause pour cause de backlog infini.',
    en: 'The page was paused due to an infinite backlog.',
  },
  {
    fr: 'La page est en pleine session de validation de concept.',
    en: 'The page is in a concept validation session.',
  },
  {
    fr: 'La page a été supprimée lors d’un stand-up meeting.',
    en: 'The page was deleted during a stand-up meeting.',
  },
  {
    fr: 'La page est en train de chercher son persona idéal.',
    en: 'The page is looking for its ideal persona.',
  },
  {
    fr: 'La page a été envoyée en mission d’open innovation.',
    en: 'The page was sent on an open innovation mission.',
  },
  {
    fr: 'La page est en pleine session de pitch elevator.',
    en: 'The page is in an elevator pitch session.',
  },
  {
    fr: 'La page a été supprimée lors d’un daily scrum.',
    en: 'The page was deleted during a daily scrum.',
  },
  { fr: 'La page est en train de chercher son MVP.', en: 'The page is looking for its MVP.' },
  {
    fr: 'La page a été mise en pause pour cause de scaling.',
    en: 'The page was paused due to scaling.',
  },
  {
    fr: 'La page est en pleine session de user testing.',
    en: 'The page is in a user testing session.',
  },
  {
    fr: 'La page a été supprimée lors d’un pivot stratégique.',
    en: 'The page was deleted during a strategic pivot.',
  },
  { fr: 'La page est en train de chercher son NPS.', en: 'The page is looking for its NPS.' },
  {
    fr: 'La page a été envoyée en mission de growth.',
    en: 'The page was sent on a growth mission.',
  },
  {
    fr: 'La page est en pleine session de design sprint.',
    en: 'The page is in a design sprint session.',
  },
  {
    fr: 'La page a été supprimée lors d’un brainstorming intensif.',
    en: 'The page was deleted during an intensive brainstorming.',
  },
  { fr: 'La page est en train de chercher son TAM.', en: 'The page is looking for its TAM.' },
  {
    fr: 'La page a été mise en pause pour cause de churn élevé.',
    en: 'The page was paused due to high churn.',
  },
  {
    fr: 'La page est en pleine session de customer discovery.',
    en: 'The page is in a customer discovery session.',
  },
  {
    fr: 'La page a été supprimée lors d’un hackathon international.',
    en: 'The page was deleted during an international hackathon.',
  },
  { fr: 'La page est en train de chercher son ICP.', en: 'The page is looking for its ICP.' },
  {
    fr: 'La page a été envoyée en mission de scale-up.',
    en: 'The page was sent on a scale-up mission.',
  },
  {
    fr: 'La page est en pleine session de go-to-market.',
    en: 'The page is in a go-to-market session.',
  },
  {
    fr: 'La page a été supprimée lors d’un test A/B.',
    en: 'The page was deleted during an A/B test.',
  },
  { fr: 'La page est en train de chercher son CAC.', en: 'The page is looking for its CAC.' },
  {
    fr: 'La page a été mise en pause pour cause de cash burn.',
    en: 'The page was paused due to cash burn.',
  },
  {
    fr: 'La page est en pleine session de product discovery.',
    en: 'The page is in a product discovery session.',
  },
  {
    fr: 'La page a été supprimée lors d’un hackathon de weekend.',
    en: 'The page was deleted during a weekend hackathon.',
  },
  { fr: 'La page est en train de chercher son LTV.', en: 'The page is looking for its LTV.' },
  {
    fr: 'La page a été envoyée en mission de fundraising.',
    en: 'The page was sent on a fundraising mission.',
  },
  {
    fr: 'La page est en pleine session de product-market fit.',
    en: 'The page is in a product-market fit session.',
  },
  {
    fr: 'La page a été supprimée lors d’un daily stand-up.',
    en: 'The page was deleted during a daily stand-up.',
  },
  {
    fr: 'La page est en train de chercher son churn rate.',
    en: 'The page is looking for its churn rate.',
  },
  {
    fr: 'La page a été mise en pause pour cause de roadmap floue.',
    en: 'The page was paused due to a blurry roadmap.',
  },
  {
    fr: 'La page est en pleine session de customer success.',
    en: 'The page is in a customer success session.',
  },
  {
    fr: 'La page a été supprimée lors d’un hackathon étudiant.',
    en: 'The page was deleted during a student hackathon.',
  },
  {
    fr: 'La page est en train de chercher son break-even.',
    en: 'The page is looking for its break-even.',
  },
  {
    fr: 'La page a été envoyée en mission de scale.',
    en: 'The page was sent on a scaling mission.',
  },
  {
    fr: 'La page est en pleine session de business model canvas.',
    en: 'The page is in a business model canvas session.',
  },
  {
    fr: 'La page a été supprimée lors d’un hackathon corporate.',
    en: 'The page was deleted during a corporate hackathon.',
  },
  { fr: 'La page est en train de chercher son ROI.', en: 'The page is looking for its ROI.' },
  {
    fr: 'La page a été mise en pause pour cause de cash flow négatif.',
    en: 'The page was paused due to negative cash flow.',
  },
  {
    fr: 'La page est en pleine session de validation marché.',
    en: 'The page is in a market validation session.',
  },
  {
    fr: 'La page a été supprimée lors d’un hackathon open source.',
    en: 'The page was deleted during an open source hackathon.',
  },
  {
    fr: 'La page est en train de chercher son NPS score.',
    en: 'The page is looking for its NPS score.',
  },
  {
    fr: 'La page a été envoyée en mission de disruption.',
    en: 'The page was sent on a disruption mission.',
  },
  {
    fr: 'La page est en pleine session de lean canvas.',
    en: 'The page is in a lean canvas session.',
  },
  {
    fr: 'La page a été supprimée lors d’un hackathon remote.',
    en: 'The page was deleted during a remote hackathon.',
  },
  { fr: 'La page est en train de chercher son PMF.', en: 'The page is looking for its PMF.' },
  {
    fr: 'La page a été mise en pause pour cause de burn rate élevé.',
    en: 'The page was paused due to high burn rate.',
  },
  {
    fr: 'La page est en pleine session de design UX.',
    en: 'The page is in a UX design session.',
  },
  {
    fr: 'La page a été supprimée lors d’un hackathon international.',
    en: 'The page was deleted during an international hackathon.',
  },
  {
    fr: 'La page est en train de chercher son ICP idéal.',
    en: 'The page is looking for its ideal ICP.',
  },
  {
    fr: 'La page a été envoyée en mission de scale international.',
    en: 'The page was sent on an international scaling mission.',
  },
  {
    fr: 'La page est en pleine session de product design.',
    en: 'The page is in a product design session.',
  },
  {
    fr: 'La page a été supprimée lors d’un hackathon de startup.',
    en: 'The page was deleted during a startup hackathon.',
  },
  {
    fr: 'La page est en train de chercher son unicorn status.',
    en: 'The page is looking for its unicorn status.',
  },
];

export default function NotFound() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  // Détection côté client pour éviter l'hydration mismatch
  useEffect(() => {
    setIsClient(true);
    // Animation d'entrée progressive
    const timer = setTimeout(() => setAnimateIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Détection de la langue navigateur (français ou anglais)
  const lang = useMemo(() => {
    if (!isClient) return 'en'; // Valeur par défaut côté serveur
    return navigator.language.startsWith('fr') ? 'fr' : 'fr';
  }, [isClient]);

  // Sélection mémorisée d'un message aléatoire
  const randomMsg = useMemo(() => {
    if (!isClient) return notFoundMessages[0][lang]; // Message par défaut côté serveur
    return notFoundMessages[Math.floor(Math.random() * notFoundMessages.length)][lang];
  }, [isClient, lang]);

  // Liens utiles avec des hrefs réels
  const links: Link[] = useMemo(() => [
    {
      title: lang === 'fr' ? 'Messages' : 'Messages',
      subtitle: lang === 'fr' ? 'Consultez vos conversations privées.' : 'Check your private conversations.',
      icon: MessageChatCircle,
      cta: lang === 'fr' ? 'Mes messages' : 'My messages',
      href: '/messages',
    },
    {
      title: lang === 'fr' ? 'Profil' : 'Profile',
      subtitle: lang === 'fr' ? 'Gérez votre profil et vos informations.' : 'Manage your profile and information.',
      icon: User01,
      cta: lang === 'fr' ? 'Mon profil' : 'My profile',
      href: '/profile',
    },
    {
      title: lang === 'fr' ? 'Paramètres' : 'Settings',
      subtitle: lang === 'fr' ? 'Configurez vos préférences.' : 'Configure your preferences.',
      icon: Settings01,
      cta: lang === 'fr' ? 'Paramètres' : 'Settings',
      href: '/settings',
    },
  ], [lang]);

  const _handleGoHome = () => {
    router.push('/');
  };

  const handleGoToFeed = () => {
    router.push('/'); // Home = Feed
  };

  return (
    <>
      <Head>
        <title>{lang === 'fr' ? 'Page non trouvée - 404' : 'Page Not Found - 404'}</title>
        <meta 
          name="description" 
          content={lang === 'fr' 
            ? "Oups ! La page que vous cherchez n'existe pas. Découvrez nos suggestions pour continuer votre navigation sur Onefive." 
            : "Oops! The page you're looking for doesn't exist. Discover our suggestions to continue browsing Onefive."
          } 
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <section 
        className="flex min-h-screen items-center justify-center overflow-hidden bg-primary py-16 md:py-24"
        role="main"
        aria-labelledby="error-title"
      >
        <div className="mx-auto w-full max-w-container grow px-4 md:px-8">
          <div className={`mx-auto flex w-full max-w-5xl flex-col items-center gap-16 text-center transition-all duration-1000 ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="flex flex-col items-center justify-center gap-8 md:gap-12">
              <div className="z-10 flex flex-col items-center justify-center gap-4 md:gap-6">
                              <div className="relative group">
                <FeaturedIcon 
                  color="gray" 
                  theme="modern" 
                  size="xl" 
                  className="z-10 hidden md:flex transition-transform duration-300 group-hover:scale-110 animate-float" 
                  icon={SearchLg} 
                />
                <FeaturedIcon 
                  color="gray" 
                  theme="modern" 
                  size="lg" 
                  className="z-10 md:hidden transition-transform duration-300 group-hover:scale-110 animate-float" 
                  icon={SearchLg} 
                />
                <BackgroundPattern
                  pattern="grid"
                  className="absolute top-1/2 left-1/2 z-0 hidden -translate-x-1/2 -translate-y-1/2 md:block opacity-20"
                />
                <BackgroundPattern
                  pattern="grid"
                  size="md"
                  className="absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 md:hidden opacity-20"
                />
              </div>
              <span className="text-md font-semibold text-brand-secondary animate-pulse-glow">404 error</span>
                <h1 
                  id="error-title"
                  className="z-10 text-display-md font-semibold text-primary md:text-display-lg lg:text-display-xl max-w-4xl leading-tight"
                >
                  {randomMsg}
                </h1>
                <p className="z-10 text-lg text-tertiary md:text-xl max-w-2xl">
                  {lang === 'fr'
                    ? "La page que vous cherchez n'existe pas. Voici quelques options pour continuer :"
                    : "The page you are looking for doesn't exist. Here are some options to continue:"}
                </p>
              </div>
              <div className="z-10 flex flex-col-reverse gap-3 self-stretch sm:flex-row sm:self-auto sm:justify-center">
                <Button 
                  iconLeading={ArrowLeft} 
                  color="secondary" 
                  size="xl" 
                  onClick={() => router.back()}
                  className="transition-transform duration-200 hover:scale-105 hover-lift focus-visible:ring-brand"
                  aria-label={lang === 'fr' ? 'Retourner à la page précédente' : 'Go back to previous page'}
                >
                  {lang === 'fr' ? 'Retour' : 'Go back'}
                </Button>
                <Button 
                  size="xl" 
                  onClick={handleGoToFeed}
                  className="transition-transform duration-200 hover:scale-105 hover-lift hover-glow focus-visible:ring-brand"
                  aria-label={lang === 'fr' ? 'Aller au feed principal' : 'Go to main feed'}
                >
                  {lang === 'fr' ? 'Aller au feed' : 'Go to feed'}
                </Button>
              </div>
            </div>
            <div className="z-10 w-full">
              <h2 className="sr-only">
                {lang === 'fr' ? 'Liens utiles' : 'Helpful links'}
              </h2>
              <ul className="grid w-full grid-cols-1 justify-items-center gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {links.map((item, index) => (
                  <li 
                    key={item.title} 
                    className={`flex max-w-sm flex-col items-center gap-4 text-center transition-all duration-500 hover:scale-105 ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                    style={{ transitionDelay: `${index * 100 + 300}ms` }}
                  >
                    <div className="group">
                      <FeaturedIcon 
                        color="gray" 
                        theme="modern" 
                        size="md" 
                        icon={item.icon}
                        className="transition-transform duration-300 group-hover:scale-110" 
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-center">
                      <h3 className="text-lg font-semibold text-primary">{item.title}</h3>
                      <p className="text-md text-tertiary">{item.subtitle}</p>
                    </div>
                    <Button
                      color="link-color"
                      size="lg"
                      href={item.href}
                      className="whitespace-pre transition-transform duration-200 hover:scale-105"
                      iconTrailing={<ArrowRight className="size-5" />}
                      aria-label={`${item.cta} - ${item.title}`}
                    >
                      {item.cta}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
