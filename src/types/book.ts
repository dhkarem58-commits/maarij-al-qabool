export type DisplayMode = 'both' | 'matn' | 'sharh';

export type SharhDetailLevel = 'full' | 'digest';

export type ActiveTab =
  | 'reader'
  | 'trees'
  | 'qbank'
  | 'evidences'
  | 'comparisons'
  | 'bookmarks';

export type EvidenceType = 'quran' | 'hadith' | 'athar' | 'rational';

export type SharhPatternType =
  | 'quran'
  | 'hadith'
  | 'matnQuote'
  | 'refutation'
  | 'creedRule'
  | 'division'
  | 'illustration';

export interface MatnFootnote {
  number: string;
  text: string;
}

export interface MatnSegment {
  title?: string;
  text: string;
  footnotes?: MatnFootnote[];
}

export interface NumberedEvidence {
  id: string;
  number: number;
  type: EvidenceType;
  text: string;
  reference: string;
  inference?: string;
}

export interface SharhSubElement {
  id: string;
  orderLabel: string;
  title: string;
  conciseSummary?: string;
  paragraphs: string[];
  highlightedQuote?: {
    text: string;
    attribution?: string;
  };
  bulletItems?: {
    label: string;
    detail: string;
  }[];
  evidences?: NumberedEvidence[];
}

export interface TopicSection {
  id: string;
  number: number;
  title: string;
  pageRef: string;
  summary: string;
  matn?: MatnSegment;
  sharhElements: SharhSubElement[];
  evidences: NumberedEvidence[];
}

export interface QaItem {
  id: string;
  number: number;
  question: string;
  answerParagraphs: string[];
  evidences?: NumberedEvidence[];
}

export interface Lecture {
  id: string;
  number: number;
  arabicOrdinal: string;
  title: string;
  subtitle: string;
  pageRange: string;
  openingInvocation: string;
  topics: TopicSection[];
  qaSectionTitle?: string;
  qaItems?: QaItem[];
  closingNote?: string;
}

export interface QuestionBankAnswerBlock {
  type: 'paragraph' | 'list' | 'highlight';
  title?: string;
  text?: string;
  items?: string[];
}

export interface QuestionBankItem {
  id: string;
  questionNumber: number;
  question: string;
  answerBlocks: QuestionBankAnswerBlock[];
  relatedLectureId: string;
  relatedTopicId: string;
  topicBadge: string;
  treeId?: string;
}

export type TreeNodeTone =
  | 'root'
  | 'sunnah'
  | 'negator'
  | 'affirmer'
  | 'branch'
  | 'detail';

export interface MindMapNode {
  id: string;
  title: string;
  subtitle?: string;
  points?: string[];
  tone?: TreeNodeTone;
  children?: MindMapNode[];
}

export interface MindMapTree {
  id: string;
  number: number;
  title: string;
  sourceLabel: string;
  relatedLectureId: string;
  relatedTopicId: string;
  summary: string;
  root: MindMapNode;
}

export interface SectComparisonRow {
  door: string;
  ahluSunnah: string;
  extremeNegators: string;
  extremeAffirmers: string;
  intermediateOrOther: string;
}

export interface KasbComparisonItem {
  group: string;
  definition: string;
  analogy: string;
  ruling: string;
}

export interface SpellingCorrection {
  id: string;
  location: string;
  original: string;
  corrected: string;
  note: string;
}

export interface SearchResult {
  lectureId: string;
  lectureTitle: string;
  topicId: string;
  topicTitle: string;
  matchType: 'matn' | 'sharh' | 'evidence' | 'qa';
  snippet: string;
}
