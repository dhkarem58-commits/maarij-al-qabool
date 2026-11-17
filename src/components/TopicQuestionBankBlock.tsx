import { useState } from 'react';
import { Eye, EyeOff, GitFork, HelpCircle } from 'lucide-react';
import type { QuestionBankItem } from '../types/book';
import { toArabicIndicDigits } from '../utils/studyHelpers';
import { RichArabicText } from './RichArabicText';

interface TopicQuestionBankBlockProps {
  questions: QuestionBankItem[];
  colorCodingEnabled: boolean;
  onOpenTree?: (treeId: string) => void;
}

export function TopicQuestionBankBlock({
  questions,
  colorCodingEnabled,
  onOpenTree,
}: TopicQuestionBankBlockProps) {
  const [hiddenAnswerIds, setHiddenAnswerIds] = useState<Record<string, boolean>>({});

  if (!questions || questions.length === 0) return null;

  const toggleAnswer = (id: string) => {
    setHiddenAnswerIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section
      aria-label="بنك الأسئلة المحلول المرتبط بهذا الموضوع"
      data-testid="topic-qbank-block"
      className="mt-6 rounded-xl border border-[#D4C49A] bg-[#F5EFE0]/55 p-4 sm:p-5 dark:border-[#443828] dark:bg-[#1E1A15]/70"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#D4C49A]/70 pb-2.5 dark:border-[#443828]">
        <div className="flex items-center gap-2">
          <HelpCircle
            className="h-4.5 w-4.5 text-[#8B5E34] dark:text-[#C48F5A]"
            aria-hidden="true"
          />
          <h4 className="font-heading text-lg font-bold text-[#8B5E34] sm:text-xl dark:text-[#C48F5A]">
            أسئلة بنك المراجعة المحلولة المرتبطة بهذا الموضوع
          </h4>
        </div>
        <span className="text-xs font-bold tabular-nums text-[#5E584F] dark:text-[#A8A095]">
          {toArabicIndicDigits(questions.length)} سؤال
        </span>
      </div>

      <div className="space-y-4">
        {questions.map((item) => {
          const isHidden = Boolean(hiddenAnswerIds[item.id]);
          return (
            <div
              key={item.id}
              className="rounded-lg border border-[#E6DFD3] bg-[#FFFFFF] p-4 dark:border-[#2E2924] dark:bg-[#1D1A17]"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 shrink-0 rounded border border-[#8B5E34]/40 bg-[#F5EFE0] px-2 py-0.5 text-xs font-bold tabular-nums text-[#8B5E34] dark:border-[#C48F5A]/40 dark:bg-[#1E1A15] dark:text-[#C48F5A]">
                    س {toArabicIndicDigits(item.questionNumber)}
                  </span>
                  <h5 className="font-heading text-lg font-bold leading-snug text-[#1B4D3E] dark:text-[#4BA388]">
                    <RichArabicText
                      text={item.question}
                      variant="plainWithQuran"
                      colorCodingEnabled={colorCodingEnabled}
                    />
                  </h5>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.treeId && onOpenTree && (
                    <button
                      type="button"
                      onClick={() => onOpenTree(item.treeId!)}
                      className="inline-flex items-center gap-1 rounded border border-[#1B4D3E]/30 bg-[#1B4D3E]/10 px-2 py-1 text-xs font-semibold text-[#1B4D3E] hover:bg-[#1B4D3E]/15 dark:border-[#4BA388]/30 dark:bg-[#4BA388]/15 dark:text-[#4BA388]"
                    >
                      <GitFork className="h-3 w-3" aria-hidden="true" />
                      <span>عرض التشجير</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleAnswer(item.id)}
                    className="inline-flex items-center gap-1 rounded border border-[#E6DFD3] bg-[#FAF7F2] px-2.5 py-1 text-xs font-medium text-[#5E584F] hover:text-[#1F1D1A] dark:border-[#2E2924] dark:bg-[#141210] dark:text-[#A8A095] dark:hover:text-[#EFECE6]"
                  >
                    {isHidden ? (
                      <>
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>إظهار الإجابة</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>إخفاء للاختبار</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {!isHidden && (
                <div className="mt-3 space-y-2.5 border-t border-[#E6DFD3] pt-3 text-sm leading-[1.9] text-[#1F1D1A] sm:text-base dark:border-[#2E2924] dark:text-[#EFECE6]">
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
                              ? 'rounded-md border border-[#D4C49A] bg-[#F5EFE0]/70 p-3 dark:border-[#443828] dark:bg-[#1E1A15]'
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
                        <ul className="space-y-1.5 pr-4">
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
            </div>
          );
        })}
      </div>
    </section>
  );
}
