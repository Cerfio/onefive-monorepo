"use client";
import React, { useState } from "react";
import Builder from "@/components/builder";
import FeatureCard from "@/components/feature-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  Users,
  PieChart,
  Clock,
  Search,
  Filter,
  ChevronRight,
  Award,
  BarChart2,
  Target,
  Shield,
  Briefcase,
  Zap,
  FileText,
  Star,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ButtonJoinWaitlist from "@/components/ui/button-join-wailist";

// Projets de financement
const investmentProjects = [
  {
    id: 1,
    name: "EcoTech Solutions",
    tagline: "Technologie verte pour un avenir durable",
    description:
      "Nous développons des solutions de recyclage innovantes pour réduire l'impact environnemental des déchets électroniques.",
    logo: "/logos/ecotech.svg",
    image: "/mockups/ecotech.jpg",
    raised: 180000,
    target: 250000,
    investors: 124,
    valuation: "1.8M€",
    sector: "GreenTech",
    stage: "Seed",
    location: "Paris, France",
    minInvestment: 100,
    timeLeft: "18 jours",
    founder: {
      name: "Marie Dubois",
      role: "CEO & Co-fondatrice",
      avatar: "/isobel-fuller.jpg",
    },
    highlights: [
      "3 brevets déposés",
      "Partenariat avec 2 grandes entreprises",
      "Prototype fonctionnel",
    ],
    isFeatured: true,
    progress: 72,
  },
  {
    id: 2,
    name: "HealthConnect",
    tagline: "Connecter les patients et professionnels de santé",
    description:
      "Notre plateforme permet aux patients de consulter des médecins à distance et de gérer leurs dossiers médicaux en toute sécurité.",
    logo: "/logos/healthconnect.svg",
    image: "/mockups/healthconnect.jpg",
    raised: 320000,
    target: 400000,
    investors: 215,
    valuation: "3.2M€",
    sector: "HealthTech",
    stage: "Série A",
    location: "Lyon, France",
    minInvestment: 250,
    timeLeft: "9 jours",
    founder: {
      name: "Thomas Laurent",
      role: "CEO & Fondateur",
      avatar: "/franklin-mays.jpg",
    },
    highlights: [
      "10 000 utilisateurs actifs",
      "Certifié RGPD",
      "Partenariat avec 3 hôpitaux",
    ],
    isFeatured: true,
    progress: 80,
  },
  {
    id: 3,
    name: "FinGenius",
    tagline: "Intelligence artificielle pour la finance personnelle",
    description:
      "FinGenius utilise l'IA pour aider les particuliers à optimiser leurs finances, épargner et investir intelligemment.",
    logo: "/logos/fingenius.svg",
    image: "/mockups/fingenius.jpg",
    raised: 90000,
    target: 150000,
    investors: 78,
    valuation: "1.2M€",
    sector: "FinTech",
    stage: "Pre-seed",
    location: "Bordeaux, France",
    minInvestment: 100,
    timeLeft: "25 jours",
    founder: {
      name: "Alexandre Chen",
      role: "CTO & Co-fondateur",
      avatar: "/speakers/hayden.jpg",
    },
    highlights: [
      "Algorithme propriétaire",
      "5 000 utilisateurs en bêta",
      "Équipe de 6 data scientists",
    ],
    isFeatured: false,
    progress: 60,
  },
];

// Statistiques d'investissement
const investmentStats = [
  {
    value: "12M€+",
    label: "Investis",
    description: "Sur notre plateforme",
  },
  {
    value: "8K+",
    label: "Investisseurs",
    description: "Communauté active",
  },
  {
    value: "45+",
    label: "Startups financées",
    description: "Avec succès",
  },
  {
    value: "82%",
    label: "Taux de réussite",
    description: "Des campagnes",
  },
];

