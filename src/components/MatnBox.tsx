import { useState } from 'react';
import { BookMarked, Check, Copy } from 'lucide-react';
import type { MatnSegment } from '../types/book';
import { toArabicIndicDigits } from '../utils/studyHelpers';
import { RichArabicText } from './RichArabicText';

interface MatnBoxProps {
  matn: MatnSegment;
  fontScale: number;
  colorCodingEnabled?: boolean;
}

export function MatnBox({
  matn,
  fontScale,
  colorCodingEnabled = true,
}: MatnBoxProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(matn.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard may be unavailable in restricted contexts; fail silently
    }
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
        </div>

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
