import { useState } from 'react';
import {
  Edit3,
  Eye,
  EyeOff,
  GitFork,
  HelpCircle,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import type { Lecture, QuestionBankItem } from '../types/book';
import { toArabicIndicDigits } from '../utils/studyHelpers';
import { QuestionEditor } from './InlineEditors';
import { RichArabicText } from './RichArabicText';

interface TopicQuestionBankBlockProps {
  questions: QuestionBankItem[];
  lectures?: Lecture[];
  lectureId?: string;
  topicId?: string;
  topicTitle?: string;
  colorCodingEnabled: boolean;
  onOpenTree?: (treeId: string) => void;
  editMode?: boolean;
  modifiedQuestionIds?: Record<string, boolean>;
  customQuestionIds?: Record<string, boolean>;
  onSaveQuestion?: (item: QuestionBankItem, isCustom: boolean) => void;
  onDeleteQuestion?: (questionId: string, isCustom: boolean) => void;
  onRestoreQuestion?: (questionId: string) => void;
  onAddQuestion?: (item: QuestionBankItem) => void;
  nextQuestionNumber?: number;
}

export function TopicQuestionBankBlock({
  questions,
  lectures = [],
  lectureId = '',
  topicId = '',
  topicTitle = '',
  colorCodingEnabled,
  onOpenTree,
  editMode = false,
  modifiedQuestionIds = {},
  customQuestionIds = {},
  onSaveQuestion,
  onDeleteQuestion,
  onRestoreQuestion,
  onAddQuestion,
  nextQuestionNumber = 112,
}: TopicQuestionBankBlockProps) {
  const [hiddenAnswerIds, setHiddenAnswerIds] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);

  if ((!questions || questions.length === 0) && !editMode) return null;

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
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tabular-nums text-[#5E584F] dark:text-[#A8A095]">
            {toArabicIndicDigits(questions.length)} سؤال
          </span>
          {editMode && onAddQuestion && !addingNew && (
            <button
              type="button"
              onClick={() => setAddingNew(true)}
              className="inline-flex items-center gap-1 rounded border border-[#1B4D3E]/40 bg-[#FFFFFF] px-2.5 py-1 text-xs font-bold text-[#1B4D3E] dark:border-[#4BA388]/40 dark:bg-[#1D1A17] dark:text-[#4BA388]"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>إضافة سؤال</span>
            </button>
          )}
        </div>
      </div>

      {addingNew && onAddQuestion && (
        <div className="mb-4">
          <QuestionEditor
            initial={{
              id: `custom-q-${Date.now()}`,
              questionNumber: nextQuestionNumber,
              question: '',
              answerBlocks: [{ type: 'paragraph', text: '' }],
              relatedLectureId: lectureId || lectures[0]?.id || '',
              relatedTopicId: topicId || lectures[0]?.topics[0]?.id || '',
              topicBadge: topicTitle || 'موضوع مضاف',
            }}
            lectures={lectures}
            submitLabel="إضافة السؤال للموضوع"
            onSave={(newItem) => {
              onAddQuestion(newItem);
              setAddingNew(false);
            }}
            onCancel={() => setAddingNew(false)}
          />
        </div>
      )}

      <div className="space-y-4">
        {questions.map((item) => {
          const isHidden = Boolean(hiddenAnswerIds[item.id]);
          const isCustom = Boolean(customQuestionIds[item.id]);
          const isModified = Boolean(modifiedQuestionIds[item.id]);
          const isEditing = editingId === item.id;

          if (isEditing && onSaveQuestion) {
            return (
              <QuestionEditor
                key={item.id}
                initial={item}
                lectures={lectures}
                onSave={(updated) => {
                  onSaveQuestion(updated, isCustom);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            );
          }

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

                <div className="flex flex-wrap items-center gap-1.5">
                  {editMode && onSaveQuestion && (
                    <button
                      type="button"
                      onClick={() => setEditingId(item.id)}
                      className="inline-flex items-center gap-1 rounded border border-[#8B5E34] bg-[#FAF7F2] px-2 py-1 text-xs font-bold text-[#8B5E34] dark:border-[#C48F5A] dark:bg-[#141210] dark:text-[#C48F5A]"
                    >
                      <Edit3 className="h-3 w-3" aria-hidden="true" />
                      <span>تعديل</span>
                    </button>
                  )}

                  {editMode && isModified && !isCustom && onRestoreQuestion && (
                    <button
                      type="button"
                      onClick={() => onRestoreQuestion(item.id)}
                      className="inline-flex items-center gap-1 rounded border border-[#1B4D3E]/40 bg-[#FAF7F2] px-2 py-1 text-xs font-semibold text-[#1B4D3E] dark:border-[#4BA388]/40 dark:bg-[#141210] dark:text-[#4BA388]"
                    >
                      <RotateCcw className="h-3 w-3" aria-hidden="true" />
                      <span>استعادة</span>
                    </button>
                  )}

                  {editMode && onDeleteQuestion && (
                    <button
                      type="button"
                      onClick={() => onDeleteQuestion(item.id, isCustom)}
                      className="inline-flex items-center gap-1 rounded border border-red-300 bg-[#FAF7F2] px-2 py-1 text-xs font-semibold text-red-700 dark:border-red-900/60 dark:bg-[#141210] dark:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                      <span>مسح</span>
                    </button>
                  )}

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
