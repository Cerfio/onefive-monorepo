"use client";
import React, { useState, useEffect } from "react";
import Builder from "@/components/builder";
import FeatureCard from "@/components/feature-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Calendar,
  DollarSign,
  Building,
  Search,
  Filter,
  Coffee,
  Award,
  LampDesk,
  Users,
  Clock,
  ThumbsUp,
  ChevronRight,
  Map,
  List,
  Bookmark,
  StarIcon,
  ArrowUpRight,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ButtonJoinWaitlist from "@/components/ui/button-join-wailist";

// Incubateurs & Accélérateurs
const incubators = [
  {
    id: 1,
    name: "Station F",
    description: "World's largest startup campus in Paris",
    address: "5 Parvis Alan Turing, 75013 Paris",
    category: "Incubateur",
    image: "/mockups/stationf.jpg",
    application: "Candidature quadrimestre",
    domain: "Pas de domaine spécifique",
    rating: 4.8,
    reviews: 124,
    isFeatured: true,
  },
  {
    id: 2,
    name: "WILCO",
    description:
      "L'accélérateur d'innovation au service de votre transformation",
    address: "10 Rue de Moussy, 75004 Paris",
    category: "Accélérateur",
    image: "/mockups/wilco.jpg",
    application: "Candidature spontanée",
    domain: "Fintech, SaaS, Legaltech",
    rating: 4.6,
    reviews: 86,
    isFeatured: true,
  },
  {
    id: 3,
    name: "Paris&Co",
    description: "Accélérateur d'innovation de la Ville de Paris",
    address: "157 Boulevard Macdonald, 75019 Paris",
    category: "Incubateur",
    image: "/mockups/parisandco.jpg",
    application: "Appel à candidatures semestriel",
    domain: "Smart City, GreenTech, HealthTech",
    rating: 4.5,
    reviews: 92,
    isFeatured: false,
  },
];

// Concours & Appels à projets
const competitions = [
  {
    id: 1,
    name: "Viens lancer ta startup !",
    description: "Concours pour les entrepreneurs en phase d'amorçage",
    organizer: "Startup Banlieue",
    location: "14-16 Rue Voltaire, 94270 Le Kremlin-Bicêtre",
    category: "Concours",
    image: "/mockups/startup-competition.jpg",
    date: "10 févr. 2023, 19:00 - 12 févr. 2023, 19:00",
    participants: 259,
    price: "Free",
    deadline: "5 février 2023",
    isFeatured: true,
  },
  {
    id: 2,
    name: "Innovation Challenge",
    description: "Compétition d'innovation ouverte aux startups early-stage",
    organizer: "BPI France",
    location: "8 Boulevard Haussmann, 75009 Paris",
    category: "Appel à projets",
    image: "/mockups/bpi-challenge.jpg",
    date: "15 mars 2023 - 18 mars 2023",
    participants: 180,
    price: "Free",
    deadline: "28 février 2023",
    isFeatured: false,
  },
];

// Espaces de coworking & Cafés
const coworkings = [
  {
    id: 1,
    name: "WeWork Lafayette",
    description:
      "Quelle que soit votre façon de travailler, nous sommes là pour vous aider",
    address: "33 Rue la Fayette, 75009 Paris",
    category: "Coworking",
    image: "/mockups/wework.jpg",
    price: "29,99 € / jour",
    openHours: "24/24",
    amenities: ["WiFi", "Café", "Salles de réunion", "Imprimantes"],
    rating: 4.3,
    reviews: 108,
    isFeatured: true,
  },
  {
    id: 2,
    name: "Café Craft",
    description: "Café et espace de travail pour les créatifs",
    address: "24 Rue des Vinaigriers, 75010 Paris",
    category: "Café",
    image: "/mockups/cafe-craft.jpg",
    price: "Consommation obligatoire",
    openHours: "8:30 - 19:00",
    amenities: ["WiFi", "Prises électriques", "Café de spécialité"],
    rating: 4.5,
    reviews: 92,
    isFeatured: false,
  },
];

