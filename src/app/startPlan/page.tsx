"use client";
import React, { useCallback, useEffect, useState } from "react";
import TopicForm from "@/components/TopicForm";
import OutlineGenerator from "@/components/OutlineGenerator";
import ContentGenerator from "@/components/ContentGenerator";
import DocumentPreview from "@/components/DocumentPreview";
import RotatingMessages from "@/components/rotatingmessages";
import { AnimatePresence, motion } from "framer-motion";
import {
  ClipboardList,
  Pencil,
  FileText,
  FileDown,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentOutline, Topic } from "@/lib/types";
import { generateAIOutline } from "@/lib/actions/outline";
import { toast } from "sonner";
import {
  clearPlannerDraft,
  loadPlannerDraft,
  savePlannerDraft,
} from "@/lib/planner-draft";
import type { PlannerDraft } from "@/lib/types";

const loadingMessages = [
  "Crafting your perfect document...",
  "Gathering research materials...",
  "Organizing your content...",
  "Applying financial literacy based formatting...",
  "Almost ready to present your work...",
];

const Index = () => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [topicInfo, setTopicInfo] = useState<Topic | null>(null);
  const [documentOutline, setDocumentOutline] =
    useState<DocumentOutline | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [savedDraft, setSavedDraft] = useState<PlannerDraft | null>(null);
  const [draftActive, setDraftActive] = useState(false);
  const [draftStorageAvailable, setDraftStorageAvailable] = useState(true);
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [topicFormKey, setTopicFormKey] = useState(0);

  useEffect(() => {
    try {
      const draft = loadPlannerDraft();
      if (draft) {
        setSavedDraft(draft);
      } else {
        setDraftActive(true);
      }
    } catch (error) {
      console.error("Failed to load saved life plan:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load the saved plan from this browser."
      );
      setDraftStorageAvailable(false);
      setDraftActive(true);
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (
      !draftLoaded ||
      !draftActive ||
      !draftStorageAvailable ||
      (!topicInfo && !documentOutline)
    ) {
      return;
    }

    setDraftStatus("saving");
    const timeout = window.setTimeout(() => {
      const savedAt = new Date().toISOString();
      try {
        savePlannerDraft({
          version: 1,
          savedAt,
          step,
          topicInfo,
          documentOutline,
        });
        setLastSavedAt(savedAt);
        setDraftStatus("saved");
      } catch (error) {
        console.error("Failed to save life plan draft:", error);
        toast.error(
          "This browser could not save your plan. Your work may be lost if you leave this page."
        );
        setDraftStorageAvailable(false);
        setDraftStatus("idle");
      }
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [
    documentOutline,
    draftActive,
    draftLoaded,
    draftStorageAvailable,
    step,
    topicInfo,
  ]);

  const handleDraftChange = useCallback((topic: Topic) => {
    setTopicInfo(topic);
  }, []);

  const resumeSavedDraft = () => {
    if (!savedDraft) return;
    setTopicInfo(savedDraft.topicInfo);
    setDocumentOutline(savedDraft.documentOutline);
    setStep(savedDraft.step);
    setLastSavedAt(savedDraft.savedAt);
    setSavedDraft(null);
    setDraftActive(true);
  };

  const startNewPlan = (confirmDiscard = false) => {
    if (
      confirmDiscard &&
      !window.confirm(
        "Start a new plan and delete the saved plan from this browser?"
      )
    ) {
      return;
    }

    try {
      clearPlannerDraft();
    } catch (error) {
      console.error("Failed to clear saved life plan:", error);
      toast.error("Unable to delete the saved plan from this browser.");
      return;
    }

    setSavedDraft(null);
    setTopicInfo(null);
    setDocumentOutline(null);
    setStep(1);
    setTopicFormKey((key) => key + 1);
    setLastSavedAt(null);
    setDraftStatus("idle");
    setDraftActive(true);
  };

  const handleTopicSubmit = async (topic: Topic) => {
    setTopicInfo(topic);
    setLoading(true);
    try {
      const outline = await generateAIOutline(
        topic.mainTopic,
        topic.academicLevel || "undergraduate",
        topic.documentLength
      );
      setDocumentOutline(outline);
      setStep(2);
      toast.success("Outline generated successfully!");
    } catch (error: any) {
      console.error("Failed to generate outline:", error);
      toast.error(`Failed to generate outline: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOutlineUpdate = (outline: DocumentOutline) => {
    setDocumentOutline(outline);
  };

  const goToStep = (newStep: number) => {
    setStep(newStep);
  };

  const handleGenerateProgress = (progress: number) => {
    console.log(`Content generation progress: ${progress}%`);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 20 : -20,
      opacity: 0,
    }),
  };

  const workflow = [
    { icon: <ClipboardList size={24} />, label: "Outline Builder" },
    { icon: <Pencil size={24} />, label: "Content Editor" },
    { icon: <FileText size={24} />, label: "Document Formatting" },
    { icon: <FileDown size={24} />, label: "Export Document" },
  ];

  if (!draftLoaded) {
    return (
      <main className="min-h-screen bg-background text-foreground pt-24 px-4">
        <p className="mx-auto max-w-4xl text-center text-muted-foreground">
          Checking for a saved life plan…
        </p>
      </main>
    );
  }

  if (savedDraft) {
    return (
      <main className="min-h-screen bg-background text-foreground pt-24 pb-12 px-4">
        <div className="mx-auto max-w-2xl rounded-lg border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold">Continue your life plan?</h1>
          <p className="mt-2 text-muted-foreground">
            A plan for{" "}
            <span className="font-medium text-foreground">
              {savedDraft.topicInfo?.mainTopic.trim() || "Untitled life plan"}
            </span>{" "}
            was saved {new Date(savedDraft.savedAt).toLocaleString()}.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            This draft is stored only in this browser. Anyone with access to this
            device may be able to view it.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button onClick={resumeSavedDraft} className="w-full sm:w-auto">
              Continue saved plan
            </Button>
            <Button
              onClick={() => startNewPlan()}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Start a new plan
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pt-16 md:pt-24">
      {loading && (
        <div className="fixed flex flex-col justify-center items-center inset-0 size-full z-50 bg-background/80">
          <Loader className="size-28 ease-in text-primary animate-spin mb-8" />
          <div className="w-80 text-center">
            <RotatingMessages
              messages={loadingMessages}
              className="text-primary/90 font-medium h-8"
            />
          </div>
        </div>
      )}

      <main className="flex-1 py-8 md:py-12 px-4">
        <div className="container mx-auto max-w-4xl px-0 sm:px-4">
          {/* Workflow Steps */}
          <div className="rounded-lg border-primary/30 border px-2 py-6 md:p-6 mb-8 shadow-sm bg-card text-card-foreground">
            <div className="flex flex-wrap justify-around md:justify-between items-start md:items-center relative gap-y-4">
              {workflow.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center z-10 w-1/2 md:w-auto"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      index + 1 === step
                        ? "bg-primary text-primary-foreground"
                        : index + 1 < step
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      index + 1 === step
                        ? "text-primary"
                        : index + 1 < step
                        ? "text-primary/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}

              {/* Progress bar */}
              <div className="absolute top-6 left-0 w-full h-0.5 overflow-hidden rounded-full hidden md:block">
                <div
                  className="h-0.5 bg-primary transition-all duration-300"
                  style={{
                    width: `${((step - 1) / (workflow.length - 1)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex mt-6 w-full flex-col sm:flex-row justify-between gap-2">
              {step > 1 && (
                <Button
                  onClick={() => goToStep(step - 1)}
                  variant={"ghost"}
                  className="w-full sm:w-auto"
                >
                  Previous
                </Button>
              )}
              <div className="sm:flex-grow" /> {/* Spacer */}
              {step < 4 && documentOutline && (
                <Button
                  onClick={() => goToStep(step + 1)}
                  className="w-full sm:w-auto"
                >
                  Next
                </Button>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-2 border-t pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span aria-live="polite">
                {!draftStorageAvailable
                  ? "Draft saving is unavailable in this browser."
                  : draftStatus === "saving"
                  ? "Saving draft on this device…"
                  : lastSavedAt || draftStatus === "saved"
                  ? "Draft saved on this device."
                  : "Your draft is saved only in this browser."}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-start sm:self-auto"
                onClick={() => startNewPlan(true)}
              >
                Start over
              </Button>
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false} custom={step}>
            {step === 1 && (
              <motion.div
                key="topic-form"
                custom={1}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <TopicForm
                  key={topicFormKey}
                  onSubmit={handleTopicSubmit}
                  onDraftChange={handleDraftChange}
                  initialTopicInfo={topicInfo}
                />
              </motion.div>
            )}

            {step === 2 && documentOutline && (
              <motion.div
                key="outline-generator"
                custom={2}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <OutlineGenerator
                  outline={documentOutline}
                  onOutlineUpdate={handleOutlineUpdate}
                  onBack={() => goToStep(1)}
                  onNext={() => goToStep(3)}
                />
              </motion.div>
            )}

            {step === 3 && documentOutline && topicInfo && (
              <motion.div
                key="content-generator"
                custom={3}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <ContentGenerator
                  outline={documentOutline}
                  topicInfo={topicInfo}
                  onOutlineUpdate={handleOutlineUpdate}
                  onBack={() => goToStep(2)}
                  onNext={() => goToStep(4)}
                  onProgressUpdate={handleGenerateProgress}
                />
              </motion.div>
            )}

            {step === 4 && documentOutline && topicInfo && (
              <motion.div
                key="document-preview"
                custom={4}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <DocumentPreview
                  outline={documentOutline}
                  topicInfo={topicInfo}
                  onBack={() => goToStep(3)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="py-4 px-6 border-t text-center text-sm text-muted-foreground mt-10">
        <p>AgentX AI • Professional Insurance Info Generator</p>
      </footer>
    </div>
  );
};

export default Index;
