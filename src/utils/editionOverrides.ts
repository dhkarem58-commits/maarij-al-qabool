import type {
  Lecture,
  QuestionBankItem,
  SharhSubElement,
  TopicSection,
} from '../types/book';
import type {
  QuestionOverride,
  SharhSubElementOverride,
  StudyEditionData,
  TopicOverride,
} from '../types/edition';

export const EDITION_LIMITS = {
  displayNameMaxLength: 80,
  bioMaxLength: 200,
  uidPattern: /^[a-zA-Z0-9_-]+$/,
  maxTopicOverrides: 50,
  maxQuestionOverrides: 100,
  maxAddedQuestions: 100,
} as const;

export function createEmptyEdition(
  uid: string,
  displayName: string
): StudyEditionData {
  return {
    uid,
    displayName: (displayName || 'طالب علم').trim().slice(0, EDITION_LIMITS.displayNameMaxLength),
    bio: '',
    isPublic: false,
    revision: 0,
    topicOverrides: {},
    questionOverrides: {},
    addedQuestions: [],
  };
}

export function mergeTopicWithOverride(
  topic: TopicSection,
  override?: TopicOverride
): TopicSection {
  if (!override) return topic;

  let mergedMatn = topic.matn;
  if (override.matnDeleted) {
    mergedMatn = undefined;
  } else if (mergedMatn && (override.matnText !== undefined || override.matnTitle !== undefined)) {
    mergedMatn = {
      ...mergedMatn,
      title: override.matnTitle !== undefined ? override.matnTitle : mergedMatn.title,
      text: override.matnText !== undefined ? override.matnText : mergedMatn.text,
    };
  } else if (!mergedMatn && override.matnText) {
    mergedMatn = {
      title: override.matnTitle || 'المتن المضاف',
      text: override.matnText,
    };
  }

  const sharhOverrides = override.sharhOverrides || {};
  const mergedSharh: SharhSubElement[] = [];

  for (const el of topic.sharhElements) {
    const elOverride = sharhOverrides[el.id];
    if (!elOverride) {
      mergedSharh.push(el);
      continue;
    }
    if (elOverride.deleted) {
      continue;
    }
    mergedSharh.push({
      ...el,
      orderLabel:
        elOverride.orderLabel !== undefined ? elOverride.orderLabel : el.orderLabel,
      title: elOverride.title !== undefined ? elOverride.title : el.title,
      conciseSummary:
        elOverride.conciseSummary !== undefined
          ? elOverride.conciseSummary
          : el.conciseSummary,
      paragraphs:
        elOverride.paragraphs !== undefined ? elOverride.paragraphs : el.paragraphs,
      highlightedQuote:
        elOverride.highlightedQuote === null
          ? undefined
          : elOverride.highlightedQuote !== undefined
            ? elOverride.highlightedQuote
            : el.highlightedQuote,
      bulletItems:
        elOverride.bulletItems !== undefined
          ? elOverride.bulletItems
          : el.bulletItems,
    });
  }

  if (override.addedSubElements && override.addedSubElements.length > 0) {
    for (const added of override.addedSubElements) {
      mergedSharh.push(added);
    }
  }

  return {
    ...topic,
    title: override.title !== undefined ? override.title : topic.title,
    summary: override.summary !== undefined ? override.summary : topic.summary,
    matn: mergedMatn,
    sharhElements: mergedSharh,
  };
}

export function mergeLecturesWithEdition(
  lectures: Lecture[],
  edition: StudyEditionData | null | undefined
): Lecture[] {
  if (!edition) return lectures;
  const overrides = edition.topicOverrides || {};
  if (Object.keys(overrides).length === 0) return lectures;

  return lectures.map((lecture) => ({
    ...lecture,
    topics: lecture.topics.map((topic) =>
      mergeTopicWithOverride(topic, overrides[topic.id])
    ),
  }));
}

export function mergeQuestionBankWithEdition(
  questions: QuestionBankItem[],
  edition: StudyEditionData | null | undefined
): QuestionBankItem[] {
  if (!edition) return questions;
  const overrides = edition.questionOverrides || {};
  const merged: QuestionBankItem[] = [];

  for (const q of questions) {
    const ov = overrides[q.id];
    if (!ov) {
      merged.push(q);
      continue;
    }
    if (ov.deleted) {
      continue;
    }
    merged.push({
      ...q,
      questionNumber:
        ov.questionNumber !== undefined ? ov.questionNumber : q.questionNumber,
      question: ov.question !== undefined ? ov.question : q.question,
      topicBadge: ov.topicBadge !== undefined ? ov.topicBadge : q.topicBadge,
      relatedLectureId:
        ov.relatedLectureId !== undefined ? ov.relatedLectureId : q.relatedLectureId,
      relatedTopicId:
        ov.relatedTopicId !== undefined ? ov.relatedTopicId : q.relatedTopicId,
      answerBlocks:
        ov.answerBlocks !== undefined ? ov.answerBlocks : q.answerBlocks,
    });
  }

  if (edition.addedQuestions && edition.addedQuestions.length > 0) {
    for (const customQ of edition.addedQuestions) {
      merged.push(customQ);
    }
  }

  return merged;
}

