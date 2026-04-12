"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  File,
  FolderClosed,
  Upload,
  Users,
  Lock,
  Eye,
  FileText,
  FileSpreadsheet,
  PresentationIcon,
  FileImage,
  FilePlus,
  FileCode,
  FileCog,
  Share2,
  Settings,
  Download,
  MoreHorizontal,
  ChevronDown,
  Plus,
  Search,
  BarChart2,
  Clock,
  ArrowUpRight,
  Shield,
  X,
  CloudUpload,
  Globe,
  // Dialog,
  // DialogContent,
  // DialogHeader,
  // DialogTitle,
  // DialogDescription,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { TextArea } from "@/components/ui/text-area";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { InfoIcon } from "lucide-react";

const DataroomPage = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAccessModalOpen, setIsAccessModalOpen] = useState<boolean>(false);
  const [selectedAccessGroup, setSelectedAccessGroup] =
    useState<string>("team");
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [inviteRole, setInviteRole] = useState<string>("viewer");
  const [inviteGroup, setInviteGroup] = useState<string>("team");

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const membersPerPage = 5;

  // Liste des invitations en attente (toutes catégories confondues)
  const [pendingInvitations, setPendingInvitations] = useState<
    Array<{
      email: string;
      role: string;
      group: string;
      invitedAt: string;
    }>
  >([
    {
      email: "nouveau@example.com",
      role: "viewer",
      group: "team",
      invitedAt: "2023-11-15T10:30:00Z",
    },
    {
      email: "attente@example.com",
      role: "editor",
      group: "team",
      invitedAt: "2023-11-14T14:20:00Z",
    },
    {
      email: "potential@investor.com",
      role: "viewer",
      group: "investors",
      invitedAt: "2023-11-13T09:45:00Z",
    },
  ]);

  const accessLevels = [
    {
      id: "team",
      name: "Team Members",
      count: 6,
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: "investors",
      name: "Investors",
      count: 4,
      icon: <BarChart2 className="w-4 h-4" />,
    },
    {
      id: "advisors",
      name: "Advisors",
      count: 2,
      icon: <Shield className="w-4 h-4" />,
    },
    {
      id: "pending",
      name: "Pending Invitations",
      count: pendingInvitations.length,
      icon: <Clock className="w-4 h-4" />,
    },
  ];

  const categories = [
    { id: "all", name: "All Files", count: 28 },
    { id: "financial", name: "Financials", count: 7 },
    { id: "legal", name: "Legal", count: 5 },
    { id: "pitch", name: "Pitch Deck", count: 3 },
    { id: "business", name: "Business Plan", count: 4 },
    { id: "market", name: "Market", count: 6 },
    { id: "team", name: "Team", count: 3 },
  ];

  const dataroomStats = [
    { label: "Total Documents", value: "28" },
    { label: "Unique Views", value: "17" },
    { label: "Total Views", value: "42" },
    { label: "Avg. View Time", value: "5m 32s" },
  ];

  const recentDocuments = [
    {
      id: "doc1",
      name: "Financial Projections 2024-2026.xlsx",
      icon: <FileSpreadsheet className="w-5 h-5 text-green-600" />,
      category: "financial",
      uploaded: "2 days ago",
      views: 8,
      size: "1.4 MB",
    },
    {
      id: "doc2",
      name: "Pitch Deck - Series A.pdf",
      icon: <PresentationIcon className="w-5 h-5 text-[#5E6AD2]" />,
      category: "pitch",
      uploaded: "4 days ago",
      views: 12,
      size: "3.8 MB",
    },
    {
      id: "doc3",
      name: "Term Sheet - Draft.docx",
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      category: "legal",
      uploaded: "1 week ago",
      views: 5,
      size: "520 KB",
    },
    {
      id: "doc4",
      name: "Cap Table - Current.xlsx",
      icon: <FileSpreadsheet className="w-5 h-5 text-green-600" />,
      category: "financial",
      uploaded: "1 week ago",
      views: 7,
      size: "890 KB",
    },
    {
      id: "doc5",
      name: "Market Analysis Report.pdf",
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      category: "market",
      uploaded: "2 weeks ago",
      views: 4,
      size: "2.1 MB",
    },
  ];

  const viewerActivity = [
    {
      user: {
        name: "Emma Dubois",
        role: "Investor, Venture Capital Firm",
        avatar: "/isobel-fuller.jpg",
      },
      action: "viewed 'Financial Projections 2024-2026.xlsx'",
      time: "2 hours ago",
      duration: "8m 12s",
    },
    {
      user: {
        name: "Lucas Renard",
        role: "Angel Investor",
        avatar: "/franklin-mays.jpg",
      },
      action: "downloaded 'Pitch Deck - Series A.pdf'",
      time: "Yesterday",
      duration: "-",
    },
    {
      user: {
        name: "Sophie Garnier",
        role: "Partner, TechFund",
        avatar: "/speakers/sarah.jpg",
      },
      action: "viewed 'Cap Table - Current.xlsx'",
      time: "3 days ago",
      duration: "4m 45s",
    },
  ];

  const groupMembers = {
    team: [
      {
        id: 1,
        name: "Alexandre Dumas",
        email: "alex@company.com",
        role: "Co-founder",
        avatar: "/avatars/alex.jpg",
      },
      {
        id: 2,
        name: "Marie Curie",
        email: "marie@company.com",
        role: "CTO",
        avatar: "/avatars/marie.jpg",
      },
      {
        id: 3,
        name: "Victor Hugo",
        email: "victor@company.com",
        role: "CFO",
        avatar: "/isobel-fuller.jpg",
      },
      {
        id: 4,
        name: "Émile Zola",
        email: "emile@company.com",
        role: "Product Manager",
        avatar: "/franklin-mays.jpg",
      },
      {
        id: 5,
        name: "Simone de Beauvoir",
        email: "simone@company.com",
        role: "Marketing",
        avatar: "/speakers/sarah.jpg",
      },
      {
        id: 6,
        name: "Jean-Paul Sartre",
        email: "jps@company.com",
        role: "Developer",
        avatar: "",
      },
    ],
    investors: [
      {
        id: 7,
        name: "Emma Dubois",
        email: "emma@vcfirm.com",
        role: "Venture Capital Firm",
        avatar: "/isobel-fuller.jpg",
      },
      {
        id: 8,
        name: "Lucas Renard",
        email: "lucas@angel.com",
        role: "Angel Investor",
        avatar: "/franklin-mays.jpg",
      },
      {
        id: 9,
        name: "Sophie Garnier",
        email: "sophie@techfund.com",
        role: "Partner, TechFund",
        avatar: "/speakers/sarah.jpg",
      },
      {
        id: 10,
        name: "Thomas Mercier",
        email: "thomas@capital.com",
        role: "Investment Manager",
        avatar: "",
      },
    ],
    advisors: [
      {
        id: 11,
        name: "Claude Monet",
        email: "claude@advisor.com",
        role: "Industry Expert",
        avatar: "",
      },
      {
        id: 12,
        name: "Édith Piaf",
        email: "edith@advisor.com",
        role: "Financial Advisor",
        avatar: "",
      },
    ],
  };

  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadCategory, setUploadCategory] = useState<string>("financial");
  const [uploadDescription, setUploadDescription] = useState<string>("");
  const [uploadAccess, setUploadAccess] = useState<string>("team");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Configuration des limites de stockage
  const FILE_SIZE_LIMIT = 20; // En MB
  const DATAROOM_TOTAL_LIMIT = 5120; // En MB (5GB)

  // État pour suivre l'espace de stockage
  const [storageUsed, setStorageUsed] = useState<number>(1250); // En MB (exemple: 1.25GB utilisés)
  const [selectedStartup, setSelectedStartup] = useState<string>("startup-1");

  // Liste des startups disponibles (dans un cas réel, cela viendrait d'une API)
  const availableStartups = [
    { id: "startup-1", name: "Acme Inc." },
    { id: "startup-2", name: "TechFuture SAS" },
    { id: "startup-3", name: "NextGen Solutions" },
  ];

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      // Ajouter à la liste des invitations en attente
      setPendingInvitations((prev) => [
        ...prev,
        {
          email: inviteEmail,
          role: inviteRole,
          group: inviteGroup,
          invitedAt: new Date().toISOString(),
        },
      ]);

      console.log(
        `Inviting ${inviteEmail} with role ${inviteRole} to ${inviteGroup} group`
      );
      setInviteEmail("");
      // En production, ajoutez ici l'appel API pour envoyer l'invitation
    }
  };

  const handleCancelInvitation = (email: string) => {
    setPendingInvitations((prev) =>
      prev.filter((invite) => invite.email !== email)
    );
    console.log(`Cancelling invitation for ${email}`);
    // En production, ajoutez ici l'appel API pour annuler l'invitation
  };

  const loadMoreMembers = () => {
    if (loading || !hasMore) return;

    setLoading(true);
    // Simuler un appel API avec un délai
    setTimeout(() => {
      setPage((prevPage) => prevPage + 1);
      // Vérifier s'il y a plus de données à charger
      if (page >= 3) {
        setHasMore(false);
      }
      setLoading(false);
    }, 800);
  };

  // Observateur pour l'infinite scroll
  const observer = React.useRef<IntersectionObserver | null>(null);
  const lastMemberElementRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreMembers();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // Afficher un nombre limité de membres pour la pagination
  const getPaginatedMembers = (groupId: keyof typeof groupMembers) => {
    if (!groupMembers[groupId]) return []; // Check if groupId exists in groupMembers
    return groupMembers[groupId].slice(0, page * membersPerPage);
  };

  const handleRemoveMember = (memberId: number) => {
    console.log(
      `Removing member with ID ${memberId} from ${selectedAccessGroup}`
    );
  };

  const handleRoleChange = (memberId: number, newRole: string) => {
    console.log(`Changing role for member with ID ${memberId} to ${newRole}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      // Vérifier la taille de chaque fichier
      const validFiles = filesArray.filter((file) => {
        const fileSizeInMB = file.size / (1024 * 1024);
        return fileSizeInMB <= FILE_SIZE_LIMIT;
      });

      // Vérifier la taille totale après ajout
      const totalNewSize =
        validFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024);
      const totalAfterUpload = storageUsed + totalNewSize;

      if (totalAfterUpload > DATAROOM_TOTAL_LIMIT) {
        alert(
          `Espace de stockage insuffisant. Vous avez ${(DATAROOM_TOTAL_LIMIT - storageUsed).toFixed(2)}MB disponibles.`
        );
        return;
      }

      // Vérifier si des fichiers ont été rejetés à cause de leur taille
      if (validFiles.length < filesArray.length) {
        alert(
          `${filesArray.length - validFiles.length} fichier(s) ont été ignorés car ils dépassent la limite de ${FILE_SIZE_LIMIT}MB par fichier.`
        );
      }

      setUploadFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);

      // Vérifier la taille de chaque fichier
      const validFiles = filesArray.filter((file) => {
        const fileSizeInMB = file.size / (1024 * 1024);
        return fileSizeInMB <= FILE_SIZE_LIMIT;
      });

      // Vérifier la taille totale après ajout
      const totalNewSize =
        validFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024);
      const totalAfterUpload = storageUsed + totalNewSize;

      if (totalAfterUpload > DATAROOM_TOTAL_LIMIT) {
        alert(
          `Espace de stockage insuffisant. Vous avez ${(DATAROOM_TOTAL_LIMIT - storageUsed).toFixed(2)}MB disponibles.`
        );
        return;
      }

      // Vérifier si des fichiers ont été rejetés à cause de leur taille
      if (validFiles.length < filesArray.length) {
        alert(
          `${filesArray.length - validFiles.length} fichier(s) ont été ignorés car ils dépassent la limite de ${FILE_SIZE_LIMIT}MB par fichier.`
        );
      }

      setUploadFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveFile = (fileName: string) => {
    setUploadFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  const handleUploadSubmit = () => {
    console.log("Files to upload:", uploadFiles);
    console.log("Category:", uploadCategory);
    console.log("Description:", uploadDescription);
    console.log("Access:", uploadAccess);
    console.log("Startup:", selectedStartup);

    // Calculer la taille totale des nouveaux fichiers
    const totalNewSize =
      uploadFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024);

    // Mettre à jour l'espace utilisé
    setStorageUsed((prev) => prev + totalNewSize);

    // Réinitialiser le formulaire
    setUploadFiles([]);
    setUploadDescription("");
    setIsUploadModalOpen(false);

    // En production, ajoutez ici l'appel API pour envoyer les fichiers
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="h-8 w-8 text-blue-500" />;
      case "xls":
      case "xlsx":
        return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
      case "ppt":
      case "pptx":
        return <PresentationIcon className="h-8 w-8 text-orange-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileImage className="h-8 w-8 text-purple-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  // Calcul du pourcentage d'espace utilisé
  const storagePercentage = Math.min(
    100,
    (storageUsed / DATAROOM_TOTAL_LIMIT) * 100
  );

  // Formater la taille en GB avec 2 décimales
  const formatStorageSize = (sizeInMB: number) => {
    return (sizeInMB / 1024).toFixed(2);
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      <Navbar hasScrolled={false} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header avec sélecteur de startup */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-[#101828]">Data Room</h1>
              <Select
                value={selectedStartup}
                onValueChange={setSelectedStartup}
              >
                <SelectTrigger className="w-[200px] h-9 border-dashed">
                  <SelectValue placeholder="Sélectionner une startup" />
                </SelectTrigger>
                <SelectContent>
                  {availableStartups.map((startup) => (
                    <SelectItem key={startup.id} value={startup.id}>
                      {startup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-muted-foreground mt-1">
              Manage your fundraising documents and track investor engagement
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex gap-3">
            <Button variant="outline" className="rounded-lg">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button
              className="rounded-lg bg-[#5E6AD2] hover:bg-[#4F5AC3]"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </Button>
          </div>
        </div>

        {/* Indicateur d'espace de stockage */}
        <div className="mb-8 p-4 border rounded-lg bg-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Stockage utilisé</h3>
            <span className="text-sm text-gray-500">
              {formatStorageSize(storageUsed)}GB /{" "}
              {formatStorageSize(DATAROOM_TOTAL_LIMIT)}GB
            </span>
          </div>
          <Progress value={storagePercentage} className="h-2" />
          {storagePercentage > 90 && (
            <p className="mt-2 text-xs text-amber-600">
              Attention: vous approchez de la limite de stockage disponible.
            </p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {dataroomStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-semibold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Categories */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold">Document Categories</h2>
              </div>

              <div className="p-2">
                <ul className="space-y-1">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <button
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                          selectedCategory === category.id
                            ? "bg-[#5E6AD2]/10 text-[#5E6AD2] font-medium"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <span className="flex items-center">
                          <FolderClosed
                            className={`w-4 h-4 mr-2 ${
                              selectedCategory === category.id
                                ? "text-[#5E6AD2]"
                                : "text-gray-400"
                            }`}
                          />
                          {category.name}
                        </span>
                        <Badge variant="outline" className="ml-2">
                          {category.count}
                        </Badge>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 border-t border-gray-100">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  New Category
                </Button>
              </div>
            </div>

            {/* Access Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-[#5E6AD2]" />
                  Access Management
                </h2>
              </div>

              <div className="p-2">
                <ul className="space-y-1">
                  {accessLevels.map((level) => (
                    <li key={level.id}>
                      <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
                        <span className="flex items-center">
                          {level.icon}
                          <span className="ml-2">{level.name}</span>
                        </span>
                        <Badge variant="outline" className="ml-2">
                          {level.count}
                        </Badge>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsAccessModalOpen(true)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Access
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search files..."
                    className="pl-10 rounded-lg"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="outline" className="text-xs h-9">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    Recent
                    <ChevronDown className="h-3.5 w-3.5 ml-1" />
                  </Button>

                  <Button variant="outline" className="text-xs h-9">
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Most viewed
                    <ChevronDown className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Document Tabs and List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <Tabs
                defaultValue="all"
                className="w-full"
                onValueChange={setActiveTab}
              >
                <div className="px-4 pt-4">
                  <TabsList className="grid grid-cols-4 h-10">
                    <TabsTrigger value="all">All Documents</TabsTrigger>
                    <TabsTrigger value="recent">Recently Viewed</TabsTrigger>
                    <TabsTrigger value="shared">Shared with Me</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="all" className="p-0">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <div className="grid grid-cols-12 text-xs font-medium text-gray-500">
                      <div className="col-span-5">Name</div>
                      <div className="col-span-2">Category</div>
                      <div className="col-span-2">Added</div>
                      <div className="col-span-1 text-center">Views</div>
                      <div className="col-span-1 text-center">Size</div>
                      <div className="col-span-1"></div>
                    </div>
                  </div>

                  <ul className="divide-y divide-gray-100">
                    {recentDocuments.map((doc) => (
                      <li key={doc.id} className="px-4 py-3 hover:bg-gray-50">
                        <div className="grid grid-cols-12 items-center">
                          <div className="col-span-5 flex items-center">
                            <div className="mr-3">{doc.icon}</div>
                            <div className="truncate">
                              <p className="font-medium text-sm">{doc.name}</p>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <Badge
                              variant="secondary"
                              className="font-normal bg-gray-100"
                            >
                              {doc.category}
                            </Badge>
                          </div>
                          <div className="col-span-2 text-sm text-gray-500">
                            {doc.uploaded}
                          </div>
                          <div className="col-span-1 text-center text-sm">
                            <div className="flex items-center justify-center">
                              <Eye className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                              {doc.views}
                            </div>
                          </div>
                          <div className="col-span-1 text-center text-sm text-gray-500">
                            {doc.size}
                          </div>
                          <div className="col-span-1 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </TabsContent>

                <TabsContent value="analytics" className="p-0">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-medium">Recent Viewer Activity</h3>
                  </div>

                  <div className="p-4">
                    <ul className="space-y-4">
                      {viewerActivity.map((activity, index) => (
                        <li
                          key={index}
                          className="flex items-start p-3 rounded-lg border border-gray-100"
                        >
                          <Image
                            src={activity.user.avatar}
                            alt={activity.user.name}
                            width={40}
                            height={40}
                            className="rounded-full mr-3"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium">
                                  {activity.user.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {activity.user.role}
                                </p>
                              </div>
                              <div className="text-sm text-gray-500">
                                {activity.time}
                              </div>
                            </div>
                            <p className="mt-1 text-sm">
                              {activity.action}
                              {activity.duration !== "-" && (
                                <span className="text-gray-500 ml-2">
                                  (viewed for {activity.duration})
                                </span>
                              )}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      {/* Modal pour la gestion des accès */}
      <Dialog open={isAccessModalOpen} onOpenChange={setIsAccessModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gestion des accès</DialogTitle>
            <DialogDescription>
              Gérez les groupes d'accès et invitez de nouveaux membres
            </DialogDescription>
          </DialogHeader>

          {/* Formulaire d'invitation - visible sur tous les onglets sauf "pending" */}
          {selectedAccessGroup !== "pending" && (
            <div className="mt-6 p-4 border rounded-lg bg-[#F9FAFB]">
              <h3 className="text-sm font-medium mb-3">
                Inviter un nouveau membre
              </h3>
              <div className="flex gap-2 items-center">
                <Input
                  type="email"
                  placeholder="Email de la personne à inviter"
                  className="flex-1"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <Select
                  defaultValue="viewer"
                  value={inviteRole}
                  onValueChange={setInviteRole}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Éditeur</SelectItem>
                    <SelectItem value="viewer">Lecteur</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  defaultValue={selectedAccessGroup}
                  value={inviteGroup}
                  onValueChange={setInviteGroup}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Groupe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="investors">Investors</SelectItem>
                    <SelectItem value="advisors">Advisors</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleInvite}>Inviter</Button>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Tabs
              defaultValue="team"
              value={selectedAccessGroup}
              onValueChange={setSelectedAccessGroup}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="team">
                  <Users className="w-4 h-4 mr-2" />
                  Équipe
                </TabsTrigger>
                <TabsTrigger value="investors">
                  <BarChart2 className="w-4 h-4 mr-2" />
                  Investisseurs
                </TabsTrigger>
                <TabsTrigger value="advisors">
                  <Shield className="w-4 h-4 mr-2" />
                  Conseillers
                </TabsTrigger>
                <TabsTrigger value="pending" className="relative">
                  <Clock className="w-4 h-4 mr-2" />
                  En attente
                  {pendingInvitations.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {pendingInvitations.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Contenu des onglets des groupes */}
              {["team", "investors", "advisors"].map((groupId) => (
                <TabsContent
                  key={groupId}
                  value={groupId}
                  className="space-y-4"
                >
                  {/* Liste des membres avec infinite scroll */}
                  <div className="border rounded-lg divide-y overflow-auto max-h-[400px]">
                    {groupMembers[groupId as keyof typeof groupMembers]
                      ?.length > 0 ? (
                      getPaginatedMembers(
                        groupId as keyof typeof groupMembers
                      ).map((member, index) => {
                        const isLastElement =
                          index ===
                          getPaginatedMembers(
                            groupId as keyof typeof groupMembers
                          ).length -
                            1;

                        return (
                          <div
                            key={member.id}
                            className="p-3 flex items-center justify-between"
                            ref={isLastElement ? lastMemberElementRef : null}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage
                                  src={member.avatar}
                                  alt={member.name}
                                />
                                <AvatarFallback>
                                  {member.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-gray-500">
                                  {member.email}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Select defaultValue="viewer">
                                <SelectTrigger className="w-[120px] h-8">
                                  <SelectValue placeholder={member.role} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="editor">
                                    Éditeur
                                  </SelectItem>
                                  <SelectItem value="viewer">
                                    Lecteur
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 h-8 w-8"
                                onClick={() => handleRemoveMember(member.id)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                </svg>
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        <p>Aucun membre dans ce groupe</p>
                        <p className="text-sm mt-1">
                          Utilisez le formulaire ci-dessus pour inviter des
                          membres
                        </p>
                      </div>
                    )}

                    {loading && (
                      <div className="p-4 flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}

              {/* Contenu de l'onglet "En attente" */}
              <TabsContent value="pending" className="space-y-4">
                {pendingInvitations.length > 0 ? (
                  <div className="border rounded-lg divide-y">
                    {pendingInvitations.map((invite, idx) => (
                      <div
                        key={idx}
                        className="p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-amber-100 text-amber-600">
                              {invite.email.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center">
                              <p className="font-medium">{invite.email}</p>
                              <Badge
                                variant="outline"
                                className="ml-2 text-amber-600 bg-amber-50 border-amber-200"
                              >
                                En attente
                              </Badge>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 gap-2">
                              <p>
                                Invité le{" "}
                                {new Date(
                                  invite.invitedAt
                                ).toLocaleDateString()}
                              </p>
                              <span className="text-gray-300">•</span>
                              <p className="flex items-center">
                                {invite.group === "team" && (
                                  <Users className="w-3 h-3 mr-1" />
                                )}
                                {invite.group === "investors" && (
                                  <BarChart2 className="w-3 h-3 mr-1" />
                                )}
                                {invite.group === "advisors" && (
                                  <Shield className="w-3 h-3 mr-1" />
                                )}
                                {invite.group === "team" && "Team"}
                                {invite.group === "investors" && "Investors"}
                                {invite.group === "advisors" && "Advisors"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{invite.role}</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 h-8 w-8"
                            onClick={() => handleCancelInvitation(invite.email)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 border rounded-lg">
                    <Clock className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p>Aucune invitation en attente</p>
                    <p className="text-sm mt-1">
                      Les invitations envoyées apparaîtront ici
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal pour l'upload de fichiers */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter des fichiers</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              Téléchargez des fichiers dans votre Data Room
              <Badge variant="outline">
                {availableStartups.find((s) => s.id === selectedStartup)?.name}
              </Badge>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Zone de drag & drop */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-[#5E6AD2] bg-[#5E6AD2]/5"
                  : "border-gray-300 hover:border-[#5E6AD2]"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleFileDrop}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <CloudUpload className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-600 font-medium">
                Glissez-déposez vos fichiers ici ou cliquez pour parcourir
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Supports: PDF, Word, Excel, PowerPoint, Images (max{" "}
                {FILE_SIZE_LIMIT}MB par fichier)
              </p>
            </div>

            {/* Espace disponible */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Espace disponible:</span>
                <span className="text-sm font-medium">
                  {formatStorageSize(DATAROOM_TOTAL_LIMIT - storageUsed)}GB /{" "}
                  {formatStorageSize(DATAROOM_TOTAL_LIMIT)}GB
                </span>
              </div>
              <Progress value={storagePercentage} className="h-1.5" />
            </div>

            {/* Liste des fichiers sélectionnés */}
            {uploadFiles.length > 0 && (
              <div className="border rounded-lg divide-y max-h-[200px] overflow-y-auto">
                {uploadFiles.map((file, index) => (
                  <div
                    key={index}
                    className="p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.name)}
                      <div>
                        <p className="font-medium truncate max-w-[300px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(file.name);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Catégorie de document */}
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie de document</Label>
              <Select
                value={uploadCategory}
                onValueChange={setUploadCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Financier</SelectItem>
                  <SelectItem value="legal">Juridique</SelectItem>
                  <SelectItem value="operations">Opérations</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="product">Produit</SelectItem>
                  <SelectItem value="pitch">Pitch Deck</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnelle)</Label>
              <TextArea
                id="description"
                placeholder="Ajoutez une description pour aider les lecteurs à comprendre le contenu"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>

            {/* Contrôle d'accès */}
            <div className="space-y-3">
              <Label>Qui peut accéder à ces fichiers?</Label>
              <RadioGroup value={uploadAccess} onValueChange={setUploadAccess}>
                <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-gray-50">
                  <RadioGroupItem value="team" id="access-team" />
                  <Label
                    htmlFor="access-team"
                    className="flex items-center font-normal cursor-pointer"
                  >
                    <Users className="w-4 h-4 mr-2 text-gray-500" />
                    Team seulement
                  </Label>
                </div>

                <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-gray-50">
                  <RadioGroupItem value="investors" id="access-investors" />
                  <Label
                    htmlFor="access-investors"
                    className="flex items-center font-normal cursor-pointer"
                  >
                    <BarChart2 className="w-4 h-4 mr-2 text-gray-500" />
                    Investisseurs
                  </Label>
                </div>

                <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-gray-50">
                  <RadioGroupItem value="advisors" id="access-advisors" />
                  <Label
                    htmlFor="access-advisors"
                    className="flex items-center font-normal cursor-pointer"
                  >
                    <Shield className="w-4 h-4 mr-2 text-gray-500" />
                    Conseillers
                  </Label>
                </div>

                <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-gray-50">
                  <RadioGroupItem value="all" id="access-all" />
                  <Label
                    htmlFor="access-all"
                    className="flex items-center font-normal cursor-pointer"
                  >
                    <Globe className="w-4 h-4 mr-2 text-gray-500" />
                    Tous les membres
                  </Label>
                </div>
              </RadioGroup>

              <div className="flex items-center space-x-2 mt-2">
                <Checkbox id="track-views" />
                <Label
                  htmlFor="track-views"
                  className="text-sm font-normal cursor-pointer"
                >
                  Activer le suivi des consultations
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <div className="flex items-center text-sm text-gray-500 mr-auto">
              <InfoIcon className="w-4 h-4 mr-1" />
              Limite de {FILE_SIZE_LIMIT}MB par fichier
            </div>
            <Button
              variant="outline"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleUploadSubmit}
              disabled={uploadFiles.length === 0}
              className="bg-[#5E6AD2] hover:bg-[#4F5AC3]"
            >
              {uploadFiles.length > 1
                ? `Télécharger ${uploadFiles.length} fichiers`
                : uploadFiles.length === 1
                  ? "Télécharger le fichier"
                  : "Télécharger"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataroomPage;
