import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpLeft, Search, X } from 'lucide-react';
import type { Lecture, SearchResult } from '../types/book';
import { searchLectures, toArabicIndicDigits } from '../utils/studyHelpers';
import { RichArabicText } from './RichArabicText';

interface SearchModalProps {
  open: boolean;
  lectures: Lecture[];
  onClose: () => void;
  onSelectResult: (lectureId: string, topicId: string) => void;
}

function getMatchLabel(type: SearchResult['matchType']) {
  switch (type) {
    case 'matn':
      return 'المتن';
    case 'sharh':
      return 'الشرح';
    case 'evidence':
      return 'الدليل';
    case 'qa':
      return 'سؤال وجواب';
  }
}

export function SearchModal({
  open,
  lectures,
  onClose,
  onSelectResult,
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | SearchResult['matchType']>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const rawResults = useMemo(() => searchLectures(lectures, query), [lectures, query]);

  const filteredResults = useMemo(() => {
    if (typeFilter === 'all') return rawResults;
    return rawResults.filter((r) => r.matchType === typeFilter);
  }, [rawResults, typeFilter]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-14 sm:pt-20"
      role="dialog"
      aria-modal="true"
      aria-label="البحث الشامل في المتن والشرح"
      data-testid="search-modal"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[78vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[#E6DFD3] bg-[#FFFFFF] shadow-2xl dark:border-[#2E2924] dark:bg-[#1D1A17]">
        {/* Search Input Header */}
        <div className="flex items-center gap-3 border-b border-[#E6DFD3] px-4 py-3 dark:border-[#2E2924]">
          <Search
            className="h-5 w-5 shrink-0 text-[#1B4D3E] dark:text-[#4BA388]"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            data-testid="search-modal-input"
            placeholder="ابحث في المتن أو الشرح أو الأدلة أو الأسئلة (بدون تشكيل)..."
            className="flex-1 bg-transparent text-sm text-[#1F1D1A] placeholder:text-[#5E584F]/75 focus:outline-none sm:text-base dark:text-[#EFECE6] dark:placeholder:text-[#A8A095]/65"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق نافذة البحث"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E6DFD3] text-[#5E584F] hover:text-[#1F1D1A] dark:border-[#2E2924] dark:text-[#A8A095] dark:hover:text-[#EFECE6]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6DFD3] bg-[#FAF7F2] px-4 py-2 dark:border-[#2E2924] dark:bg-[#141210]">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: 'الكل' },
                { id: 'matn', label: 'المتن' },
                { id: 'sharh', label: 'الشرح' },
                { id: 'evidence', label: 'الأدلة' },
                { id: 'qa', label: 'الأسئلة' },
              ] as const
            ).map((btn) => {
              const active = typeFilter === btn.id;
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setTypeFilter(btn.id)}
                  className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-[#1B4D3E] text-[#FFFFFF] dark:bg-[#4BA388] dark:text-[#141210]'
                      : 'text-[#5E584F] hover:text-[#1F1D1A] dark:text-[#A8A095] dark:hover:text-[#EFECE6]'
                  }`}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>

          {query.trim().length >= 2 && (
            <span className="text-xs font-medium tabular-nums text-[#5E584F] dark:text-[#A8A095]">
              {toArabicIndicDigits(filteredResults.length)} نتيجة
            </span>
          )}
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {query.trim().length < 2 ? (
            <div className="py-10 text-center text-sm text-[#5E584F] dark:text-[#A8A095]">
              اكتب كلمتين أو حرفين فأكثر للبحث الفوري عبر المحاضرات الست (١٢ – ١٧).
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {['التأويل الباطل', 'الطائفة المنصورة', 'الكسب', 'المرجئة', 'السماع'].map(
                  (sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => setQuery(sample)}
                      className="rounded border border-[#D4C49A] bg-[#F5EFE0] px-2.5 py-1 text-xs font-medium text-[#8B5E34] hover:bg-[#EDE4CC] dark:border-[#443828] dark:bg-[#1E1A15] dark:text-[#C48F5A]"
                    >
                      {sample}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#5E584F] dark:text-[#A8A095]">
              لم يُعثر على نتائج مطابقة لعبارة «{query}».
            </div>
          ) : (
            <ul className="space-y-2.5">
              {filteredResults.map((res, idx) => (
                <li key={`${res.lectureId}-${res.topicId}-${res.matchType}-${idx}`}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectResult(res.lectureId, res.topicId);
                      onClose();
                    }}
                    className="w-full rounded-lg border border-[#E6DFD3] bg-[#FAF7F2]/60 p-3.5 text-right transition-colors hover:border-[#1B4D3E] hover:bg-[#FFFFFF] dark:border-[#2E2924] dark:bg-[#141210]/60 dark:hover:border-[#4BA388] dark:hover:bg-[#1D1A17]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-[#8B5E34] dark:text-[#C48F5A]">
                        {res.lectureTitle}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded border border-[#1B4D3E]/30 bg-[#1B4D3E]/10 px-2 py-0.5 font-semibold text-[#1B4D3E] dark:border-[#4BA388]/30 dark:bg-[#4BA388]/15 dark:text-[#4BA388]">
                        {getMatchLabel(res.matchType)}
                        <ArrowUpLeft className="h-3 w-3" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-bold text-[#1F1D1A] dark:text-[#EFECE6]">
                      <RichArabicText text={res.topicTitle} variant="plainWithQuran" />
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[#5E584F] dark:text-[#A8A095]">
                      <RichArabicText text={res.snippet} variant="plainWithQuran" />
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