export function isTopicModified(
  edition: StudyEditionData | null | undefined,
  topicId: string
): boolean {
  if (!edition) return false;
  const ov = edition.topicOverrides?.[topicId];
  if (!ov) return false;
  return Boolean(
    ov.title !== undefined ||
      ov.summary !== undefined ||
      ov.matnDeleted ||
      ov.matnTitle !== undefined ||
      ov.matnText !== undefined ||
      (ov.sharhOverrides && Object.keys(ov.sharhOverrides).length > 0) ||
      (ov.addedSubElements && ov.addedSubElements.length > 0)
  );
}

export function getDeletedSharhIds(
  edition: StudyEditionData | null | undefined,
  topicId: string
): string[] {
  const sharhOv = edition?.topicOverrides?.[topicId]?.sharhOverrides;
  if (!sharhOv) return [];
  return Object.entries(sharhOv)
    .filter(([, val]) => Boolean(val.deleted))
    .map(([id]) => id);
}

export function getDeletedQuestionIds(
  edition: StudyEditionData | null | undefined
): string[] {
  const qOv = edition?.questionOverrides;
  if (!qOv) return [];
  return Object.entries(qOv)
    .filter(([, val]) => Boolean(val.deleted))
    .map(([id]) => id);
}

export function countEditionChanges(edition: StudyEditionData | null | undefined): {
  topicsModified: number;
  sharhModified: number;
  questionsModified: number;
  questionsAdded: number;
  total: number;
} {
  if (!edition) {
    return {
      topicsModified: 0,
      sharhModified: 0,
      questionsModified: 0,
      questionsAdded: 0,
      total: 0,
    };
  }
  const topicEntries = Object.values(edition.topicOverrides || {});
  const topicsModified = topicEntries.length;
  let sharhModified = 0;
  for (const ov of topicEntries) {
    sharhModified += Object.keys(ov.sharhOverrides || {}).length;
    sharhModified += (ov.addedSubElements || []).length;
    if (ov.matnDeleted || ov.matnText !== undefined || ov.matnTitle !== undefined) {
      sharhModified += 1;
    }
    if (ov.title !== undefined || ov.summary !== undefined) {
      sharhModified += 1;
    }
  }
  const questionsModified = Object.keys(edition.questionOverrides || {}).length;
  const questionsAdded = (edition.addedQuestions || []).length;

  return {
    topicsModified,
    sharhModified,
    questionsModified,
    questionsAdded,
    total: sharhModified + questionsModified + questionsAdded,
  };
}

function cleanTopicOverride(ov: TopicOverride): TopicOverride | null {
  const next: TopicOverride = {};
  if (ov.title !== undefined) next.title = ov.title;
  if (ov.summary !== undefined) next.summary = ov.summary;
  if (ov.matnDeleted) next.matnDeleted = true;
  if (ov.matnTitle !== undefined) next.matnTitle = ov.matnTitle;
  if (ov.matnText !== undefined) next.matnText = ov.matnText;
  if (ov.sharhOverrides && Object.keys(ov.sharhOverrides).length > 0) {
    next.sharhOverrides = ov.sharhOverrides;
  }
  if (ov.addedSubElements && ov.addedSubElements.length > 0) {
    next.addedSubElements = ov.addedSubElements;
  }
  return Object.keys(next).length > 0 ? next : null;
}

function updateTopicOverride(
  edition: StudyEditionData,
  topicId: string,
  updater: (prev: TopicOverride) => TopicOverride
): StudyEditionData {
  const prevTopic = edition.topicOverrides[topicId] || {};
  const updated = cleanTopicOverride(updater(prevTopic));
  const nextTopicOverrides = { ...edition.topicOverrides };
  if (updated) {
    nextTopicOverrides[topicId] = updated;
  } else {
    delete nextTopicOverrides[topicId];
  }
  return {
    ...edition,
    revision: edition.revision + 1,
    topicOverrides: nextTopicOverrides,
    updatedAtMs: Date.now(),
  };
}