// Secteurs d'investissement
const sectors = [
  { name: "GreenTech", color: "bg-green-100 text-green-800", count: 12 },
  { name: "HealthTech", color: "bg-blue-100 text-blue-800", count: 8 },
  { name: "FinTech", color: "bg-purple-100 text-purple-800", count: 15 },
  { name: "EdTech", color: "bg-yellow-100 text-yellow-800", count: 7 },
  { name: "AI & ML", color: "bg-red-100 text-red-800", count: 14 },
  { name: "SaaS", color: "bg-indigo-100 text-indigo-800", count: 18 },
];

// Témoignages
const testimonials = [
  {
    quote:
      "La section Crowdfunding nous a permis de lever des fonds en un temps record.",
    author: "Alexandre Bernard",
    role: "Co-fondateur de BrightWave",
    avatar: "/speakers/hayden.jpg",
  },
  {
    quote:
      "J'ai pu diversifier mon portefeuille avec des investissements dans des startups prometteuses dès 100€.",
    author: "Sophie Martin",
    role: "Investisseuse particulière",
    avatar: "/isobel-fuller.jpg",
  },
];

// Filtres
const stages = ["Pre-seed", "Seed", "Série A", "Série B+"];
const locations = ["Paris", "Lyon", "Bordeaux", "Lille", "Nantes", "Toulouse"];
const minimumInvestments = ["100€", "250€", "500€", "1000€+"];

// Avantages
const benefits = [
  {
    title: "Pour les entrepreneurs",
    items: [
      {
        title: "Financement rapide",
        description:
          "Levez des fonds auprès d'une communauté d'investisseurs qualifiés en quelques semaines.",
        icon: <Zap className="w-6 h-6 text-[#5E6AD2]" />,
      },
      {
        title: "Validation du marché",
        description:
          "Obtenez une validation de votre projet et des retours précieux de la part d'investisseurs.",
        icon: <Target className="w-6 h-6 text-[#5E6AD2]" />,
      },
      {
        title: "Visibilité accrue",
        description:
          "Bénéficiez d'une exposition médiatique et attirez l'attention de grands investisseurs.",
        icon: <TrendingUp className="w-6 h-6 text-[#5E6AD2]" />,
      },
    ],
  },
  {
    title: "Pour les investisseurs",
    items: [
      {
        title: "Investissement accessible",
        description:
          "Investissez dans des startups prometteuses à partir de 100€ seulement.",
        icon: <DollarSign className="w-6 h-6 text-[#5E6AD2]" />,
      },
      {
        title: "Portefeuille diversifié",
        description:
          "Constituez un portefeuille diversifié de startups dans différents secteurs.",
        icon: <PieChart className="w-6 h-6 text-[#5E6AD2]" />,
      },
      {
        title: "Sécurité juridique",
        description:
          "Profitez d'un cadre juridique sécurisé et transparent pour vos investissements.",
        icon: <Shield className="w-6 h-6 text-[#5E6AD2]" />,
      },
    ],
  },
];

// Processus d'investissement
const investmentProcess = [
  {
    title: "Découverte",
    description:
      "Explorez les projets innovants qui correspondent à vos intérêts d'investissement.",
    icon: <Search className="w-8 h-8" />,
  },
  {
    title: "Due Diligence",
    description:
      "Accédez à des données financières et business détaillées pour évaluer le potentiel.",
    icon: <FileText className="w-8 h-8" />,
  },
  {
    title: "Investissement",
    description:
      "Investissez à partir de 100€ et devenez actionnaire de startups prometteuses.",
    icon: <DollarSign className="w-8 h-8" />,
  },
  {
    title: "Suivi",
    description:
      "Recevez des mises à jour régulières sur le développement des startups de votre portefeuille.",
    icon: <BarChart2 className="w-8 h-8" />,
  },
];

