import { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { SPELLING_CORRECTIONS } from '../data';
import { toArabicIndicDigits } from '../utils/studyHelpers';
import { RichArabicText } from './RichArabicText';

interface CorrectionsModalProps {
  open: boolean;
  onClose: () => void;
}

export function CorrectionsModal({ open, onClose }: CorrectionsModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="سجل التصويبات الإملائية والتحقيق"
      data-testid="corrections-modal"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[82vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[#E6DFD3] bg-[#FFFFFF] shadow-2xl dark:border-[#2E2924] dark:bg-[#1D1A17]">
        <div className="flex items-center justify-between border-b border-[#E6DFD3] px-5 py-4 dark:border-[#2E2924]">
          <div className="flex items-center gap-2.5">
            <CheckCircle2
              className="h-5 w-5 text-[#1B4D3E] dark:text-[#4BA388]"
              aria-hidden="true"
            />
            <div>
              <h2 className="font-heading text-2xl font-bold text-[#1F1D1A] dark:text-[#EFECE6]">
                سجل التصويبات الإملائية والتحقيق اللغوي
              </h2>
              <p className="text-xs text-[#5E584F] dark:text-[#A8A095]">
                أبرز الأخطاء الطباعية والإملائية وأرقام الآيات المصححة في التفريغ دون أي اختصار للشرح.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق نافذة التصويبات"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E6DFD3] text-[#5E584F] hover:text-[#1F1D1A] dark:border-[#2E2924] dark:text-[#A8A095] dark:hover:text-[#EFECE6]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {SPELLING_CORRECTIONS.map((cor, index) => (
            <div
              key={cor.id}
              className="rounded-lg border border-[#E6DFD3] bg-[#FAF7F2] p-4 dark:border-[#2E2924] dark:bg-[#141210]"
            >
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#8B5E34] dark:text-[#C48F5A]">
                <span>{cor.location}</span>
                <span className="tabular-nums">#{toArabicIndicDigits(index + 1)}</span>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <div className="rounded border border-red-300/60 bg-red-50/60 p-2.5 text-sm text-[#1F1D1A] dark:border-red-900/40 dark:bg-red-950/20 dark:text-[#EFECE6]">
                  <span className="mb-1 block text-xs font-bold text-red-700 dark:text-red-400">
                    الخطأ في الأصل / التفريغ:
                  </span>
                  <span>{cor.original}</span>
                </div>
                <div className="rounded border border-[#1B4D3E]/30 bg-[#1B4D3E]/10 p-2.5 text-sm text-[#1F1D1A] dark:border-[#4BA388]/30 dark:bg-[#4BA388]/15 dark:text-[#EFECE6]">
                  <span className="mb-1 block text-xs font-bold text-[#1B4D3E] dark:text-[#4BA388]">
                    التصويب المعتمد:
                  </span>
                  <span className="font-matn text-base">
                    <RichArabicText text={cor.corrected} variant="plainWithQuran" />
                  </span>
                </div>
              </div>

              <p className="mt-2.5 text-xs leading-relaxed text-[#5E584F] dark:text-[#A8A095]">
                <RichArabicText text={cor.note} variant="plainWithQuran" />
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
