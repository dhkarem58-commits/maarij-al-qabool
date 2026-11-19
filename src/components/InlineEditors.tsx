import { useState } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import type {
  Lecture,
  QuestionBankAnswerBlock,
  QuestionBankItem,
  SharhSubElement,
} from '../types/book';
import { toArabicIndicDigits } from '../utils/studyHelpers';

interface SharhSubElementEditorProps {
  initial: SharhSubElement;
  submitLabel?: string;
  onSave: (updated: SharhSubElement) => void;
  onCancel: () => void;
}

export function SharhSubElementEditor({
  initial,
  submitLabel = 'اعتماد التعديل',
  onSave,
  onCancel,
}: SharhSubElementEditorProps) {
  const [orderLabel, setOrderLabel] = useState(initial.orderLabel);
  const [title, setTitle] = useState(initial.title);
  const [conciseSummary, setConciseSummary] = useState(initial.conciseSummary || '');
  const [paragraphs, setParagraphs] = useState<string[]>(
    initial.paragraphs.length > 0 ? initial.paragraphs : ['']
  );
  const [quoteText, setQuoteText] = useState(initial.highlightedQuote?.text || '');
  const [quoteAttr, setQuoteAttr] = useState(
    initial.highlightedQuote?.attribution || ''
  );
  const [bulletItems, setBulletItems] = useState<{ label: string; detail: string }[]>(
    initial.bulletItems || []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedParagraphs = paragraphs.map((p) => p.trim()).filter(Boolean);
    const cleanedBullets = bulletItems
      .map((b) => ({ label: b.label.trim(), detail: b.detail.trim() }))
      .filter((b) => b.label || b.detail);

    onSave({
      ...initial,
      orderLabel: orderLabel.trim() || initial.orderLabel || 'فقرة',
      title: title.trim() || initial.title || 'عنوان الفقرة',
      conciseSummary: conciseSummary.trim(),
      paragraphs: cleanedParagraphs.length > 0 ? cleanedParagraphs : [''],
      highlightedQuote: quoteText.trim()
        ? {
            text: quoteText.trim(),
            ...(quoteAttr.trim() ? { attribution: quoteAttr.trim() } : {}),
          }
        : undefined,
      bulletItems: cleanedBullets.length > 0 ? cleanedBullets : undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-testid={`sharh-editor-${initial.id}`}
      className="space-y-3 rounded-xl border-2 border-[#8B5E34]/50 bg-[#FAF7F2] p-4 dark:border-[#C48F5A]/50 dark:bg-[#141210]"
    >
      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-bold text-[#5E584F] dark:text-[#A8A095]">
            الترتيب / الوسم:
          </label>
          <input
            type="text"
            value={orderLabel}
            onChange={(e) => setOrderLabel(e.target.value)}
            placeholder="أولاً / فائدة"
            className="w-full rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-2.5 py-1.5 text-xs font-semibold text-[#1F1D1A] focus:border-[#1B4D3E] focus:outline-none dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#EFECE6]"
          />
        </div>
        <div className="sm:col-span-3">
          <label className="mb-1 block text-xs font-bold text-[#5E584F] dark:text-[#A8A095]">
            عنوان الفقرة الفرعية:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-testid="sharh-editor-title-input"
            className="w-full rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-3 py-1.5 text-sm font-bold text-[#1F1D1A] focus:border-[#1B4D3E] focus:outline-none dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#EFECE6]"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold text-[#1B4D3E] dark:text-[#6EE7B7]">
          المختصر المركّز (الخلاصة المحررة):
        </label>
        <textarea
          rows={2}
          value={conciseSummary}
          onChange={(e) => setConciseSummary(e.target.value)}
          data-testid="sharh-editor-digest-input"
          placeholder="اكتب المختصر المركّز أو اتركه فارغاً لإخفاء صندوق الخلاصة..."
          className="w-full rounded-md border border-[#1B4D3E]/30 bg-[#FFFFFF] px-3 py-2 text-sm leading-relaxed text-[#1F1D1A] focus:border-[#1B4D3E] focus:outline-none dark:border-[#4BA388]/30 dark:bg-[#1D1A17] dark:text-[#EFECE6]"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#5E584F] dark:text-[#A8A095]">
            فقرات الشرح (يمكنك وضع الآيات بين ﴿ ﴾ ليُعرض بالرسم العثماني):
          </label>
          <button
            type="button"
            onClick={() => setParagraphs((prev) => [...prev, ''])}
            className="inline-flex items-center gap-1 rounded border border-[#1B4D3E]/30 bg-[#1B4D3E]/10 px-2 py-1 text-xs font-bold text-[#1B4D3E] dark:border-[#4BA388]/30 dark:bg-[#4BA388]/15 dark:text-[#4BA388]"
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
            <span>إضافة فقرة نصية</span>
          </button>
        </div>
        {paragraphs.map((para, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <textarea
              rows={3}
              value={para}
              data-testid={`sharh-editor-para-${idx}`}
              onChange={(e) =>
                setParagraphs((prev) =>
                  prev.map((item, i) => (i === idx ? e.target.value : item))
                )
              }
              className="flex-1 rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-3 py-2 text-sm leading-relaxed text-[#1F1D1A] focus:border-[#1B4D3E] focus:outline-none dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#EFECE6]"
            />
            {paragraphs.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setParagraphs((prev) => prev.filter((_, i) => i !== idx))
                }
                aria-label="حذف هذه الفقرة"
                className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#E6DFD3] bg-[#FFFFFF] text-[#5E584F] hover:text-red-700 dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#A8A095]"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Optional Highlighted Quote */}
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-bold text-[#5E584F] dark:text-[#A8A095]">
            اقتباس مميز (اختياري):
          </label>
          <input
            type="text"
            value={quoteText}
            onChange={(e) => setQuoteText(e.target.value)}
            placeholder="نص الاقتباس أو القاعدة..."
            className="w-full rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#1F1D1A] focus:border-[#1B4D3E] focus:outline-none dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#EFECE6]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-[#5E584F] dark:text-[#A8A095]">
            العزو / القائل:
          </label>
          <input
            type="text"
            value={quoteAttr}
            onChange={(e) => setQuoteAttr(e.target.value)}
            placeholder="مثال: الشارح / ابن تيمية"
            className="w-full rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#1F1D1A] focus:border-[#1B4D3E] focus:outline-none dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#EFECE6]"
          />
        </div>
      </div>

      {/* Optional Bullet Items */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#5E584F] dark:text-[#A8A095]">
            النقاط التفصيلية ({toArabicIndicDigits(bulletItems.length)}):
          </span>
          <button
            type="button"
            onClick={() =>
              setBulletItems((prev) => [...prev, { label: '', detail: '' }])
            }
            className="inline-flex items-center gap-1 rounded border border-[#D4C49A] bg-[#F5EFE0] px-2 py-1 text-xs font-semibold text-[#8B5E34] dark:border-[#443828] dark:bg-[#1E1A15] dark:text-[#C48F5A]"
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
            <span>إضافة نقطة</span>
          </button>
        </div>
        {bulletItems.map((b, idx) => (
          <div key={idx} className="flex flex-wrap items-start gap-2 sm:flex-nowrap">
            <input
              type="text"
              value={b.label}
              onChange={(e) =>
                setBulletItems((prev) =>
                  prev.map((item, i) =>
                    i === idx ? { ...item, label: e.target.value } : item
                  )
                )
              }
              placeholder="عنوان النقطة:"
              className="w-full rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-2.5 py-1.5 text-xs font-bold text-[#1F1D1A] sm:w-44 dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#EFECE6]"
            />
            <input
              type="text"
              value={b.detail}
              onChange={(e) =>
                setBulletItems((prev) =>
                  prev.map((item, i) =>
                    i === idx ? { ...item, detail: e.target.value } : item
                  )
                )
              }
              placeholder="تفصيل النقطة..."
              className="flex-1 rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-2.5 py-1.5 text-xs text-[#1F1D1A] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#EFECE6]"
            />
            <button
              type="button"
              onClick={() =>
                setBulletItems((prev) => prev.filter((_, i) => i !== idx))
              }
              aria-label="حذف النقطة"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-[#E6DFD3] bg-[#FFFFFF] text-[#5E584F] hover:text-red-700 dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#A8A095]"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1 rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-3 py-1.5 text-xs font-semibold text-[#5E584F] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#A8A095]"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          <span>إلغاء</span>
        </button>
        <button
          type="submit"
          data-testid="sharh-editor-submit-btn"
          className="inline-flex items-center gap-1 rounded-md bg-[#1B4D3E] px-4 py-1.5 text-xs font-bold text-white dark:bg-[#4BA388] dark:text-[#141210]"
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{submitLabel}</span>
        </button>
      </div>
    </form>
  );
}

interface QuestionEditorProps {
  initial: QuestionBankItem;
  lectures: Lecture[];
  submitLabel?: string;
  onSave: (updated: QuestionBankItem) => void;
  onCancel: () => void;
}

export function QuestionEditor({
  initial,
  lectures,
  submitLabel = 'اعتماد تعديل السؤال',
  onSave,
  onCancel,
}: QuestionEditorProps) {
  const [questionNumber, setQuestionNumber] = useState(
    String(initial.questionNumber)
  );
  const [relatedLectureId, setRelatedLectureId] = useState(
    initial.relatedLectureId
  );
  const [relatedTopicId, setRelatedTopicId] = useState(initial.relatedTopicId);
  const [topicBadge, setTopicBadge] = useState(initial.topicBadge);
  const [question, setQuestion] = useState(initial.question);
  const [blocks, setBlocks] = useState<QuestionBankAnswerBlock[]>(
    initial.answerBlocks.length > 0
      ? initial.answerBlocks
      : [{ type: 'paragraph', text: '' }]
  );

  const selectedLecture =
    lectures.find((l) => l.id === relatedLectureId) || lectures[0];

  const handleLectureChange = (lecId: string) => {
    setRelatedLectureId(lecId);
    const lec = lectures.find((l) => l.id === lecId);
    if (lec && lec.topics.length > 0) {
      setRelatedTopicId(lec.topics[0].id);
      setTopicBadge(lec.topics[0].title);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number.parseInt(questionNumber, 10);
    const cleanedBlocks = blocks
      .map((b) => ({
        ...b,
        title: b.title?.trim() || undefined,
        text: b.text?.trim() || undefined,
        items: b.items
          ? b.items.map((x) => x.trim()).filter(Boolean)
          : undefined,
      }))
      .filter((b) => b.text || (b.items && b.items.length > 0));

    onSave({
      ...initial,
      questionNumber:
        Number.isFinite(num) && num > 0 ? num : initial.questionNumber,
      relatedLectureId,
      relatedTopicId,
      topicBadge: topicBadge.trim() || 'موضوع مخصص',
      question: question.trim() || initial.question,
      answerBlocks:
        cleanedBlocks.length > 0
          ? cleanedBlocks
          : [{ type: 'paragraph', text: '—' }],
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-testid={`question-editor-${initial.id}`}
      className="space-y-3 rounded-xl border-2 border-[#8B5E34]/50 bg-[#FAF7F2] p-4 dark:border-[#C48F5A]/50 dark:bg-[#141210]"
    >
      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-bold text-[#5E584F] dark:text-[#A8A095]">
            رقم السؤال:
          </label>
          <input
            type="number"
            min={1}
            value={questionNumber}
            onChange={(e) => setQuestionNumber(e.target.value)}
            className="w-full rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-2.5 py-1.5 text-xs font-bold text-[#1F1D1A] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#EFECE6]"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-[#5E584F] dark:text-[#A8A095]">
            المحاضرة:
          </label>
          <select
            value={relatedLectureId}
            onChange={(e) => handleLectureChange(e.target.value)}
            className="w-full rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-2.5 py-1.5 text-xs text-[#1F1D1A] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#EFECE6]"
          >
            {lectures.map((lec) => (
              <option key={lec.id} value={lec.id}>
                {lec.arabicOrdinal}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-bold text-[#5E584F] dark:text-[#A8A095]">
            الموضوع المرتبط:
          </label>
          <select
            value={relatedTopicId}
            onChange={(e) => {
              setRelatedTopicId(e.target.value);
              const t = selectedLecture?.topics.find(
                (x) => x.id === e.target.value
              );
              if (t) setTopicBadge(t.title);
            }}
            className="w-full rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-2.5 py-1.5 text-xs text-[#1F1D1A] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#EFECE6]"
          >
            {selectedLecture?.topics.map((t) => (
              <option key={t.id} value={t.id}>
                العنصر {toArabicIndicDigits(t.number)}: {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold text-[#5E584F] dark:text-[#A8A095]">
          عنوان التصنيف (الوسم):
        </label>
        <input
          type="text"
          value={topicBadge}
          onChange={(e) => setTopicBadge(e.target.value)}
          className="w-full rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-3 py-1.5 text-xs font-semibold text-[#1F1D1A] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#EFECE6]"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold text-[#1B4D3E] dark:text-[#4BA388]">
          نص السؤال:
        </label>
        <textarea
          rows={2}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          data-testid="question-editor-text-input"
          className="w-full rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-3 py-2 text-sm font-bold text-[#1F1D1A] focus:border-[#1B4D3E] focus:outline-none dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#EFECE6]"
        />
      </div>

      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-[#5E584F] dark:text-[#A8A095]">
            كتل الإجابة النموذجية:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                setBlocks((prev) => [...prev, { type: 'paragraph', text: '' }])
              }
              className="inline-flex items-center gap-1 rounded border border-[#1B4D3E]/30 bg-[#1B4D3E]/10 px-2 py-1 text-xs font-semibold text-[#1B4D3E] dark:border-[#4BA388]/30 dark:bg-[#4BA388]/15 dark:text-[#4BA388]"
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
              <span>فقرة</span>
            </button>
            <button
              type="button"
              onClick={() =>
                setBlocks((prev) => [...prev, { type: 'highlight', text: '' }])
              }
              className="inline-flex items-center gap-1 rounded border border-[#D4C49A] bg-[#F5EFE0] px-2 py-1 text-xs font-semibold text-[#8B5E34] dark:border-[#443828] dark:bg-[#1E1A15] dark:text-[#C48F5A]"
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
              <span>خلاصة مميزة</span>
            </button>
            <button
              type="button"
              onClick={() =>
                setBlocks((prev) => [...prev, { type: 'list', items: [''] }])
              }
              className="inline-flex items-center gap-1 rounded border border-[#E6DFD3] bg-[#FFFFFF] px-2 py-1 text-xs font-semibold text-[#5E584F] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#A8A095]"
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
              <span>قائمة نقطية</span>
            </button>
          </div>
        </div>

        {blocks.map((block, bIdx) => (
          <div
            key={bIdx}
            className="space-y-2 rounded-lg border border-[#E6DFD3] bg-[#FFFFFF] p-3 dark:border-[#2E2924] dark:bg-[#1D1A17]"
          >
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                value={block.title || ''}
                onChange={(e) =>
                  setBlocks((prev) =>
                    prev.map((item, i) =>
                      i === bIdx ? { ...item, title: e.target.value } : item
                    )
                  )
                }
                placeholder="عنوان فرعي للكتلة (اختياري)..."
                className="flex-1 rounded border border-[#E6DFD3] bg-[#FAF7F2] px-2.5 py-1 text-xs font-bold text-[#8B5E34] dark:border-[#2E2924] dark:bg-[#141210] dark:text-[#C48F5A]"
              />
              {blocks.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setBlocks((prev) => prev.filter((_, i) => i !== bIdx))
                  }
                  aria-label="حذف كتلة الإجابة"
                  className="flex h-7 w-7 items-center justify-center rounded border border-[#E6DFD3] text-[#5E584F] hover:text-red-700 dark:border-[#2E2924] dark:text-[#A8A095]"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            {block.type !== 'list' ? (
              <textarea
                rows={2}
                value={block.text || ''}
                data-testid={`question-editor-block-text-${bIdx}`}
                onChange={(e) =>
                  setBlocks((prev) =>
                    prev.map((item, i) =>
                      i === bIdx ? { ...item, text: e.target.value } : item
                    )
                  )
                }
                placeholder="اكتب نص الجواب هنا..."
                className="w-full rounded border border-[#E6DFD3] bg-[#FAF7F2] px-3 py-1.5 text-sm leading-relaxed text-[#1F1D1A] dark:border-[#2E2924] dark:bg-[#141210] dark:text-[#EFECE6]"
              />
            ) : (
              <div className="space-y-1.5">
                {(block.items || []).map((li, liIdx) => (
                  <div key={liIdx} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={li}
                      onChange={(e) =>
                        setBlocks((prev) =>
                          prev.map((item, i) =>
                            i === bIdx
                              ? {
                                  ...item,
                                  items: (item.items || []).map((x, j) =>
                                    j === liIdx ? e.target.value : x
                                  ),
                                }
                              : item
                          )
                        )
                      }
                      placeholder="عنصر في القائمة..."
                      className="flex-1 rounded border border-[#E6DFD3] bg-[#FAF7F2] px-2.5 py-1 text-xs text-[#1F1D1A] dark:border-[#2E2924] dark:bg-[#141210] dark:text-[#EFECE6]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setBlocks((prev) =>
                          prev.map((item, i) =>
                            i === bIdx
                              ? {
                                  ...item,
                                  items: (item.items || []).filter(
                                    (_, j) => j !== liIdx
                                  ),
                                }
                              : item
                          )
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded border border-[#E6DFD3] text-[#5E584F] hover:text-red-700 dark:border-[#2E2924]"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setBlocks((prev) =>
                      prev.map((item, i) =>
                        i === bIdx
                          ? { ...item, items: [...(item.items || []), ''] }
                          : item
                      )
                    )
                  }
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B4D3E] dark:text-[#4BA388]"
                >
                  <Plus className="h-3 w-3" aria-hidden="true" />
                  <span>إضافة نقطة للقائمة</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1 rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-3 py-1.5 text-xs font-semibold text-[#5E584F] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#A8A095]"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          <span>إلغاء</span>
        </button>
        <button
          type="submit"
          data-testid="question-editor-submit-btn"
          className="inline-flex items-center gap-1 rounded-md bg-[#1B4D3E] px-4 py-1.5 text-xs font-bold text-white dark:bg-[#4BA388] dark:text-[#141210]"
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{submitLabel}</span>
        </button>
      </div>
    </form>
  );
}
