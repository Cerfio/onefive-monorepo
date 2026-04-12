"use client";
import React, { useState } from "react";
import Builder from "@/components/builder";
import FeatureCard from "@/components/feature-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Filter,
  Download,
  BookOpen,
  Play,
  Star,
  Clock,
  FileText,
  Check,
  Users,
  Video,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ButtonJoinWaitlist from "@/components/ui/button-join-wailist";

// Cours et méthodologies
const methodologyCourses = [
  {
    id: 1,
    title: "Discover UX/UI",
    subtitle: "Sketching User Flows",
    instructor: {
      name: "Hayden Durand",
      role: "Co-Founder & CEO @HenryClub",
      avatar: "/speakers/hayden.jpg",
    },
    description:
      "Ce programme se concentre sur l'expérience utilisateur (UX) et l'interface utilisateur (UI) pour aider les entrepreneurs à créer des entreprises à succès en ligne.",
    category: "Design",
    subcategory: "UX/UI",
    duration: "2h 15min",
    modules: 20,
    completedModules: 2,
    rating: 5,
    reviews: 128,
    resources: [
      {
        name: "Download figma kit for this methodology",
        icon: <Download className="w-4 h-4" />,
      },
      {
        name: "View full course overview",
        icon: <FileText className="w-4 h-4" />,
      },
    ],
    isCertified: true,
    image: "/mockups/ux-course.jpg",
    isFeatured: true,
    progress: 10,
  },
  {
    id: 2,
    title: "Lean Startup Methodology",
    subtitle: "Validation & MVP Development",
    instructor: {
      name: "Sophie Chen",
      role: "Founder @LeanAcademy",
      avatar: "/speakers/sarah.jpg",
    },
    description:
      "Apprenez à lancer rapidement votre startup avec un minimum de ressources, valider votre idée et itérer efficacement.",
    category: "Startup",
    subcategory: "Business Strategy",
    duration: "3h 45min",
    modules: 18,
    completedModules: 0,
    rating: 4.8,
    reviews: 96,
    resources: [
      {
        name: "Download business canvas template",
        icon: <Download className="w-4 h-4" />,
      },
      {
        name: "Customer interview guide",
        icon: <FileText className="w-4 h-4" />,
      },
    ],
    isCertified: true,
    image: "/mockups/lean-startup.jpg",
    isFeatured: true,
    progress: 0,
  },
  {
    id: 3,
    title: "Pitch Deck Mastery",
    subtitle: "Creating Compelling Investor Presentations",
    instructor: {
      name: "Thomas Laurent",
      role: "Venture Capitalist @TechFund",
      avatar: "/franklin-mays.jpg",
    },
    description:
      "Créez un pitch deck qui captive les investisseurs et maximise vos chances de financement.",
    category: "Fundraising",
    subcategory: "Pitch",
    duration: "1h 30min",
    modules: 12,
    completedModules: 0,
    rating: 4.9,
    reviews: 145,
    resources: [
      {
        name: "Download pitch deck templates",
        icon: <Download className="w-4 h-4" />,
      },
      {
        name: "Investor Q&A cheat sheet",
        icon: <FileText className="w-4 h-4" />,
      },
    ],
    isCertified: true,
    image: "/mockups/pitch-deck.jpg",
    isFeatured: false,
    progress: 0,
  },
  {
    id: 4,
    title: "Growth Hacking Essentials",
    subtitle: "Scaling Your Startup with Limited Resources",
    instructor: {
      name: "Julie Moreau",
      role: "Growth Lead @RocketGrowth",
      avatar: "/isobel-fuller.jpg",
    },
    description:
      "Découvrez des stratégies de croissance non conventionnelles pour acquérir des utilisateurs rapidement sans budget important.",
    category: "Marketing",
    subcategory: "Growth",
    duration: "2h 45min",
    modules: 16,
    completedModules: 0,
    rating: 4.7,
    reviews: 89,
    resources: [
      {
        name: "Growth experiment templates",
        icon: <Download className="w-4 h-4" />,
      },
      { name: "Analytics setup guide", icon: <FileText className="w-4 h-4" /> },
    ],
    isCertified: false,
    image: "/mockups/growth-hacking.jpg",
    isFeatured: false,
    progress: 0,
  },
];

