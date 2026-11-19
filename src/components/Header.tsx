import { useState } from 'react';
import { BookOpen, Menu, Search, User as UserIcon, X } from 'lucide-react';
import type { ActiveTab } from '../types/book';
import type { EditionViewMode } from '../types/edition';
import { toArabicIndicDigits } from '../utils/studyHelpers';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenSearch: () => void;
  onOpenAccount: () => void;
  bookmarksCount: number;
  viewMode: EditionViewMode;
  authorDisplayName: string;
  isSignedIn: boolean;
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
  onOpenAccount,
  bookmarksCount,
  viewMode,
  authorDisplayName,
  isSignedIn,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const accountButtonLabel =
    viewMode.kind === 'shared'
      ? `نسخة: ${viewMode.displayName}`
      : viewMode.kind === 'mine'
        ? `نسختي: ${authorDisplayName}`
        : isSignedIn
          ? authorDisplayName
          : 'حسابي والنسخ';

  return (
    <header className="sticky top-0 z-40 border-b border-[#E6DFD3] bg-[#FAF7F2]/95 backdrop-blur-sm dark:border-[#2E2924] dark:bg-[#141210]/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => onTabChange('reader')}
            className="flex min-w-0 items-center gap-2 text-right focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4D3E] sm:gap-2.5"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#D4C49A] bg-[#F5EFE0] text-[#1B4D3E] sm:h-9 sm:w-9 dark:border-[#443828] dark:bg-[#1E1A15] dark:text-[#4BA388]">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-heading text-xl font-bold leading-tight text-[#1F1D1A] sm:text-2xl dark:text-[#EFECE6]">
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
          className="hidden items-center gap-3 lg:flex xl:gap-5"
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

        {/* Zone 3: PWA Install + Account + Search + Mobile Drawer */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="hidden sm:block">
            <PWAInstallButton />
          </div>

          <button
            type="button"
            onClick={onOpenAccount}
            data-testid="open-account-btn"
            className="flex max-w-[112px] items-center gap-1.5 truncate whitespace-nowrap rounded-md border border-[#D4C49A] bg-[#F5EFE0] px-2 py-1.5 text-xs font-bold text-[#8B5E34] hover:bg-[#EDE4CC] sm:max-w-[180px] sm:px-2.5 sm:py-2 sm:text-sm dark:border-[#443828] dark:bg-[#1E1A15] dark:text-[#C48F5A]"
            aria-label="حسابي وتبديل النسخ"
          >
            <UserIcon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
            <span className="truncate">{accountButtonLabel}</span>
          </button>

          <button
            type="button"
            onClick={onOpenSearch}
            data-testid="open-search-btn"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-2.5 py-2 text-xs font-medium text-[#1F1D1A] hover:border-[#8B5E34] hover:text-[#1B4D3E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4D3E] sm:px-3 sm:text-sm dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#EFECE6] dark:hover:border-[#C48F5A] dark:hover:text-[#4BA388]"
            aria-label="بحث سريع في المتن والشرح والأدلة"
          >
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">بحث سريع</span>
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
          <div className="mt-2.5 flex justify-end border-t border-[#E6DFD3] pt-2.5 sm:hidden dark:border-[#2E2924]">
            <PWAInstallButton />
          </div>
        </nav>
      )}
    </header>
  );
}
