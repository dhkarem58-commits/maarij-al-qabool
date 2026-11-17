import { useMemo, useState } from 'react';
import { ArrowUpLeft, Filter, Search } from 'lucide-react';
import type { EvidenceType, Lecture } from '../types/book';
import {
  extractAllEvidences,
  getEvidenceTypeLabel,
  normalizeArabicForSearch,
  toArabicIndicDigits,
} from '../utils/studyHelpers';
import { RichArabicText } from './RichArabicText';

interface EvidencesIndexViewProps {
  lectures: Lecture[];
  colorCodingEnabled?: boolean;
  onNavigateToTopic: (lectureId: string, topicId: string) => void;
}

const TYPE_FILTERS: { id: 'all' | EvidenceType; label: string }[] = [
  { id: 'all', label: 'جميع الأدلة' },
  { id: 'quran', label: 'القرآن الكريم' },
  { id: 'hadith', label: 'الحديث الشريف' },
  { id: 'athar', label: 'الآثار وأقوال السلف' },
  { id: 'rational', label: 'الأدلة العقلية واللغوية' },
];

export function EvidencesIndexView({
  lectures,
  colorCodingEnabled = true,
  onNavigateToTopic,
}: EvidencesIndexViewProps) {
  const [selectedType, setSelectedType] = useState<'all' | EvidenceType>('all');
  const [selectedLectureId, setSelectedLectureId] = useState<string>('all');
  const [query, setQuery] = useState('');

  const allEvidences = useMemo(() => extractAllEvidences(lectures), [lectures]);

  const filteredEvidences = useMemo(() => {
    const normQuery = normalizeArabicForSearch(query);
    return allEvidences.filter((ev) => {
      if (selectedType !== 'all' && ev.type !== selectedType) return false;
      if (selectedLectureId !== 'all' && ev.lectureId !== selectedLectureId) return false;
      if (normQuery) {
        const blob = `${ev.text} ${ev.reference} ${ev.inference ?? ''} ${ev.topicTitle}`;
        if (!normalizeArabicForSearch(blob).includes(normQuery)) return false;
      }
      return true;
    });
  }, [allEvidences, selectedType, selectedLectureId, query]);

  return (
    <div className="space-y-6" data-testid="evidences-index-view">
      {/* Header & Filters */}
      <div className="rounded-xl border border-[#E6DFD3] bg-[#FFFFFF] p-5 shadow-xs sm:p-6 dark:border-[#2E2924] dark:bg-[#1D1A17]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6DFD3] pb-4 dark:border-[#2E2924]">
          <div>
            <h2 className="font-heading text-2xl font-bold text-[#1F1D1A] sm:text-3xl dark:text-[#EFECE6]">
              فهرس الأدلة الشامل والمُرقَّم
            </h2>
            <p className="mt-1 text-sm text-[#5E584F] dark:text-[#A8A095]">
              مجموع الأدلة المستخرجة من المحاضرات (١٢ – ١٧) مع ترقيم كل دليل ضمن عنصره وموضوعه.
            </p>
          </div>
          <div className="rounded-md border border-[#D4C49A] bg-[#F5EFE0] px-3 py-1.5 text-sm font-bold tabular-nums text-[#8B5E34] dark:border-[#443828] dark:bg-[#1E1A15] dark:text-[#C48F5A]">
            المعروض: {toArabicIndicDigits(filteredEvidences.length)} من{' '}
            {toArabicIndicDigits(allEvidences.length)} دليلاً
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="تصفية حسب نوع الدليل">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5E584F] dark:text-[#A8A095]">
              <Filter className="h-3.5 w-3.5" aria-hidden="true" />
              <span>نوع الدليل:</span>
            </span>
            {TYPE_FILTERS.map((f) => {
              const active = selectedType === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  data-testid={`filter-evidence-${f.id}`}
                  aria-pressed={active}
                  onClick={() => setSelectedType(f.id)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                    active
                      ? 'border-[#1B4D3E] bg-[#1B4D3E] text-[#FFFFFF] dark:border-[#4BA388] dark:bg-[#4BA388] dark:text-[#141210]'
                      : 'border-[#E6DFD3] bg-[#FAF7F2] text-[#5E584F] hover:border-[#8B5E34] hover:text-[#1F1D1A] dark:border-[#2E2924] dark:bg-[#141210] dark:text-[#A8A095] dark:hover:text-[#EFECE6]'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="evidence-lecture-select"
                className="mb-1 block text-xs font-semibold text-[#5E584F] dark:text-[#A8A095]"
              >
                تصفية حسب المحاضرة:
              </label>
              <select
                id="evidence-lecture-select"
                value={selectedLectureId}
                onChange={(e) => setSelectedLectureId(e.target.value)}
                className="w-full rounded-md border border-[#E6DFD3] bg-[#FAF7F2] px-3 py-2 text-sm text-[#1F1D1A] focus:border-[#1B4D3E] focus:outline-none dark:border-[#2E2924] dark:bg-[#141210] dark:text-[#EFECE6]"
              >
                <option value="all">جميع المحاضرات (١٢ – ١٧)</option>
                {lectures.map((lec) => (
                  <option key={lec.id} value={lec.id}>
                    {lec.arabicOrdinal}: {lec.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="evidence-search-input"
                className="mb-1 block text-xs font-semibold text-[#5E584F] dark:text-[#A8A095]"
              >
                بحث في نصوص الأدلة:
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-2.5 right-3 h-4 w-4 text-[#5E584F] dark:text-[#A8A095]"
                  aria-hidden="true"
                />
                <input
                  id="evidence-search-input"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث بلفظ الآية أو الحديث أو وجه الاستدلال..."
                  className="w-full rounded-md border border-[#E6DFD3] bg-[#FAF7F2] py-2 pr-9 pl-3 text-sm text-[#1F1D1A] placeholder:text-[#5E584F]/70 focus:border-[#1B4D3E] focus:outline-none dark:border-[#2E2924] dark:bg-[#141210] dark:text-[#EFECE6] dark:placeholder:text-[#A8A095]/60"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredEvidences.length === 0 ? (
        <div className="rounded-xl border border-[#E6DFD3] bg-[#FFFFFF] p-8 text-center text-sm text-[#5E584F] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#A8A095]">
          لا توجد أدلة مطابقة لمعايير التصفية الحالية.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvidences.map((ev, idx) => (
            <div
              key={`${ev.id}-${idx}`}
              className="rounded-lg border border-[#E6DFD3] bg-[#FFFFFF] p-4 hover:border-[#8B5E34]/60 dark:border-[#2E2924] dark:bg-[#1D1A17] dark:hover:border-[#C48F5A]/60"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6DFD3] pb-2.5 dark:border-[#2E2924]">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded border border-[#1B4D3E]/30 bg-[#1B4D3E]/10 px-2 py-0.5 font-bold tabular-nums text-[#1B4D3E] dark:border-[#4BA388]/30 dark:bg-[#4BA388]/15 dark:text-[#4BA388]">
                    دليل {toArabicIndicDigits(ev.number)} في العنصر
                  </span>
                  <span className="font-semibold text-[#8B5E34] dark:text-[#C48F5A]">
                    {getEvidenceTypeLabel(ev.type)}
                  </span>
                  <span className="text-[#5E584F] dark:text-[#A8A095]">• {ev.reference}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateToTopic(ev.lectureId, ev.topicId)}
                  className="inline-flex items-center gap-1 rounded border border-[#E6DFD3] bg-[#FAF7F2] px-2.5 py-1 text-xs font-semibold text-[#1B4D3E] hover:border-[#1B4D3E] dark:border-[#2E2924] dark:bg-[#141210] dark:text-[#4BA388] dark:hover:border-[#4BA388]"
                >
                  <span>الانتقال للموضع</span>
                  <ArrowUpLeft className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-2.5 text-xs font-semibold text-[#5E584F] dark:text-[#A8A095]">
                {ev.lectureTitle} — {ev.topicTitle}
                {ev.subElementTitle ? ` (${ev.subElementTitle})` : ''}
              </div>

              <p className="mt-2 font-matn text-lg leading-[1.95] text-[#1F1D1A] dark:text-[#EFECE6]">
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
                <p className="mt-2 text-xs leading-relaxed text-[#5E584F] sm:text-sm dark:text-[#A8A095]">
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
          ))}
        </div>
      )}
    </div>
  );
}