// Instructeurs vedettes
const instructors = [
  {
    name: "Hayden Durand",
    role: "Co-Founder & CEO @HenryClub",
    avatar: "/speakers/hayden.jpg",
    expertise: "UX/UI Design",
    courses: 5,
    students: 3240,
    rating: 4.9,
  },
  {
    name: "Sophie Chen",
    role: "Founder @LeanAcademy",
    avatar: "/speakers/sarah.jpg",
    expertise: "Lean Startup",
    courses: 3,
    students: 2150,
    rating: 4.8,
  },
  {
    name: "Thomas Laurent",
    role: "Venture Capitalist @TechFund",
    avatar: "/franklin-mays.jpg",
    expertise: "Fundraising",
    courses: 4,
    students: 2650,
    rating: 4.9,
  },
];

// Statistiques
const methodologyStats = [
  {
    value: "50+",
    label: "Méthodologies",
    description: "Couvrant tous les aspects de la création d'entreprise",
  },
  {
    value: "25+",
    label: "Experts",
    description: "Entrepreneurs et professionnels reconnus",
  },
  {
    value: "12K+",
    label: "Étudiants",
    description: "Entrepreneurs formés",
  },
  {
    value: "92%",
    label: "Satisfaction",
    description: "Note moyenne des utilisateurs",
  },
];

// Catégories principales
const categories = [
  { name: "Design", color: "bg-purple-100 text-purple-800", count: 12 },
  { name: "Startup", color: "bg-blue-100 text-blue-800", count: 18 },
  { name: "Fundraising", color: "bg-green-100 text-green-800", count: 8 },
  { name: "Marketing", color: "bg-orange-100 text-orange-800", count: 15 },
  { name: "Product", color: "bg-pink-100 text-pink-800", count: 10 },
  { name: "Finance", color: "bg-amber-100 text-amber-800", count: 6 },
];

// Témoignages
const testimonials = [
  {
    quote: "Les ressources méthodologiques nous ont évité bien des erreurs.",
    author: "Camille Perrin",
    role: "Consultante en stratégie digitale",
    avatar: "/isobel-fuller.jpg",
  },
  {
    quote:
      "J'ai pu lancer mon MVP en suivant pas à pas les méthodologies proposées.",
    author: "Alexandre Martin",
    role: "Fondateur de DataViz",
    avatar: "/franklin-mays.jpg",
  },
];

interface Course {
  id: number;
  title: string;
  subtitle: string;
  instructor: {
    name: string;
    role: string;
    avatar: string;
  };
  description: string;
  category: string;
  subcategory: string;
  duration: string;
  modules: number;
  completedModules: number;
  rating: number;
  reviews: number;
  resources: { name: string; icon: React.ReactNode }[];
  isCertified: boolean; 
  image: string;
  isFeatured: boolean;
  progress: number;
}

