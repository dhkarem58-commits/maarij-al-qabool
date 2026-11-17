import { CheckCircle2, Layers, Moon, Palette, PanelRightOpen, Sun, Type } from 'lucide-react';
import type { DisplayMode, SharhDetailLevel } from '../types/book';
import { toArabicIndicDigits } from '../utils/studyHelpers';

interface WorkspaceToolbarProps {
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  detailLevel: SharhDetailLevel;
  onDetailLevelChange: (level: SharhDetailLevel) => void;
  colorCodingEnabled: boolean;
  onToggleColorCoding: () => void;
  fontScale: number;
  onFontScaleChange: (scale: number) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenCorrections: () => void;
  showTocToggle?: boolean;
  showReaderControls?: boolean;
  onOpenMobileToc?: () => void;
}

const MODE_OPTIONS: { id: DisplayMode; label: string }[] = [
  { id: 'both', label: 'المتن والشرح' },
  { id: 'matn', label: 'المتن فقط' },
  { id: 'sharh', label: 'الشرح فقط' },
];

const DETAIL_OPTIONS: { id: SharhDetailLevel; label: string }[] = [
  { id: 'full', label: 'الشرح الكامل' },
  { id: 'digest', label: 'المختصر المركز' },
];

export function WorkspaceToolbar({
  displayMode,
  onDisplayModeChange,
  detailLevel,
  onDetailLevelChange,
  colorCodingEnabled,
  onToggleColorCoding,
  fontScale,
  onFontScaleChange,
  darkMode,
  onToggleDarkMode,
  onOpenCorrections,
  showTocToggle = false,
  showReaderControls = true,
  onOpenMobileToc,
}: WorkspaceToolbarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5 rounded-lg border border-[#E6DFD3] bg-[#FFFFFF] p-3 shadow-xs dark:border-[#2E2924] dark:bg-[#1D1A17]">
      {/* Start Group: TOC Toggle + DisplayMode + DetailLevel */}
      <div className="flex flex-wrap items-center gap-2">
        {showTocToggle && onOpenMobileToc && (
          <button
            type="button"
            onClick={onOpenMobileToc}
            className="flex items-center gap-1.5 rounded-md border border-[#E6DFD3] bg-[#FAF7F2] px-3 py-1.5 text-xs font-medium text-[#1F1D1A] hover:border-[#8B5E34] sm:text-sm lg:hidden dark:border-[#2E2924] dark:bg-[#141210] dark:text-[#EFECE6]"
          >
            <PanelRightOpen className="h-4 w-4" aria-hidden="true" />
            <span>فهرس المحاضرات</span>
          </button>
        )}

        {showReaderControls && (
          <>
            <div
              role="group"
              aria-label="وضع عرض المتن والشرح"
              className="inline-flex rounded-md border border-[#E6DFD3] bg-[#FAF7F2] p-0.5 dark:border-[#2E2924] dark:bg-[#141210]"
            >
              {MODE_OPTIONS.map((opt) => {
                const active = displayMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    data-testid={`mode-${opt.id}`}
                    aria-pressed={active}
                    onClick={() => onDisplayModeChange(opt.id)}
                    className={`whitespace-nowrap rounded px-2.5 py-1.5 text-xs font-semibold sm:px-3 sm:text-sm ${
                      active
                        ? 'bg-[#1B4D3E] text-[#FFFFFF] dark:bg-[#4BA388] dark:text-[#141210]'
                        : 'text-[#5E584F] hover:text-[#1F1D1A] dark:text-[#A8A095] dark:hover:text-[#EFECE6]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {displayMode !== 'matn' && (
              <div
                role="group"
                aria-label="مستوى تفصيل الشرح"
                className="inline-flex items-center rounded-md border border-[#D4C49A] bg-[#F5EFE0]/70 p-0.5 dark:border-[#443828] dark:bg-[#1E1A15]"
              >
                <Layers
                  className="mx-1.5 hidden h-3.5 w-3.5 text-[#8B5E34] sm:inline-block dark:text-[#C48F5A]"
                  aria-hidden="true"
                />
                {DETAIL_OPTIONS.map((opt) => {
                  const active = detailLevel === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      data-testid={`detail-${opt.id}`}
                      aria-pressed={active}
                      onClick={() => onDetailLevelChange(opt.id)}
                      className={`whitespace-nowrap rounded px-2.5 py-1.5 text-xs font-semibold sm:text-sm ${
                        active
                          ? 'bg-[#8B5E34] text-[#FFFFFF] dark:bg-[#C48F5A] dark:text-[#141210]'
                          : 'text-[#5E584F] hover:text-[#1F1D1A] dark:text-[#A8A095] dark:hover:text-[#EFECE6]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* End Group: Color-Coding + Font Controls + Corrections + Theme */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          data-testid="toggle-color-coding"
          aria-pressed={colorCodingEnabled}
          onClick={onToggleColorCoding}
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1.5 text-xs font-semibold sm:text-sm ${
            colorCodingEnabled
              ? 'border-[#1B4D3E]/40 bg-[#1B4D3E]/10 text-[#1B4D3E] dark:border-[#4BA388]/40 dark:bg-[#4BA388]/15 dark:text-[#4BA388]'
              : 'border-[#E6DFD3] bg-[#FAF7F2] text-[#5E584F] dark:border-[#2E2924] dark:bg-[#141210] dark:text-[#A8A095]'
          }`}
        >
          <Palette className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>ألوان الأنماط</span>
        </button>

        {/* Font Scale Stepper */}
        <div
          aria-label="حجم الخط"
          className="inline-flex items-center gap-1 rounded-md border border-[#E6DFD3] bg-[#FAF7F2] px-2 py-1 dark:border-[#2E2924] dark:bg-[#141210]"
        >
          <Type className="h-3.5 w-3.5 text-[#5E584F] dark:text-[#A8A095]" aria-hidden="true" />
          <button
            type="button"
            onClick={() => onFontScaleChange(Math.max(85, fontScale - 10))}
            disabled={fontScale <= 85}
            aria-label="تصغير الخط"
            className="flex h-6 w-6 items-center justify-center rounded text-sm font-bold text-[#1F1D1A] hover:bg-[#E6DFD3]/60 disabled:opacity-40 dark:text-[#EFECE6] dark:hover:bg-[#2E2924]"
          >
            -
          </button>
          <span className="min-w-[5ch] px-1 text-center text-xs font-medium tabular-nums text-[#5E584F] dark:text-[#A8A095]">
            {toArabicIndicDigits(fontScale)}٪
          </span>
          <button
            type="button"
            onClick={() => onFontScaleChange(Math.min(135, fontScale + 10))}
            disabled={fontScale >= 135}
            aria-label="تكبير الخط"
            className="flex h-6 w-6 items-center justify-center rounded text-sm font-bold text-[#1F1D1A] hover:bg-[#E6DFD3]/60 disabled:opacity-40 dark:text-[#EFECE6] dark:hover:bg-[#2E2924]"
          >
            +
          </button>
        </div>

        {/* Corrections Audit Modal Button */}
        <button
          type="button"
          onClick={onOpenCorrections}
          data-testid="open-corrections-btn"
          className="flex items-center gap-1.5 whitespace-nowrap rounded-md border border-[#D4C49A] bg-[#F5EFE0] px-2.5 py-1.5 text-xs font-semibold text-[#8B5E34] hover:bg-[#EDE4CC] sm:text-sm dark:border-[#443828] dark:bg-[#1E1A15] dark:text-[#C48F5A] dark:hover:bg-[#2A241C]"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>تصويبات التحقيق</span>
        </button>

        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          data-testid="toggle-dark-mode"
          aria-label={darkMode ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
          className="flex h-8.5 w-8.5 items-center justify-center rounded-md border border-[#E6DFD3] bg-[#FAF7F2] text-[#1F1D1A] hover:border-[#8B5E34] dark:border-[#2E2924] dark:bg-[#141210] dark:text-[#EFECE6] dark:hover:border-[#C48F5A]"
        >
          {darkMode ? (
            <Sun className="h-4 w-4 text-[#C48F5A]" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4 text-[#5E584F]" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
