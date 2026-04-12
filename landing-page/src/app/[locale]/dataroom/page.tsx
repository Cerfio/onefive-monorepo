"use client";
import React, { useState } from "react";
import Builder from "@/components/builder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Clock,
  Eye,
  FileText,
  Upload,
  Users,
  UserPlus,
  Lock,
  File,
  BarChart2,
  Download,
  FileSpreadsheet,
  Database,
  Share2,
  MoreVertical,
  FolderPlus,
  Clock4,
  LucideUser,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ButtonJoinWaitlist from "@/components/ui/button-join-wailist";

// Statistiques de la dataroom
const dataStats = [
  {
    label: "Total Documents",
    value: "28",
  },
  {
    label: "Unique Views",
    value: "17",
  },
  {
    label: "Total Views",
    value: "42",
  },
  {
    label: "Avg. View Time",
    value: "5m 32s",
  },
];

// Catégories de documents
const documentCategories = [
  { name: "All Files", count: 28, icon: <File className="w-4 h-4 mr-2" /> },
  {
    name: "Financials",
    count: 7,
    icon: <FileSpreadsheet className="w-4 h-4 mr-2" />,
  },
  { name: "Legal", count: 5, icon: <FileText className="w-4 h-4 mr-2" /> },
  { name: "Pitch Deck", count: 3, icon: <FileText className="w-4 h-4 mr-2" /> },
  {
    name: "Business Plan",
    count: 4,
    icon: <FileText className="w-4 h-4 mr-2" />,
  },
  { name: "Market", count: 6, icon: <BarChart2 className="w-4 h-4 mr-2" /> },
  { name: "Team", count: 3, icon: <Users className="w-4 h-4 mr-2" /> },
];

// Gestion des accès
const accessManagement = [
  { name: "Team Members", count: 6, icon: <Users className="w-4 h-4 mr-2" /> },
  { name: "Investors", count: 4, icon: <Database className="w-4 h-4 mr-2" /> },
  { name: "Advisors", count: 2, icon: <LucideUser className="w-4 h-4 mr-2" /> },
  {
    name: "Pending Invitations",
    count: 3,
    icon: <Clock4 className="w-4 h-4 mr-2" />,
  },
];

// Liste des documents
const documents = [
  {
    id: 1,
    name: "Financial Projections 2024-2026.xlsx",
    category: "financial",
    added: "2 days ago",
    views: 8,
    size: "1.4 MB",
    icon: <FileSpreadsheet className="w-5 h-5 text-green-600" />,
    access: [
      { avatar: "/isobel-fuller.jpg", name: "Emma Dubois" },
      { avatar: "/franklin-mays.jpg", name: "Lucas Renard" },
    ],
  },
  {
    id: 2,
    name: "Pitch Deck - Series A.pdf",
    category: "pitch",
    added: "4 days ago",
    views: 12,
    size: "3.8 MB",
    icon: <FileText className="w-5 h-5 text-red-600" />,
    access: [
      { avatar: "/isobel-fuller.jpg", name: "Emma Dubois" },
      { avatar: "/franklin-mays.jpg", name: "Lucas Renard" },
    ],
  },
  {
    id: 3,
    name: "Term Sheet - Draft.docx",
    category: "legal",
    added: "1 week ago",
    views: 5,
    size: "520 KB",
    icon: <FileText className="w-5 h-5 text-blue-600" />,
    access: [],
  },
  {
    id: 4,
    name: "Cap Table - Current.xlsx",
    category: "financial",
    added: "1 week ago",
    views: 7,
    size: "890 KB",
    icon: <FileSpreadsheet className="w-5 h-5 text-green-600" />,
    access: [],
  },
  {
    id: 5,
    name: "Market Analysis Report.pdf",
    category: "market",
    added: "2 weeks ago",
    views: 4,
    size: "2.1 MB",
    icon: <FileText className="w-5 h-5 text-red-600" />,
    access: [],
  },
];

// Fonctionnalités clés
const keyFeatures = [
  {
    title: "Organisation sécurisée des documents",
    description:
      "Stockez et organisez tous vos documents confidentiels dans un espace sécurisé et structuré.",
    icon: <File className="w-5 h-5" />,
  },
  {
    title: "Contrôle d'accès granulaire",
    description:
      "Définissez précisément qui peut accéder à quels documents et avec quels niveaux de permissions.",
    icon: <Lock className="w-5 h-5" />,
  },
  {
    title: "Analyse des interactions",
    description:
      "Suivez qui consulte vos documents, quand et pendant combien de temps.",
    icon: <BarChart2 className="w-5 h-5" />,
  },
  {
    title: "Partage sécurisé",
    description:
      "Partagez vos documents avec des investisseurs, conseillers ou partenaires en toute sécurité.",
    icon: <Share2 className="w-5 h-5" />,
  },
];

