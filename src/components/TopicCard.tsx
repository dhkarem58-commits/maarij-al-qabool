import { useState } from 'react';
import {
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  GitFork,
  Plus,
  Quote,
  RotateCcw,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { MIND_MAP_TREES, SUB_ELEMENT_SUMMARIES } from '../data';
import type {
  DisplayMode,
  Lecture,
  QuestionBankItem,
  SharhDetailLevel,
  SharhPatternType,
  SharhSubElement,
  TopicSection,
} from '../types/book';
import type { TopicOverride } from '../types/edition';
import { toArabicIndicDigits } from '../utils/studyHelpers';
import { EvidenceList } from './EvidenceList';
import { SharhSubElementEditor } from './InlineEditors';
import { MatnBox } from './MatnBox';
import { MindMapNodeCard } from './MindMapNodeCard';
import { RichArabicText } from './RichArabicText';
import { TopicQuestionBankBlock } from './TopicQuestionBankBlock';

interface TopicCardProps {
  topic: TopicSection;
  lectureId: string;
  lectures: Lecture[];
  allQuestions: QuestionBankItem[];
  canonicalSharhElements: SharhSubElement[];
  hasCanonicalMatn: boolean;
  topicOverride?: TopicOverride;
  displayMode: DisplayMode;
  detailLevel: SharhDetailLevel;
  colorCodingEnabled: boolean;
  spotlightPattern: SharhPatternType | null;
  fontScale: number;
  isBookmarked: boolean;
  editMode?: boolean;
  modifiedQuestionIds?: Record<string, boolean>;
  customQuestionIds?: Record<string, boolean>;
  nextQuestionNumber?: number;
  onToggleBookmark: (topicId: string) => void;
  onOpenTree: (treeId: string) => void;
  onSaveTopicMeta?: (topicId: string, title: string, summary: string) => void;
  onSaveMatn?: (topicId: string, title: string, text: string) => void;
  onDeleteMatn?: (topicId: string) => void;
  onRestoreMatn?: (topicId: string) => void;
  onSaveSharhElement?: (
    topicId: string,
    subElement: SharhSubElement,
    isCustom: boolean
  ) => void;
  onDeleteSharhElement?: (
    topicId: string,
    subElementId: string,
    isCustom: boolean
  ) => void;
  onRestoreSharhElement?: (topicId: string, subElementId: string) => void;
  onAddSharhElement?: (topicId: string, newElement: SharhSubElement) => void;
  onRestoreTopic?: (topicId: string) => void;
  onSaveQuestion?: (item: QuestionBankItem, isCustom: boolean) => void;
  onDeleteQuestion?: (questionId: string, isCustom: boolean) => void;
  onRestoreQuestion?: (questionId: string) => void;
  onAddQuestion?: (item: QuestionBankItem) => void;
}

export function TopicCard({
  topic,
  lectureId,
  lectures,
  allQuestions,
  canonicalSharhElements,
  hasCanonicalMatn,
  topicOverride,
  displayMode,
  detailLevel,
  colorCodingEnabled,
  spotlightPattern,
  fontScale,
  isBookmarked,
  editMode = false,
  modifiedQuestionIds = {},
  customQuestionIds = {},
  nextQuestionNumber = 112,
  onToggleBookmark,
  onOpenTree,
  onSaveTopicMeta,
  onSaveMatn,
  onDeleteMatn,
  onRestoreMatn,
  onSaveSharhElement,
  onDeleteSharhElement,
  onRestoreSharhElement,
  onAddSharhElement,
  onRestoreTopic,
  onSaveQuestion,
  onDeleteQuestion,
  onRestoreQuestion,
  onAddQuestion,
}: TopicCardProps) {
  const [expandedDigestIds, setExpandedDigestIds] = useState<Record<string, boolean>>({});
  const [inlineTreeOpenId, setInlineTreeOpenId] = useState<string | null>(null);
  const [editingMeta, setEditingMeta] = useState(false);
  const [draftTitle, setDraftTitle] = useState(topic.title);
  const [draftSummary, setDraftSummary] = useState(topic.summary);
  const [editingSharhId, setEditingSharhId] = useState<string | null>(null);
  const [addingSharh, setAddingSharh] = useState(false);

  const showMatn = displayMode !== 'sharh';
  const showSharh = displayMode !== 'matn';
  const sharhFontSizePx = Math.round((16.5 * fontScale) / 100);

  const topicTrees = MIND_MAP_TREES.filter((t) => t.relatedTopicId === topic.id);
  const topicQuestions = allQuestions.filter((q) => q.relatedTopicId === topic.id);

  const customSubElementIds = new Set(
    (topicOverride?.addedSubElements || []).map((el) => el.id)
  );
  const deletedSharhElements = canonicalSharhElements.filter((el) =>
    Boolean(topicOverride?.sharhOverrides?.[el.id]?.deleted)
  );
  const isTopicModified = Boolean(topicOverride);
  const isMatnModified = Boolean(
    topicOverride?.matnText !== undefined ||
      topicOverride?.matnTitle !== undefined ||
      topicOverride?.matnDeleted
  );

  const toggleSubElementFull = (elId: string) => {
    setExpandedDigestIds((prev) => ({ ...prev, [elId]: !prev[elId] }));
  };

  const handleSaveMeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveTopicMeta && draftTitle.trim()) {
      onSaveTopicMeta(topic.id, draftTitle.trim(), draftSummary.trim());
    }
    setEditingMeta(false);
  };

  return (
    <article
      id={topic.id}
      data-testid={`topic-${topic.id}`}
      className="scroll-mt-24 rounded-xl border border-[#E6DFD3] bg-[#FFFFFF] p-5 shadow-xs sm:p-7 dark:border-[#2E2924] dark:bg-[#1D1A17]"
    >
      {/* Topic Header */}
      <header className="mb-5 border-b border-[#E6DFD3] pb-4 dark:border-[#2E2924]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
            <span className="rounded border border-[#1B4D3E]/30 bg-[#1B4D3E]/10 px-2.5 py-1 text-[#1B4D3E] dark:border-[#4BA388]/30 dark:bg-[#4BA388]/15 dark:text-[#4BA388]">
              العنصر {toArabicIndicDigits(topic.number)}
            </span>
            <span className="tabular-nums text-[#8B5E34] dark:text-[#C48F5A]">
              {topic.pageRef}
            </span>
            {isTopicModified && (
              <span className="rounded bg-[#8B5E34]/15 px-2 py-0.5 text-[11px] font-bold text-[#8B5E34] dark:bg-[#C48F5A]/20 dark:text-[#C48F5A]">
                معدّل في هذه النسخة
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {editMode && onSaveTopicMeta && !editingMeta && (
              <button
                type="button"
                data-testid={`edit-topic-meta-${topic.id}`}
                onClick={() => {
                  setDraftTitle(topic.title);
                  setDraftSummary(topic.summary);
                  setEditingMeta(true);
                }}
                className="inline-flex items-center gap-1 rounded-md border border-[#8B5E34] bg-[#F5EFE0] px-2.5 py-1.5 text-xs font-bold text-[#8B5E34] dark:border-[#C48F5A] dark:bg-[#1E1A15] dark:text-[#C48F5A]"
              >
                <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>تعديل العنوان</span>
              </button>
            )}

            {editMode && isTopicModified && onRestoreTopic && (
              <button
                type="button"
                onClick={() => onRestoreTopic(topic.id)}
                className="inline-flex items-center gap-1 rounded-md border border-[#1B4D3E]/40 bg-[#FAF7F2] px-2.5 py-1.5 text-xs font-semibold text-[#1B4D3E] dark:border-[#4BA388]/40 dark:bg-[#141210] dark:text-[#4BA388]"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>استعادة العنصر كاملاً</span>
              </button>
            )}

            {topicTrees.map((tree) => (
              <button
                key={tree.id}
                type="button"
                data-testid={`inline-tree-toggle-${tree.id}`}
                onClick={() =>
                  setInlineTreeOpenId((prev) => (prev === tree.id ? null : tree.id))
                }
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold ${
                  inlineTreeOpenId === tree.id
                    ? 'border-[#1B4D3E] bg-[#1B4D3E] text-white dark:border-[#4BA388] dark:bg-[#4BA388] dark:text-[#141210]'
                    : 'border-[#1B4D3E]/30 bg-[#1B4D3E]/10 text-[#1B4D3E] hover:bg-[#1B4D3E]/15 dark:border-[#4BA388]/30 dark:bg-[#4BA388]/15 dark:text-[#4BA388]'
                }`}
              >
                <GitFork className="h-3.5 w-3.5" aria-hidden="true" />
                <span>تشجير المبحث</span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => onToggleBookmark(topic.id)}
              aria-pressed={isBookmarked}
              aria-label={isBookmarked ? 'إزالة من المحفوظات' : 'حفظ العنصر في المفضلة'}
              data-testid={`bookmark-btn-${topic.id}`}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium ${
                isBookmarked
                  ? 'border-[#8B5E34] bg-[#F5EFE0] text-[#8B5E34] dark:border-[#C48F5A] dark:bg-[#1E1A15] dark:text-[#C48F5A]'
                  : 'border-[#E6DFD3] bg-[#FAF7F2] text-[#5E584F] hover:border-[#8B5E34] hover:text-[#1F1D1A] dark:border-[#2E2924] dark:bg-[#141210] dark:text-[#A8A095] dark:hover:border-[#C48F5A] dark:hover:text-[#EFECE6]'
              }`}
            >
              <Bookmark
                className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-current' : ''}`}
                aria-hidden="true"
              />
              <span>{isBookmarked ? 'محفوظ' : 'حفظ العنصر'}</span>
            </button>
          </div>
        </div>

        {editingMeta ? (
          <form onSubmit={handleSaveMeta} className="mt-3 space-y-2.5 rounded-lg border border-[#D4C49A] bg-[#FAF7F2] p-3.5 dark:border-[#443828] dark:bg-[#141210]">
            <input
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              className="w-full rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-3 py-1.5 font-heading text-xl font-bold text-[#1F1D1A] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#EFECE6]"
            />
            <textarea
              rows={2}
              value={draftSummary}
              onChange={(e) => setDraftSummary(e.target.value)}
              className="w-full rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-3 py-1.5 text-sm text-[#1F1D1A] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#EFECE6]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingMeta(false)}
                className="inline-flex items-center gap-1 rounded border border-[#E6DFD3] bg-[#FFFFFF] px-3 py-1 text-xs font-semibold text-[#5E584F] dark:border-[#2E2924] dark:bg-[#1D1A17]"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                <span>إلغاء</span>
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded bg-[#1B4D3E] px-3.5 py-1 text-xs font-bold text-white dark:bg-[#4BA388] dark:text-[#141210]"
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                <span>اعتماد</span>
              </button>
            </div>
          </form>
        ) : (
          <>
            <h3 className="mt-3 font-heading text-2xl font-bold leading-snug text-[#1F1D1A] sm:text-3xl dark:text-[#EFECE6]">
              <RichArabicText
                text={topic.title}
                variant="plainWithQuran"
                colorCodingEnabled={colorCodingEnabled}
              />
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-[#5E584F] dark:text-[#A8A095]">
              <RichArabicText
                text={topic.summary}
                variant="plainWithQuran"
                colorCodingEnabled={colorCodingEnabled}
              />
            </p>
          </>
        )}

        {/* Inline Mind Map Preview when toggled */}
        {inlineTreeOpenId &&
          topicTrees
            .filter((t) => t.id === inlineTreeOpenId)
            .map((tree) => (
              <div
                key={tree.id}
                data-testid={`inline-tree-panel-${tree.id}`}
                className="mt-4 rounded-xl border border-[#1B4D3E]/30 bg-[#FAF7F2] p-4 dark:border-[#4BA388]/30 dark:bg-[#141210]"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#E6DFD3] pb-2 dark:border-[#2E2924]">
                  <div>
                    <div className="text-xs font-bold text-[#8B5E34] dark:text-[#C48F5A]">
                      {tree.sourceLabel}
                    </div>
                    <h4 className="font-heading text-lg font-bold text-[#1B4D3E] dark:text-[#4BA388]">
                      {tree.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenTree(tree.id)}
                    className="inline-flex items-center gap-1 rounded border border-[#1B4D3E] bg-[#1B4D3E] px-2.5 py-1 text-xs font-semibold text-white hover:opacity-90 dark:border-[#4BA388] dark:bg-[#4BA388] dark:text-[#141210]"
                  >
                    <GitFork className="h-3 w-3" aria-hidden="true" />
                    <span>فتح في صفحة التشجير</span>
                  </button>
                </div>
                <MindMapNodeCard
                  node={tree.root}
                  colorCodingEnabled={colorCodingEnabled}
                />
              </div>
            ))}
      </header>

      {/* Matn Section */}
      {showMatn && topic.matn && (
        <div className={showSharh ? 'mb-6' : ''}>
          <MatnBox
            matn={topic.matn}
            fontScale={fontScale}
            colorCodingEnabled={colorCodingEnabled}
            editMode={editMode}
            isModified={isMatnModified}
            onSaveMatn={
              onSaveMatn ? (title, text) => onSaveMatn(topic.id, title, text) : undefined
            }
            onDeleteMatn={onDeleteMatn ? () => onDeleteMatn(topic.id) : undefined}
            onRestoreMatn={onRestoreMatn ? () => onRestoreMatn(topic.id) : undefined}
          />
        </div>
      )}

      {/* Restore Deleted Matn Banner */}
      {showMatn && !topic.matn && editMode && hasCanonicalMatn && onRestoreMatn && (
        <div className="mb-6 flex items-center justify-between gap-2 rounded-lg border border-dashed border-[#D4C49A] bg-[#FAF7F2] px-4 py-2.5 text-xs text-[#5E584F] dark:border-[#443828] dark:bg-[#141210] dark:text-[#A8A095]">
          <span>تم مسح نص المتن من هذا العنصر في نسختك.</span>
          <button
            type="button"
            onClick={() => onRestoreMatn(topic.id)}
            className="inline-flex items-center gap-1 rounded border border-[#1B4D3E]/40 bg-[#FFFFFF] px-2.5 py-1 font-bold text-[#1B4D3E] dark:border-[#4BA388]/40 dark:bg-[#1D1A17] dark:text-[#4BA388]"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            <span>استعادة المتن الأصلي</span>
          </button>
        </div>
      )}

      {/* Sharh Section */}
      {showSharh && (
        <div data-testid="sharh-section" className="space-y-6">
          {topic.sharhElements.map((el) => {
            const digest =
              el.conciseSummary !== undefined
                ? el.conciseSummary
                : SUB_ELEMENT_SUMMARIES[el.id];
            const showFullText =
              detailLevel === 'full' || Boolean(expandedDigestIds[el.id]);
            const isCustom = customSubElementIds.has(el.id);
            const isModified = Boolean(topicOverride?.sharhOverrides?.[el.id]);
            const isEditingThis = editingSharhId === el.id;

            if (isEditingThis && onSaveSharhElement) {
              return (
                <SharhSubElementEditor
                  key={el.id}
                  initial={{
                    ...el,
                    conciseSummary: digest || '',
                  }}
                  onSave={(updated) => {
                    onSaveSharhElement(topic.id, updated, isCustom);
                    setEditingSharhId(null);
                  }}
                  onCancel={() => setEditingSharhId(null)}
                />
              );
            }

            return (
              <section key={el.id} className="space-y-3" data-testid={`sharh-el-${el.id}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#E6DFD3]/70 pb-2 dark:border-[#2E2924]/70">
                  <div className="flex flex-wrap items-baseline gap-2.5">
                    <span className="shrink-0 text-sm font-bold text-[#8B5E34] dark:text-[#C48F5A]">
                      {el.orderLabel}:
                    </span>
                    <h4 className="font-heading text-xl font-bold leading-snug text-[#1B4D3E] sm:text-2xl dark:text-[#4BA388]">
                      <RichArabicText
                        text={el.title}
                        variant="plainWithQuran"
                        colorCodingEnabled={colorCodingEnabled}
                      />
                    </h4>
                    {(isModified || isCustom) && (
                      <span className="rounded bg-[#8B5E34]/15 px-2 py-0.5 text-[11px] font-bold text-[#8B5E34] dark:bg-[#C48F5A]/20 dark:text-[#C48F5A]">
                        {isCustom ? 'مضاف' : 'معدّل'}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {editMode && onSaveSharhElement && (
                      <button
                        type="button"
                        data-testid={`edit-sharh-${el.id}`}
                        onClick={() => setEditingSharhId(el.id)}
                        className="inline-flex items-center gap-1 rounded border border-[#8B5E34] bg-[#FAF7F2] px-2.5 py-1 text-xs font-bold text-[#8B5E34] dark:border-[#C48F5A] dark:bg-[#141210] dark:text-[#C48F5A]"
                      >
                        <Edit3 className="h-3 w-3" aria-hidden="true" />
                        <span>تعديل</span>
                      </button>
                    )}

                    {editMode && isModified && !isCustom && onRestoreSharhElement && (
                      <button
                        type="button"
                        onClick={() => onRestoreSharhElement(topic.id, el.id)}
                        className="inline-flex items-center gap-1 rounded border border-[#1B4D3E]/40 bg-[#FAF7F2] px-2 py-1 text-xs font-semibold text-[#1B4D3E] dark:border-[#4BA388]/40 dark:bg-[#141210] dark:text-[#4BA388]"
                      >
                        <RotateCcw className="h-3 w-3" aria-hidden="true" />
                        <span>استعادة</span>
                      </button>
                    )}

                    {editMode && onDeleteSharhElement && (
                      <button
                        type="button"
                        data-testid={`delete-sharh-${el.id}`}
                        onClick={() => onDeleteSharhElement(topic.id, el.id, isCustom)}
                        className="inline-flex items-center gap-1 rounded border border-red-300 bg-[#FAF7F2] px-2 py-1 text-xs font-semibold text-red-700 dark:border-red-900/60 dark:bg-[#141210] dark:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden="true" />
                        <span>مسح</span>
                      </button>
                    )}

                    {detailLevel === 'digest' && (
                      <button
                        type="button"
                        onClick={() => toggleSubElementFull(el.id)}
                        className="inline-flex items-center gap-1 rounded border border-[#E6DFD3] bg-[#FAF7F2] px-2.5 py-1 text-xs font-semibold text-[#5E584F] hover:border-[#8B5E34] hover:text-[#1F1D1A] dark:border-[#2E2924] dark:bg-[#141210] dark:text-[#A8A095]"
                      >
                        {showFullText ? (
                          <>
                            <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>إخفاء التفصيل</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>عرض النص الكامل</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Concise Focused Digest Banner */}
                {digest && (
                  <div
                    data-testid={`digest-${el.id}`}
                    className="rounded-lg border border-[#1B4D3E]/25 bg-[#ECFDF5]/60 px-4 py-3 dark:border-[#4BA388]/30 dark:bg-[#0D2920]/50"
                  >
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-[#1B4D3E] dark:text-[#6EE7B7]">
                      <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>المختصر المركّز (الخلاصة المحررة):</span>
                    </div>
                    <p
                      style={{
                        fontSize: `${Math.max(14, sharhFontSizePx - 1)}px`,
                      }}
                      className="font-sharh leading-[1.85] text-[#1F1D1A] dark:text-[#EFECE6]"
                    >
                      <RichArabicText
                        text={digest}
                        variant="sharh"
                        colorCodingEnabled={colorCodingEnabled}
                        spotlightPattern={spotlightPattern}
                      />
                    </p>
                  </div>
                )}

                {/* Full Unabridged Sharh Text */}
                {showFullText && (
                  <div
                    style={{ fontSize: `${sharhFontSizePx}px` }}
                    className="font-sharh space-y-3.5 leading-[1.98] text-[#1F1D1A] dark:text-[#EFECE6]"
                  >
                    {el.paragraphs.map((para, idx) => (
                      <p key={idx}>
                        <RichArabicText
                          text={para}
                          variant="sharh"
                          colorCodingEnabled={colorCodingEnabled}
                          spotlightPattern={spotlightPattern}
                        />
                      </p>
                    ))}
                  </div>
                )}

                {showFullText && el.highlightedQuote && (
                  <blockquote className="rounded-lg border border-[#D4C49A] bg-[#F5EFE0]/70 p-4 dark:border-[#443828] dark:bg-[#1E1A15]/80">
                    <div className="flex items-start gap-2.5">
                      <Quote
                        className="mt-1 h-4 w-4 shrink-0 text-[#8B5E34] dark:text-[#C48F5A]"
                        aria-hidden="true"
                      />
                      <div className="space-y-1.5">
                        <p className="font-matn text-base leading-[1.95] text-[#1F1D1A] sm:text-lg dark:text-[#EFECE6]">
                          <RichArabicText
                            text={el.highlightedQuote.text}
                            variant="sharh"
                            colorCodingEnabled={colorCodingEnabled}
                            spotlightPattern={spotlightPattern}
                          />
                        </p>
                        {el.highlightedQuote.attribution && (
                          <footer className="text-xs font-semibold text-[#8B5E34] dark:text-[#C48F5A]">
                            — {el.highlightedQuote.attribution}
                          </footer>
                        )}
                      </div>
                    </div>
                  </blockquote>
                )}

                {el.bulletItems && el.bulletItems.length > 0 && (
                  <ul className="space-y-2.5 rounded-lg border border-[#E6DFD3] bg-[#FAF7F2]/70 p-4 dark:border-[#2E2924] dark:bg-[#141210]/70">
                    {el.bulletItems.map((item, idx) => (
                      <li
                        key={idx}
                        style={{ fontSize: `${sharhFontSizePx}px` }}
                        className="leading-[1.85] text-[#1F1D1A] dark:text-[#EFECE6]"
                      >
                        <span className="font-bold text-[#1B4D3E] dark:text-[#4BA388]">
                          • {item.label}{' '}
                        </span>
                        <span>
                          <RichArabicText
                            text={item.detail}
                            variant="sharh"
                            colorCodingEnabled={colorCodingEnabled}
                            spotlightPattern={spotlightPattern}
                          />
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {el.evidences && el.evidences.length > 0 && (
                  <EvidenceList
                    evidences={el.evidences}
                    heading={`أدلة فقرة «${el.orderLabel}»`}
                    colorCodingEnabled={colorCodingEnabled}
                  />
                )}
              </section>
            );
          })}

          {/* Deleted Sharh Elements Restore Bar */}
          {editMode && deletedSharhElements.length > 0 && onRestoreSharhElement && (
            <div className="rounded-lg border border-dashed border-[#D4C49A] bg-[#FAF7F2] p-3 text-xs dark:border-[#443828] dark:bg-[#141210]">
              <div className="mb-2 font-bold text-[#8B5E34] dark:text-[#C48F5A]">
                فقرات محذوفة من هذا العنصر ({toArabicIndicDigits(deletedSharhElements.length)}):
              </div>
              <div className="flex flex-wrap gap-2">
                {deletedSharhElements.map((del) => (
                  <button
                    key={del.id}
                    type="button"
                    onClick={() => onRestoreSharhElement(topic.id, del.id)}
                    className="inline-flex items-center gap-1 rounded border border-[#1B4D3E]/40 bg-[#FFFFFF] px-2.5 py-1 font-semibold text-[#1B4D3E] dark:border-[#4BA388]/40 dark:bg-[#1D1A17] dark:text-[#4BA388]"
                  >
                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                    <span>استعادة: {del.orderLabel} — {del.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add New Sharh Sub-Element Button & Editor */}
          {editMode && onAddSharhElement && (
            <div>
              {addingSharh ? (
                <SharhSubElementEditor
                  initial={{
                    id: `custom-sharh-${Date.now()}`,
                    orderLabel: 'فائدة مضافة',
                    title: '',
                    conciseSummary: '',
                    paragraphs: [''],
                  }}
                  submitLabel="إضافة الفقرة للعنصر"
                  onSave={(newEl) => {
                    onAddSharhElement(topic.id, newEl);
                    setAddingSharh(false);
                  }}
                  onCancel={() => setAddingSharh(false)}
                />
              ) : (
                <button
                  type="button"
                  data-testid={`add-sharh-btn-${topic.id}`}
                  onClick={() => setAddingSharh(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-[#1B4D3E]/50 bg-[#1B4D3E]/5 px-3.5 py-2 text-xs font-bold text-[#1B4D3E] hover:bg-[#1B4D3E]/10 dark:border-[#4BA388]/50 dark:bg-[#4BA388]/10 dark:text-[#4BA388]"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>إضافة فقرة شرح أو فائدة جديدة هنا</span>
                </button>
              )}
            </div>
          )}

          {/* Per-Topic Sequential Numbered Evidences */}
          <EvidenceList
            evidences={topic.evidences}
            heading={`أدلة العنصر ${toArabicIndicDigits(topic.number)} المرقمة`}
            colorCodingEnabled={colorCodingEnabled}
          />

          {/* Distributed Solved Question Bank for this Topic */}
          <TopicQuestionBankBlock
            questions={topicQuestions}
            lectures={lectures}
            lectureId={lectureId}
            topicId={topic.id}
            topicTitle={topic.title}
            colorCodingEnabled={colorCodingEnabled}
            onOpenTree={onOpenTree}
            editMode={editMode}
            modifiedQuestionIds={modifiedQuestionIds}
            customQuestionIds={customQuestionIds}
            nextQuestionNumber={nextQuestionNumber}
            onSaveQuestion={onSaveQuestion}
            onDeleteQuestion={onDeleteQuestion}
            onRestoreQuestion={onRestoreQuestion}
            onAddQuestion={onAddQuestion}
          />
        </div>
      )}
    </article>
  );
}