export function setTopicMetaOverride(
  edition: StudyEditionData,
  topicId: string,
  meta: { title?: string; summary?: string }
): StudyEditionData {
  return updateTopicOverride(edition, topicId, (prev) => ({
    ...prev,
    title: meta.title,
    summary: meta.summary,
  }));
}

export function setMatnOverride(
  edition: StudyEditionData,
  topicId: string,
  matn: { title?: string; text?: string; deleted?: boolean }
): StudyEditionData {
  return updateTopicOverride(edition, topicId, (prev) => {
    if (matn.deleted) {
      return {
        ...prev,
        matnDeleted: true,
        matnTitle: undefined,
        matnText: undefined,
      };
    }
    return {
      ...prev,
      matnDeleted: undefined,
      matnTitle: matn.title,
      matnText: matn.text,
    };
  });
}

export function restoreMatnOriginal(
  edition: StudyEditionData,
  topicId: string
): StudyEditionData {
  return updateTopicOverride(edition, topicId, (prev) => ({
    ...prev,
    matnDeleted: undefined,
    matnTitle: undefined,
    matnText: undefined,
  }));
}

export function setSharhSubElementOverride(
  edition: StudyEditionData,
  topicId: string,
  subElementId: string,
  override: SharhSubElementOverride
): StudyEditionData {
  return updateTopicOverride(edition, topicId, (prev) => ({
    ...prev,
    sharhOverrides: {
      ...(prev.sharhOverrides || {}),
      [subElementId]: override,
    },
  }));
}

export function deleteSharhSubElement(
  edition: StudyEditionData,
  topicId: string,
  subElementId: string
): StudyEditionData {
  return setSharhSubElementOverride(edition, topicId, subElementId, {
    deleted: true,
  });
}

export function restoreSharhSubElement(
  edition: StudyEditionData,
  topicId: string,
  subElementId: string
): StudyEditionData {
  return updateTopicOverride(edition, topicId, (prev) => {
    const nextSharh = { ...(prev.sharhOverrides || {}) };
    delete nextSharh[subElementId];
    return {
      ...prev,
      sharhOverrides: nextSharh,
    };
  });
}

export function addSharhSubElement(
  edition: StudyEditionData,
  topicId: string,
  newElement: SharhSubElement
): StudyEditionData {
  return updateTopicOverride(edition, topicId, (prev) => ({
    ...prev,
    addedSubElements: [...(prev.addedSubElements || []), newElement],
  }));
}

export function updateAddedSharhSubElement(
  edition: StudyEditionData,
  topicId: string,
  subElementId: string,
  updatedElement: SharhSubElement
): StudyEditionData {
  return updateTopicOverride(edition, topicId, (prev) => ({
    ...prev,
    addedSubElements: (prev.addedSubElements || []).map((item) =>
      item.id === subElementId ? updatedElement : item
    ),
  }));
}

export function removeAddedSharhSubElement(
  edition: StudyEditionData,
  topicId: string,
  subElementId: string
): StudyEditionData {
  return updateTopicOverride(edition, topicId, (prev) => ({
    ...prev,
    addedSubElements: (prev.addedSubElements || []).filter(
      (item) => item.id !== subElementId
    ),
  }));
}

export function restoreTopicOriginal(
  edition: StudyEditionData,
  topicId: string
): StudyEditionData {
  const nextTopicOverrides = { ...edition.topicOverrides };
  delete nextTopicOverrides[topicId];
  return {
    ...edition,
    revision: edition.revision + 1,
    topicOverrides: nextTopicOverrides,
    updatedAtMs: Date.now(),
  };
}

export function setQuestionOverride(
  edition: StudyEditionData,
  questionId: string,
  override: QuestionOverride
): StudyEditionData {
  return {
    ...edition,
    revision: edition.revision + 1,
    questionOverrides: {
      ...edition.questionOverrides,
      [questionId]: override,
    },
    updatedAtMs: Date.now(),
  };
}

export function deleteCanonicalQuestion(
  edition: StudyEditionData,
  questionId: string
): StudyEditionData {
  return setQuestionOverride(edition, questionId, { deleted: true });
}

export function restoreCanonicalQuestion(
  edition: StudyEditionData,
  questionId: string
): StudyEditionData {
  const next = { ...edition.questionOverrides };
  delete next[questionId];
  return {
    ...edition,
    revision: edition.revision + 1,
    questionOverrides: next,
    updatedAtMs: Date.now(),
  };
}

export function addCustomQuestion(
  edition: StudyEditionData,
  item: QuestionBankItem
): StudyEditionData {
  return {
    ...edition,
    revision: edition.revision + 1,
    addedQuestions: [...edition.addedQuestions, item],
    updatedAtMs: Date.now(),
  };
}

