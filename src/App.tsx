/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BookmarksView } from './components/BookmarksView';
import { ComparisonTablesView } from './components/ComparisonTablesView';
import { CorrectionsModal } from './components/CorrectionsModal';
import { EvidencesIndexView } from './components/EvidencesIndexView';
import { Header } from './components/Header';
import { MindMapTreesView } from './components/MindMapTreesView';
import { PatternLegendBar } from './components/PatternLegendBar';
import { QaSection } from './components/QaSection';
import { QuestionBankView } from './components/QuestionBankView';
import { RichArabicText } from './components/RichArabicText';
import { SearchModal } from './components/SearchModal';
import { SidebarToc } from './components/SidebarToc';
import { TopicCard } from './components/TopicCard';
import { WorkspaceToolbar } from './components/WorkspaceToolbar';
import { LECTURES } from './data';
import type {
  ActiveTab,
  DisplayMode,
  SharhDetailLevel,
  SharhPatternType,
} from './types/book';
import { countTopicEvidences, toArabicIndicDigits } from './utils/studyHelpers';

const STORAGE_KEYS = {
  bookmarks: 'maarij_bookmarks_v1',
  darkMode: 'maarij_dark_mode_v1',
  displayMode: 'maarij_display_mode_v1',
  detailLevel: 'maarij_detail_level_v1',
  colorCoding: 'maarij_color_coding_v1',
  fontScale: 'maarij_font_scale_v1',
  activeLecture: 'maarij_active_lecture_v1',
};

