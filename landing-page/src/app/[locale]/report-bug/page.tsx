"use client";
import React, { useState } from "react";
import Builder from "@/components/builder";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/text-area";
import posthog from "posthog-js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const bugCategories = [
  {
    value: "ui",
    label: "User Interface",
    description: "Visual glitches, display issues, or design inconsistencies",
  },
  {
    value: "functionality",
    label: "Functionality",
    description: "Features not working as expected or broken functionality",
  },
  {
    value: "performance",
    label: "Performance",
    description: "Slow loading times, lag, or crashes",
  },
  {
    value: "account",
    label: "Account Issues",
    description: "Problems with login, settings, or profile management",
  },
  {
    value: "mobile",
    label: "Mobile Experience",
    description: "Issues specific to mobile devices",
  },
  {
    value: "other",
    label: "Other",
    description: "Other technical issues not listed above",
  },
];

const priorityLevels = [
  {
    value: "low",
    label: "Low",
    description: "Minor inconvenience, doesn't affect core functionality",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Affects functionality but has workarounds",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "high",
    label: "High",
    description: "Severely impacts usage, no workaround available",
    color: "bg-red-100 text-red-800",
  },
];

const Body = () => {
  const [category, setCategory] = React.useState("");
  const [priority, setPriority] = React.useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [title, setTitle] = useState("");
  const [steps, setSteps] = useState("");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");
  const [additional, setAdditional] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/bug-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          category,
          priority,
          steps,
          expected,
          actual,
          additional,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      posthog.capture("bug_report_submitted", { category, priority });
      setSubmitSuccess(true);
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError("An unknown error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-8">
      {/* Tips Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 mt-10">
        <h3 className="flex items-center gap-2 text-blue-800 font-medium mb-3">
          <AlertCircle className="h-5 w-5" />
          Tips for a Good Bug Report
        </h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Be specific about what happened
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Include steps to reproduce the issue
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Mention your browser and device type
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Add screenshots if possible
          </li>
        </ul>
      </div>

      {submitSuccess ? (
        <div className="bg-white border rounded-xl p-8 text-center">
          <div className="h-16 w-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-medium mb-2">
            Bug Report Submitted Successfully!
          </h3>
          <p className="text-muted-foreground mb-6">
            Thank you for helping us improve Onefive. Our team will review your
            report as soon as possible.
          </p>
          <Button
            onClick={() => {
              setSubmitSuccess(false);
              // Reset form fields
              setTitle("");
              setCategory("");
              setPriority("");
              setSteps("");
              setExpected("");
              setActual("");
              setAdditional("");
            }}
            className="bg-[#5E6AD2] hover:bg-[#4F59B8]"
          >
            Submit Another Report
          </Button>
        </div>
      ) : (
        /* Bug Report Form */
        <div className="bg-white rounded-xl border p-8">
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span>{submitError}</span>
              </div>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="title">
                Bug Title
              </label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                className="w-full"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Bug Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {bugCategories.map((category) => (
                    <SelectItem
                      key={category.value}
                      value={category.value}
                      className="relative flex flex-col items-start py-3"
                    >
                      <span className="font-medium">{category.label}</span>
                      <span className="text-xs pl-2 text-muted-foreground">
                        {category.description}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority Level</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityLevels.map((level) => (
                    <SelectItem
                      key={level.value}
                      value={level.value}
                      className="relative flex items-center justify-between py-3"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{level.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {level.description}
                        </span>
                      </div>
                      <Badge className={level.color}>{level.label}</Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Steps to Reproduce */}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="steps">
                Steps to Reproduce
              </label>
              <TextArea
                id="steps"
                placeholder="1. Go to...
2. Click on...
3. Observe that..."
                className="min-h-[120px]"
                required
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
              />
            </div>

            {/* Expected vs Actual */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="expected">
                  Expected Behavior
                </label>
                <TextArea
                  id="expected"
                  placeholder="What should have happened?"
                  className="min-h-[100px]"
                  required
                  value={expected}
                  onChange={(e) => setExpected(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="actual">
                  Actual Behavior
                </label>
                <TextArea
                  id="actual"
                  placeholder="What happened instead?"
                  className="min-h-[100px]"
                  required
                  value={actual}
                  onChange={(e) => setActual(e.target.value)}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="additional">
                Additional Information
              </label>
              <TextArea
                id="additional"
                placeholder="Browser version, device type, screenshots URL, or any other relevant details..."
                className="min-h-[100px]"
                value={additional}
                onChange={(e) => setAdditional(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#5E6AD2]"
              disabled={isSubmitting}
            >
              Submit Bug Report
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

const ReportBug = () => {
  return (
    <Builder
      title="Report a Bug"
      description="Help us improve Onefive by reporting any issues you encounter"
      image={null}
      body={<Body />}
      displayJoinWaitlist={false}
      badge="Problem"
    />
  );
};

export default ReportBug;
