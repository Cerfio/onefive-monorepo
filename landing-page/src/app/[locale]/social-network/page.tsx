"use client";
import React, { useState } from "react";
import Builder from "@/components/builder";
import FeatureCard from "@/components/feature-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  MessageCircle,
  ThumbsUp,
  Heart,
  Globe,
  Award,
  Bell,
  Share2,
  Search,
  Bookmark,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ButtonJoinWaitlist from "@/components/ui/button-join-wailist";

// Profils populaires
const featuredProfiles = [
  {
    name: "Thomas Laurent",
    avatar: "/franklin-mays.jpg",
    role: "Fondateur & CEO, TechVision",
    followers: 2845,
    bio: "Entrepreneur en série, investisseur, mentor dans la tech.",
    status: "En ligne",
  },
  {
    name: "Sophie Moreau",
    avatar: "/isobel-fuller.jpg",
    role: "Co-fondatrice, GreenImpact",
    followers: 1624,
    bio: "Investisseuse dans les startups cleantech et développement durable.",
    status: "Dernière connexion il y a 4h",
  },
  {
    name: "Alexandre Chen",
    avatar: "/speakers/sarah.jpg",
    role: "CTO, DataFlow",
    followers: 3105,
    bio: "Expert en IA et traitement de données, ancien de Google.",
    status: "En ligne",
  },
];

// Statistiques du réseau

// Posts tendance
const trendingPosts = [
  {
    id: 1,
    author: {
      name: "Clara Dubois",
      avatar: "/isobel-fuller.jpg",
      role: "Fondatrice, NutriTech",
    },
    content:
      "Nous venons de finaliser notre série A ! Merci à toute l'équipe et à nos investisseurs qui ont rendu cela possible. Un grand pas pour NutriTech ! #funding #startup #foodtech",
    media: "/mockups/post-image1.jpg",
    likes: 342,
    comments: 56,
    shares: 28,
    time: "Il y a 2h",
    trending: true,
  },
  {
    id: 2,
    author: {
      name: "Marc Lefèvre",
      avatar: "/franklin-mays.jpg",
      role: "CEO, Quantum Labs",
    },
    content:
      "Je recherche un CTO expérimenté pour rejoindre notre aventure dans la technologie quantique. Idéalement quelqu'un avec une expérience en informatique quantique et en gestion d'équipe. DM si intéressé ! #recrutement #quantumcomputing",
    media: null,
    likes: 124,
    comments: 87,
    shares: 15,
    time: "Il y a 5h",
    trending: true,
  },
  {
    id: 3,
    author: {
      name: "Julie Nguyen",
      avatar: "/speakers/sarah.jpg",
      role: "Angel Investor",
    },
    content:
      "J'organise un petit-déjeuner networking pour les fondateurs de SaaS à Paris la semaine prochaine. Places limitées. Inscrivez-vous via le lien dans ma bio ! #networking #saas #startuplife",
    media: "/mockups/post-image2.jpg",
    likes: 256,
    comments: 42,
    shares: 31,
    time: "Il y a 1j",
    trending: false,
  },
];

// Suggestions de connections
const connectionSuggestions = [
  {
    name: "David Martin",
    avatar: "/austin-wade.jpg",
    role: "VP Engineering, RoboTech",
    mutualConnections: 12,
  },
  {
    name: "Camille Bernard",
    avatar: "/speakers/sarah.jpg",
    role: "Business Angel",
    mutualConnections: 8,
  },
  {
    name: "Pierre Fournier",
    avatar: "/franklin-mays.jpg",
    role: "Fondateur, AlphaScale",
    mutualConnections: 5,
  },
];

// Industries/tags populaires
const popularTags = [
  { name: "AI & Machine Learning", color: "bg-blue-100 text-blue-800" },
  { name: "Fintech", color: "bg-green-100 text-green-800" },
  { name: "SaaS", color: "bg-purple-100 text-purple-800" },
  { name: "Cleantech", color: "bg-teal-100 text-teal-800" },
  { name: "E-commerce", color: "bg-orange-100 text-orange-800" },
  { name: "Healthtech", color: "bg-pink-100 text-pink-800" },
];

interface Post {
  id: number;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  media: string | null;
  likes: number;
  comments: number;
  shares: number;
  time: string;
  trending: boolean;
}

