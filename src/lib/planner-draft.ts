import type {
  DocumentOutline,
  PlannerDraft,
  Section,
  SubTopic,
  Topic,
} from "@/lib/types";

const DRAFT_KEY = "agentx:life-plan-draft:v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTopic(value: unknown): value is Topic {
  return (
    isRecord(value) &&
    typeof value.mainTopic === "string" &&
    typeof value.documentLength === "number" &&
    Number.isFinite(value.documentLength) &&
    value.documentLength > 0 &&
    (value.outputFormat === "DOCX" || value.outputFormat === "PDF") &&
    (value.topicDescription === undefined ||
      typeof value.topicDescription === "string") &&
    (value.academicLevel === undefined ||
      typeof value.academicLevel === "string")
  );
}

function isSubTopic(value: unknown): value is SubTopic {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.isSelected === "boolean" &&
    typeof value.content === "string"
  );
}

function isSection(value: unknown): value is Section {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.isSelected === "boolean" &&
    Array.isArray(value.subtopics) &&
    value.subtopics.every(isSubTopic)
  );
}

function isOutline(value: unknown): value is DocumentOutline {
  return (
    isRecord(value) &&
    typeof value.mainTopic === "string" &&
    Array.isArray(value.sections) &&
    value.sections.every(isSection)
  );
}

function isPlannerDraft(value: unknown): value is PlannerDraft {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    typeof value.savedAt !== "string" ||
    Number.isNaN(Date.parse(value.savedAt)) ||
    typeof value.step !== "number" ||
    !Number.isInteger(value.step) ||
    value.step < 1 ||
    value.step > 4 ||
    !(value.topicInfo === null || isTopic(value.topicInfo)) ||
    !(value.documentOutline === null || isOutline(value.documentOutline))
  ) {
    return false;
  }

  return (
    value.step === 1 ||
    (value.topicInfo !== null && value.documentOutline !== null)
  );
}

export function loadPlannerDraft(): PlannerDraft | null {
  const rawDraft = window.localStorage.getItem(DRAFT_KEY);
  if (!rawDraft) return null;

  let draft: unknown;
  try {
    draft = JSON.parse(rawDraft);
  } catch {
    window.localStorage.removeItem(DRAFT_KEY);
    throw new Error("The saved plan was unreadable and has been removed.");
  }

  if (!isPlannerDraft(draft)) {
    window.localStorage.removeItem(DRAFT_KEY);
    throw new Error("The saved plan was invalid and has been removed.");
  }

  return draft;
}

export function savePlannerDraft(draft: PlannerDraft): void {
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearPlannerDraft(): void {
  window.localStorage.removeItem(DRAFT_KEY);
}