function readStoredString(key: string, fallback: string): string {
  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function readStoredBookmarks(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.bookmarks);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('reader');
  const [activeLectureId, setActiveLectureId] = useState<string>(() => {
    const saved = readStoredString(STORAGE_KEYS.activeLecture, LECTURES[0].id);
    return LECTURES.some((l) => l.id === saved) ? saved : LECTURES[0].id;
  });
  const [activeTopicId, setActiveTopicId] = useState<string | undefined>(undefined);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    const saved = readStoredString(STORAGE_KEYS.displayMode, 'both');
    return saved === 'matn' || saved === 'sharh' || saved === 'both' ? saved : 'both';
  });
  const [detailLevel, setDetailLevel] = useState<SharhDetailLevel>(() => {
    const saved = readStoredString(STORAGE_KEYS.detailLevel, 'full');
    return saved === 'digest' ? 'digest' : 'full';
  });
  const [colorCodingEnabled, setColorCodingEnabled] = useState<boolean>(() => {
    const saved = readStoredString(STORAGE_KEYS.colorCoding, 'true');
    return saved !== 'false';
  });
  const [spotlightPattern, setSpotlightPattern] = useState<SharhPatternType | null>(
    null
  );
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const [fontScale, setFontScale] = useState<number>(() => {
    const raw = Number(readStoredString(STORAGE_KEYS.fontScale, '100'));
    return Number.isFinite(raw) && raw >= 85 && raw <= 135 ? raw : 100;
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return readStoredString(STORAGE_KEYS.darkMode, 'false') === 'true';
  });
  const [bookmarkedTopicIds, setBookmarkedTopicIds] = useState<string[]>(readStoredBookmarks);
  const [searchOpen, setSearchOpen] = useState(false);
  const [correctionsOpen, setCorrectionsOpen] = useState(false);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem(STORAGE_KEYS.darkMode, String(darkMode));
    } catch {
      // ignore storage failures
    }
  }, [darkMode]);

  // Persist user preferences
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.displayMode, displayMode);
      window.localStorage.setItem(STORAGE_KEYS.detailLevel, detailLevel);
      window.localStorage.setItem(
        STORAGE_KEYS.colorCoding,
        String(colorCodingEnabled)
      );
      window.localStorage.setItem(STORAGE_KEYS.fontScale, String(fontScale));
      window.localStorage.setItem(STORAGE_KEYS.activeLecture, activeLectureId);
    } catch {
      // ignore
    }
  }, [displayMode, detailLevel, colorCodingEnabled, fontScale, activeLectureId]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.bookmarks,
        JSON.stringify(bookmarkedTopicIds)
      );
    } catch {
      // ignore
    }
  }, [bookmarkedTopicIds]);

  // Global keyboard shortcut Cmd/Ctrl + K for Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentLectureIndex = useMemo(
    () => Math.max(0, LECTURES.findIndex((l) => l.id === activeLectureId)),
    [activeLectureId]
  );
  const currentLecture = LECTURES[currentLectureIndex] || LECTURES[0];
  const prevLecture = currentLectureIndex > 0 ? LECTURES[currentLectureIndex - 1] : null;
  const nextLecture =
    currentLectureIndex < LECTURES.length - 1 ? LECTURES[currentLectureIndex + 1] : null;

  const toggleBookmark = (topicId: string) => {
    setBookmarkedTopicIds((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const handleSelectLecture = (lectureId: string) => {
    setActiveLectureId(lectureId);
    setActiveTopicId(undefined);
    setActiveTab('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToTopic = (lectureId: string, topicId: string) => {
    setActiveLectureId(lectureId);
    setActiveTopicId(topicId);
    setActiveTab('reader');
    setTimeout(() => {
      const target = document.getElementById(topicId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  const handleOpenTree = (treeId: string) => {
    setSelectedTreeId(treeId);
    setActiveTab('trees');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showPatternLegend =
    colorCodingEnabled &&
    (activeTab === 'reader' || activeTab === 'qbank' || activeTab === 'trees');

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#FAF7F2] text-[#1F1D1A] dark:bg-[#141210] dark:text-[#EFECE6]"
    >
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSearch={() => setSearchOpen(true)}
        bookmarksCount={bookmarkedTopicIds.length}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <WorkspaceToolbar
          displayMode={displayMode}
          onDisplayModeChange={setDisplayMode}
          detailLevel={detailLevel}
          onDetailLevelChange={setDetailLevel}
          colorCodingEnabled={colorCodingEnabled}
          onToggleColorCoding={() => {
            setColorCodingEnabled((prev) => !prev);
            setSpotlightPattern(null);
          }}
          fontScale={fontScale}
          onFontScaleChange={setFontScale}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((d) => !d)}
          onOpenCorrections={() => setCorrectionsOpen(true)}
          showTocToggle={activeTab === 'reader'}
          showReaderControls={activeTab === 'reader'}
          onOpenMobileToc={() => setMobileTocOpen(true)}
        />

        {showPatternLegend && (
          <PatternLegendBar
            spotlightPattern={spotlightPattern}
            onSelectPattern={setSpotlightPattern}
          />
        )}

        {activeTab === 'reader' && (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <SidebarToc
              lectures={LECTURES}
              activeLectureId={currentLecture.id}
              activeTopicId={activeTopicId}
              onSelectLecture={handleSelectLecture}
              onSelectTopic={handleNavigateToTopic}
              mobileOpen={mobileTocOpen}
              onCloseMobile={() => setMobileTocOpen(false)}
            />

            <div className="min-w-0 flex-1 space-y-6">
              {/* Lecture Hero Header */}
              <section
                aria-label="رأس المحاضرة"
                className="rounded-xl border border-[#E6DFD3] bg-[#FFFFFF] p-5 shadow-xs sm:p-7 dark:border-[#2E2924] dark:bg-[#1D1A17]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#8B5E34] dark:text-[#C48F5A]">
                  <span>{currentLecture.arabicOrdinal}</span>
                  <span className="tabular-nums">
                    {currentLecture.pageRange} •{' '}
                    {toArabicIndicDigits(currentLecture.topics.length)} عناصر •{' '}
                    {toArabicIndicDigits(countTopicEvidences(currentLecture))} دليلاً
                  </span>
                </div>

                <h1 className="mt-2 font-heading text-3xl font-bold leading-snug text-[#1B4D3E] sm:text-4xl dark:text-[#4BA388]">
                  {currentLecture.title}
                </h1>

                <p className="mt-2 text-sm leading-relaxed text-[#5E584F] sm:text-base dark:text-[#A8A095]">
                  {currentLecture.subtitle}
                </p>

                {currentLecture.openingInvocation && (
                  <div className="mt-4 rounded-lg border border-[#D4C49A]/80 bg-[#F5EFE0]/60 px-4 py-3 font-matn text-base leading-relaxed text-[#1F1D1A] dark:border-[#443828] dark:bg-[#1E1A15]/70 dark:text-[#EFECE6]">
                    <RichArabicText
                      text={currentLecture.openingInvocation}
                      variant="plainWithQuran"
                      colorCodingEnabled={colorCodingEnabled}
                    />
                  </div>
                )}
              </section>

              {/* Topics List */}
              {currentLecture.topics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  displayMode={displayMode}
                  detailLevel={detailLevel}
                  colorCodingEnabled={colorCodingEnabled}
                  spotlightPattern={spotlightPattern}
                  fontScale={fontScale}
                  isBookmarked={bookmarkedTopicIds.includes(topic.id)}
                  onToggleBookmark={toggleBookmark}
                  onOpenTree={handleOpenTree}
                />
              ))}

              {/* Q&A Section (Hidden when viewing Matn Only) */}
              {displayMode !== 'matn' &&
                currentLecture.qaItems &&
                currentLecture.qaItems.length > 0 && (
                  <QaSection
                    lectureId={currentLecture.id}
                    title={currentLecture.qaSectionTitle}
                    items={currentLecture.qaItems}
                    fontScale={fontScale}
                    colorCodingEnabled={colorCodingEnabled}
                    spotlightPattern={spotlightPattern}
                  />
                )}

              {currentLecture.closingNote && (
                <div className="rounded-lg border border-[#E6DFD3] bg-[#FFFFFF] px-5 py-3.5 text-center text-sm font-medium text-[#5E584F] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#A8A095]">
                  {currentLecture.closingNote}
                </div>
              )}

              {/* Prev / Next Lecture Navigation */}
              <nav
                aria-label="التنقل بين المحاضرات"
                className="flex flex-wrap items-center justify-between gap-3 pt-2"
              >
                {prevLecture ? (
                  <button
                    type="button"
                    onClick={() => handleSelectLecture(prevLecture.id)}
                    className="flex items-center gap-2 rounded-lg border border-[#E6DFD3] bg-[#FFFFFF] px-4 py-3 text-right hover:border-[#1B4D3E] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:hover:border-[#4BA388]"
                  >
                    <ChevronRight className="h-4 w-4 text-[#1B4D3E] dark:text-[#4BA388]" aria-hidden="true" />
                    <div>
                      <div className="text-xs text-[#5E584F] dark:text-[#A8A095]">
                        المحاضرة السابقة
                      </div>
                      <div className="text-sm font-bold text-[#1F1D1A] dark:text-[#EFECE6]">
                        {prevLecture.arabicOrdinal}
                      </div>
                    </div>
                  </button>
                ) : (
                  <div />
                )}

                {nextLecture && (
                  <button
                    type="button"
                    onClick={() => handleSelectLecture(nextLecture.id)}
                    className="flex items-center gap-2 rounded-lg border border-[#E6DFD3] bg-[#FFFFFF] px-4 py-3 text-left hover:border-[#1B4D3E] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:hover:border-[#4BA388]"
                  >
                    <div>
                      <div className="text-xs text-[#5E584F] dark:text-[#A8A095]">
                        المحاضرة التالية
                      </div>
                      <div className="text-sm font-bold text-[#1F1D1A] dark:text-[#EFECE6]">
                        {nextLecture.arabicOrdinal}
                      </div>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-[#1B4D3E] dark:text-[#4BA388]" aria-hidden="true" />
                  </button>
                )}
              </nav>
            </div>
          </div>
        )}

        {activeTab === 'trees' && (
          <MindMapTreesView
            key={selectedTreeId || 'default-tree'}
            onNavigateToTopic={handleNavigateToTopic}
            colorCodingEnabled={colorCodingEnabled}
            initialTreeId={selectedTreeId}
          />
        )}

        {activeTab === 'qbank' && (
          <QuestionBankView
            colorCodingEnabled={colorCodingEnabled}
            onNavigateToTopic={handleNavigateToTopic}
            onOpenTree={handleOpenTree}
          />
        )}

        {activeTab === 'evidences' && (
          <EvidencesIndexView
            lectures={LECTURES}
            colorCodingEnabled={colorCodingEnabled}
            onNavigateToTopic={handleNavigateToTopic}
          />
        )}

        {activeTab === 'comparisons' && (
          <ComparisonTablesView colorCodingEnabled={colorCodingEnabled} />
        )}

        {activeTab === 'bookmarks' && (
          <BookmarksView
            lectures={LECTURES}
            bookmarkedTopicIds={bookmarkedTopicIds}
            onToggleBookmark={toggleBookmark}
            onNavigateToTopic={handleNavigateToTopic}
          />
        )}
      </main>

      <SearchModal
        open={searchOpen}
        lectures={LECTURES}
        onClose={() => setSearchOpen(false)}
        onSelectResult={handleNavigateToTopic}
      />

      <CorrectionsModal
        open={correctionsOpen}
        onClose={() => setCorrectionsOpen(false)}
      />
    </div>
  );
}
