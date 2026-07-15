import { SITE_URL } from "@/lib/site";

type QA = { q: string; a: string };

const FAQ: Record<"en" | "fr", QA[]> = {
  en: [
    {
      q: "What is Onefive?",
      a: "Onefive is a platform that connects entrepreneurs, investors and experts. It brings networking, a secure fundraising dataroom and startup resources together in one ecosystem.",
    },
    {
      q: "Who is Onefive for?",
      a: "Startup founders, investors (VCs and business angels) and experts or mentors who want to connect, share deals and help ventures grow.",
    },
    {
      q: "What is the Onefive dataroom?",
      a: "A secure space to share your startup's documents with investors during a fundraise, with granular, per-category access control and revocable links.",
    },
    {
      q: "How do I get access to Onefive?",
      a: "Onefive is in pre-launch. Join the waitlist from the homepage and we'll notify you as soon as your access opens.",
    },
    {
      q: "Where is Onefive based?",
      a: "Onefive was founded in 2025 and is based in Paris, France, with a product available in English and French.",
    },
  ],
  fr: [
    {
      q: "Qu'est-ce qu'Onefive ?",
      a: "Onefive est une plateforme qui connecte entrepreneurs, investisseurs et experts. Elle réunit networking, dataroom de levée de fonds sécurisée et ressources startup dans un seul écosystème.",
    },
    {
      q: "À qui s'adresse Onefive ?",
      a: "Aux fondateurs de startups, aux investisseurs (fonds et business angels) et aux experts ou mentors qui veulent se connecter, partager des deals et faire grandir des projets.",
    },
    {
      q: "Qu'est-ce que la dataroom Onefive ?",
      a: "Un espace sécurisé pour partager les documents de votre startup avec des investisseurs pendant une levée, avec un contrôle d'accès granulaire par catégorie et des liens révocables.",
    },
    {
      q: "Comment accéder à Onefive ?",
      a: "Onefive est en pré-lancement. Inscrivez-vous à la waitlist depuis la page d'accueil : nous vous préviendrons dès l'ouverture de votre accès.",
    },
    {
      q: "Où est basé Onefive ?",
      a: "Onefive a été fondé en 2025 et est basé à Paris, avec un produit disponible en français et en anglais.",
    },
  ],
};

/**
 * FAQ section + FAQPage JSON-LD. Static content (no data fetching), so it is
 * fully server-rendered into the HTML even though the homepage that hosts it is
 * a client component — which is what makes it citable by AI search / eligible
 * for Google's FAQ + AI Overviews. Uses native <details> so it works with no JS.
 */
export default function FaqSection({ locale }: { locale: string }) {
  const items = FAQ[locale === "fr" ? "fr" : "en"];
  const heading = locale === "fr" ? "Questions fréquentes" : "Frequently asked questions";

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/${locale}#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <section
      // The FAQPage schema below declares @id `<url>#faq`, so the fragment has
      // to resolve to something — it did not. It is also what /terms links to,
      // there being no standalone FAQ page.
      id="faq"
      className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <h2 className="text-3xl font-bold text-center text-[#101828] mb-10">
        {heading}
      </h2>
      <div className="flex flex-col divide-y divide-gray-200 border-y border-gray-200">
        {items.map((item) => (
          <details key={item.q} className="group py-5">
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-semibold text-[#101828] list-none">
              {item.q}
              <span className="text-[#5E6AD2] transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-[#475467] leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
