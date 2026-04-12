"use client";
import React, { useState, useEffect, useCallback } from "react";
import Builder from "@/components/builder";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/text-area";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import posthog from "posthog-js";
import {
  ArrowLeft,
  FileText,
  Lightbulb,
  Loader2,
  CheckCircle,
  AlertCircle,
  Users,
  Clock,
  BookOpen,
  X,
  ArrowRight,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const articleCategories = [
  { label: 'Startup Tips', value: 'startup-tips' },
  { label: 'Growth Stories', value: 'growth-stories' },
  { label: 'Product Updates', value: 'product-updates' },
  { label: 'Fundraising', value: 'fundraising' },
  { label: 'Tech Insights', value: 'tech-insights' },
  { label: 'Team Building', value: 'team-building' },
];

interface FormData {
  title: string;
  category: string;
  description: string;
  targetAudience: string;
  email: string;
  writingExperience?: string;
  sampleArticles?: string;
}

const Body = () => {
  // Form states
  const [formData, setFormData] = useState<FormData>({
    title: "",
    category: "",
    description: "",
    targetAudience: "",
    email: "",
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const [wantToContribute, setWantToContribute] = useState(false);
  const [wantToWrite, setWantToWrite] = useState(false);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Fonction pour nettoyer le localStorage
  const clearSavedData = useCallback(() => {
    localStorage.removeItem('articleSuggestion');
  }, []);

  // Charger les données sauvegardées au montage
  useEffect(() => {
    const savedData = localStorage.getItem('articleSuggestion');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
        if (parsedData.category) {
          setSelectedCategory(parsedData.category);
        }
      } catch (error) {
        console.error('Error parsing saved data:', error);
        clearSavedData(); // Nettoyer si les données sont corrompues
      }
    }
  }, [clearSavedData]);

  // Sauvegarder les modifications
  useEffect(() => {
    if (Object.values(formData).some(value => value !== "")) {
      localStorage.setItem('articleSuggestion', JSON.stringify({
        ...formData,
        category: selectedCategory
      }));
    }
  }, [formData, selectedCategory]);

  // Nettoyer au démontage ou navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.values(formData).some(value => value !== "")) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError("");

      // Transformer les tags en format attendu par Payload
      const formattedTags = selectedTags.map(tag => ({
        value: tag
      }));

      const response = await fetch("/api/article-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          category: selectedCategory,
          description: formData.description,
          targetAudience: formData.targetAudience,
          email: formData.email,
          tags: formattedTags, // Array<{ value: string }>
          wantToContribute: wantToContribute,
          wantToWrite: wantToWrite,
          writingExperience: wantToWrite ? formData.writingExperience : null,
          sampleArticles: wantToWrite ? formData.sampleArticles : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit suggestion");
      }

      clearSavedData();
      posthog.capture("article_suggestion_submitted", { want_to_contribute: wantToContribute });
      setIsSuccess(true);
    } catch (error) {
      console.error("Submission error:", error);
      setError(error instanceof Error ? error.message : "Failed to submit suggestion");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const tag = e.currentTarget.value.trim();
      if (tag && !selectedTags.includes(tag)) {
        setSelectedTags([...selectedTags, tag]);
        e.currentTarget.value = "";
      }
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  // Ajouter un bouton pour abandonner le brouillon
  const handleDiscardDraft = () => {
    if (window.confirm('Are you sure you want to discard your draft?')) {
      clearSavedData();
      setFormData({
        title: "",
        category: "",
        description: "",
        targetAudience: "",
        email: "",
      });
      setSelectedCategory("");
    }
  };

  const handleCheckedChange = (checked: boolean | "indeterminate") => {
    setWantToWrite(checked === true);
  };

  // Success message component
  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-8 mt-20 text-center">
        <div className="mb-8 flex flex-col items-center">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold mb-6">Suggestion Submitted!</h1>
          <p className="text-xl text-muted-foreground max-w-lg">
            Thank you for your article suggestion. Our editorial team will review it and get back to you soon.
          </p>
        </div>
        
        <Link href="/blog">
          <Button className="mt-8 bg-[#5E6AD2] hover:bg-[#4F58B0]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 mt-20 min-h-screen">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/blog" className="hover:text-[#5E6AD2] flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-6">Suggest an Article</h1>
        <p className="text-xl text-muted-foreground">
          Help us create content that matters to you. Share your article ideas and shape the future of our blog.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        {/* Main Form Section */}
        <div>
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium">Article Title</label>
                <div className="space-y-2">
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="border-gray-200 bg-gray-50/70 focus:bg-white"
                  />
                  {formData.title && (
                    <div className="text-xs text-muted-foreground">
                      <h4 className="font-medium mb-1">Suggestions to improve your title:</h4>
                      <ul className="space-y-1">
                        <li className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {formData.title.length < 60 ? "Good length" : "Consider shorter title"}
                        </li>
                        <li className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {formData.title.includes("How") ? "Action-oriented" : "Consider starting with 'How' or 'Why'"}
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <div className="flex flex-wrap gap-2">
                  {articleCategories.map((category) => (
                    <Badge
                      key={category.value}
                      variant={selectedCategory === category.value ? "default" : "outline"}
                      className="cursor-pointer hover:border-[#5E6AD2] px-4 py-2"
                      onClick={() => setSelectedCategory(category.value)}
                    >
                      {category.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Article Description</label>
                <TextArea
                  name="description"
                  placeholder="Describe the main points you'd like the article to cover..."
                  className="min-h-[150px] border-gray-200 bg-gray-50/70 focus:bg-white"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Audience</label>
                <TextArea
                  name="targetAudience"
                  placeholder="Who would benefit most from this article?"
                  className="min-h-[100px] border-gray-200 bg-gray-50/70 focus:bg-white"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Your Email</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="tom@myspace.com"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="border-gray-200 bg-gray-50/70 focus:bg-white"
                />
                <p className="text-xs text-muted-foreground">
                  We'll notify you when your suggestion is reviewed
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Preview</label>
                  <Badge variant="outline" className="text-xs">
                    Auto-generated
                  </Badge>
                </div>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium mb-2">{formData.title || "Your article title"}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {selectedCategory ? articleCategories.find(c => c.value === selectedCategory)?.label || "Category" : "Category"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ~5 min read
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formData.description || "Your article description will appear here..."}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Related Tags</label>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} className="bg-[#5E6AD2]/10 text-[#5E6AD2]">
                      {tag}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                  <Input
                    placeholder="Add a tag"
                    className="!w-auto flex-grow"
                    onKeyDown={handleTagInput}
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="wantToWrite"
                    checked={wantToWrite}
                    onCheckedChange={handleCheckedChange}
                  />
                  <div>
                    <label htmlFor="wantToWrite" className="text-sm font-medium block mb-1">
                      I would like to write this article myself
                    </label>
                    <p className="text-xs text-muted-foreground">
                      If selected, our editorial team will review your application and contact you to discuss the next steps
                    </p>
                  </div>
                </div>

                {wantToWrite && (
                  <div className="mt-4 space-y-4 pl-7">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Writing Experience</label>
                      <TextArea
                        name="writingExperience"
                        placeholder="Tell us about your writing experience and expertise in this topic..."
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sample Articles</label>
                      <Input
                        name="sampleArticles"
                        placeholder="Links to your published articles (if any)"
                        type="url"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Ajouter un bouton pour abandonner si un brouillon existe */}
              {Object.values(formData).some(value => value !== "") && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-red-500 hover:text-red-600 text-sm"
                    onClick={handleDiscardDraft}
                  >
                    Discard draft
                  </Button>
                </div>
              )}

              <Button 
                type="submit"
                className="w-full bg-[#5E6AD2] text-white hover:bg-[#4F58B0] py-6 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Suggestion"
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Blog Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="font-semibold mb-4">Blog Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-[#5E6AD2]" />
                <div>
                  <div className="font-medium">150+ articles</div>
                  <div className="text-sm text-muted-foreground">Published to date</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-[#5E6AD2]" />
                <div>
                  <div className="font-medium">10k+ monthly readers</div>
                  <div className="text-sm text-muted-foreground">Active community</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#5E6AD2]" />
                <div>
                  <div className="font-medium">5 days average</div>
                  <div className="text-sm text-muted-foreground">Review time</div>
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="font-semibold mb-4">Suggestion Guidelines</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Lightbulb className="w-4 h-4 text-[#5E6AD2] mt-1 flex-shrink-0" />
                Focus on practical, actionable insights
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Lightbulb className="w-4 h-4 text-[#5E6AD2] mt-1 flex-shrink-0" />
                Consider current startup challenges
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Lightbulb className="w-4 h-4 text-[#5E6AD2] mt-1 flex-shrink-0" />
                Share unique perspectives or experiences
              </li>
            </ul>
          </div>

          {/* Become a Writer Section */}
          <div className="bg-gradient-to-br from-[#5E6AD2]/10 to-[#5E6AD2]/5 rounded-xl p-6 border border-[#5E6AD2]/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#5E6AD2]/10 rounded-lg">
                <FileText className="w-5 h-5 text-[#5E6AD2]" />
              </div>
              <div>
                <h3 className="font-semibold">Become a Content Writer</h3>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Soon, you'll be able to join our community of writers and share your expertise with thousands of founders.
            </p>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-[#5E6AD2]" />
                <span>Get paid for your articles</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-[#5E6AD2]" />
                <span>Build your personal brand</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-[#5E6AD2]" />
                <span>Reach a growing audience</span>
              </div>
            </div>

            <Button 
              disabled
              className="w-full bg-gray-100 text-gray-500 hover:bg-gray-100 cursor-not-allowed"
            >
              Coming Soon
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SuggestArticlePage = () => {
  return (
    <Builder
      title="Suggest an Article | Onefive Blog"
      description="Share your article ideas and help shape our content"
      image={null}
      body={<Body />}
      displayJoinWaitlist={false}
      badge="Blog"
    />
  );
};

export default SuggestArticlePage; 