"use client";
import React from "react";
import { useTranslations } from "next-intl";
import Builder from "@/components/builder";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/text-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import posthog from "posthog-js";

const Body = () => {
  const t = useTranslations("contact");
  const contactCategories = [
    { value: "technical", labelKey: "categories.technical.label", descKey: "categories.technical.description" },
    { value: "account", labelKey: "categories.account.label", descKey: "categories.account.description" },
    { value: "feature", labelKey: "categories.feature.label", descKey: "categories.feature.description" },
    { value: "billing", labelKey: "categories.billing.label", descKey: "categories.billing.description" },
    { value: "partnership", labelKey: "categories.partnership.label", descKey: "categories.partnership.description" },
    { value: "other", labelKey: "categories.other.label", descKey: "categories.other.description" },
  ] as const;
  const [category, setCategory] = React.useState("");
  const [formState, setFormState] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!category) {
      setSubmitError(t("selectCategory"));
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formState,
          category,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      // Clear form
      setFormState({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
      });
      setCategory("");
      posthog.capture("contact_form_submitted", { category });
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(
        (error as Error).message || t("submitError")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-8">
      {/* Contact Form */}
      <div className="bg-white rounded-xl border p-8 mt-10">
        {submitSuccess ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="text-xl font-medium mb-2">{t("messageSent")}</h3>
            <p className="text-muted-foreground mb-6">
              {t("thankYouReachOut")}
            </p>
            <Button
              onClick={() => setSubmitSuccess(false)}
              className="bg-[#5E6AD2]"
            >
              {t("sendAnotherMessage")}
            </Button>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="firstName">
                  {t("firstName")}
                </label>
                <Input
                  id="firstName"
                  placeholder="Mark"
                  className="w-full"
                  required
                  value={formState.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="lastName">
                  {t("lastName")}
                </label>
                <Input
                  id="lastName"
                  placeholder="Zuckerberg"
                  className="w-full"
                  required
                  value={formState.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                {t("email")}
              </label>
              <Input
                id="email"
                type="email"
                placeholder="mark@facebook.com"
                className="w-full"
                required
                value={formState.email}
                onChange={handleChange}
              />
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("whatCanWeHelp")}
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectCategoryPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {contactCategories.map((cat) => (
                    <SelectItem
                      key={cat.value}
                      value={cat.value}
                      className="relative flex flex-col items-start py-3"
                    >
                      <span className="font-medium">{t(cat.labelKey)}</span>
                      <span className="text-xs pl-2 text-muted-foreground">
                        {t(cat.descKey)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="message">
                {t("message")}
              </label>
              <TextArea
                id="message"
                placeholder={t("messagePlaceholder")}
                className="min-h-[150px]"
                required
                value={formState.message}
                onChange={(e) => handleChange(e)}
              />
            </div>

            {submitError && (
              <div className="text-red-500 text-sm">{submitError}</div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#5E6AD2]"
              disabled={isSubmitting}
            >
              {isSubmitting ? t("sending") : t("sendMessage")}
            </Button>
          </form>
        )}
      </div>

      {/* Alternative Contact Methods */}
      <div className="mt-12 grid grid-cols-2 gap-6">
        <div className="text-center p-6 border rounded-xl hover:border-[#5E6AD2] transition-colors">
          <div className="text-2xl mb-2">📧</div>
          <h3 className="font-medium mb-2">{t("emailUs")}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t("forNonUrgent")}
          </p>
          <a
            href="mailto:support@onefive.com"
            className="text-[#5E6AD2] hover:underline"
          >
            support@onefive.com
          </a>
        </div>

        <div className="text-center p-6 border rounded-xl hover:border-[#5E6AD2] transition-colors">
          <div className="text-2xl mb-2">💬</div>
          <h3 className="font-medium mb-2">{t("liveChat")}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t("availableHours")}
          </p>
          <span className="text-[#5E6AD2]">9:00 AM - 6:00 PM CET</span>
        </div>
      </div>
    </div>
  );
};

const Contact = () => {
  const t = useTranslations("contact");
  return (
    <Builder
      title={t("title")}
      description={t("description")}
      image={null}
      body={<Body />}
      displayJoinWaitlist={false}
      badge={t("badge")}
    />
  );
};

export default Contact;
