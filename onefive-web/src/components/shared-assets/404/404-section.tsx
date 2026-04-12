"use client";


import { ArrowLeft } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";

// Liste de 100 messages 404 bilingues orientés entrepreneuriat
const notFoundMessages = [
  { fr: "Erreur 404 : La page a pivoté vers un nouveau business model.", en: "Error 404: The page pivoted to a new business model." },
  { fr: "Erreur 404 : Cette page est en pleine levée de fonds, repassez plus tard.", en: "Error 404: This page is fundraising, please come back later." },
  { fr: "Erreur 404 : La page a été rachetée par un concurrent.", en: "Error 404: The page was acquired by a competitor." },
  { fr: "Erreur 404 : La page est partie pitcher son projet à des investisseurs.", en: "Error 404: The page went to pitch its project to investors." },
  { fr: "Erreur 404 : La page a rejoint un incubateur secret.", en: "Error 404: The page joined a secret incubator." },
  { fr: "Erreur 404 : La page est en brainstorming pour trouver sa mission.", en: "Error 404: The page is brainstorming to find its mission." },
  { fr: "Erreur 404 : La page a été supprimée lors d’un hackathon.", en: "Error 404: The page was deleted during a hackathon." },
  { fr: "Erreur 404 : La page cherche encore son product-market fit.", en: "Error 404: The page is still searching for its product-market fit." },
  { fr: "Erreur 404 : La page est en pleine session de networking.", en: "Error 404: The page is in a networking session." },
  { fr: "Erreur 404 : La page a été mise en stand-by par le board.", en: "Error 404: The page was put on hold by the board." },
  { fr: "Erreur 404 : La page a été absorbée dans une fusion-acquisition.", en: "Error 404: The page was absorbed in a merger-acquisition." },
  { fr: "Erreur 404 : La page est en train de rédiger son pitch deck.", en: "Error 404: The page is writing its pitch deck." },
  { fr: "Erreur 404 : La page a été envoyée en mission d’exploration du marché.", en: "Error 404: The page was sent on a market exploration mission." },
  { fr: "Erreur 404 : La page est en pleine session de design thinking.", en: "Error 404: The page is in a design thinking session." },
  { fr: "Erreur 404 : La page a été oubliée dans un sprint agile.", en: "Error 404: The page was forgotten in an agile sprint." },
  { fr: "Erreur 404 : La page est en train de pivoter vers le B2B.", en: "Error 404: The page is pivoting to B2B." },
  { fr: "Erreur 404 : La page a été mise en pause pour cause de burn-out.", en: "Error 404: The page is on pause due to burnout." },
  { fr: "Erreur 404 : La page est en pleine levée de fonds en cryptomonnaie.", en: "Error 404: The page is raising funds in cryptocurrency." },
  { fr: "Erreur 404 : La page a été supprimée par un stagiaire trop zélé.", en: "Error 404: The page was deleted by an overzealous intern." },
  { fr: "Erreur 404 : La page est en train de rédiger son business plan.", en: "Error 404: The page is writing its business plan." },
  { fr: "Erreur 404 : La page a été envoyée en séminaire de motivation.", en: "Error 404: The page was sent to a motivation seminar." },
  { fr: "Erreur 404 : La page est en pleine session de growth hacking.", en: "Error 404: The page is in a growth hacking session." },
  { fr: "Erreur 404 : La page a été perdue dans un pivot stratégique.", en: "Error 404: The page got lost in a strategic pivot." },
  { fr: "Erreur 404 : La page est en train de chercher son marché cible.", en: "Error 404: The page is looking for its target market." },
  { fr: "Erreur 404 : La page a été mise en veille par le CTO.", en: "Error 404: The page was put to sleep by the CTO." },
  { fr: "Erreur 404 : La page est en pleine session de feedback utilisateur.", en: "Error 404: The page is in a user feedback session." },
  { fr: "Erreur 404 : La page a été envoyée en mission Lean Startup.", en: "Error 404: The page was sent on a Lean Startup mission." },
  { fr: "Erreur 404 : La page est en train de négocier avec des business angels.", en: "Error 404: The page is negotiating with business angels." },
  { fr: "Erreur 404 : La page a été absorbée dans un pivot disruptif.", en: "Error 404: The page was absorbed in a disruptive pivot." },
  { fr: "Erreur 404 : La page est en pleine session de mentoring.", en: "Error 404: The page is in a mentoring session." },
  { fr: "Erreur 404 : La page a été supprimée lors d’un refactoring sauvage.", en: "Error 404: The page was deleted during a wild refactoring." },
  { fr: "Erreur 404 : La page est en train de chercher son modèle économique.", en: "Error 404: The page is looking for its business model." },
  { fr: "Erreur 404 : La page a été envoyée en bootcamp d’innovation.", en: "Error 404: The page was sent to an innovation bootcamp." },
  { fr: "Erreur 404 : La page est en pleine session de co-création.", en: "Error 404: The page is in a co-creation session." },
  { fr: "Erreur 404 : La page a été supprimée lors d’un hackathon nocturne.", en: "Error 404: The page was deleted during a night hackathon." },
  { fr: "Erreur 404 : La page est en train de pivoter vers le SaaS.", en: "Error 404: The page is pivoting to SaaS." },
  { fr: "Erreur 404 : La page a été mise en stand-by pour cause de roadmap surchargée.", en: "Error 404: The page was put on hold due to an overloaded roadmap." },
  { fr: "Erreur 404 : La page est en pleine session de brainstorming.", en: "Error 404: The page is in a brainstorming session." },
  { fr: "Erreur 404 : La page a été supprimée par le product owner.", en: "Error 404: The page was deleted by the product owner." },
  { fr: "Erreur 404 : La page est en train de chercher son market fit.", en: "Error 404: The page is looking for its market fit." },
  { fr: "Erreur 404 : La page a été envoyée en séminaire de team building.", en: "Error 404: The page was sent to a team building seminar." },
  { fr: "Erreur 404 : La page est en pleine session de prototypage rapide.", en: "Error 404: The page is in a rapid prototyping session." },
  { fr: "Erreur 404 : La page a été supprimée lors d’un merge conflict.", en: "Error 404: The page was deleted during a merge conflict." },
  { fr: "Erreur 404 : La page est en train de chercher des early adopters.", en: "Error 404: The page is looking for early adopters." },
  { fr: "Erreur 404 : La page a été mise en pause pour cause de backlog infini.", en: "Error 404: The page was paused due to an infinite backlog." },
  { fr: "Erreur 404 : La page est en pleine session de validation de concept.", en: "Error 404: The page is in a concept validation session." },
  { fr: "Erreur 404 : La page a été supprimée lors d’un stand-up meeting.", en: "Error 404: The page was deleted during a stand-up meeting." },
  { fr: "Erreur 404 : La page est en train de chercher son persona idéal.", en: "Error 404: The page is looking for its ideal persona." },
  { fr: "Erreur 404 : La page a été envoyée en mission d’open innovation.", en: "Error 404: The page was sent on an open innovation mission." },
  { fr: "Erreur 404 : La page est en pleine session de pitch elevator.", en: "Error 404: The page is in an elevator pitch session." },
  { fr: "Erreur 404 : La page a été supprimée lors d’un daily scrum.", en: "Error 404: The page was deleted during a daily scrum." },
  { fr: "Erreur 404 : La page est en train de chercher son MVP.", en: "Error 404: The page is looking for its MVP." },
  { fr: "Erreur 404 : La page a été mise en pause pour cause de scaling.", en: "Error 404: The page was paused due to scaling." },
  { fr: "Erreur 404 : La page est en pleine session de user testing.", en: "Error 404: The page is in a user testing session." },
  { fr: "Erreur 404 : La page a été supprimée lors d’un pivot stratégique.", en: "Error 404: The page was deleted during a strategic pivot." },
  { fr: "Erreur 404 : La page est en train de chercher son NPS.", en: "Error 404: The page is looking for its NPS." },
  { fr: "Erreur 404 : La page a été envoyée en mission de growth.", en: "Error 404: The page was sent on a growth mission." },
  { fr: "Erreur 404 : La page est en pleine session de design sprint.", en: "Error 404: The page is in a design sprint session." },
  { fr: "Erreur 404 : La page a été supprimée lors d’un brainstorming intensif.", en: "Error 404: The page was deleted during an intensive brainstorming." },
  { fr: "Erreur 404 : La page est en train de chercher son TAM.", en: "Error 404: The page is looking for its TAM." },
  { fr: "Erreur 404 : La page a été mise en pause pour cause de churn élevé.", en: "Error 404: The page was paused due to high churn." },
  { fr: "Erreur 404 : La page est en pleine session de customer discovery.", en: "Error 404: The page is in a customer discovery session." },
  { fr: "Erreur 404 : La page a été supprimée lors d’un hackathon international.", en: "Error 404: The page was deleted during an international hackathon." },
  { fr: "Erreur 404 : La page est en train de chercher son ICP.", en: "Error 404: The page is looking for its ICP." },
  { fr: "Erreur 404 : La page a été envoyée en mission de scale-up.", en: "Error 404: The page was sent on a scale-up mission." },
  { fr: "Erreur 404 : La page est en pleine session de go-to-market.", en: "Error 404: The page is in a go-to-market session." },
  { fr: "Erreur 404 : La page a été supprimée lors d’un test A/B.", en: "Error 404: The page was deleted during an A/B test." },
  { fr: "Erreur 404 : La page est en train de chercher son CAC.", en: "Error 404: The page is looking for its CAC." },
  { fr: "Erreur 404 : La page a été mise en pause pour cause de cash burn.", en: "Error 404: The page was paused due to cash burn." },
  { fr: "Erreur 404 : La page est en pleine session de product discovery.", en: "Error 404: The page is in a product discovery session." },
  { fr: "Erreur 404 : La page a été supprimée lors d’un hackathon de weekend.", en: "Error 404: The page was deleted during a weekend hackathon." },
  { fr: "Erreur 404 : La page est en train de chercher son LTV.", en: "Error 404: The page is looking for its LTV." },
  { fr: "Erreur 404 : La page a été envoyée en mission de fundraising.", en: "Error 404: The page was sent on a fundraising mission." },
  { fr: "Erreur 404 : La page est en pleine session de product-market fit.", en: "Error 404: The page is in a product-market fit session." },
  { fr: "Erreur 404 : La page a été supprimée lors d’un daily stand-up.", en: "Error 404: The page was deleted during a daily stand-up." },
  { fr: "Erreur 404 : La page est en train de chercher son churn rate.", en: "Error 404: The page is looking for its churn rate." },
  { fr: "Erreur 404 : La page a été mise en pause pour cause de roadmap floue.", en: "Error 404: The page was paused due to a blurry roadmap." },
  { fr: "Erreur 404 : La page est en pleine session de customer success.", en: "Error 404: The page is in a customer success session." },
  { fr: "Erreur 404 : La page a été supprimée lors d’un hackathon étudiant.", en: "Error 404: The page was deleted during a student hackathon." },
  { fr: "Erreur 404 : La page est en train de chercher son break-even.", en: "Error 404: The page is looking for its break-even." },
  { fr: "Erreur 404 : La page a été envoyée en mission de scale.", en: "Error 404: The page was sent on a scaling mission." },
  { fr: "Erreur 404 : La page est en pleine session de business model canvas.", en: "Error 404: The page is in a business model canvas session." },
  { fr: "Erreur 404 : La page a été supprimée lors d’un hackathon corporate.", en: "Error 404: The page was deleted during a corporate hackathon." },
  { fr: "Erreur 404 : La page est en train de chercher son ROI.", en: "Error 404: The page is looking for its ROI." },
  { fr: "Erreur 404 : La page a été mise en pause pour cause de cash flow négatif.", en: "Error 404: The page was paused due to negative cash flow." },
  { fr: "Erreur 404 : La page est en pleine session de validation marché.", en: "Error 404: The page is in a market validation session." },
  { fr: "Erreur 404 : La page a été supprimée lors d’un hackathon open source.", en: "Error 404: The page was deleted during an open source hackathon." },
  { fr: "Erreur 404 : La page est en train de chercher son NPS score.", en: "Error 404: The page is looking for its NPS score." },
  { fr: "Erreur 404 : La page a été envoyée en mission de disruption.", en: "Error 404: The page was sent on a disruption mission." },
  { fr: "Erreur 404 : La page est en pleine session de lean canvas.", en: "Error 404: The page is in a lean canvas session." },
  { fr: "Erreur 404 : La page a été supprimée lors d’un hackathon remote.", en: "Error 404: The page was deleted during a remote hackathon." },
  { fr: "Erreur 404 : La page est en train de chercher son PMF.", en: "Error 404: The page is looking for its PMF." },
  { fr: "Erreur 404 : La page a été mise en pause pour cause de burn rate élevé.", en: "Error 404: The page was paused due to high burn rate." },
  { fr: "Erreur 404 : La page est en pleine session de design UX.", en: "Error 404: The page is in a UX design session." },
  { fr: "Erreur 404 : La page a été supprimée lors d’un hackathon international.", en: "Error 404: The page was deleted during an international hackathon." },
  { fr: "Erreur 404 : La page est en train de chercher son ICP idéal.", en: "Error 404: The page is looking for its ideal ICP." },
  { fr: "Erreur 404 : La page a été envoyée en mission de scale international.", en: "Error 404: The page was sent on an international scaling mission." },
  { fr: "Erreur 404 : La page est en pleine session de product design.", en: "Error 404: The page is in a product design session." },
  { fr: "Erreur 404 : La page a été supprimée lors d’un hackathon de startup.", en: "Error 404: The page was deleted during a startup hackathon." },
  { fr: "Erreur 404 : La page est en train de chercher son unicorn status.", en: "Error 404: The page is looking for its unicorn status." },
];