const CourseCard = ({ course }: { course: Course }) => {
  return (
    <div className="border rounded-lg overflow-hidden hover:border-[#5E6AD2] transition-all hover:shadow-md">
      <div className="relative">
        <Image
          src={course.image || "/mockups/default-course.jpg"}
          alt={course.title}
          width={400}
          height={225}
          className="w-full h-48 object-cover"
        />
        {course.isCertified && (
          <Badge className="absolute top-3 right-3 bg-white text-[#5E6AD2] border border-[#5E6AD2]">
            <CheckCircle className="w-3 h-3 mr-1" /> Certified
          </Badge>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between mb-2">
          <Badge
            className={`${
              course.category === "Design"
                ? "bg-purple-100 text-purple-800"
                : course.category === "Startup"
                  ? "bg-blue-100 text-blue-800"
                  : course.category === "Fundraising"
                    ? "bg-green-100 text-green-800"
                    : course.category === "Marketing"
                      ? "bg-orange-100 text-orange-800"
                      : course.category === "Product"
                        ? "bg-pink-100 text-pink-800"
                        : "bg-gray-100 text-gray-800"
            }`}
          >
            {course.category}
          </Badge>
          <Badge variant="outline">{course.subcategory}</Badge>
        </div>

        <h3 className="font-medium text-lg mb-1">{course.title}</h3>
        <h4 className="text-gray-600 mb-3">{course.subtitle}</h4>

        <div className="flex items-center gap-2 mb-3">
          <Image
            src={course.instructor.avatar}
            alt={course.instructor.name}
            width={28}
            height={28}
            className="rounded-full"
          />
          <span className="text-sm text-gray-600">
            {course.instructor.name}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {course.duration}
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {course.modules} modules
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            {course.rating} ({course.reviews})
          </div>
        </div>

        {course.progress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Progression</span>
              <span>
                {course.completedModules}/{course.modules} modules
              </span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
        )}

        <Button className="w-full bg-[#5E6AD2] hover:bg-[#4b58c4]">
          {course.progress > 0 ? "Continuer" : "Commencer"}
        </Button>
      </div>
    </div>
  );
};

const Body = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filtrer les cours basé sur la recherche et la catégorie
  const filteredCourses = methodologyCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      course.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-16 max-w-7xl mx-auto px-4 md:px-8">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-10 items-center">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#5E6AD2] to-[#8294FF]">
            Découvrez les méthodologies qui font réussir les startups
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Des cours et ressources créés par des entrepreneurs à succès pour
            vous aider à développer les compétences essentielles à chaque étape
            de votre projet.
          </p>
          <div className="flex gap-4">
            <ButtonJoinWaitlist text="Explorer les cours" />
            <Button variant="outline">Voir le catalogue</Button>
          </div>
        </div>
        <div className="flex-1">
          <Image
            src="/mockups/methodology-hero.jpg"
            alt="Methodology courses"
            width={600}
            height={400}
            className="rounded-lg shadow-md"
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid md:grid-cols-4 gap-6 my-8">
        {methodologyStats.map((stat, index) => (
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

      {/* Search and Filter Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              placeholder="Rechercher une méthodologie..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              className={selectedCategory === "all" ? "bg-[#5E6AD2]" : ""}
              onClick={() => setSelectedCategory("all")}
            >
              Tous
            </Button>
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={
                  selectedCategory === category.name.toLowerCase()
                    ? "default"
                    : "outline"
                }
                className={`whitespace-nowrap ${selectedCategory === category.name.toLowerCase() ? "bg-[#5E6AD2]" : ""}`}
                onClick={() => setSelectedCategory(category.name.toLowerCase())}
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Courses */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Méthodologies recommandées</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses
              .filter((course) => course.isFeatured)
              .map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
          </div>
        </div>

        {/* All Courses */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Toutes les méthodologies</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses
              .filter((course) => !course.isFeatured)
              .map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
          </div>
        </div>
      </div>

      {/* Featured Instructors */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold">Nos experts</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {instructors.map((instructor, index) => (
            <div
              key={index}
              className="border rounded-lg p-6 hover:border-[#5E6AD2] transition-all hover:shadow-md text-center"
            >
              <Image
                src={instructor.avatar}
                alt={instructor.name}
                width={80}
                height={80}
                className="rounded-full mx-auto mb-4"
              />
              <h3 className="font-medium text-lg">{instructor.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{instructor.role}</p>
              <Badge className="mb-4">{instructor.expertise}</Badge>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-[#5E6AD2]">
                    {instructor.courses}
                  </div>
                  <div className="text-xs text-gray-600">Cours</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-[#5E6AD2]">
                    {instructor.students}
                  </div>
                  <div className="text-xs text-gray-600">Étudiants</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-[#5E6AD2] flex items-center justify-center">
                    {instructor.rating}{" "}
                    <Star className="w-3 h-3 text-yellow-500 ml-1" />
                  </div>
                  <div className="text-xs text-gray-600">Note</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold">Ce que disent nos utilisateurs</h2>
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
          Prêt à monter en compétences ?
        </h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Rejoignez des milliers d'entrepreneurs qui développent leurs
          compétences avec nos méthodologies éprouvées.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <ButtonJoinWaitlist text="Accéder aux cours" />
          <Button variant="outline">Voir les offres premium</Button>
        </div>
      </div>
    </div>
  );
};

const MethodologyPage = () => {
  return (
    <div className="pt-8 mx-auto items-center justify-items-center min-h-screen pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
      <Builder
        badge="Methodology"
        title="Ressources & Méthodologies"
        description="Développez vos compétences entrepreneuriales grâce à des cours et méthodologies conçus par des experts."
        image="/mockups/methodology-preview.png"
        body={<Body />}
      />
    </div>
  );
};

export default MethodologyPage;
