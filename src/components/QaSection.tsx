import { HelpCircle } from 'lucide-react';
import type { QaItem, SharhPatternType } from '../types/book';
import { toArabicIndicDigits } from '../utils/studyHelpers';
import { EvidenceList } from './EvidenceList';
import { RichArabicText } from './RichArabicText';

interface QaSectionProps {
  lectureId: string;
  title?: string;
  items: QaItem[];
  fontScale: number;
  colorCodingEnabled?: boolean;
  spotlightPattern?: SharhPatternType | null;
}

export function QaSection({
  lectureId,
  title,
  items,
  fontScale,
  colorCodingEnabled = true,
  spotlightPattern = null,
}: QaSectionProps) {
  if (!items || items.length === 0) return null;

  const fontSizePx = Math.round((16 * fontScale) / 100);

  return (
    <section
      id={`${lectureId}-qa`}
      aria-label={title || 'الأسئلة والأجوبة'}
      className="scroll-mt-24 rounded-xl border border-[#E6DFD3] bg-[#FFFFFF] p-5 shadow-xs sm:p-7 dark:border-[#2E2924] dark:bg-[#1D1A17]"
    >
      <div className="mb-5 flex items-center justify-between border-b border-[#E6DFD3] pb-3 dark:border-[#2E2924]">
        <div className="flex items-center gap-2.5">
          <HelpCircle
            className="h-5 w-5 shrink-0 text-[#8B5E34] dark:text-[#C48F5A]"
            aria-hidden="true"
          />
          <h3 className="font-heading text-2xl font-bold text-[#1F1D1A] sm:text-3xl dark:text-[#EFECE6]">
            {title || 'الأسئلة والأجوبة'}
          </h3>
        </div>
        <span className="text-xs font-semibold tabular-nums text-[#5E584F] dark:text-[#A8A095]">
          {toArabicIndicDigits(items.length)} أسئلة
        </span>
      </div>

      <div className="space-y-5">
        {items.map((qa) => (
          <div
            key={qa.id}
            id={qa.id}
            className="scroll-mt-24 rounded-lg border border-[#E6DFD3] bg-[#FAF7F2]/60 p-4 sm:p-5 dark:border-[#2E2924] dark:bg-[#141210]/60"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-[#8B5E34]/40 bg-[#F5EFE0] text-xs font-bold tabular-nums text-[#8B5E34] dark:border-[#C48F5A]/40 dark:bg-[#1E1A15] dark:text-[#C48F5A]">
                س {toArabicIndicDigits(qa.number)}
              </span>
              <h4 className="font-heading text-xl font-bold leading-snug text-[#1B4D3E] dark:text-[#4BA388]">
                <RichArabicText
                  text={qa.question}
                  variant="plainWithQuran"
                  colorCodingEnabled={colorCodingEnabled}
                />
              </h4>
            </div>

            <div
              style={{ fontSize: `${fontSizePx}px` }}
              className="mt-3 space-y-2.5 pr-10 leading-[1.9] text-[#1F1D1A] dark:text-[#EFECE6]"
            >
              {qa.answerParagraphs.map((para, idx) => (
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

            {qa.evidences && qa.evidences.length > 0 && (
              <div className="pr-0 sm:pr-10">
                <EvidenceList
                  evidences={qa.evidences}
                  heading="شواهد الجواب"
                  colorCodingEnabled={colorCodingEnabled}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
