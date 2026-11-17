import { useState } from 'react';
import {
  HEARING_RANKS,
  KASB_COMPARISONS,
  MUTAZILAH_USUL,
  QADAR_RANKS,
  SECT_COMPARISON_MATRIX,
} from '../data';
import { RichArabicText } from './RichArabicText';

type MatrixViewId = 'sects' | 'kasb' | 'ranks';

interface ComparisonTablesViewProps {
  colorCodingEnabled?: boolean;
}

export function ComparisonTablesView({
  colorCodingEnabled = true,
}: ComparisonTablesViewProps) {
  const [activeMatrix, setActiveMatrix] = useState<MatrixViewId>('sects');

  return (
    <div className="space-y-6" data-testid="comparisons-view">
      {/* Header & Matrix Switcher */}
      <div className="rounded-xl border border-[#E6DFD3] bg-[#FFFFFF] p-5 shadow-xs sm:p-6 dark:border-[#2E2924] dark:bg-[#1D1A17]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E6DFD3] pb-4 dark:border-[#2E2924]">
          <div>
            <h2 className="font-heading text-2xl font-bold text-[#1F1D1A] sm:text-3xl dark:text-[#EFECE6]">
              جداول المقارنة العقدية وموازين الفرق
            </h2>
            <p className="mt-1 text-sm text-[#5E584F] dark:text-[#A8A095]">
              خلاصة مقارنة لمسائل الافتراق الكبرى كما وردت في المحاضرات (١٢ – ١٧).
            </p>
          </div>

          <div
            role="group"
            aria-label="اختيار جدول المقارنة"
            className="inline-flex flex-wrap rounded-md border border-[#E6DFD3] bg-[#FAF7F2] p-0.5 dark:border-[#2E2924] dark:bg-[#141210]"
          >
            {[
              { id: 'sects' as const, label: 'وسطية أهل السنة (٥ أبواب)' },
              { id: 'kasb' as const, label: 'الكسب وأفعال العباد' },
              { id: 'ranks' as const, label: 'المراتب والأصول الخمسة' },
            ].map((tab) => {
              const active = activeMatrix === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveMatrix(tab.id)}
                  className={`rounded px-3 py-1.5 text-xs font-semibold sm:text-sm ${
                    active
                      ? 'bg-[#1B4D3E] text-[#FFFFFF] dark:bg-[#4BA388] dark:text-[#141210]'
                      : 'text-[#5E584F] hover:text-[#1F1D1A] dark:text-[#A8A095] dark:hover:text-[#EFECE6]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Matrix 1: Five Doors Comparison */}
      {activeMatrix === 'sects' && (
        <div className="space-y-4">
          {SECT_COMPARISON_MATRIX.map((row) => (
            <div
              key={row.door}
              className="rounded-xl border border-[#E6DFD3] bg-[#FFFFFF] p-5 shadow-xs dark:border-[#2E2924] dark:bg-[#1D1A17]"
            >
              <h3 className="mb-4 border-b border-[#E6DFD3] pb-2 font-heading text-2xl font-bold text-[#8B5E34] dark:border-[#2E2924] dark:text-[#C48F5A]">
                {row.door}
              </h3>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-[#1B4D3E]/30 bg-[#1B4D3E]/5 p-4 dark:border-[#4BA388]/30 dark:bg-[#4BA388]/10">
                  <div className="mb-1.5 text-xs font-bold text-[#1B4D3E] dark:text-[#4BA388]">
                    مذهب أهل السنة والجماعة (الوسط الحق)
                  </div>
                  <p className="text-sm leading-relaxed text-[#1F1D1A] dark:text-[#EFECE6]">
                    <RichArabicText
                      text={row.ahluSunnah}
                      variant="plainWithQuran"
                      colorCodingEnabled={colorCodingEnabled}
                    />
                  </p>
                </div>

                <div className="rounded-lg border border-[#E6DFD3] bg-[#FAF7F2] p-4 dark:border-[#2E2924] dark:bg-[#141210]">
                  <div className="mb-1.5 text-xs font-bold text-[#8B5E34] dark:text-[#C48F5A]">
                    طرف النفاة / المقصرين
                  </div>
                  <p className="text-sm leading-relaxed text-[#1F1D1A] dark:text-[#EFECE6]">
                    <RichArabicText
                      text={row.extremeNegators}
                      variant="plainWithQuran"
                      colorCodingEnabled={colorCodingEnabled}
                    />
                  </p>
                </div>

                <div className="rounded-lg border border-[#E6DFD3] bg-[#FAF7F2] p-4 dark:border-[#2E2924] dark:bg-[#141210]">
                  <div className="mb-1.5 text-xs font-bold text-[#8B5E34] dark:text-[#C48F5A]">
                    طرف الغلاة / المثبتين بالباطل
                  </div>
                  <p className="text-sm leading-relaxed text-[#1F1D1A] dark:text-[#EFECE6]">
                    <RichArabicText
                      text={row.extremeAffirmers}
                      variant="plainWithQuran"
                      colorCodingEnabled={colorCodingEnabled}
                    />
                  </p>
                </div>

                <div className="rounded-lg border border-[#D4C49A] bg-[#F5EFE0]/60 p-4 dark:border-[#443828] dark:bg-[#1E1A15]/70">
                  <div className="mb-1.5 text-xs font-bold text-[#5E584F] dark:text-[#A8A095]">
                    طوائف متوسطة أو متفرعة
                  </div>
                  <p className="text-sm leading-relaxed text-[#1F1D1A] dark:text-[#EFECE6]">
                    <RichArabicText
                      text={row.intermediateOrOther}
                      variant="plainWithQuran"
                      colorCodingEnabled={colorCodingEnabled}
                    />
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Matrix 2: Kasb */}
      {activeMatrix === 'kasb' && (
        <div className="grid gap-4 md:grid-cols-2">
          {KASB_COMPARISONS.map((item) => (
            <div
              key={item.group}
              className="flex flex-col justify-between rounded-xl border border-[#E6DFD3] bg-[#FFFFFF] p-5 shadow-xs dark:border-[#2E2924] dark:bg-[#1D1A17]"
            >
              <div>
                <h3 className="border-b border-[#E6DFD3] pb-2.5 font-heading text-xl font-bold text-[#1B4D3E] dark:border-[#2E2924] dark:text-[#4BA388]">
                  {item.group}
                </h3>
                <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-[#1F1D1A] dark:text-[#EFECE6]">
                  <p>
                    <span className="font-bold text-[#8B5E34] dark:text-[#C48F5A]">التصور: </span>
                    <RichArabicText
                      text={item.definition}
                      variant="plainWithQuran"
                      colorCodingEnabled={colorCodingEnabled}
                    />
                  </p>
                  <p>
                    <span className="font-bold text-[#8B5E34] dark:text-[#C48F5A]">
                      التمثيل التوضيحي:{' '}
                    </span>
                    <RichArabicText
                      text={item.analogy}
                      variant="plainWithQuran"
                      colorCodingEnabled={colorCodingEnabled}
                    />
                  </p>
                </div>
              </div>
              <p className="mt-4 rounded-md border border-[#D4C49A] bg-[#F5EFE0] p-3 text-xs font-medium leading-relaxed text-[#1F1D1A] dark:border-[#443828] dark:bg-[#1E1A15] dark:text-[#EFECE6]">
                <span className="font-bold">الحكم والمآل: </span>
                <RichArabicText
                  text={item.ruling}
                  variant="plainWithQuran"
                  colorCodingEnabled={colorCodingEnabled}
                />
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Matrix 3: Hearing Ranks, Qadar Ranks, Mu'tazilah Usul */}
      {activeMatrix === 'ranks' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#E6DFD3] bg-[#FFFFFF] p-5 shadow-xs dark:border-[#2E2924] dark:bg-[#1D1A17]">
            <h3 className="mb-3 font-heading text-2xl font-bold text-[#1B4D3E] dark:text-[#4BA388]">
              مراتب السماع الثلاث في القرآن الكريم (المحاضرة ١٢)
            </h3>
            <div className="grid gap-3 md:grid-cols-3">
              {HEARING_RANKS.map((r) => (
                <div
                  key={r.rank}
                  className="rounded-lg border border-[#E6DFD3] bg-[#FAF7F2] p-4 dark:border-[#2E2924] dark:bg-[#141210]"
                >
                  <div className="font-bold text-[#8B5E34] dark:text-[#C48F5A]">{r.rank}</div>
                  <p className="mt-2 text-sm leading-relaxed text-[#1F1D1A] dark:text-[#EFECE6]">
                    {r.meaning}
                  </p>
                  <p className="mt-2 border-t border-[#E6DFD3] pt-2 text-xs text-[#5E584F] dark:border-[#2E2924] dark:text-[#A8A095]">
                    <RichArabicText
                      text={r.evidence}
                      variant="plainWithQuran"
                      colorCodingEnabled={colorCodingEnabled}
                    />
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#E6DFD3] bg-[#FFFFFF] p-5 shadow-xs dark:border-[#2E2924] dark:bg-[#1D1A17]">
            <h3 className="mb-3 font-heading text-2xl font-bold text-[#1B4D3E] dark:text-[#4BA388]">
              مراتب الإيمان بالقدر الأربع (المحاضرة ١٦)
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {QADAR_RANKS.map((q) => (
                <div
                  key={q.rank}
                  className="rounded-lg border border-[#E6DFD3] bg-[#FAF7F2] p-4 dark:border-[#2E2924] dark:bg-[#141210]"
                >
                  <div className="font-bold text-[#8B5E34] dark:text-[#C48F5A]">{q.rank}</div>
                  <p className="mt-2 text-sm leading-relaxed text-[#1F1D1A] dark:text-[#EFECE6]">
                    {q.detail}
                  </p>
                  <p className="mt-2 border-t border-[#E6DFD3] pt-2 font-matn text-sm text-[#5E584F] dark:border-[#2E2924] dark:text-[#A8A095]">
                    <RichArabicText
                      text={q.evidence}
                      variant="plainWithQuran"
                      colorCodingEnabled={colorCodingEnabled}
                    />
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#E6DFD3] bg-[#FFFFFF] p-5 shadow-xs dark:border-[#2E2924] dark:bg-[#1D1A17]">
            <h3 className="mb-3 font-heading text-2xl font-bold text-[#1B4D3E] dark:text-[#4BA388]">
              أصول المعتزلة الخمسة وحقيقتها (المحاضرات ١٤ – ١٦)
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MUTAZILAH_USUL.map((u) => (
                <div
                  key={u.number}
                  className="rounded-lg border border-[#E6DFD3] bg-[#FAF7F2] p-4 dark:border-[#2E2924] dark:bg-[#141210]"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded border border-[#8B5E34]/40 bg-[#F5EFE0] text-xs font-bold text-[#8B5E34] dark:border-[#C48F5A]/40 dark:bg-[#1E1A15] dark:text-[#C48F5A]">
                      {u.number}
                    </span>
                    <span className="font-bold text-[#1F1D1A] dark:text-[#EFECE6]">
                      {u.title}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#5E584F] dark:text-[#A8A095]">
                    <RichArabicText
                      text={u.truthVsError}
                      variant="plainWithQuran"
                      colorCodingEnabled={colorCodingEnabled}
                    />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