const FeedPost = ({ post }: { post: Post }) => (
  <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-[#5E6AD2] transition-all duration-300 hover:shadow-md">
    <div className="p-4">
      {/* Header with author info */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <Image
            src={post.author.avatar}
            alt={post.author.name}
            width={40}
            height={40}
            className="rounded-full ring-2 ring-white shadow-sm"
          />
          <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div className="flex-1">
          <div className="flex items-center flex-wrap gap-x-1">
            <h3 className="font-semibold text-gray-900 text-sm">
              {post.author.name}
            </h3>
            <span className="text-gray-400 text-xs">•</span>
            <span className="text-gray-600 text-xs">{post.author.role}</span>
            <span className="text-gray-400 text-xs">•</span>
            <span className="text-gray-400 text-xs">{post.time}</span>
          </div>
        </div>
        {post.trending && (
          <Badge className="bg-gradient-to-r from-orange-100 to-red-100 text-red-700 flex items-center gap-1 px-2 py-0.5 text-xs shadow-sm">
            <Star className="h-2.5 w-2.5 fill-red-600" /> Trending
          </Badge>
        )}
      </div>

      {/* Post content */}
      <p className="text-gray-800 mb-3 text-sm leading-relaxed">
        {post.content}
      </p>

      {/* Media content with improved styling */}
      {post.media && (
        <div className="relative h-52 rounded-lg overflow-hidden mb-3 shadow-inner">
          <Image
            src={post.media}
            alt="Post media"
            fill
            className="object-cover hover:scale-105 transition-transform duration-700"
          />
        </div>
      )}

      {/* Interaction buttons */}
      <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-100">
        <button className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-blue-50 transition-colors group">
          <ThumbsUp className="w-4 h-4 text-gray-500 group-hover:text-[#5E6AD2]" />
          <span className="text-xs text-gray-600 group-hover:text-[#5E6AD2]">
            {post.likes}
          </span>
        </button>
        <button className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-blue-50 transition-colors group">
          <MessageCircle className="w-4 h-4 text-gray-500 group-hover:text-[#5E6AD2]" />
          <span className="text-xs text-gray-600 group-hover:text-[#5E6AD2]">
            {post.comments}
          </span>
        </button>
        <button className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-blue-50 transition-colors group">
          <Share2 className="w-4 h-4 text-gray-500 group-hover:text-[#5E6AD2]" />
          <span className="text-xs text-gray-600 group-hover:text-[#5E6AD2]">
            {post.shares}
          </span>
        </button>
        <button className="p-1.5 rounded-full hover:bg-blue-50 transition-colors">
          <Bookmark className="w-4 h-4 text-gray-500 hover:text-[#5E6AD2]" />
        </button>
      </div>
    </div>
  </div>
);

interface Connection {
  name: string;
  avatar: string;
  role: string;
  mutualConnections: number;
}

const ConnectionCard = ({ connection }: { connection: Connection }) => (
  <div className="flex items-center justify-between p-4 border rounded-lg hover:border-[#5E6AD2] transition-all hover:shadow-sm">
    <div className="flex items-center gap-3">
      <Image
        src={connection.avatar}
        alt={connection.name}
        width={48}
        height={48}
        className="rounded-full"
      />
      <div>
        <h3 className="font-medium">{connection.name}</h3>
        <p className="text-sm text-gray-500">{connection.role}</p>
        <p className="text-xs text-[#5E6AD2]">
          {connection.mutualConnections} relations en commun
        </p>
      </div>
    </div>
    <Button size="sm" className="bg-[#5E6AD2] hover:bg-[#4b58c4]">
      Connecter
    </Button>
  </div>
);

const Body = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col gap-16 max-w-7xl mx-auto px-4 md:px-8 mt-20">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-10 items-center">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#5E6AD2] to-[#8294FF]">
            Construisez un réseau qui fait avancer votre startup
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connectez-vous avec des fondateurs, des investisseurs et des experts
            qui comprennent vos défis et peuvent contribuer à votre succès.
          </p>
          <div className="flex gap-4">
            <ButtonJoinWaitlist text="Rejoindre le réseau" />
            <Button variant="outline">En savoir plus</Button>
          </div>
        </div>
        <div className="relative w-full md:w-1/2 h-[400px] rounded-xl overflow-hidden shadow-xl">
          <Image
            src="/mockups/signin.png"
            alt="Social Network Dashboard"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0" />
        </div>
      </div>


      {/* Key Features Section */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-center mb-10">
          Fonctionnalités du réseau
        </h2>
        <div className="grid md:grid-cols-2 gap-12">
          <FeatureCard
            title="Interactions en temps réel"
            subtitle="Obtenez des retours instantanés d'un réseau dynamique d'entrepreneurs."
            description="Engagez des conversations, commentez et suscitez des discussions dynamiques avec des fondateurs partageant les mêmes idées et des collaborateurs potentiels."
            animation={
              <div className="rounded-lg bg-[#5E6AD2]/10 p-6 flex items-center justify-center">
                <MessageCircle className="w-12 h-12 text-[#5E6AD2]" />
              </div>
            }
          />
          <FeatureCard
            title="Algorithmes de recommandation intelligents"
            subtitle="Trouvez les bons collaborateurs et des insights sans effort."
            description="Obtenez des suggestions personnalisées de connexions et de contenu basées sur votre profil, vos intérêts, votre secteur et le stade de votre startup."
            animation={
              <div className="rounded-lg bg-[#5E6AD2]/10 p-6 flex items-center justify-center">
                <Users className="w-12 h-12 text-[#5E6AD2]" />
              </div>
            }
          />
          <FeatureCard
            title="Fil d'actualité personnalisé"
            subtitle="Restez informé des dernières tendances et insights entrepreneuriaux."
            description="Un flux de contenu personnalisé présentant des publications, photos, vidéos et ressources précieuses de fondateurs et d'experts dans votre domaine."
            animation={
              <div className="rounded-lg bg-[#5E6AD2]/10 p-6 flex items-center justify-center">
                <Globe className="w-12 h-12 text-[#5E6AD2]" />
              </div>
            }
          />
          <FeatureCard
            title="Partage de contenu riche"
            subtitle="Présentez votre parcours entrepreneurial avec des publications multimédia."
            description="Publiez des pitch decks, vidéos de lancement, démos de produits ou annonces de jalons importants avec une visibilité maximale auprès du bon public."
            animation={
              <div className="rounded-lg bg-[#5E6AD2]/10 p-6 flex items-center justify-center">
                <Award className="w-12 h-12 text-[#5E6AD2]" />
              </div>
            }
          />
        </div>
      </div>

      {/* Featured Profiles Section */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold">Profils populaires</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {featuredProfiles.map((profile, index) => (
            <div
              key={index}
              className="border rounded-lg p-6 hover:shadow-md transition-all relative"
            >
              <div className="absolute top-4 right-4">
                <div
                  className={`h-2 w-2 rounded-full ${profile.status.includes("En ligne") ? "bg-green-500" : "bg-gray-300"}`}
                ></div>
              </div>
              <div className="flex flex-col items-center text-center mb-4">
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  width={80}
                  height={80}
                  className="rounded-full mb-3"
                />
                <h3 className="font-medium">{profile.name}</h3>
                <p className="text-sm text-gray-600 mb-1">{profile.role}</p>
                <p className="text-xs text-[#5E6AD2] mb-3">
                  {profile.followers} abonnés
                </p>
                <p className="text-gray-700 text-sm">{profile.bio}</p>
              </div>
              <Button className="w-full bg-[#5E6AD2] hover:bg-[#4b58c4]">
                Suivre
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Feed Example Section */}
      <div className="flex gap-4">
        {trendingPosts.map((post) => (
          <FeedPost key={post.id} post={post} />
        ))}
      </div>

      {/* Connection Suggestions */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Suggestions de connexions</h2>
        </div>

        <div className="space-y-4">
          {connectionSuggestions.map((connection, index) => (
            <ConnectionCard key={index} connection={connection} />
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#F9FAFB] rounded-2xl p-8 md:p-12 text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Prêt à développer votre réseau professionnel ?
        </h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Rejoignez des milliers d'entrepreneurs qui construisent et font
          grandir leurs startups en se connectant aux bonnes personnes sur
          Onefive.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <ButtonJoinWaitlist text="Rejoindre maintenant" />
          <Button variant="outline">Demander une démo</Button>
        </div>
      </div>
    </div>
  );
};

const SocialNetwork = () => {
  return (
    <div className="pt-8 mx-auto items-center justify-items-center min-h-screen pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
      <Builder
        badge="Social Network"
        title="Connect. Share. Build."
        description="Onefive's social network is designed to help entrepreneurs connect, collaborate, and grow together."
        image={null}
        body={<Body />}
        displayJoinWaitlist={false}
      />
    </div>
  );
};

export default SocialNetwork;
