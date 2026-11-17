import { useMemo, useState } from 'react';
import { ArrowUpLeft, Eye, EyeOff, GitFork, GraduationCap, Search } from 'lucide-react';
import { LECTURES, QUESTION_BANK } from '../data';
import { normalizeArabicForSearch, toArabicIndicDigits } from '../utils/studyHelpers';
import { RichArabicText } from './RichArabicText';

interface QuestionBankViewProps {
  colorCodingEnabled: boolean;
  onNavigateToTopic: (lectureId: string, topicId: string) => void;
  onOpenTree: (treeId: string) => void;
}

export function QuestionBankView({
  colorCodingEnabled,
  onNavigateToTopic,
  onOpenTree,
}: QuestionBankViewProps) {
  const [selectedLectureId, setSelectedLectureId] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [quizMode, setQuizMode] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  const filteredQuestions = useMemo(() => {
    const norm = normalizeArabicForSearch(query);
    return QUESTION_BANK.filter((q) => {
      if (selectedLectureId !== 'all' && q.relatedLectureId !== selectedLectureId) {
        return false;
      }
      if (norm) {
        const blob = [
          q.question,
          q.topicBadge,
          ...q.answerBlocks.flatMap((b) => [b.title || '', b.text || '', ...(b.items || [])]),
        ].join(' ');
        if (!normalizeArabicForSearch(blob).includes(norm)) return false;
      }
      return true;
    });
  }, [selectedLectureId, query]);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6" data-testid="qbank-view">
      {/* Header & Controls */}
      <div className="rounded-xl border border-[#E6DFD3] bg-[#FFFFFF] p-5 shadow-xs sm:p-6 dark:border-[#2E2924] dark:bg-[#1D1A17]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E6DFD3] pb-4 dark:border-[#2E2924]">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#D4C49A] bg-[#F5EFE0] text-[#1B4D3E] dark:border-[#443828] dark:bg-[#1E1A15] dark:text-[#4BA388]">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-heading text-2xl font-bold text-[#1F1D1A] sm:text-3xl dark:text-[#EFECE6]">
                بنك الأسئلة المحلول والموزع على الموضوعات (س ٩٠ – س ١١١)
              </h2>
              <p className="mt-1 text-sm text-[#5E584F] dark:text-[#A8A095]">
                ٢٢ سؤالاً محلولاً بالإجابات النموذجية الموثقة بالقرآن والسنة، موزعةً على محاضراتها ومربوطةً بالتشجيرات.
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="toggle-quiz-mode-btn"
            aria-pressed={quizMode}
            onClick={() => {
              setQuizMode((prev) => !prev);
              setRevealedIds({});
            }}
            className={`inline-flex items-center gap-2 rounded-md border px-3.5 py-2 text-xs font-bold sm:text-sm ${
              quizMode
                ? 'border-[#1B4D3E] bg-[#1B4D3E] text-white dark:border-[#4BA388] dark:bg-[#4BA388] dark:text-[#141210]'
                : 'border-[#D4C49A] bg-[#F5EFE0] text-[#8B5E34] dark:border-[#443828] dark:bg-[#1E1A15] dark:text-[#C48F5A]'
            }`}
          >
            {quizMode ? (
              <>
                <Eye className="h-4 w-4" aria-hidden="true" />
                <span>إظهار جميع الإجابات</span>
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" aria-hidden="true" />
                <span>وضع الاختبار الذاتي (إخفاء الإجابات)</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="qbank-lecture-filter"
              className="mb-1 block text-xs font-semibold text-[#5E584F] dark:text-[#A8A095]"
            >
              تصفية حسب المحاضرة:
            </label>
            <select
              id="qbank-lecture-filter"
              value={selectedLectureId}
              onChange={(e) => setSelectedLectureId(e.target.value)}
              className="w-full rounded-md border border-[#E6DFD3] bg-[#FAF7F2] px-3 py-2 text-sm text-[#1F1D1A] focus:border-[#1B4D3E] focus:outline-none dark:border-[#2E2924] dark:bg-[#141210] dark:text-[#EFECE6]"
            >
              <option value="all">
                جميع الأسئلة ({toArabicIndicDigits(QUESTION_BANK.length)} سؤالاً)
              </option>
              {LECTURES.map((lec) => {
                const count = QUESTION_BANK.filter(
                  (q) => q.relatedLectureId === lec.id
                ).length;
                const unit =
                  count === 1 ? 'سؤال' : count === 2 ? 'سؤالان' : 'أسئلة';
                return (
                  <option key={lec.id} value={lec.id}>
                    {lec.arabicOrdinal} ({toArabicIndicDigits(count)} {unit})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label
              htmlFor="qbank-search"
              className="mb-1 block text-xs font-semibold text-[#5E584F] dark:text-[#A8A095]"
            >
              بحث في بنك الأسئلة:
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-2.5 right-3 h-4 w-4 text-[#5E584F] dark:text-[#A8A095]"
                aria-hidden="true"
              />
              <input
                id="qbank-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث برقم السؤال أو المصطلح أو الفرقة..."
                className="w-full rounded-md border border-[#E6DFD3] bg-[#FAF7F2] py-2 pr-9 pl-3 text-sm text-[#1F1D1A] placeholder:text-[#5E584F]/70 focus:border-[#1B4D3E] focus:outline-none dark:border-[#2E2924] dark:bg-[#141210] dark:text-[#EFECE6]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="rounded-xl border border-[#E6DFD3] bg-[#FFFFFF] p-8 text-center text-sm text-[#5E584F] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#A8A095]">
          لا توجد أسئلة مطابقة لخيارات البحث الحالية.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((item) => {
            const answerVisible = !quizMode || Boolean(revealedIds[item.id]);
            return (
              <article
                key={item.id}
                className="rounded-xl border border-[#E6DFD3] bg-[#FFFFFF] p-5 shadow-xs dark:border-[#2E2924] dark:bg-[#1D1A17]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6DFD3] pb-3 dark:border-[#2E2924]">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded border border-[#8B5E34]/40 bg-[#F5EFE0] px-2.5 py-1 font-bold tabular-nums text-[#8B5E34] dark:border-[#C48F5A]/40 dark:bg-[#1E1A15] dark:text-[#C48F5A]">
                      س {toArabicIndicDigits(item.questionNumber)}
                    </span>
                    <span className="font-semibold text-[#5E584F] dark:text-[#A8A095]">
                      {item.topicBadge}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {item.treeId && (
                      <button
                        type="button"
                        onClick={() => onOpenTree(item.treeId!)}
                        className="inline-flex items-center gap-1 rounded border border-[#1B4D3E]/30 bg-[#1B4D3E]/10 px-2.5 py-1 text-xs font-semibold text-[#1B4D3E] dark:border-[#4BA388]/30 dark:bg-[#4BA388]/15 dark:text-[#4BA388]"
                      >
                        <GitFork className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>التشجير</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        onNavigateToTopic(item.relatedLectureId, item.relatedTopicId)
                      }
                      className="inline-flex items-center gap-1 rounded border border-[#E6DFD3] bg-[#FAF7F2] px-2.5 py-1 text-xs font-semibold text-[#1B4D3E] hover:border-[#1B4D3E] dark:border-[#2E2924] dark:bg-[#141210] dark:text-[#4BA388]"
                    >
                      <span>الموضع في الشرح</span>
                      <ArrowUpLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <h3 className="mt-3 font-heading text-xl font-bold leading-snug text-[#1B4D3E] dark:text-[#4BA388]">
                  <RichArabicText
                    text={item.question}
                    variant="plainWithQuran"
                    colorCodingEnabled={colorCodingEnabled}
                  />
                </h3>

                {quizMode && !answerVisible ? (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => toggleReveal(item.id)}
                      className="inline-flex items-center gap-2 rounded-md border border-[#1B4D3E] bg-[#1B4D3E] px-4 py-2 text-xs font-bold text-white hover:opacity-90 dark:border-[#4BA388] dark:bg-[#4BA388] dark:text-[#141210]"
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      <span>اكشف الإجابة النموذجية</span>
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3 border-t border-[#E6DFD3]/70 pt-3.5 text-sm leading-[1.95] text-[#1F1D1A] sm:text-base dark:border-[#2E2924]/70 dark:text-[#EFECE6]">
                    {item.answerBlocks.map((block, bIdx) => (
                      <div key={bIdx} className="space-y-1.5">
                        {block.title && (
                          <div className="font-bold text-[#8B5E34] dark:text-[#C48F5A]">
                            {block.title}
                          </div>
                        )}
                        {block.text && (
                          <p
                            className={
                              block.type === 'highlight'
                                ? 'rounded-lg border border-[#D4C49A] bg-[#F5EFE0]/70 p-3.5 dark:border-[#443828] dark:bg-[#1E1A15]'
                                : ''
                            }
                          >
                            <RichArabicText
                              text={block.text}
                              variant={colorCodingEnabled ? 'sharh' : 'plainWithQuran'}
                              colorCodingEnabled={colorCodingEnabled}
                            />
                          </p>
                        )}
                        {block.items && block.items.length > 0 && (
                          <ul className="space-y-2 pr-4">
                            {block.items.map((li, liIdx) => (
                              <li key={liIdx} className="flex items-start gap-2">
                                <span className="mt-1.5 text-[10px] text-[#8B5E34] dark:text-[#C48F5A]">
                                  ●
                                </span>
                                <span>
                                  <RichArabicText
                                    text={li}
                                    variant={colorCodingEnabled ? 'sharh' : 'plainWithQuran'}
                                    colorCodingEnabled={colorCodingEnabled}
                                  />
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
