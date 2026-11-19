import type {
  QuestionBankAnswerBlock,
  QuestionBankItem,
  SharhSubElement,
} from './book';

export interface SharhSubElementOverride {
  deleted?: boolean;
  orderLabel?: string;
  title?: string;
  conciseSummary?: string;
  paragraphs?: string[];
  highlightedQuote?: {
    text: string;
    attribution?: string;
  } | null;
  bulletItems?: {
    label: string;
    detail: string;
  }[];
}

export interface TopicOverride {
  title?: string;
  summary?: string;
  matnDeleted?: boolean;
  matnTitle?: string;
  matnText?: string;
  sharhOverrides?: Record<string, SharhSubElementOverride>;
  addedSubElements?: SharhSubElement[];
}

export interface QuestionOverride {
  deleted?: boolean;
  questionNumber?: number;
  question?: string;
  topicBadge?: string;
  relatedLectureId?: string;
  relatedTopicId?: string;
  answerBlocks?: QuestionBankAnswerBlock[];
}

export interface StudyEditionData {
  uid: string;
  displayName: string;
  bio?: string;
  isPublic: boolean;
  revision: number;
  topicOverrides: Record<string, TopicOverride>;
  questionOverrides: Record<string, QuestionOverride>;
  addedQuestions: QuestionBankItem[];
  updatedAtMs?: number;
}

export type EditionViewMode =
  | { kind: 'original' }
  | { kind: 'mine' }
  | { kind: 'shared'; uid: string; displayName: string };
