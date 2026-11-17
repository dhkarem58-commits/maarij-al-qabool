import { useState } from 'react';
import { BookOpen, Menu, Search, X } from 'lucide-react';
import type { ActiveTab } from '../types/book';
import { toArabicIndicDigits } from '../utils/studyHelpers';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenSearch: () => void;
  bookmarksCount: number;
}

const NAV_ITEMS: { id: ActiveTab; label: string }[] = [
  { id: 'reader', label: 'الشرح المفصل' },
  { id: 'trees', label: 'التشجير الشامل' },
  { id: 'qbank', label: 'بنك الأسئلة' },
  { id: 'evidences', label: 'فهرس الأدلة' },
  { id: 'comparisons', label: 'مقارنة الفرق' },
  { id: 'bookmarks', label: 'المحفوظات' },
];

export function Header({
  activeTab,
  onTabChange,
  onOpenSearch,
  bookmarksCount,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#E6DFD3] bg-[#FAF7F2]/95 backdrop-blur-sm dark:border-[#2E2924] dark:bg-[#141210]/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onTabChange('reader')}
            className="flex items-center gap-2.5 text-right focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4D3E]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#D4C49A] bg-[#F5EFE0] text-[#1B4D3E] dark:border-[#443828] dark:bg-[#1E1A15] dark:text-[#4BA388]">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="flex flex-col">
              <span className="font-heading text-2xl font-bold leading-tight text-[#1F1D1A] dark:text-[#EFECE6]">
                معارج القبول
              </span>
              <span className="hidden text-[11px] text-[#5E584F] xl:block dark:text-[#A8A095]">
                الشرح المحقق والتشجير وبنك الأسئلة (١٢ – ١٧)
              </span>
            </span>
          </button>
        </div>

        {/* Zone 2: Desktop Navigation */}
        <nav
          aria-label="التنقل الرئيسي"
          className="hidden items-center gap-4 lg:flex xl:gap-6"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-testid={`nav-${item.id}`}
                onClick={() => onTabChange(item.id)}
                className={`relative whitespace-nowrap py-5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4D3E] ${
                  isActive
                    ? 'font-bold text-[#1B4D3E] dark:text-[#4BA388]'
                    : 'text-[#5E584F] hover:text-[#1F1D1A] dark:text-[#A8A095] dark:hover:text-[#EFECE6]'
                }`}
              >
                <span>{item.label}</span>
                {item.id === 'bookmarks' && bookmarksCount > 0 && (
                  <span className="mr-1.5 inline-block rounded border border-[#D4C49A] bg-[#F5EFE0] px-1.5 py-0.5 text-xs font-semibold tabular-nums text-[#8B5E34] dark:border-[#443828] dark:bg-[#1E1A15] dark:text-[#C48F5A]">
                    {toArabicIndicDigits(bookmarksCount)}
                  </span>
                )}
                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#1B4D3E] dark:bg-[#4BA388]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Search Action + Mobile Drawer Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            data-testid="open-search-btn"
            className="flex items-center gap-2 whitespace-nowrap rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-3 py-2 text-sm font-medium text-[#1F1D1A] hover:border-[#8B5E34] hover:text-[#1B4D3E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4D3E] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#EFECE6] dark:hover:border-[#C48F5A] dark:hover:text-[#4BA388]"
            aria-label="بحث سريع في المتن والشرح والأدلة"
          >
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>بحث سريع</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            data-testid="mobile-menu-toggle"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E6DFD3] bg-[#FFFFFF] text-[#1F1D1A] lg:hidden dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#EFECE6]"
            aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="قائمة الجوال"
          className="border-t border-[#E6DFD3] bg-[#FAF7F2] px-4 py-3 lg:hidden dark:border-[#2E2924] dark:bg-[#141210]"
        >
          <div className="grid grid-cols-2 gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-testid={`mobile-nav-${item.id}`}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between rounded-md border px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? 'border-[#1B4D3E] bg-[#1B4D3E]/10 font-bold text-[#1B4D3E] dark:border-[#4BA388] dark:bg-[#4BA388]/15 dark:text-[#4BA388]'
                      : 'border-[#E6DFD3] bg-[#FFFFFF] text-[#5E584F] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#A8A095]'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.id === 'bookmarks' && bookmarksCount > 0 && (
                    <span className="tabular-nums text-xs font-bold">
                      ({toArabicIndicDigits(bookmarksCount)})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