export const NotFoundSimple01 = () => {
  // Détection de la langue navigateur (français ou anglais)
  const lang = typeof window !== "undefined" && window.navigator.language.startsWith("fr") ? "fr" : "en";
  // Sélection aléatoire d'un message
  const randomMsg = notFoundMessages[Math.floor(Math.random() * notFoundMessages.length)][lang];

  return (
    <section className="flex min-h-screen items-start bg-primary py-16 md:items-center md:py-24">
      <div className="mx-auto max-w-container grow px-4 md:px-8">
        <div className="flex w-full max-w-3xl flex-col gap-8 md:gap-12">
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-md font-semibold text-brand-secondary">404 error</span>
              <h1 className="text-display-md font-semibold text-primary md:text-display-lg lg:text-display-xl">{randomMsg}</h1>
            </div>
            <p className="text-lg text-tertiary md:text-xl">
              {lang === "fr"
                ? "Désolé, la page que vous cherchez n'existe pas ou a été déplacée."
                : "Sorry, the page you are looking for doesn't exist or has been moved."}
            </p>
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button color="secondary" size="xl" iconLeading={ArrowLeft}>
              {lang === "fr" ? "Retour" : "Go back"}
            </Button>
            <Button size="xl">{lang === "fr" ? "Accueil" : "Take me home"}</Button>
          </div>
        </div>
      </div>
    </section>
  );
};
