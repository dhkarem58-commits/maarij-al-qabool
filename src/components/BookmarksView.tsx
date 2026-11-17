import { ArrowUpLeft, Bookmark, Trash2 } from 'lucide-react';
import type { Lecture } from '../types/book';
import { toArabicIndicDigits } from '../utils/studyHelpers';
import { RichArabicText } from './RichArabicText';

interface BookmarksViewProps {
  lectures: Lecture[];
  bookmarkedTopicIds: string[];
  onToggleBookmark: (topicId: string) => void;
  onNavigateToTopic: (lectureId: string, topicId: string) => void;
}

export function BookmarksView({
  lectures,
  bookmarkedTopicIds,
  onToggleBookmark,
  onNavigateToTopic,
}: BookmarksViewProps) {
  const savedItems = lectures.flatMap((lecture) =>
    lecture.topics
      .filter((topic) => bookmarkedTopicIds.includes(topic.id))
      .map((topic) => ({ lecture, topic }))
  );

  return (
    <div className="space-y-6" data-testid="bookmarks-view">
      <div className="rounded-xl border border-[#E6DFD3] bg-[#FFFFFF] p-5 shadow-xs sm:p-6 dark:border-[#2E2924] dark:bg-[#1D1A17]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl font-bold text-[#1F1D1A] sm:text-3xl dark:text-[#EFECE6]">
              العناصر والمواضع المحفوظة
            </h2>
            <p className="mt-1 text-sm text-[#5E584F] dark:text-[#A8A095]">
              تحفظ تلقائياً في متصفحك للرجوع السريع إليها أثناء المذاكرة والمراجعة.
            </p>
          </div>
          <span className="rounded-md border border-[#D4C49A] bg-[#F5EFE0] px-3 py-1.5 text-sm font-bold tabular-nums text-[#8B5E34] dark:border-[#443828] dark:bg-[#1E1A15] dark:text-[#C48F5A]">
            {toArabicIndicDigits(savedItems.length)} محفوظات
          </span>
        </div>
      </div>

      {savedItems.length === 0 ? (
        <div className="rounded-xl border border-[#E6DFD3] bg-[#FFFFFF] p-10 text-center dark:border-[#2E2924] dark:bg-[#1D1A17]">
          <Bookmark
            className="mx-auto mb-3 h-8 w-8 text-[#8B5E34]/60 dark:text-[#C48F5A]/60"
            aria-hidden="true"
          />
          <p className="font-heading text-xl font-bold text-[#1F1D1A] dark:text-[#EFECE6]">
            لا توجد مواضع محفوظة بعد
          </p>
          <p className="mt-1 text-sm text-[#5E584F] dark:text-[#A8A095]">
            اضغط على زر «حفظ العنصر» أعلى أي مبحث في الشرح لإضافته هنا.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedItems.map(({ lecture, topic }) => (
            <div
              key={topic.id}
              className="rounded-xl border border-[#E6DFD3] bg-[#FFFFFF] p-5 shadow-xs dark:border-[#2E2924] dark:bg-[#1D1A17]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-[#8B5E34] dark:text-[#C48F5A]">
                  {lecture.arabicOrdinal} • العنصر {toArabicIndicDigits(topic.number)} (
                  {topic.pageRef})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigateToTopic(lecture.id, topic.id)}
                    className="inline-flex items-center gap-1 rounded border border-[#1B4D3E] bg-[#1B4D3E] px-3 py-1 text-xs font-semibold text-[#FFFFFF] hover:opacity-90 dark:border-[#4BA388] dark:bg-[#4BA388] dark:text-[#141210]"
                  >
                    <span>قراءة العنصر</span>
                    <ArrowUpLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleBookmark(topic.id)}
                    aria-label="حذف من المحفوظات"
                    className="inline-flex items-center gap-1 rounded border border-[#E6DFD3] bg-[#FAF7F2] px-2.5 py-1 text-xs font-medium text-[#5E584F] hover:text-red-700 dark:border-[#2E2924] dark:bg-[#141210] dark:text-[#A8A095] dark:hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>

              <h3 className="mt-2 font-heading text-2xl font-bold text-[#1F1D1A] dark:text-[#EFECE6]">
                <RichArabicText text={topic.title} variant="plainWithQuran" />
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#5E584F] dark:text-[#A8A095]">
                <RichArabicText text={topic.summary} variant="plainWithQuran" />
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
