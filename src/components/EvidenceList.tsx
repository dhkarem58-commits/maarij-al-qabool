import { BookOpenCheck, Compass, ScrollText, Sparkles } from 'lucide-react';
import type { EvidenceType, NumberedEvidence } from '../types/book';
import { getEvidenceTypeLabel, toArabicIndicDigits } from '../utils/studyHelpers';
import { RichArabicText } from './RichArabicText';

interface EvidenceListProps {
  evidences: NumberedEvidence[];
  heading?: string;
  colorCodingEnabled?: boolean;
}

function getEvidenceIcon(type: EvidenceType) {
  switch (type) {
    case 'quran':
      return <BookOpenCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />;
    case 'hadith':
      return <ScrollText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />;
    case 'athar':
      return <Compass className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />;
    case 'rational':
      return <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />;
  }
}

export function EvidenceList({
  evidences,
  heading = 'الأدلة المرقمة لهذا العنصر',
  colorCodingEnabled = true,
}: EvidenceListProps) {
  if (!evidences || evidences.length === 0) return null;

  return (
    <section
      aria-label={heading}
      data-testid="topic-evidences"
      className="mt-6 rounded-lg border border-[#E6DFD3] bg-[#FAF7F2] p-4 dark:border-[#2E2924] dark:bg-[#141210]"
    >
      <div className="mb-3.5 flex items-center justify-between border-b border-[#E6DFD3] pb-2 dark:border-[#2E2924]">
        <h4 className="font-heading text-lg font-bold text-[#1B4D3E] sm:text-xl dark:text-[#4BA388]">
          {heading}
        </h4>
        <span className="text-xs font-semibold tabular-nums text-[#5E584F] dark:text-[#A8A095]">
          {toArabicIndicDigits(evidences.length)} أدلة
        </span>
      </div>

      <ol className="space-y-3">
        {evidences.map((ev) => (
          <li
            key={ev.id}
            className="rounded-md border border-[#E6DFD3] bg-[#FFFFFF] p-3.5 dark:border-[#2E2924] dark:bg-[#1D1A17]"
          >
            <div className="flex items-start gap-3">
              {/* Strict Per-Topic Sequential Number Marker */}
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-[#1B4D3E]/30 bg-[#1B4D3E]/10 text-sm font-bold tabular-nums text-[#1B4D3E] dark:border-[#4BA388]/30 dark:bg-[#4BA388]/15 dark:text-[#4BA388]">
                {toArabicIndicDigits(ev.number)}
              </span>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B5E34] dark:text-[#C48F5A]">
                    {getEvidenceIcon(ev.type)}
                    <span>{getEvidenceTypeLabel(ev.type)}</span>
                  </span>
                  <span className="text-xs font-medium text-[#5E584F] dark:text-[#A8A095]">
                    {ev.reference}
                  </span>
                </div>

                <p className="font-matn text-base leading-[1.95] text-[#1F1D1A] sm:text-lg dark:text-[#EFECE6]">
                  {ev.type === 'quran' ? (
                    <span
                      className={`font-quran text-[1.12em] leading-[2.05] ${
                        colorCodingEnabled
                          ? 'rounded bg-[#ECFDF5] px-1 text-[#14532D] dark:bg-[#064E3B]/45 dark:text-[#6EE7B7]'
                          : ''
                      }`}
                    >
                      {ev.text}
                    </span>
                  ) : (
                    <RichArabicText
                      text={ev.text}
                      variant="plainWithQuran"
                      colorCodingEnabled={colorCodingEnabled}
                    />
                  )}
                </p>

                {ev.inference && (
                  <p className="border-t border-[#E6DFD3] pt-2 text-xs leading-relaxed text-[#5E584F] sm:text-sm dark:border-[#2E2924] dark:text-[#A8A095]">
                    <span className="font-bold text-[#1B4D3E] dark:text-[#4BA388]">
                      وجه الاستدلال:{' '}
                    </span>
                    <RichArabicText
                      text={ev.inference}
                      variant="plainWithQuran"
                      colorCodingEnabled={colorCodingEnabled}
                    />
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
