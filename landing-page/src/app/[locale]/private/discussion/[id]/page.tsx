"use client";
import React, { useState, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  ThumbsUp,
  Eye,
  Share2,
  Flag,
  Bookmark,
  Send,
  MoreHorizontal,
  Award,
  CheckCircle,
  Clock,
  Calendar,
  ChevronUp,
  ChevronDown,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/text-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DiscussionDetailPage = () => {
  const params = useParams();
  const { id } = params;
  const [commentText, setCommentText] = useState("");
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(142);

  // Mock data - dans une app réelle, vous récupéreriez ces données depuis une API
  const discussionData = {
    id: id,
    title: "Comment avez-vous validé votre MVP avant de lever des fonds?",
    content: `Je suis en train de développer un SaaS dans le domaine de la fintech, et je me demande quelles sont les meilleures stratégies pour valider un MVP avant d'approcher des investisseurs.

J'ai deux approches en tête:
1. Créer une landing page et mesurer l'intérêt via des inscriptions
2. Développer un prototype fonctionnel minimal et obtenir des utilisateurs pilotes

Pour ceux qui ont levé des fonds récemment, qu'est-ce qui a le mieux fonctionné pour vous? J'aimerais particulièrement entendre des fondateurs du secteur B2B.`,
    author: {
      name: "Sarah Chen",
      avatar: "/isobel-fuller.jpg",
      role: "CEO at Innovatech",
      isVerified: true,
      joinedDate: "Jan 2022",
    },
    timestamp: "2 days ago",
    views: 1200,
    upvotes: 142,
    commentCount: 24,
    categories: ["Product Development", "Fundraising"],
    tags: ["MVP", "Product Validation", "Early-stage", "Fundraising"],
    isHot: true,
    isPoll: false,
  };

  const comments = [
    {
      id: "comment1",
      author: {
        name: "Emma Watson",
        avatar: "/franklin-mays.jpg",
        role: "Product Lead @ TechVentures",
        isVerified: true,
      },
      content:
        "Pour notre startup B2B, nous avons choisi l'approche du prototype fonctionnel avec 5 clients pilotes. Nous leur avons proposé 3 mois gratuits en échange de feedback détaillé et de témoignages.\n\nCela nous a donné:\n1. Des cas d'usage réels pour le pitch\n2. Des métriques initiales d'engagement\n3. Des témoignages crédibles pour notre deck\n\nLes VC ont été beaucoup plus réceptifs avec cette validation tangible.",
      timestamp: "1 day ago",
      upvotes: 56,
      replies: [
        {
          id: "reply1",
          author: {
            name: "Sarah Chen",
            avatar: "/isobel-fuller.jpg",
            role: "CEO at Innovatech",
            isVerified: true,
          },
          content:
            "Merci Emma! As-tu utilisé un contrat spécifique pour ces clients pilotes? Comment avez-vous géré leurs attentes?",
          timestamp: "1 day ago",
          upvotes: 12,
        },
        {
          id: "reply2",
          author: {
            name: "Emma Watson",
            avatar: "/franklin-mays.jpg",
            role: "Product Lead @ TechVentures",
            isVerified: true,
          },
          content:
            "Nous avons utilisé un simple accord de beta-test avec une clause de confidentialité et des attentes claires sur le feedback. La clé était d'être transparent sur l'état du produit et nos objectifs.",
          timestamp: "1 day ago",
          upvotes: 15,
        },
      ],
    },
    {
      id: "comment2",
      author: {
        name: "Thomas Wright",
        avatar: "/speakers/sarah.jpg",
        role: "Founder, DataSync",
        isVerified: false,
      },
      content:
        "J'ai testé les deux approches et la landing page a très bien fonctionné pour mesurer l'intérêt initial, mais c'est le prototype avec des early adopters qui a vraiment convaincu les investisseurs.\n\nUn conseil: documentez tout le feedback client de manière structurée. Nous avons créé un tableau de bord avec des verbatims et des métriques d'usage que nous avons inclus dans notre deck.",
      timestamp: "2 days ago",
      upvotes: 43,
      replies: [],
    },
    {
      id: "comment3",
      author: {
        name: "Liu Wei",
        avatar: "/speakers/sarah.jpg",
        role: "Angel Investor",
        isVerified: true,
      },
      content:
        "Du point de vue d'un investisseur, je préfère toujours voir un prototype avec des utilisateurs réels. Une landing page montre de l'intérêt, mais pas la rétention ou l'usage. Si vous êtes en B2B fintech, même 3-5 utilisateurs pilotes font une grande différence dans votre pitch.\n\nAussi, n'oubliez pas de valider votre pricing - c'est souvent négligé mais crucial pour votre modèle économique.",
      timestamp: "1 day ago",
      upvotes: 78,
      replies: [],
    },
  ];

  const relatedDiscussions = [
    {
      id: "related1",
      title: "Comment structurer son pitch deck pour une Série A?",
      commentCount: 34,
      views: 890,
      categories: ["Fundraising"],
    },
    {
      id: "related2",
      title: "Différence entre POC, prototype et MVP - clarifications",
      commentCount: 19,
      views: 645,
      categories: ["Product Development"],
    },
    {
      id: "related3",
      title: "À quel moment avez-vous embauché votre premier vendeur?",
      commentCount: 27,
      views: 720,
      categories: ["Growth Strategy"],
    },
  ];

  const toggleReply = (commentId: string) => {
    setShowReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleUpvote = () => {
    if (isUpvoted) {
      setUpvoteCount((prev) => prev - 1);
    } else {
      setUpvoteCount((prev) => prev + 1);
    }
    setIsUpvoted(!isUpvoted);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      // Logique pour soumettre le commentaire - dans une app réelle, API call
      alert(`Commentaire soumis: ${commentText}`);
      setCommentText("");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Link
          href="/private/discussion"
          className="inline-flex items-center gap-2 text-[#5E6AD2] mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux discussions
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carte de discussion principale */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {/* En-tête avec info auteur */}
              <div className="flex justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Image
                    src={discussionData.author.avatar}
                    alt={discussionData.author.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        {discussionData.author.name}
                      </span>
                      {discussionData.author.isVerified && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <CheckCircle className="h-4 w-4 text-[#5E6AD2]" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Fondateur vérifié</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {discussionData.author.role}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Membre depuis {discussionData.author.joinedDate}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {discussionData.timestamp}
                </div>
              </div>

              {/* Titre et catégories */}
              <h1 className="text-2xl font-bold mb-4">
                {discussionData.title}
              </h1>

              <div className="flex flex-wrap gap-2 mb-4">
                {discussionData.categories.map((category) => (
                  <Badge
                    key={category}
                    className={
                      category === "Product Development"
                        ? "bg-pink-100 text-pink-700"
                        : category === "Fundraising"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                    }
                  >
                    {category}
                  </Badge>
                ))}
                {discussionData.isHot && (
                  <Badge className="bg-red-100 text-red-700">Hot 🔥</Badge>
                )}
              </div>

              {/* Contenu principal */}
              <div className="prose max-w-none mb-6">
                <p className="whitespace-pre-line">{discussionData.content}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {discussionData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-gray-600 hover:bg-gray-100"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>

              {/* Actions sur le post */}
              <div className="flex items-center justify-between border-t border-b py-3 my-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-1 ${isUpvoted ? "text-[#5E6AD2]" : ""}`}
                    onClick={handleUpvote}
                  >
                    {isUpvoted ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                    <span>{upvoteCount}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{discussionData.commentCount}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>{discussionData.views}</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={isBookmarked ? "text-[#5E6AD2]" : ""}
                          onClick={handleBookmark}
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {isBookmarked ? "Retirer des favoris" : "Sauvegarder"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Partager</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Link2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copier le lien</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Flag className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Signaler</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Section commentaires */}
              <div className="mt-8">
                <h2 className="text-lg font-medium mb-6">
                  {discussionData.commentCount} Réponses
                </h2>

                {/* Formulaire de commentaire */}
                <div className="mb-8">
                  <div className="flex gap-3 mb-3">
                    <Avatar>
                      <AvatarImage src="/isobel-fuller.jpg" alt="Your Avatar" />
                      <AvatarFallback>YA</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <TextArea
                        placeholder="Partagez votre expertise ou posez une question..."
                        className="mb-2 min-h-[100px]"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                      />
                      <div className="flex justify-end">
                        <Button
                          className="bg-[#5E6AD2] hover:bg-[#4A55BD]"
                          onClick={handleCommentSubmit}
                          disabled={commentText.trim() === ""}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Répondre
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Liste des commentaires */}
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border-b pb-6 last:border-b-0"
                    >
                      <div className="flex gap-3">
                        <Avatar>
                          <AvatarImage
                            src={comment.author.avatar}
                            alt={comment.author.name}
                          />
                          <AvatarFallback>
                            {comment.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">
                                  {comment.author.name}
                                </span>
                                {comment.author.isVerified && (
                                  <CheckCircle className="h-3 w-3 text-[#5E6AD2]" />
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {comment.author.role}
                              </div>
                            </div>
                            <div className="text-xs text-gray-400">
                              {comment.timestamp}
                            </div>
                          </div>

                          <div className="my-3 whitespace-pre-line">
                            {comment.content}
                          </div>

                          <div className="flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <ThumbsUp className="h-3 w-3" />
                              <span className="text-xs">{comment.upvotes}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs"
                              onClick={() => toggleReply(comment.id)}
                            >
                              {comment.replies.length > 0 ? (
                                <>
                                  {showReplies[comment.id]
                                    ? "Masquer les réponses"
                                    : `Voir les réponses (${comment.replies.length})`}
                                </>
                              ) : (
                                "Répondre"
                              )}
                            </Button>
                          </div>

                          {/* Réponses aux commentaires */}
                          {showReplies[comment.id] &&
                            comment.replies.length > 0 && (
                              <div className="pl-6 mt-4 space-y-4 border-l-2 border-gray-100">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="flex gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage
                                        src={reply.author.avatar}
                                        alt={reply.author.name}
                                      />
                                      <AvatarFallback>
                                        {reply.author.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex justify-between items-start mb-1">
                                        <div>
                                          <div className="flex items-center gap-1">
                                            <span className="font-medium text-sm">
                                              {reply.author.name}
                                            </span>
                                            {reply.author.isVerified && (
                                              <CheckCircle className="h-3 w-3 text-[#5E6AD2]" />
                                            )}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {reply.author.role}
                                          </div>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          {reply.timestamp}
                                        </div>
                                      </div>

                                      <div className="my-2 text-sm">
                                        {reply.content}
                                      </div>

                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex items-center gap-1"
                                      >
                                        <ThumbsUp className="h-3 w-3" />
                                        <span className="text-xs">
                                          {reply.upvotes}
                                        </span>
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* À propos de l'auteur */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-medium">À propos de l'auteur</h3>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Image
                    src={discussionData.author.avatar}
                    alt={discussionData.author.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        {discussionData.author.name}
                      </span>
                      {discussionData.author.isVerified && (
                        <CheckCircle className="h-4 w-4 text-[#5E6AD2]" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {discussionData.author.role}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>
                      Membre depuis {discussionData.author.joinedDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-gray-400" />
                    <span>48 discussions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-gray-400" />
                    <span>Top Contributor</span>
                  </div>
                </div>

                <Button className="w-full mt-4 bg-[#5E6AD2] hover:bg-[#4A55BD]">
                  Voir le profil
                </Button>
              </div>
            </div>

            {/* Discussions similaires */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-medium">Discussions similaires</h3>
              </div>

              <div className="p-4">
                <div className="space-y-4">
                  {relatedDiscussions.map((discussion) => (
                    <div
                      key={discussion.id}
                      className="pb-4 border-b last:border-b-0 last:pb-0"
                    >
                      <Link
                        href={`/private/discussion/${discussion.id}`}
                        className="text-sm font-medium hover:text-[#5E6AD2] mb-2 block"
                      >
                        {discussion.title}
                      </Link>
                      <div className="flex gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {discussion.commentCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {discussion.views}
                        </div>
                        {discussion.categories.map((category) => (
                          <Badge
                            key={category}
                            className={
                              category === "Product Development"
                                ? "bg-pink-100 text-pink-700 text-xs"
                                : category === "Fundraising"
                                  ? "bg-green-100 text-green-700 text-xs"
                                  : category === "Growth Strategy"
                                    ? "bg-blue-100 text-blue-700 text-xs"
                                    : "bg-gray-100 text-gray-700 text-xs"
                            }
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DiscussionDetailPage;
