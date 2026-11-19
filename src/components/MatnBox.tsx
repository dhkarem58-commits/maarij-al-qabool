import { useState } from 'react';
import { BookMarked, Check, Copy, Edit3, RotateCcw, Trash2, X } from 'lucide-react';
import type { MatnSegment } from '../types/book';
import { toArabicIndicDigits } from '../utils/studyHelpers';
import { RichArabicText } from './RichArabicText';

interface MatnBoxProps {
  matn: MatnSegment;
  fontScale: number;
  colorCodingEnabled?: boolean;
  editMode?: boolean;
  isModified?: boolean;
  onSaveMatn?: (title: string, text: string) => void;
  onDeleteMatn?: () => void;
  onRestoreMatn?: () => void;
}

export function MatnBox({
  matn,
  fontScale,
  colorCodingEnabled = true,
  editMode = false,
  isModified = false,
  onSaveMatn,
  onDeleteMatn,
  onRestoreMatn,
}: MatnBoxProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(matn.title || 'المتن المشروح');
  const [draftText, setDraftText] = useState(matn.text);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(matn.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard may be unavailable in restricted contexts; fail silently
    }
  };

  const startEditing = () => {
    setDraftTitle(matn.title || 'المتن المشروح');
    setDraftText(matn.text);
    setEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveMatn && draftText.trim()) {
      onSaveMatn(draftTitle.trim() || 'المتن المشروح', draftText.trim());
    }
    setEditing(false);
  };

  const matnFontSizePx = Math.round((20 * fontScale) / 100);

  return (
    <section
      aria-label="المتن المشروح"
      data-testid="matn-box"
      className="rounded-lg border border-[#D4C49A] bg-[#F5EFE0] p-4 sm:p-5 dark:border-[#443828] dark:bg-[#1E1A15]"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#D4C49A]/70 pb-2.5 dark:border-[#443828]">
        <div className="flex items-center gap-2">
          <BookMarked
            className="h-4 w-4 shrink-0 text-[#8B5E34] dark:text-[#C48F5A]"
            aria-hidden="true"
          />
          <span className="font-heading text-base font-bold tracking-wide text-[#8B5E34] sm:text-lg dark:text-[#C48F5A]">
            {matn.title || 'المتن المشروح'}
          </span>
          {isModified && (
            <span className="rounded bg-[#8B5E34]/15 px-2 py-0.5 text-[11px] font-bold text-[#8B5E34] dark:bg-[#C48F5A]/20 dark:text-[#C48F5A]">
              معدّل
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {editMode && onSaveMatn && !editing && (
            <button
              type="button"
              onClick={startEditing}
              data-testid="edit-matn-btn"
              className="inline-flex items-center gap-1 rounded border border-[#8B5E34] bg-[#FFFFFF] px-2.5 py-1 text-xs font-bold text-[#8B5E34] hover:bg-[#FAF7F2] dark:border-[#C48F5A] dark:bg-[#1D1A17] dark:text-[#C48F5A]"
            >
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>تعديل المتن</span>
            </button>
          )}

          {editMode && isModified && onRestoreMatn && (
            <button
              type="button"
              onClick={onRestoreMatn}
              className="inline-flex items-center gap-1 rounded border border-[#1B4D3E]/40 bg-[#FFFFFF] px-2 py-1 text-xs font-semibold text-[#1B4D3E] dark:border-[#4BA388]/40 dark:bg-[#1D1A17] dark:text-[#4BA388]"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              <span>استعادة الأصل</span>
            </button>
          )}

          {editMode && onDeleteMatn && (
            <button
              type="button"
              onClick={onDeleteMatn}
              data-testid="delete-matn-btn"
              className="inline-flex items-center gap-1 rounded border border-red-300 bg-[#FFFFFF] px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:bg-[#1D1A17] dark:text-red-400"
            >
              <Trash2 className="h-3 w-3" aria-hidden="true" />
              <span>مسح</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            aria-label="نسخ نص المتن"
            className="inline-flex items-center gap-1.5 rounded border border-[#D4C49A] bg-[#FAF7F2] px-2.5 py-1 text-xs font-medium text-[#5E584F] hover:text-[#1F1D1A] dark:border-[#443828] dark:bg-[#141210] dark:text-[#A8A095] dark:hover:text-[#EFECE6]"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#1B4D3E] dark:text-[#4BA388]" aria-hidden="true" />
                <span>تم النسخ</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                <span>نسخ المتن</span>
              </>
            )}
          </button>
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="space-y-2.5" data-testid="matn-editor-form">
          <input
            type="text"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="عنوان المتن..."
            className="w-full rounded-md border border-[#D4C49A] bg-[#FFFFFF] px-3 py-1.5 text-sm font-bold text-[#1F1D1A] dark:border-[#443828] dark:bg-[#141210] dark:text-[#EFECE6]"
          />
          <textarea
            rows={4}
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            data-testid="matn-editor-textarea"
            className="w-full rounded-md border border-[#D4C49A] bg-[#FFFFFF] px-3 py-2 font-matn text-base leading-relaxed text-[#1F1D1A] dark:border-[#443828] dark:bg-[#141210] dark:text-[#EFECE6]"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex items-center gap-1 rounded border border-[#E6DFD3] bg-[#FFFFFF] px-3 py-1 text-xs font-semibold text-[#5E584F] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#A8A095]"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              <span>إلغاء</span>
            </button>
            <button
              type="submit"
              data-testid="save-matn-edit-btn"
              className="inline-flex items-center gap-1 rounded bg-[#1B4D3E] px-3.5 py-1 text-xs font-bold text-white dark:bg-[#4BA388] dark:text-[#141210]"
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              <span>اعتماد المتن</span>
            </button>
          </div>
        </form>
      ) : (
        <p
          style={{ fontSize: `${matnFontSizePx}px` }}
          className="font-matn leading-[2.08] text-[#1F1D1A] dark:text-[#EFECE6]"
        >
          <RichArabicText
            text={matn.text}
            variant="matn"
            colorCodingEnabled={colorCodingEnabled}
          />
        </p>
      )}

      {matn.footnotes && matn.footnotes.length > 0 && (
        <div className="mt-4 border-t border-[#D4C49A]/70 pt-3 dark:border-[#443828]">
          <div className="mb-1.5 text-xs font-bold text-[#8B5E34] dark:text-[#C48F5A]">
            حواشي ضبط المتن:
          </div>
          <ul className="space-y-1.5 text-xs leading-relaxed text-[#5E584F] sm:text-sm dark:text-[#A8A095]">
            {matn.footnotes.map((fn, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="shrink-0 font-bold tabular-nums text-[#8B5E34] dark:text-[#C48F5A]">
                  ({fn.number || toArabicIndicDigits(idx + 1)})
                </span>
                <span>
                  <RichArabicText
                    text={fn.text}
                    variant="plainWithQuran"
                    colorCodingEnabled={colorCodingEnabled}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