const ProjectCard = ({
  project,
}: {
  project: {
    image?: string;
    name: string;
    tagline: string;
    logo?: string;
    description: string;
    raised: number;
    progress: number;
    investors: number;
    target: number;
    sector: string;
    stage: string;
    location: string;
    minInvestment: number;
    timeLeft: string;
  };
}) => (
  <div className="border rounded-lg overflow-hidden hover:border-[#5E6AD2] transition-all hover:shadow-md">
    <div className="relative h-40 overflow-hidden">
      <Image
        src={project.image || "/mockups/default-project.jpg"}
        alt={project.name}
        fill
        style={{ objectFit: "cover" }}
      />
      <div className="absolute top-3 right-3">
        <Badge
          className={
            project.sector === "GreenTech"
              ? "bg-green-100 text-green-800"
              : project.sector === "HealthTech"
                ? "bg-blue-100 text-blue-800"
                : project.sector === "FinTech"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-100 text-gray-800"
          }
        >
          {project.sector}
        </Badge>
      </div>
    </div>
    <div className="p-6">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg mb-1">{project.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{project.tagline}</p>
        </div>
        {project.logo ? (
          <Image
            src={project.logo}
            alt={`${project.name} logo`}
            width={40}
            height={40}
            className="rounded-md"
          />
        ) : (
          <div className="w-10 h-10 bg-[#5E6AD2]/10 rounded-md flex items-center justify-center text-[#5E6AD2] font-bold">
            {project.name.charAt(0)}
          </div>
        )}
      </div>

      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
        {project.description}
      </p>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">
            {project.raised.toLocaleString()}€ levés
          </span>
          <span className="text-gray-600">{project.progress}%</span>
        </div>
        <Progress value={project.progress} className="h-2" />
        <div className="flex justify-between text-xs mt-1">
          <span className="text-gray-600">
            {project.investors} investisseurs
          </span>
          <span className="text-gray-600">
            Objectif: {project.target.toLocaleString()}€
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div className="flex items-center gap-1 text-gray-700">
          <Briefcase className="w-4 h-4 text-gray-400" />
          <span>{project.stage}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-700">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{project.location}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-700">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>Min: {project.minInvestment}€</span>
        </div>
        <div className="flex items-center gap-1 text-gray-700">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{project.timeLeft}</span>
        </div>
      </div>

      <Button className="w-full">Investir maintenant</Button>
    </div>
  </div>
);

