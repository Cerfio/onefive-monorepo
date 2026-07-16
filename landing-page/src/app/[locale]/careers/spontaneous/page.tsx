"use client";
import React, { useState } from "react";
import Builder from "@/components/builder";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/text-area";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import posthog from "posthog-js";
import {
  ArrowLeft,
  Upload,
  Briefcase,
  GraduationCap,
  LinkedinIcon,
  GithubIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const departments = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "Operations",
  "HR",
  "Finance",
];

const Body = () => {
  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentRole: "",
    yearsOfExperience: "",
    linkedin: "",
    github: "",
    message: "",
  });
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Same limits the server enforces — reject here for instant feedback.
    const MAX_BYTES = 5 * 1024 * 1024;
    const ALLOWED_TYPES = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (file.size > MAX_BYTES) {
      setError("Your CV must be under 5 MB");
      e.target.value = "";
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Your CV must be a PDF, DOC or DOCX file");
      e.target.value = "";
      return;
    }

    setError("");
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setError("");

    // Validate form data
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !selectedDepartment || !formData.currentRole || !formData.yearsOfExperience || 
        !formData.message || !selectedFile) {
      setError("Please fill in all required fields and upload your CV");
      return;
    }

    // Create FormData object
    const submitData = new FormData();
    submitData.append("firstName", formData.firstName);
    submitData.append("lastName", formData.lastName);
    submitData.append("email", formData.email);
    submitData.append("phone", formData.phone);
    submitData.append("preferredDepartment", selectedDepartment);
    submitData.append("currentRole", formData.currentRole);
    submitData.append("yearsOfExperience", formData.yearsOfExperience);
    submitData.append("linkedin", formData.linkedin);
    submitData.append("github", formData.github);
    submitData.append("message", formData.message);
    submitData.append("resume", selectedFile);

    try {
      setIsSubmitting(true);
      
      const response = await fetch("/api/careers/spontaneous", {
        method: "POST",
        body: submitData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application");
      }
      
      posthog.capture("career_application_submitted", { type: "spontaneous" });
      setIsSuccess(true);
      
      // Reset form after successful submission
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        currentRole: "",
        yearsOfExperience: "",
        linkedin: "",
        github: "",
        message: "",
      });
      setSelectedDepartment("");
      setSelectedFile(null);
      
    } catch (err) {
      console.error("Application submission error:", err);
      setError(err instanceof Error ? err.message : "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success message component
  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-8 mt-20 text-center">
        <div className="mb-8 flex flex-col items-center">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold mb-6">Application Submitted!</h1>
          <p className="text-xl text-muted-foreground max-w-lg">
            Thank you for your application. We'll review your profile and get back to you soon.
          </p>
        </div>
        
        <Link href="/careers">
          <Button className="mt-8 bg-[#5E6AD2] hover:bg-[#4F58B0]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Careers
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-8 mt-20">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/careers" className="hover:text-[#5E6AD2] flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back to Careers
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-6">Spontaneous Application</h1>
        <p className="text-xl text-muted-foreground">
          Don&apos;t see the perfect role? We&apos;re always looking for talented people to join our team.
          Tell us about yourself and what you&apos;re looking for.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Application Form */}
      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Personal Information */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Personal Information</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input 
                name="firstName"
                placeholder="Jack" 
                required 
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input 
                name="lastName"
                placeholder="Dorsey" 
                required 
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input 
              name="email"
              type="email" 
              placeholder="jack@twitter.com" 
              required 
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <Input 
              name="phone"
              type="tel" 
              placeholder="+33 6 12 34 56 78" 
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Professional Information */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Professional Information</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">Preferred Department</label>
            <div className="flex flex-wrap gap-2">
              {departments.map((dept) => (
                <Badge
                  key={dept}
                  variant={selectedDepartment === dept ? "default" : "outline"}
                  className="cursor-pointer hover:border-[#5E6AD2] px-4 py-2"
                  onClick={() => setSelectedDepartment(dept)}
                >
                  {dept}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Current Role</label>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <Input 
                name="currentRole"
                placeholder="Senior Software Engineer" 
                required 
                value={formData.currentRole}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Years of Experience</label>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-muted-foreground" />
              <Input 
                name="yearsOfExperience"
                type="number" 
                placeholder="5" 
                required 
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Social Profiles</label>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <LinkedinIcon className="w-4 h-4 text-muted-foreground" />
                <Input 
                  name="linkedin"
                  placeholder="LinkedIn URL" 
                  value={formData.linkedin}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex items-center gap-2">
                <GithubIcon className="w-4 h-4 text-muted-foreground" />
                <Input 
                  name="github"
                  placeholder="GitHub URL" 
                  value={formData.github}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Your Message</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">Why do you want to join us?</label>
            <TextArea 
              name="message"
              placeholder="Tell us about your motivation and what you could bring to the team..."
              className="min-h-[150px]"
              required
              value={formData.message}
              onChange={handleInputChange}
            />
          </div>

          {/* CV Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload your CV</label>
            <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-[#5E6AD2] transition-colors">
              <input
                type="file"
                id="cv"
                name="resume"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              <label htmlFor="cv" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedFile ? selectedFile.name : "Drop your CV here or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOC, DOCX up to 5MB
                </p>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
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
            "Submit Application"
          )}
        </Button>
      </form>
    </div>
  );
};

const SpontaneousPage = () => {
  return (
    <Builder
      title="Spontaneous Application | Careers at Onefive"
      description="Submit your spontaneous application to join our team"
      image={null}
      body={<Body />}
      displayJoinWaitlist={false}
      badge="Careers"
    />
  );
};

export default SpontaneousPage; 