// Témoignages
const testimonials = [
  {
    quote:
      "La dataroom nous a permis de structurer notre levée de fonds de manière professionnelle et sécurisée.",
    author: "Camille Perrin",
    role: "CEO de GrowthTech",
    avatar: "/isobel-fuller.jpg",
  },
  {
    quote:
      "En tant qu'investisseur, j'apprécie l'organisation claire et l'accès facile aux documents essentiels.",
    author: "Thomas Rivière",
    role: "Partner chez VentureOne",
    avatar: "/franklin-mays.jpg",
  },
];

const DocumentCard = ({ doc }: { doc: (typeof documents)[0] }) => {
  return (
    <div className="border rounded-lg overflow-hidden hover:border-[#5E6AD2] transition-all hover:shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          {doc.icon}
          <h3 className="font-medium text-lg">{doc.name}</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-3.5 h-3.5 mr-2" />
            <span>Ajouté {doc.added}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Eye className="w-3.5 h-3.5 mr-2" />
            <span>{doc.views} vues</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <File className="w-3.5 h-3.5 mr-2" />
            <span>{doc.size}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex -space-x-2">
            {doc.access.slice(0, 3).map((user, index) => (
              <div key={index} className="relative" title={user.name}>
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={24}
                  height={24}
                  className="rounded-full border-2 border-white"
                />
              </div>
            ))}
            {doc.access.length > 3 && (
              <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 border-2 border-white">
                <span className="text-xs text-gray-600">
                  +{doc.access.length - 3}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour la page Dataroom
const Body = () => {
  return (
    <div className="flex flex-col gap-16 max-w-7xl mx-auto px-4 md:px-8 mt-16">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-10 items-center">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#5E6AD2] to-[#8294FF]">
            Gérez et partagez vos documents confidentiels
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Centralisez, organisez et partagez en toute sécurité vos documents
            avec votre équipe, vos investisseurs et vos conseillers. Une
            dataroom simple et sécurisée pour votre startup.
          </p>
          <div className="flex gap-4">
            <ButtonJoinWaitlist text="Créer ma dataroom" />
            <Link href="/about">
              <Button variant="outline">About us</Button>
            </Link>
          </div>
        </div>
        <div className="relative w-full md:w-1/2 h-[400px] rounded-xl overflow-hidden shadow-xl">
          <Image
            src="/mockups/dataroom-preview.png"
            alt="Dataroom Preview"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="all" className="-mt-8">
        <TabsList className="mb-6">
          <TabsTrigger value="all">Tous les documents</TabsTrigger>
          <TabsTrigger value="financial">Documents financiers</TabsTrigger>
          <TabsTrigger value="legal">Documents légaux</TabsTrigger>
          <TabsTrigger value="pitch">Pitch Decks</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="financial" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents
              .filter((doc) => doc.category === "financial")
              .map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="legal" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents
              .filter((doc) => doc.category === "legal")
              .map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="pitch" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents
              .filter((doc) => doc.category === "pitch")
              .map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Features Section - Garder la même structure que dans Spotlight */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center">
          Tout ce dont vous avez besoin pour gérer vos documents
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {keyFeatures.map((feature, index) => (
            <div
              key={index}
              className="border rounded-xl p-6 hover:border-[#5E6AD2] transition-all"
            >
              <div className="bg-[#5E6AD2]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="font-medium text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section - Même style que Spotlight */}
      <div className="bg-[#F9FAFB] rounded-2xl p-8 md:p-12 text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Prêt à sécuriser et partager vos documents ?
        </h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Rejoignez des milliers d'entrepreneurs qui utilisent notre dataroom
          pour gérer leurs documents confidentiels.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <ButtonJoinWaitlist text="Créer ma dataroom" />
          <Button variant="outline">Demander une démo</Button>
        </div>
      </div>
    </div>
  );
};

const DataroomPage = () => {
  return (
    <div className="pt-8 mx-auto items-center justify-items-center min-h-screen pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
      <Builder
        badge="Dataroom"
        title="Gérez et partagez vos documents confidentiels"
        description="Centralisez, organisez et partagez en toute sécurité vos documents avec votre équipe, vos investisseurs et vos conseillers."
        image={null}
        displayJoinWaitlist={false}
        body={<Body />}
      />
    </div>
  );
};

export default DataroomPage;
