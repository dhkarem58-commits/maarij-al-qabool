import { useState } from 'react';
import { ArrowUpLeft, GitFork } from 'lucide-react';
import { MIND_MAP_TREES } from '../data';
import { toArabicIndicDigits } from '../utils/studyHelpers';
import { MindMapNodeCard } from './MindMapNodeCard';

interface MindMapTreesViewProps {
  onNavigateToTopic: (lectureId: string, topicId: string) => void;
  colorCodingEnabled: boolean;
  initialTreeId?: string | null;
}

export function MindMapTreesView({
  onNavigateToTopic,
  colorCodingEnabled,
  initialTreeId,
}: MindMapTreesViewProps) {
  const [selectedTreeId, setSelectedTreeId] = useState<string>(
    initialTreeId && MIND_MAP_TREES.some((t) => t.id === initialTreeId)
      ? initialTreeId
      : MIND_MAP_TREES[0].id
  );
  const [showAllOverview, setShowAllOverview] = useState(false);

  const activeTree =
    MIND_MAP_TREES.find((t) => t.id === selectedTreeId) || MIND_MAP_TREES[0];

  return (
    <div className="space-y-6" data-testid="trees-view">
      {/* Header */}
      <div className="rounded-xl border border-[#E6DFD3] bg-[#FFFFFF] p-5 shadow-xs sm:p-6 dark:border-[#2E2924] dark:bg-[#1D1A17]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E6DFD3] pb-4 dark:border-[#2E2924]">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#D4C49A] bg-[#F5EFE0] text-[#1B4D3E] dark:border-[#443828] dark:bg-[#1E1A15] dark:text-[#4BA388]">
              <GitFork className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-heading text-2xl font-bold text-[#1F1D1A] sm:text-3xl dark:text-[#EFECE6]">
                التشجير الشامل لجميع جزئيات الشرح
              </h2>
              <p className="mt-1 text-sm text-[#5E584F] dark:text-[#A8A095]">
                تشجيرات تفاعلية متفرعة تشمل جميع خرائط الأبواب والفرق ومباحث المحاضرات (١٢ – ١٧) مع إمكانية طيّ وتوسيع كل فرع.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAllOverview((prev) => !prev)}
              data-testid="toggle-all-trees-btn"
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold sm:text-sm ${
                showAllOverview
                  ? 'border-[#1B4D3E] bg-[#1B4D3E] text-white dark:border-[#4BA388] dark:bg-[#4BA388] dark:text-[#141210]'
                  : 'border-[#D4C49A] bg-[#F5EFE0] text-[#8B5E34] dark:border-[#443828] dark:bg-[#1E1A15] dark:text-[#C48F5A]'
              }`}
            >
              {showAllOverview
                ? 'عرض شجرة واحدة مركّزة'
                : `عرض التشجيرات التسعة معاً (${toArabicIndicDigits(MIND_MAP_TREES.length)})`}
            </button>
          </div>
        </div>

        {/* Selector Grid */}
        {!showAllOverview && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {MIND_MAP_TREES.map((tree) => {
              const active = tree.id === activeTree.id;
              return (
                <button
                  key={tree.id}
                  type="button"
                  data-testid={`tree-tab-${tree.id}`}
                  onClick={() => setSelectedTreeId(tree.id)}
                  className={`flex flex-col items-start rounded-lg border p-3 text-right transition-colors ${
                    active
                      ? 'border-[#1B4D3E] bg-[#1B4D3E]/10 dark:border-[#4BA388] dark:bg-[#4BA388]/15'
                      : 'border-[#E6DFD3] bg-[#FAF7F2] hover:border-[#8B5E34] dark:border-[#2E2924] dark:bg-[#141210] dark:hover:border-[#C48F5A]'
                  }`}
                >
                  <span className="text-xs font-bold tabular-nums text-[#8B5E34] dark:text-[#C48F5A]">
                    تشجير {toArabicIndicDigits(tree.number)} • {tree.sourceLabel}
                  </span>
                  <span
                    className={`mt-1 font-heading text-base font-bold leading-snug ${
                      active
                        ? 'text-[#1B4D3E] dark:text-[#4BA388]'
                        : 'text-[#1F1D1A] dark:text-[#EFECE6]'
                    }`}
                  >
                    {tree.title}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Rendered Trees */}
      {(showAllOverview ? MIND_MAP_TREES : [activeTree]).map((tree) => (
        <section
          key={tree.id}
          aria-label={tree.title}
          className="rounded-xl border border-[#E6DFD3] bg-[#FFFFFF] p-5 shadow-xs sm:p-6 dark:border-[#2E2924] dark:bg-[#1D1A17]"
        >
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-[#E6DFD3] pb-4 dark:border-[#2E2924]">
            <div>
              <div className="text-xs font-bold text-[#8B5E34] dark:text-[#C48F5A]">
                تشجير {toArabicIndicDigits(tree.number)} • {tree.sourceLabel}
              </div>
              <h3 className="mt-1 font-heading text-2xl font-bold text-[#1B4D3E] dark:text-[#4BA388]">
                {tree.title}
              </h3>
              <p className="mt-1 text-sm text-[#5E584F] dark:text-[#A8A095]">
                {tree.summary}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                onNavigateToTopic(tree.relatedLectureId, tree.relatedTopicId)
              }
              className="inline-flex items-center gap-1.5 rounded-md border border-[#E6DFD3] bg-[#FAF7F2] px-3 py-1.5 text-xs font-semibold text-[#1B4D3E] hover:border-[#1B4D3E] dark:border-[#2E2924] dark:bg-[#141210] dark:text-[#4BA388] dark:hover:border-[#4BA388]"
            >
              <span>الانتقال إلى الشرح الأصلي</span>
              <ArrowUpLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <MindMapNodeCard
            node={tree.root}
            colorCodingEnabled={colorCodingEnabled}
          />
        </section>
      ))}
    </div>
  );
}