// Événements
const events = [
  {
    id: 1,
    name: "Paris Startup Meetup",
    description: "Networking pour entrepreneurs et investisseurs",
    organizer: "Startup Network France",
    location: "Station F, 75013 Paris",
    category: "Networking",
    image: "/mockups/paris-meetup.jpg",
    date: "22 février 2023, 18:30 - 21:00",
    participants: 150,
    price: "Free",
    isFeatured: true,
  },
  {
    id: 2,
    name: "Workshop Pitch Deck",
    description: "Apprenez à créer un pitch deck efficace",
    organizer: "Founders Institute",
    location: "Le Perchoir Marais, 75003 Paris",
    category: "Workshop",
    image: "/mockups/pitch-workshop.jpg",
    date: "28 février 2023, 14:00 - 17:00",
    participants: 65,
    price: "25 €",
    isFeatured: false,
  },
];

// Catégories pour filtres
const categories = [
  {
    name: "Incubateur",
    color: "bg-blue-100 text-blue-800",
    icon: <Building className="w-4 h-4" />,
  },
  {
    name: "Accélérateur",
    color: "bg-purple-100 text-purple-800",
    icon: <LampDesk className="w-4 h-4" />,
  },
  {
    name: "Coworking",
    color: "bg-green-100 text-green-800",
    icon: <Users className="w-4 h-4" />,
  },
  {
    name: "Café",
    color: "bg-amber-100 text-amber-800",
    icon: <Coffee className="w-4 h-4" />,
  },
  {
    name: "Concours",
    color: "bg-pink-100 text-pink-800",
    icon: <Award className="w-4 h-4" />,
  },
  {
    name: "Événement",
    color: "bg-indigo-100 text-indigo-800",
    icon: <Calendar className="w-4 h-4" />,
  },
];

// Domaines/tags pour filtres
const domains = [
  { name: "Fintech", color: "bg-emerald-100 text-emerald-800" },
  { name: "HealthTech", color: "bg-red-100 text-red-800" },
  { name: "SaaS", color: "bg-sky-100 text-sky-800" },
  { name: "GreenTech", color: "bg-lime-100 text-lime-800" },
  { name: "E-commerce", color: "bg-orange-100 text-orange-800" },
  { name: "Legaltech", color: "bg-violet-100 text-violet-800" },
];

// Villes populaires
const popularCities = [
  "Paris",
  "Lyon",
  "Marseille",
  "Bordeaux",
  "Lille",
  "Toulouse",
  "Nantes",
  "Strasbourg",
];

// Études de cas
const spotlightCases = [
  {
    title: "Comment TechVision a trouvé ses investisseurs",
    description:
      "Grâce à Spotlight, TechVision a identifié et connecté avec 3 investisseurs clés en moins de 2 semaines.",
    logo: "/logos/techvision.svg",
    stats: "2,5M€ levés",
  },
  {
    title: "GreenImpact et sa croissance internationale",
    description:
      "En utilisant Spotlight pour identifier des partenaires internationaux, GreenImpact s'est déployée dans 4 nouveaux pays.",
    logo: "/logos/greenimpact.svg",
    stats: "+400% de croissance",
  },
  {
    title: "La stratégie de recrutement de DataFlow",
    description:
      "DataFlow a recruté toute son équipe technique en visualisant les talents disponibles via Spotlight.",
    logo: "/logos/dataflow.svg",
    stats: "12 recrutements clés",
  },
];

// Témoignages
const testimonials = [
  {
    quote:
      "J'adore la section Spotlight, elle centralise tout ce dont j'ai besoin pour mon projet.",
    author: "Léa Dupont",
    role: "CEO de HappyNest",
    avatar: "/isobel-fuller.jpg",
  },
  {
    quote:
      "Spotlight nous a permis d'identifier les opportunités et tendances que nous n'aurions jamais vues autrement.",
    author: "Marc Durand",
    role: "Fondateur de NextWave",
    avatar: "/franklin-mays.jpg",
  },
];

