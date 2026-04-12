"use client";

import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/lib/utils";
import { Language } from "@/types/languages";

const reviews = [
  {
    firstName: "Emma",
    lastName: "Dubois",
    pseudo: "@emmad",
    testimonial: {
      fr: "Onefive a complètement changé notre manière de réseauter.",
      en: "Onefive completely transformed the way we network.",
    },
    job: {
      fr: "CEO de Innovatech",
      en: "CEO at Innovatech",
    },
  },
  {
    firstName: "Louis",
    lastName: "Morel",
    pseudo: "@lmorel",
    testimonial: {
      fr: "Grâce à Onefive, nous avons trouvé des investisseurs en quelques semaines !",
      en: "Thanks to Onefive, we found investors within weeks!",
    },
    job: {
      fr: "CFO chez GreenPulse",
      en: "CFO at GreenPulse",
    },
  },
  {
    firstName: "Chloé",
    lastName: "Lefèvre",
    pseudo: "@chloeL",
    testimonial: {
      fr: "C'est devenu notre plateforme de référence pour suivre les dernières tendances startup.",
      en: "It has become our go-to platform to track startup trends.",
    },
    job: {
      fr: "Marketing Manager chez StartupBoost",
      en: "Marketing Manager at StartupBoost",
    },
  },
  {
    firstName: "Nathan",
    lastName: "Caron",
    pseudo: "@nathanc",
    testimonial: {
      fr: "J'ai rencontré des mentors incroyables via Onefive.",
      en: "I met incredible mentors through Onefive.",
    },
    job: {
      fr: "Fondateur de CaronTech",
      en: "Founder at CaronTech",
    },
  },
  {
    firstName: "Sophie",
    lastName: "Garnier",
    pseudo: "@sophieg",
    testimonial: {
      fr: "Onefive nous a aidés à décrocher notre place dans un incubateur prestigieux.",
      en: "Onefive helped us secure a spot in a prestigious incubator.",
    },
    job: {
      fr: "COO de FoodLab",
      en: "COO at FoodLab",
    },
  },
  {
    firstName: "Julien",
    lastName: "Martin",
    pseudo: "@julmart",
    testimonial: {
      fr: "La communauté est super active et toujours prête à aider.",
      en: "The community is super active and always willing to help.",
    },
    job: {
      fr: "Développeur Full Stack chez NextLevel",
      en: "Full Stack Developer at NextLevel",
    },
  },
  {
    firstName: "Léa",
    lastName: "Dupont",
    pseudo: "@leadup",
    testimonial: {
      fr: "J'adore la section Spotlight, elle centralise tout ce dont j'ai besoin pour mon projet.",
      en: "I love the Spotlight section; it centralizes everything I need for my project.",
    },
    job: {
      fr: "CEO de HappyNest",
      en: "CEO at HappyNest",
    },
  },
  {
    firstName: "Thomas",
    lastName: "Fontaine",
    pseudo: "@tfontaine",
    testimonial: {
      fr: "Onefive, c'est notre boîte à outils digitale pour avancer plus vite.",
      en: "Onefive is our digital toolbox to move faster.",
    },
    job: {
      fr: "CTO chez Startly",
      en: "CTO at Startly",
    },
  },
  {
    firstName: "Camille",
    lastName: "Perrin",
    pseudo: "@cperrin",
    testimonial: {
      fr: "Les ressources méthodologiques nous ont évité bien des erreurs.",
      en: "The methodological resources saved us from many mistakes.",
    },
    job: {
      fr: "Consultante en stratégie digitale",
      en: "Digital Strategy Consultant",
    },
  },
  {
    firstName: "Alexandre",
    lastName: "Bernard",
    pseudo: "@alexb",
    testimonial: {
      fr: "La section Crowdfunding nous a permis de lever des fonds en un temps record.",
      en: "The Crowdfunding section helped us raise funds in record time.",
    },
    job: {
      fr: "Co-fondateur de BrightWave",
      en: "Co-founder at BrightWave",
    },
  },
  {
    firstName: "Mélanie",
    lastName: "Durand",
    pseudo: "@meldu",
    testimonial: {
      fr: "La plateforme est intuitive et facile à utiliser.",
      en: "The platform is intuitive and easy to use.",
    },
    job: {
      fr: "Responsable RH chez TalentWorks",
      en: "HR Manager at TalentWorks",
    },
  },
  {
    firstName: "Clément",
    lastName: "Roux",
    pseudo: "@clemroux",
    testimonial: {
      fr: "Onefive nous a donné une visibilité incroyable.",
      en: "Onefive gave us incredible visibility.",
    },
    job: {
      fr: "CMO chez VisionUp",
      en: "CMO at VisionUp",
    },
  },
  {
    firstName: "Isabelle",
    lastName: "Petit",
    pseudo: "@isapetit",
    testimonial: {
      fr: "Nous avons recruté trois talents grâce à Onefive.",
      en: "We recruited three talents thanks to Onefive.",
    },
    job: {
      fr: "Directrice RH chez FastTrack",
      en: "HR Director at FastTrack",
    },
  },
  {
    firstName: "Lucas",
    lastName: "Renard",
    pseudo: "@lucasren",
    testimonial: {
      fr: "L'outil de méthodologie est une pépite pour structurer son projet.",
      en: "The methodology tool is a gem for structuring your project.",
    },
    job: {
      fr: "Consultant indépendant",
      en: "Independent Consultant",
    },
  },
  {
    firstName: "Claire",
    lastName: "Barbier",
    pseudo: "@claireb",
    testimonial: {
      fr: "Onefive nous a fait gagner un temps précieux.",
      en: "Onefive saved us precious time.",
    },
    job: {
      fr: "Product Owner chez DevHub",
      en: "Product Owner at DevHub",
    },
  },
  {
    firstName: "Antoine",
    lastName: "Blanc",
    pseudo: "@antoineb",
    testimonial: {
      fr: "La section Community est très dynamique et engageante.",
      en: "The Community section is very dynamic and engaging.",
    },
    job: {
      fr: "COO chez NextGenTech",
      en: "COO at NextGenTech",
    },
  },
  {
    firstName: "Valérie",
    lastName: "Girard",
    pseudo: "@valgirard",
    testimonial: {
      fr: "Onefive m'a permis de lancer mon projet en confiance.",
      en: "Onefive gave me the confidence to launch my project.",
    },
    job: {
      fr: "Entrepreneure",
      en: "Entrepreneur",
    },
  },
  {
    firstName: "Paul",
    lastName: "Verdier",
    pseudo: "@paulv",
    testimonial: {
      fr: "Un incontournable pour tous les entrepreneurs.",
      en: "A must-have for every entrepreneur.",
    },
    job: {
      fr: "Fondateur de BrightSky",
      en: "Founder at BrightSky",
    },
  },
  {
    firstName: "Élise",
    lastName: "Bouvier",
    pseudo: "@eliseb",
    testimonial: {
      fr: "Je recommande vivement Onefive à tous les créateurs.",
      en: "I highly recommend Onefive to all creators.",
    },
    job: {
      fr: "Directrice de création",
      en: "Creative Director",
    },
  },
  {
    firstName: "Romain",
    lastName: "Clément",
    pseudo: "@rclement",
    testimonial: {
      fr: "Une plateforme visionnaire pour les startups.",
      en: "A visionary platform for startups.",
    },
    job: {
      fr: "VP Innovation chez GrowthHub",
      en: "VP Innovation at GrowthHub",
    },
  },
  {
    firstName: "Marine",
    lastName: "Fischer",
    pseudo: "@marinef",
    testimonial: {
      fr: "L'interface est moderne et très agréable à utiliser.",
      en: "The interface is modern and very pleasant to use.",
    },
    job: {
      fr: "UX Designer chez DreamWorks",
      en: "UX Designer at DreamWorks",
    },
  },
  {
    firstName: "Arthur",
    lastName: "Leclerc",
    pseudo: "@arthurlec",
    testimonial: {
      fr: "Nous avons triplé notre base d'utilisateurs grâce à Onefive.",
      en: "We tripled our user base thanks to Onefive.",
    },
    job: {
      fr: "Growth Manager chez SeedUp",
      en: "Growth Manager at SeedUp",
    },
  },
  {
    firstName: "Manon",
    lastName: "Rousseau",
    pseudo: "@manrousseau",
    testimonial: {
      fr: "Les fonctionnalités proposées sont parfaitement adaptées aux startups.",
      en: "The features offered are perfectly suited for startups.",
    },
    job: {
      fr: "CMO chez StartPlanet",
      en: "CMO at StartPlanet",
    },
  },
  {
    firstName: "Vincent",
    lastName: "Nicolas",
    pseudo: "@vincentnic",
    testimonial: {
      fr: "Un outil indispensable pour structurer et faire grandir sa startup.",
      en: "An essential tool to structure and grow your startup.",
    },
    job: {
      fr: "Entrepreneur chez TechSavvy",
      en: "Entrepreneur at TechSavvy",
    },
  },
  {
    firstName: "Sarah",
    lastName: "Bourgeois",
    pseudo: "@sarahbg",
    testimonial: {
      fr: "Grâce à Onefive, nous avons trouvé des partenaires stratégiques qui ont accéléré notre croissance.",
      en: "Thanks to Onefive, we found strategic partners who accelerated our growth.",
    },
    job: {
      fr: "CEO chez GreenTech Innov",
      en: "CEO at GreenTech Innov",
    },
  },
];

