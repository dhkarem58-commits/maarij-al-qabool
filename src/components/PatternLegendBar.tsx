import { Palette, RotateCcw } from 'lucide-react';
import type { SharhPatternType } from '../types/book';
import { SHARH_PATTERNS } from '../utils/patternColorizer';

interface PatternLegendBarProps {
  spotlightPattern: SharhPatternType | null;
  onSelectPattern: (pattern: SharhPatternType | null) => void;
}

export function PatternLegendBar({
  spotlightPattern,
  onSelectPattern,
}: PatternLegendBarProps) {
  return (
    <section
      aria-label="دليل ألوان الأنماط العلمية للشارح والمتن"
      data-testid="pattern-legend-bar"
      className="mb-6 rounded-lg border border-[#E6DFD3] bg-[#FFFFFF] px-4 py-3 shadow-xs dark:border-[#2E2924] dark:bg-[#1D1A17]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6DFD3]/70 pb-2 dark:border-[#2E2924]/70">
        <div className="flex items-center gap-2 text-xs font-bold text-[#1B4D3E] dark:text-[#4BA388]">
          <Palette className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>دليل التمييز اللوني لأنماط الشارح والمتن (اضغط لتمييز نمط واحد)</span>
        </div>

        {spotlightPattern && (
          <button
            type="button"
            data-testid="reset-spotlight-btn"
            onClick={() => onSelectPattern(null)}
            className="inline-flex items-center gap-1 rounded border border-[#D4C49A] bg-[#F5EFE0] px-2 py-0.5 text-xs font-semibold text-[#8B5E34] hover:bg-[#EDE4CC] dark:border-[#443828] dark:bg-[#1E1A15] dark:text-[#C48F5A]"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            <span>إظهار الكل</span>
          </button>
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {SHARH_PATTERNS.map((pat) => {
          const isActive = spotlightPattern === pat.id;
          return (
            <button
              key={pat.id}
              type="button"
              data-testid={`pattern-btn-${pat.id}`}
              aria-pressed={isActive}
              title={pat.description}
              onClick={() => onSelectPattern(isActive ? null : pat.id)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${
                isActive
                  ? 'border-[#1B4D3E] bg-[#1B4D3E]/10 text-[#1B4D3E] dark:border-[#4BA388] dark:bg-[#4BA388]/15 dark:text-[#4BA388]'
                  : 'border-[#E6DFD3] bg-[#FAF7F2] text-[#1F1D1A] hover:border-[#8B5E34] dark:border-[#2E2924] dark:bg-[#141210] dark:text-[#EFECE6]'
              }`}
            >
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${pat.swatchClass}`}
                aria-hidden="true"
              />
              <span>{pat.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