interface Resource {
  id: number;
  name: string;
  description: string;
  image: string;
  category: string;
  isFeatured: boolean;
  rating?: number;
  reviews?: number;
  domain?: string;
  application?: string;
  price?: string;
  openHours?: string;
  participants?: number;
  date?: string;
  location?: string;
  address?: string;
  amenities?: string[];
  organizer?: string;
  deadline?: string;
}

const ResourceCard = ({
  resource,
  type,
}: {
  resource: Resource;
  type: string;
}) => {
  const getDetailsByType = () => {
    switch (type) {
      case "incubator":
        return (
          <>
            <div className="text-sm text-gray-500 mb-1">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{resource.application}</span>
              </div>
            </div>
            {resource.domain && (
              <div className="flex flex-wrap gap-1 mb-3">
                {resource.domain.split(", ").map((domain, idx) => (
                  <Badge
                    key={idx}
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    {domain}
                  </Badge>
                ))}
              </div>
            )}
          </>
        );
      case "competition":
        return (
          <>
            <div className="text-sm text-gray-500 mb-1">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{resource.date}</span>
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-1">
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{resource.participants} participants</span>
              </div>
            </div>
            <div className="text-sm font-medium text-red-600 mb-3">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Date limite: {resource.deadline}</span>
              </div>
            </div>
          </>
        );
      case "coworking":
        return (
          <>
            <div className="text-sm text-gray-500 mb-1">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                <span>{resource.price}</span>
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-1">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Ouvert {resource.openHours}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {resource.amenities?.slice(0, 3).map((amenity, idx) => (
                <Badge key={idx} variant="outline" className="bg-gray-50">
                  {amenity}
                </Badge>
              ))}
              {resource.amenities?.length && resource.amenities.length > 3 && (
                <Badge variant="outline" className="bg-gray-50">
                  +{resource.amenities.length - 3}
                </Badge>
              )}
            </div>
          </>
        );
      case "event":
        return (
          <>
            <div className="text-sm text-gray-500 mb-1">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{resource.date}</span>
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-1">
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{resource.participants} participants</span>
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                <span>{resource.price}</span>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden hover:border-[#5E6AD2] transition-all hover:shadow-sm">
      <div className="relative h-40">
        <Image
          src={resource.image || "/placeholder.jpg"}
          alt={resource.name}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge className={getCategoryColor(resource.category)}>
            {resource.category}
          </Badge>
        </div>
        {resource.isFeatured && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-yellow-100 text-yellow-800">
              <Star className="w-3 h-3 fill-yellow-500 mr-1" /> Recommandé
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-medium text-lg mb-1">{resource.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{resource.description}</p>

        <div className="text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{resource.address || resource.location}</span>
          </div>
        </div>

        {getDetailsByType()}

        <div className="flex justify-between items-center">
          {resource.rating && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(Math.floor(resource.rating))].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
                  />
                ))}
                {resource.rating % 1 !== 0 && (
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                )}
              </div>
              <span className="text-sm font-medium">{resource.rating}</span>
              <span className="text-xs text-gray-500">
                ({resource.reviews})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getCategoryColor = (category: string) => {
  const found = categories.find((c) => c.name === category);
  return found ? found.color : "bg-gray-100 text-gray-800";
};