const Body = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");

  // Filtrer les projets selon les critères
  const filteredProjects = investmentProjects.filter((project) => {
    // Filtre de recherche
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Filtre par secteur
    const matchesSector =
      selectedSector === "all" || project.sector === selectedSector;

    // Filtre par stage
    const matchesStage =
      selectedStage === "all" || project.stage === selectedStage;

    return matchesSearch && matchesSector && matchesStage;
  });

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 flex flex-col">
            <span>Investissez dans</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5E6AD2] to-[#8B5CF6]">
              les startups de demain
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Devenez actionnaire de startups innovantes dès 100€ et participez à
            l'économie de demain grâce au crowdequity.
          </p>
          <div className="flex gap-4">
            <ButtonJoinWaitlist text="Investir maintenant" />
            <Button variant="outline">Comment ça marche</Button>
          </div>
        </div>
        <div className="flex-1">
          <Image
            src="/mockups/investment-hero.jpg"
            alt="Crowdfunding investment"
            width={600}
            height={400}
            className="rounded-lg shadow-md"
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid md:grid-cols-4 gap-6">
        {investmentStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg border border-gray-200 text-center"
          >
            <div className="text-3xl font-bold text-[#5E6AD2] mb-2">
              {stat.value}
            </div>
            <div className="font-medium mb-1">{stat.label}</div>
            <div className="text-sm text-gray-600">{stat.description}</div>
          </div>
        ))}
      </div>

      {/* Featured Projects */}
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Projets à la une</h2>
          <Link href="/investment/all">
            <Button variant="outline" className="flex items-center gap-2">
              Voir tous les projets
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {investmentProjects
            .filter((project) => project.isFeatured)
            .map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
        </div>
      </div>

      {/* Explore Projects Section */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold">Explorez par secteur</h2>

        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            placeholder="Recherchez un projet..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4">
          <Button
            variant={selectedSector === "all" ? "default" : "outline"}
            className={selectedSector === "all" ? "bg-[#5E6AD2]" : ""}
            onClick={() => setSelectedSector("all")}
          >
            Tous les secteurs
          </Button>
          {sectors.map((sector, index) => (
            <Button
              key={index}
              variant={selectedSector === sector.name ? "default" : "outline"}
              className={`whitespace-nowrap ${selectedSector === sector.name ? "bg-[#5E6AD2]" : ""}`}
              onClick={() => setSelectedSector(sector.name)}
            >
              {sector.name} ({sector.count})
            </Button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4">
          <Button
            variant={selectedStage === "all" ? "default" : "outline"}
            className={selectedStage === "all" ? "bg-[#5E6AD2]" : ""}
            onClick={() => setSelectedStage("all")}
          >
            Tous les stades
          </Button>
          {stages.map((stage, index) => (
            <Button
              key={index}
              variant={selectedStage === stage ? "default" : "outline"}
              className={`whitespace-nowrap ${selectedStage === stage ? "bg-[#5E6AD2]" : ""}`}
              onClick={() => setSelectedStage(stage)}
            >
              {stage}
            </Button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>

      {/* Process Section */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center">
          Comment investir avec Onefive
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          {investmentProcess.map((step, index) => (
            <div
              key={index}
              className="border rounded-xl p-6 text-center hover:border-[#5E6AD2] transition-all"
            >
              <div className="mx-auto bg-[#5E6AD2]/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <div className="text-[#5E6AD2]">{step.icon}</div>
              </div>
              <div className="absolute -mt-12 flex items-center justify-center w-8 h-8 rounded-full bg-[#5E6AD2] text-white font-bold text-sm mx-auto">
                {index + 1}
              </div>
              <h3 className="font-medium text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center">
          Les avantages du crowdequity
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefitGroup, groupIndex) => (
            <div key={groupIndex} className="space-y-6">
              <h3 className="text-xl font-semibold text-[#5E6AD2]">
                {benefitGroup.title}
              </h3>
              <div className="space-y-4">
                {benefitGroup.items.map((benefit, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex gap-4 items-start p-4 border rounded-lg hover:border-[#5E6AD2] transition-all"
                  >
                    <div className="mt-1">{benefit.icon}</div>
                    <div>
                      <h4 className="font-medium mb-1">{benefit.title}</h4>
                      <p className="text-sm text-gray-600">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold">Témoignages</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="border rounded-lg p-6 hover:border-[#5E6AD2] transition-all"
            >
              <div className="flex items-start gap-4">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  width={60}
                  height={60}
                  className="rounded-full"
                />
                <div>
                  <p className="text-gray-700 italic mb-4">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <h3 className="font-medium">{testimonial.author}</h3>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#F9FAFB] rounded-2xl p-8 md:p-12 text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Prêt à investir dans l'avenir ?
        </h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Rejoignez des milliers d'investisseurs et entrepreneurs sur notre
          plateforme de crowdequity et participez au financement de
          l'innovation.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <ButtonJoinWaitlist text="Créer un compte investisseur" />
          <Button variant="outline">Je suis entrepreneur</Button>
        </div>
      </div>
    </div>
  );
};

const InvestmentPage = () => {
  return (
    <div className="pt-8 mx-auto items-center justify-items-center min-h-screen pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
      <Builder
        badge="Investment"
        title="Crowdequity"
        description="Investissez dans des startups innovantes dès 100€ et devenez actionnaire de l'économie de demain."
        image="/mockups/investment-preview.png"
        body={<Body />}
      />
    </div>
  );
};

export default InvestmentPage;
