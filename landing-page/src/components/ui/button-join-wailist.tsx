"use client";
import { useTranslations } from "next-intl";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog-responsive";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Loader2,
} from "lucide-react";
import posthog from "posthog-js";

export default function ButtonJoinWaitlist({
  text,
  icon = false,
  withAnimation = false,
  placeholder,
}: {
  text: string;
  icon?: boolean;
  withAnimation?: boolean;
  placeholder?: string;
}) {
  const t = useTranslations("waitlist");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [page, setPage] = useState<"join" | "more" | "success">("join");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // États pour les sélecteurs de la deuxième étape
  const [job, setJob] = useState("");
  const [source, setSource] = useState("");
  const [goal, setGoal] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasJoinedWaitlist, setHasJoinedWaitlist] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const [focusedInput, setFocusedInput] = useState(false);

  const emailSchema = z.string().email();

  useEffect(() => {
    if (dialogOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [dialogOpen]);

  // Vérifier si l'utilisateur a déjà rejoint la waitlist
  useEffect(() => {
    const joined = localStorage.getItem("waitlist_joined");
    if (joined) {
      try {
        const joinedData = JSON.parse(joined);
        setHasJoinedWaitlist(true);
        // Pré-remplir l'email si disponible
        if (joinedData.email) {
          setEmail(joinedData.email);
        }
      } catch (e) {
        // En cas d'erreur de parsing, réinitialiser
        localStorage.removeItem("waitlist_joined");
      }
    }
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Valider l'email mais ne pas afficher l'erreur pendant la saisie initiale
    const result = emailSchema.safeParse(value);
    setIsValid(result.success);

    // Ne mettre à jour l'erreur que si le champ a déjà été "touché" auparavant
    if (touched) {
      setError(result.success ? "" : t("invalidEmail"));
    }

    // Assurez-vous que l'input garde le focus
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    setTouched(true);
    validateEmail(email);
  };

  const validateEmail = (value: string) => {
    const result = emailSchema.safeParse(value);
    setIsValid(result.success);
    setError(result.success ? "" : t("invalidEmail"));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          job,
          source,
          goal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("submitError"));
      }

      // Stocker l'information dans localStorage, que l'email soit nouveau ou pas
      localStorage.setItem(
        "waitlist_joined",
        JSON.stringify({
          email,
          joinedAt: new Date().toISOString(),
        })
      );

      // Ne pas mettre hasJoinedWaitlist à true tout de suite
      // pour permettre à l'utilisateur de voir la page de succès d'abord
      // setHasJoinedWaitlist(true); -- commenté

      posthog.capture("waitlist_signup_success", { job, source, goal });
      setPage("success");
    } catch (error) {
      console.error("Error submitting to waitlist:", error);
      setError(t("submitError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setError("");
    setTouched(false);
    setIsValid(false);
    setJob("");
    setSource("");
    setGoal("");
    setPage("join");
  };

  // Détermine si on peut continuer à l'étape 2
  const canContinue = isValid;

  // Détermine si on peut finaliser le formulaire
  const canFinish = job && source && goal;

  const ProgressIndicator = () => {
    return (
      <div className="flex items-center justify-center gap-4 mb-5">
        <div className="flex items-center gap-1.5">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              page === "join" || page === "more"
                ? "bg-[#5E6AD2] text-white"
                : "bg-green-100 text-green-600"
            }`}
          >
            {page === "success" ? <Check className="w-4 h-4" /> : "1"}
          </div>
          <span
            className={`text-sm ${
              page === "join" ? "font-medium text-[#5E6AD2]" : "text-gray-500"
            }`}
          >
            {t("stepEmail")}
          </span>
        </div>
        <div
          className={`w-8 h-0.5 ${
            page === "join"
              ? "bg-gray-200"
              : page === "more"
                ? "bg-[#5E6AD2]"
                : "bg-green-500"
          }`}
        />
        <div className="flex items-center gap-1.5">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              page === "join"
                ? "bg-gray-100 text-gray-400"
                : page === "more"
                  ? "bg-[#5E6AD2] text-white"
                  : "bg-green-100 text-green-600"
            }`}
          >
            {page === "success" ? <Check className="w-4 h-4" /> : "2"}
          </div>
          <span
            className={`text-sm ${
              page === "more" ? "font-medium text-[#5E6AD2]" : "text-gray-500"
            }`}
          >
            {t("stepInfos")}
          </span>
        </div>
      </div>
    );
  };

  // Effet pour gérer le focus automatique lorsque la modale s'ouvre
  useEffect(() => {
    // Attendre que la modale soit complètement ouverte avant de focus l'input
    if (dialogOpen && inputRef.current && page === "join") {
      // Petit délai pour s'assurer que la modale est bien rendue
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        // Marquer l'input comme focusé pour notre logique de gestion du clavier
        setFocusedInput(true);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [dialogOpen, page]);

  // Effet pour gérer le repositionnement sur iOS quand le clavier apparaît/disparaît
  useEffect(() => {
    const handleVisualViewportResize = () => {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

      if (!isMobile && focusedInput && inputRef.current) {
        setTimeout(() => {
          inputRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      }
    };

    // Utiliser visualViewport si disponible (meilleure prise en charge sur iOS)
    if (window.visualViewport) {
      window.visualViewport.addEventListener(
        "resize",
        handleVisualViewportResize
      );
      window.visualViewport.addEventListener(
        "scroll",
        handleVisualViewportResize
      );
    } else {
      // Fallback pour les navigateurs plus anciens
      window.addEventListener("resize", handleVisualViewportResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          handleVisualViewportResize
        );
        window.visualViewport.removeEventListener(
          "scroll",
          handleVisualViewportResize
        );
      } else {
        window.removeEventListener("resize", handleVisualViewportResize);
      }
    };
  }, [focusedInput]);

  const JoinPage = () => {
    // Utiliser une icône Lucide pour une meilleure cohérence visuelle
    const AnimatedArrow = () => (
      <motion.div
        className="absolute right-4 transform -translate-y-1/2 flex items-center justify-center"
        initial={{ x: 0 }}
        animate={{ x: [0, 4, 0] }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          repeatType: "loop",
          repeatDelay: 0,
        }}
      >
        <ArrowRight className="h-4 w-4" />
      </motion.div>
    );

    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center gap-2 relative w-full">
            <FlickeringGrid
              className="absolute inset-0 z-0 size-full"
              squareSize={2}
              gridGap={10}
              color="#6B7280"
              maxOpacity={0.3}
              flickerChance={0.1}
              height={140}
            />
            <Image
              src="/onefive.svg"
              alt="onefive logo"
              className="pt-4"
              width={32}
              height={32}
            />
            {t("joinTitle")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t("joinDescription")}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="mt-2 pb-4 space-y-6 text-sm text-center sm:pb-0 sm:text-left">
          <ProgressIndicator />

          <div className="space-y-2">
            <div className="relative">
              <Input
                id="email"
                ref={inputRef}
                autoFocus
                placeholder={placeholder ?? "mark@facebook.com"}
                value={email}
                onChange={handleEmailChange}
                // onFocus={handleInputFocus}
                // onBlur={handleInputBlur}
                className={cn(
                  "pl-4 pr-10 py-3 transition-colors",
                  isValid && touched
                    ? "border-green-500 bg-green-50/50"
                    : error && touched
                      ? "border-red-500 bg-red-50/50"
                      : ""
                )}
              />
              {isValid && touched && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>

            {error && touched && (
              <p className="text-red-500 text-xs">{error}</p>
            )}
          </div>

          <Button
            onClick={() => {
              console.log("clicked", {
                isValid,
                canContinue,
                email,
                touched,
              });
              setPage("more");
            }}
            type="button"
            className="w-full bg-[#5E6AD2] hover:bg-[#4F59B8] transition-colors py-3 relative flex items-center justify-center"
            disabled={!canContinue}
          >
            <span className="mr-4">{t("continue")}</span>
            <AnimatedArrow />
          </Button>
          <div className="mt-5" />
        </DialogBody>
      </>
    );
  };

  const MorePage = () => {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center gap-2 relative w-full">
            <FlickeringGrid
              className="absolute inset-0 z-0 size-full"
              squareSize={2}
              gridGap={10}
              color="#6B7280"
              maxOpacity={0.3}
              flickerChance={0.1}
              height={140}
            />
            <Image
              src="/onefive.svg"
              alt="onefive logo"
              className="pt-4"
              width={32}
              height={32}
            />
            {t("movementTitle")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t("movementDescription")}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="mt-2 pb-4 space-y-6 text-sm text-center sm:pb-0 sm:text-left">
          <ProgressIndicator />

          <div className="flex flex-col gap-4">
            <Select value={job} onValueChange={setJob}>
              <SelectTrigger
                className={cn(
                  "w-full transition-all duration-300",
                  job ? "border-[#5E6AD2]" : ""
                )}
              >
                <SelectValue placeholder={t("selectJob")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="founder">{t("jobFounder")}</SelectItem>
                <SelectItem value="investor">{t("jobInvestor")}</SelectItem>
                <SelectItem value="aspiring-founder">
                  {t("jobAspiringFounder")}
                </SelectItem>
                <SelectItem value="student">{t("jobStudent")}</SelectItem>
                <SelectItem value="startup-employee">
                  {t("jobStartupEmployee")}
                </SelectItem>
                <SelectItem value="other">{t("jobOther")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={source} onValueChange={setSource}>
              <SelectTrigger
                className={cn(
                  "w-full transition-all duration-300",
                  source ? "border-[#5E6AD2]" : ""
                )}
              >
                <SelectValue placeholder={t("selectSource")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linkedin">{t("sourceLinkedin")}</SelectItem>
                <SelectItem value="product-hunt">{t("sourceProductHunt")}</SelectItem>
                <SelectItem value="twitter">{t("sourceTwitter")}</SelectItem>
                <SelectItem value="friend">{t("sourceFriend")}</SelectItem>
                <SelectItem value="google">{t("sourceGoogle")}</SelectItem>
                <SelectItem value="other">{t("sourceOther")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={goal} onValueChange={setGoal}>
              <SelectTrigger
                className={cn(
                  "w-full transition-all duration-300",
                  goal ? "border-[#5E6AD2]" : ""
                )}
              >
                <SelectValue placeholder={t("selectGoal")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="find-cofounders">
                  {t("goalFindCofounders")}
                </SelectItem>
                <SelectItem value="gain-visibility">
                  {t("goalGainVisibility")}
                </SelectItem>
                <SelectItem value="access-funding">
                  {t("goalAccessFunding")}
                </SelectItem>
                <SelectItem value="learn-resources">
                  {t("goalLearnResources")}
                </SelectItem>
                <SelectItem value="discover-events">
                  {t("goalDiscoverEvents")}
                </SelectItem>
                <SelectItem value="other">{t("goalOther")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setPage("join")}
              variant="outline"
              className="flex gap-1 items-center w-1/3"
            >
              <ArrowLeft className="w-4 h-4" /> {t("back")}
            </Button>

            <Button
              onClick={handleSubmit}
              className="w-2/3 bg-[#5E6AD2] hover:bg-[#4F59B8] transition-colors"
              disabled={!canFinish || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                  {t("submitting")}
                </>
              ) : (
                t("completeRegistration")
              )}
            </Button>
          </div>
        </DialogBody>
      </>
    );
  };

  const SuccessPage = () => {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center gap-2 relative w-full">
            <FlickeringGrid
              className="absolute inset-0 z-0 size-full"
              squareSize={2}
              gridGap={10}
              color="#6B7280"
              maxOpacity={0.3}
              flickerChance={0.1}
              height={140}
            />
            <div className="mt-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            {t("successTitle")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t("successDescription")}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="mt-4 pb-4 space-y-4 text-sm text-center sm:pb-0">
          <p className="text-muted-foreground">
            {t("yourEmail")} <span className="font-medium text-black">{email}</span>
          </p>

          <Button
            onClick={() => {
              setDialogOpen(false);
              // On attend que la modale soit complètement fermée avant de changer l'état
              // pour éviter de voir brièvement la vue "already joined"
            }}
            className="w-full bg-[#5E6AD2]"
          >
            {t("gotIt")}
          </Button>
        </DialogBody>
      </>
    );
  };

  // Ajouter un composant pour afficher quand déjà rejoint
  const AlreadyJoinedContent = () => {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center gap-2 relative w-full">
            <FlickeringGrid
              className="absolute inset-0 z-0 size-full"
              squareSize={2}
              gridGap={10}
              color="#6B7280"
              maxOpacity={0.3}
              flickerChance={0.1}
              height={140}
            />
            <div className="mt-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            {t("alreadyJoinedTitle")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t("alreadyJoinedDescription")}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="mt-4 pb-4 space-y-4 text-sm text-center sm:pb-0">
          <p className="text-muted-foreground">
            {t("yourEmail")} <span className="font-medium text-black">{email}</span>
          </p>

          <Button
            onClick={() => setDialogOpen(false)}
            className="w-full bg-[#5E6AD2]"
          >
            {t("gotIt")}
          </Button>
        </DialogBody>
      </>
    );
  };

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        // Si on ferme la modale et qu'un input est focus, blur l'input d'abord
        if (!open && focusedInput && inputRef.current) {
          inputRef.current.blur();
        }

        setDialogOpen(open);
        if (open) {
          posthog.capture("waitlist_dialog_opened", { source: text });
        }

        if (!open && page === "success") {
          setTimeout(() => {
            setHasJoinedWaitlist(true);
            resetForm();
          }, 300);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="lg"
          className={cn(
            "relative overflow-hidden bg-gradient-to-r from-[#5E6AD2] to-[#5E6AD2] hover:brightness-110 text-white px-4 py-4 font-bold flex items-center gap-3 group shadow-lg hover:shadow-[#5E6AD2]/25",
            withAnimation &&
              "hover:scale-105 active:scale-95 transition-all duration-300"
          )}
        >
          <motion.div
            className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
            }}
          />
          <span className="relative font-semibold">{text}</span>
          {icon && (
            <motion.svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              initial={{ x: 0 }}
              animate={{ x: 5 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </motion.svg>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto px-6 py-6">
        {/* <DialogContent className="max-h-[90dvh] overflow-y-auto px-6 py-6"> */}

        <AnimatePresence mode="wait">
          {hasJoinedWaitlist ? (
            <motion.div
              key="already-joined"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <AlreadyJoinedContent />
            </motion.div>
          ) : (
            page === "join" && (
              <motion.div
                key="join"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <JoinPage />
                <div className="mt-20" />
              </motion.div>
            )
          )}

          {!hasJoinedWaitlist && page === "more" && (
            <motion.div
              key="more"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <MorePage />
              {/* <div className="mt-20" /> */}
            </motion.div>
          )}

          {!hasJoinedWaitlist && page === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <SuccessPage />
              <div className="mt-20" />
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
