import { ChevronDown, ChevronLeft, HelpCircle, X } from 'lucide-react';
import type { Lecture } from '../types/book';
import { countTopicEvidences, toArabicIndicDigits } from '../utils/studyHelpers';

interface SidebarTocProps {
  lectures: Lecture[];
  activeLectureId: string;
  activeTopicId?: string;
  onSelectLecture: (lectureId: string) => void;
  onSelectTopic: (lectureId: string, topicId: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function SidebarToc({
  lectures,
  activeLectureId,
  activeTopicId,
  onSelectLecture,
  onSelectTopic,
  mobileOpen,
  onCloseMobile,
}: SidebarTocProps) {
  const renderList = () => (
    <div className="space-y-2">
      <div className="mb-3 flex items-center justify-between border-b border-[#E6DFD3] pb-2.5 dark:border-[#2E2924]">
        <h2 className="font-heading text-xl font-bold text-[#1F1D1A] dark:text-[#EFECE6]">
          فهرس المحاضرات (١٢ – ١٧)
        </h2>
        <span className="text-xs font-medium text-[#5E584F] dark:text-[#A8A095]">
          {toArabicIndicDigits(lectures.length)} محاضرات
        </span>
      </div>

      {lectures.map((lecture) => {
        const isCurrent = lecture.id === activeLectureId;
        const totalEvs = countTopicEvidences(lecture);

        return (
          <div
            key={lecture.id}
            className={`rounded-lg border ${
              isCurrent
                ? 'border-[#1B4D3E]/40 bg-[#FFFFFF] dark:border-[#4BA388]/40 dark:bg-[#1D1A17]'
                : 'border-[#E6DFD3] bg-[#FAF7F2] hover:bg-[#FFFFFF] dark:border-[#2E2924] dark:bg-[#1A1714] dark:hover:bg-[#1D1A17]'
            }`}
          >
            <button
              type="button"
              data-testid={`toc-lecture-${lecture.number}`}
              onClick={() => {
                onSelectLecture(lecture.id);
                if (!isCurrent) {
                  onCloseMobile();
                }
              }}
              className="flex w-full items-start justify-between gap-2 p-3 text-right focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4D3E]"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#8B5E34] dark:text-[#C48F5A]">
                  <span>{lecture.arabicOrdinal}</span>
                  <span>•</span>
                  <span className="tabular-nums">{lecture.pageRange}</span>
                </div>
                <div
                  className={`mt-1 text-sm font-bold leading-snug ${
                    isCurrent
                      ? 'text-[#1B4D3E] dark:text-[#4BA388]'
                      : 'text-[#1F1D1A] dark:text-[#EFECE6]'
                  }`}
                >
                  {lecture.title}
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-[#5E584F] dark:text-[#A8A095]">
                  <span>{toArabicIndicDigits(lecture.topics.length)} عناصر</span>
                  <span>•</span>
                  <span>{toArabicIndicDigits(totalEvs)} دليلاً</span>
                  {lecture.qaItems && lecture.qaItems.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{toArabicIndicDigits(lecture.qaItems.length)} أسئلة</span>
                    </>
                  )}
                </div>
              </div>
              {isCurrent ? (
                <ChevronDown
                  className="mt-1 h-4 w-4 shrink-0 text-[#1B4D3E] dark:text-[#4BA388]"
                  aria-hidden="true"
                />
              ) : (
                <ChevronLeft
                  className="mt-1 h-4 w-4 shrink-0 text-[#5E584F] dark:text-[#A8A095]"
                  aria-hidden="true"
                />
              )}
            </button>

            {isCurrent && (
              <div className="border-t border-[#E6DFD3] px-2.5 py-2 dark:border-[#2E2924]">
                <ul className="space-y-1">
                  {lecture.topics.map((topic) => {
                    const isTopicActive = activeTopicId === topic.id;
                    return (
                      <li key={topic.id}>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTopic(lecture.id, topic.id);
                            onCloseMobile();
                          }}
                          className={`flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-right text-xs transition-colors ${
                            isTopicActive
                              ? 'bg-[#1B4D3E]/10 font-bold text-[#1B4D3E] dark:bg-[#4BA388]/15 dark:text-[#4BA388]'
                              : 'text-[#5E584F] hover:bg-[#FAF7F2] hover:text-[#1F1D1A] dark:text-[#A8A095] dark:hover:bg-[#141210] dark:hover:text-[#EFECE6]'
                          }`}
                        >
                          <span className="mt-0.5 shrink-0 font-bold tabular-nums text-[#8B5E34] dark:text-[#C48F5A]">
                            {toArabicIndicDigits(topic.number)}.
                          </span>
                          <span className="leading-relaxed">{topic.title}</span>
                        </button>
                      </li>
                    );
                  })}

                  {lecture.qaItems && lecture.qaItems.length > 0 && (
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTopic(lecture.id, `${lecture.id}-qa`);
                          onCloseMobile();
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-right text-xs font-medium text-[#8B5E34] hover:bg-[#F5EFE0] dark:text-[#C48F5A] dark:hover:bg-[#1E1A15]"
                      >
                        <HelpCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>
                          الأسئلة والأجوبة ({toArabicIndicDigits(lecture.qaItems.length)})
                        </span>
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        aria-label="فهرس المحاضرات والعناصر"
        className="hidden w-72 shrink-0 lg:block xl:w-80"
      >
        <div className="sticky top-22 max-h-[calc(100vh-6.5rem)] overflow-y-auto pl-1">
          {renderList()}
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="فهرس المحاضرات"
        >
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 flex h-full w-80 max-w-[85vw] flex-col border-l border-[#E6DFD3] bg-[#FAF7F2] p-4 shadow-xl dark:border-[#2E2924] dark:bg-[#141210]">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8B5E34] dark:text-[#C48F5A]">
                التنقل السريع
              </span>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="إغلاق الفهرس"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E6DFD3] bg-[#FFFFFF] text-[#1F1D1A] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#EFECE6]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{renderList()}</div>
          </div>
        </div>
      )}
    </>
  );
}
