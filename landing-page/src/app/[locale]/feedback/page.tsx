"use client";
import React, { useEffect, useState } from "react";
import Builder from "@/components/builder";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/text-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import posthog from "posthog-js";
import { Input } from "@/components/ui/input";

const feedbackCategories = [
  {
    value: "feature",
    label: "Feature Request",
    description: "Suggest new features or improvements",
    icon: "💡",
  },
  {
    value: "bug",
    label: "Bug Report",
    description: "Report technical issues",
    icon: "🐛",
  },
  {
    value: "ux",
    label: "User Experience",
    description: "Share your experience using Onefive",
    icon: "🎯",
  },
  {
    value: "content",
    label: "Content Suggestion",
    description: "Suggest topics or resources",
    icon: "📚",
  },
  {
    value: "other",
    label: "Other Feedback",
    description: "Share any other thoughts or ideas",
    icon: "💭",
  },
];

// Utilisé comme fallback si l'API échoue
const fallbackUpdates = [
  {
    title: "New Messaging System",
    status: "Launched",
    date: "Last week",
    description: "Based on your feedback, we've improved the chat experience",
  },
  {
    title: "Startup Analytics Dashboard",
    status: "In Progress",
    date: "Coming soon",
    description: "Currently developing based on community suggestions",
  },
  {
    title: "Mobile App",
    status: "Planned",
    date: "Q2 2024",
    description: "Most requested feature - coming to iOS and Android",
  },
];

const Body = () => {
  const [feedbackCategory, setFeedbackCategory] = React.useState("");
  const [feedbackText, setFeedbackText] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  // État pour les Recent Updates
  const [recentUpdates, setRecentUpdates] = useState(fallbackUpdates);
  const [loadingUpdates, setLoadingUpdates] = useState(true);
  const [updatesError, setUpdatesError] = useState(false);

  // Récupérer les recent updates depuis l'API
  useEffect(() => {
    const fetchRecentUpdates = async () => {
      try {
        setLoadingUpdates(true);
        const response = await fetch("/api/recent-updates?limit=3");

        if (!response.ok) {
          throw new Error("Failed to fetch recent updates");
        }

        const data = await response.json();

        if (data.docs && data.docs.length > 0) {
          setRecentUpdates(data.docs);
        }
      } catch (error) {
        console.error("Error fetching recent updates:", error);
        setUpdatesError(true);
        // Conserver les fallback updates en cas d'erreur
      } finally {
        setLoadingUpdates(false);
      }
    };

    fetchRecentUpdates();
  }, []);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement | HTMLButtonElement>
  ) => {
    e.preventDefault();

    if (!feedbackCategory) {
      setSubmitError("Please select a feedback category");
      return;
    }

    if (!feedbackText.trim()) {
      setSubmitError("Please provide your feedback");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: feedbackCategory,
          feedbackText,
          userEmail: userEmail || undefined, // Only send if provided
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit feedback");
      }

      // Clear form
      setFeedbackCategory("");
      setFeedbackText("");
      setUserEmail("");
      posthog.capture("feedback_submitted", { category: feedbackCategory });
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(
        (error as Error).message || "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-8">
      <div className="grid md:grid-cols-2 gap-12 mt-10">
        {/* Feedback Form */}
        <div className="space-y-8">
          {submitSuccess ? (
            <div className="space-y-6 text-center py-8 border rounded-xl p-6">
              <div className="text-3xl mb-3">🎉</div>
              <h3 className="text-xl font-medium mb-2">
                Thank You for Your Feedback!
              </h3>
              <p className="text-muted-foreground mb-6">
                Your input helps us improve Onefive for everyone. We review all
                suggestions and implement the most requested features.
              </p>
              <Button
                onClick={() => setSubmitSuccess(false)}
                className="bg-[#5E6AD2]"
              >
                Submit Another Feedback
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Category</h3>
                <Select
                  value={feedbackCategory}
                  onValueChange={setFeedbackCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    {feedbackCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <div>
                            <div className="font-medium">{category.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {category.description}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Your Feedback</h3>
                <TextArea
                  placeholder="Share your thoughts, ideas, or suggestions..."
                  className="min-h-[200px]"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">
                  Your Email (Optional)
                </h3>
                <Input
                  type="email"
                  placeholder="steve@youtube.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Provide your email if you&apos;d like us to follow up with you
                  about this feedback.
                </p>
              </div>

              {submitError && (
                <div className="text-red-500 text-sm">{submitError}</div>
              )}

              <Button
                className="w-full bg-[#5E6AD2]"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            Your feedback helps us improve Onefive for everyone.
            <br />
            We review all suggestions and implement the most requested features.
          </div>
        </div>

        {/* Recent Updates */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium">Recent Updates</h3>
            <Link
              href="/changelog"
              className="text-sm text-[#5E6AD2] hover:underline flex items-center gap-1"
            >
              View all updates
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingUpdates ? (
            // État de chargement
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-xl p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {recentUpdates.map((update, index) => (
                <div
                  key={index}
                  className="border rounded-xl p-6 hover:border-[#5E6AD2] transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{update.title}</h4>
                    <Badge
                      className={
                        update.status === "Launched"
                          ? "bg-green-100 text-green-800"
                          : update.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }
                    >
                      {update.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {update.description}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {update.date}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 p-6 border rounded-xl bg-gray-50">
            <h3 className="font-medium mb-2">How We Handle Feedback</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• All feedback is reviewed by our product team</li>
              <li>• Popular requests are prioritized in our roadmap</li>
              <li>• Updates are shared in our changelog</li>
              <li>• Contributors are credited for implemented ideas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const Feedback = () => {
  return (
    <Builder
      title="Share Your Feedback"
      description="Help shape the future of Onefive with your suggestions"
      image={null}
      body={<Body />}
      displayJoinWaitlist={false}
      badge="Feedback"
    />
  );
};

export default Feedback;