const Body = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [location, setLocation] = useState("Paris, France");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'map'

  return (
    <div className="flex flex-col gap-16 max-w-7xl mx-auto px-4 md:px-8 mt-16">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-10 items-center">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#5E6AD2] to-[#8294FF]">
            Trouvez toutes les ressources pour votre startup
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Spotlight centralise les meilleures opportunités pour les
            entrepreneurs : incubateurs, concours, espaces de travail et
            événements. Tout ce dont vous avez besoin pour lancer et développer
            votre projet.
          </p>
          <div className="flex gap-4">
            <ButtonJoinWaitlist text="Explorer Spotlight" />
            <Link href="/about">
              <Button variant="outline">À propos</Button>
            </Link>
          </div>
        </div>
        <div className="relative w-full md:w-1/2 h-[400px] rounded-xl overflow-hidden shadow-xl">
          <Image
            src="/mockups/spotlight-resource-map.png"
            alt="Spotlight Resource Map"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="all" className="-mt-8">
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mélange des ressources recommandées */}
            {[...incubators, ...competitions, ...coworkings, ...events]
              .filter((item) => item.isFeatured)
              .map((resource) => {
                const type =
                  resource.category === "Incubateur" ||
                  resource.category === "Accélérateur"
                    ? "incubator"
                    : resource.category === "Concours" ||
                        resource.category === "Appel à projets"
                      ? "competition"
                      : resource.category === "Coworking" ||
                          resource.category === "Café"
                        ? "coworking"
                        : "event";

                return (
                  <ResourceCard
                    key={`${type}-${resource.id}`}
                    resource={resource}
                    type={type}
                  />
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="incubateurs" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {incubators.map((incubator) => (
              <ResourceCard
                key={incubator.id}
                resource={incubator}
                type="incubator"
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="concours" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map((competition) => (
              <ResourceCard
                key={competition.id}
                resource={competition}
                type="competition"
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coworking" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coworkings.map((coworking) => (
              <ResourceCard
                key={coworking.id}
                resource={coworking}
                type="coworking"
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <ResourceCard key={event.id} resource={event} type="event" />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Features Section */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center">
          Tout ce dont vous avez besoin pour réussir
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="border rounded-xl p-6 hover:border-[#5E6AD2] transition-all">
            <div className="bg-blue-100 text-blue-800 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-lg mb-2">
              Incubateurs & Accélérateurs
            </h3>
            <p className="text-gray-600">
              Découvrez les meilleures structures d'accompagnement pour votre
              startup.
            </p>
          </div>

          <div className="border rounded-xl p-6 hover:border-[#5E6AD2] transition-all">
            <div className="bg-pink-100 text-pink-800 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-lg mb-2">
              Concours & Appels à projets
            </h3>
            <p className="text-gray-600">
              Trouvez des opportunités de financement et de visibilité.
            </p>
          </div>

          <div className="border rounded-xl p-6 hover:border-[#5E6AD2] transition-all">
            <div className="bg-green-100 text-green-800 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Coffee className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-lg mb-2">
              Espaces de coworking & Cafés
            </h3>
            <p className="text-gray-600">
              Identifiez les meilleurs endroits pour travailler et réseauter.
            </p>
          </div>

          <div className="border rounded-xl p-6 hover:border-[#5E6AD2] transition-all">
            <div className="bg-purple-100 text-purple-800 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-lg mb-2">Événements</h3>
            <p className="text-gray-600">
              Restez informé des meilleurs meetups, ateliers et conférences.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#F9FAFB] rounded-2xl p-8 md:p-12 text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Prêt à découvrir les meilleures ressources pour votre startup ?
        </h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Rejoignez Spotlight et accédez à un écosystème entrepreneurial complet
          pour trouver l'accompagnement, les financements et les espaces dont
          vous avez besoin.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <ButtonJoinWaitlist text="Accéder à Spotlight" />
          <Button variant="outline">Demander une démo</Button>
        </div>
      </div>
    </div>
  );
};

const SpotlightPage = () => {
  return (
    <div className="pt-8 mx-auto items-center justify-items-center min-h-screen pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
      <Builder
        badge="Spotlight"
        title="Découvrez toutes les ressources entrepreneuriales"
        description="Trouvez des incubateurs, concours, espaces de travail et événements pour développer votre startup."
        image={null}
        displayJoinWaitlist={false}
        body={<Body />}
      />
    </div>
  );
};

export default SpotlightPage;