export function updateCustomQuestion(
  edition: StudyEditionData,
  questionId: string,
  updated: QuestionBankItem
): StudyEditionData {
  return {
    ...edition,
    revision: edition.revision + 1,
    addedQuestions: edition.addedQuestions.map((q) =>
      q.id === questionId ? updated : q
    ),
    updatedAtMs: Date.now(),
  };
}

export function removeCustomQuestion(
  edition: StudyEditionData,
  questionId: string
): StudyEditionData {
  return {
    ...edition,
    revision: edition.revision + 1,
    addedQuestions: edition.addedQuestions.filter((q) => q.id !== questionId),
    updatedAtMs: Date.now(),
  };
}

/**
 * Strips undefined values recursively (Firestore forbids undefined) and enforces
 * volumetric constraints declared in firebase-blueprint.json.
 */
function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => stripUndefinedDeep(v)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) {
        out[k] = stripUndefinedDeep(v);
      }
    }
    return out as T;
  }
  return value;
}

export function sanitizeEditionForFirestore(
  edition: StudyEditionData,
  uid: string
): {
  uid: string;
  displayName: string;
  bio: string;
  isPublic: boolean;
  revision: number;
  topicOverrides: Record<string, TopicOverride>;
  questionOverrides: Record<string, QuestionOverride>;
  addedQuestions: QuestionBankItem[];
} {
  const safeDisplayName =
    (edition.displayName || 'طالب علم')
      .trim()
      .slice(0, EDITION_LIMITS.displayNameMaxLength) || 'طالب علم';
  const safeBio = (edition.bio || '').trim().slice(0, EDITION_LIMITS.bioMaxLength);

  const topicEntries = Object.entries(edition.topicOverrides || {}).slice(
    0,
    EDITION_LIMITS.maxTopicOverrides
  );
  const questionEntries = Object.entries(edition.questionOverrides || {}).slice(
    0,
    EDITION_LIMITS.maxQuestionOverrides
  );
  const safeAddedQuestions = (edition.addedQuestions || []).slice(
    0,
    EDITION_LIMITS.maxAddedQuestions
  );

  return stripUndefinedDeep({
    uid,
    displayName: safeDisplayName,
    bio: safeBio,
    isPublic: Boolean(edition.isPublic),
    revision: Math.max(0, Math.min(1000000, Math.floor(edition.revision || 0))),
    topicOverrides: Object.fromEntries(topicEntries),
    questionOverrides: Object.fromEntries(questionEntries),
    addedQuestions: safeAddedQuestions,
  });
}

export function mergeGuestDraftIntoUserEdition(
  guestEdition: StudyEditionData | null,
  remoteEdition: StudyEditionData | null,
  uid: string,
  fallbackDisplayName: string
): StudyEditionData {
  const base: StudyEditionData = remoteEdition
    ? { ...remoteEdition, uid }
    : createEmptyEdition(uid, guestEdition?.displayName || fallbackDisplayName);

  if (!guestEdition || countEditionChanges(guestEdition).total === 0) {
    return base;
  }

  const mergedTopicOverrides: Record<string, TopicOverride> = {
    ...base.topicOverrides,
  };
  for (const [topicId, guestOv] of Object.entries(guestEdition.topicOverrides || {})) {
    const existingOv = mergedTopicOverrides[topicId] || {};
    mergedTopicOverrides[topicId] = {
      ...existingOv,
      ...guestOv,
      sharhOverrides: {
        ...(existingOv.sharhOverrides || {}),
        ...(guestOv.sharhOverrides || {}),
      },
      addedSubElements: [
        ...(existingOv.addedSubElements || []),
        ...(guestOv.addedSubElements || []).filter(
          (g) => !(existingOv.addedSubElements || []).some((e) => e.id === g.id)
        ),
      ],
    };
  }

  const mergedQuestionOverrides: Record<string, QuestionOverride> = {
    ...base.questionOverrides,
    ...guestEdition.questionOverrides,
  };

  const existingQuestionIds = new Set(base.addedQuestions.map((q) => q.id));
  const mergedAddedQuestions = [
    ...base.addedQuestions,
    ...guestEdition.addedQuestions.filter((q) => !existingQuestionIds.has(q.id)),
  ];

  return {
    ...base,
    displayName: base.displayName || guestEdition.displayName || fallbackDisplayName,
    revision: Math.max(base.revision, guestEdition.revision) + 1,
    topicOverrides: mergedTopicOverrides,
    questionOverrides: mergedQuestionOverrides,
    addedQuestions: mergedAddedQuestions,
    updatedAtMs: Date.now(),
  };
}