const ReviewCard = ({
  firstName,
  lastName,
  pseudo,
  testimonial,
  job,
  locale,
}: {
  firstName: string;
  lastName: string;
  pseudo: string;
  testimonial: { fr: string; en: string };
  job: { fr: string; en: string };
  locale: Language;
}) => {
  return (
    <figure
      className={cn(
        "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <div className="flex flex-col">
          <figcaption className="text-[#101828] text-sm font-semibold leading-5">
            {firstName} {lastName}
          </figcaption>
          <p className="text-[#475467] text-xs font-semibold leading-5">
            {job[locale]}
          </p>
        </div>
      </div>
      <blockquote className="text-[#475467] text-sm font-normal leading-5">
        {testimonial[locale]}
      </blockquote>
    </figure>
  );
};

function MarqueeDemo({ locale }: { locale: Language }) {
  const firstRow = reviews.slice(0, reviews.length / 2);
  const secondRow = reviews.slice(reviews.length / 2);

  return (
    <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden gap-5">
      <Marquee pauseOnHover className="[--duration:100s]">
        {firstRow.map((review) => (
          <ReviewCard key={review.pseudo} {...review} locale={locale} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:100s]">
        {secondRow.map((review) => (
          <ReviewCard key={review.pseudo} {...review} locale={locale} />
        ))}
      </Marquee>
    </div>
  );
}

interface TestimonialsSectionProps {
  locale: Language;
}

export default function TestimonialsSection({ locale }: TestimonialsSectionProps) {
  return (
    <div className="flex flex-col items-center justify-center max-w-7xl w-full overflow-hidden">
      <MarqueeDemo locale={locale} />
    </div>
  );
}

