import { useState } from 'react';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import type { MindMapNode, TreeNodeTone } from '../types/book';
import { RichArabicText } from './RichArabicText';

interface MindMapNodeCardProps {
  node: MindMapNode;
  depth?: number;
  defaultExpanded?: boolean;
  colorCodingEnabled?: boolean;
}

function getToneClasses(tone: TreeNodeTone = 'branch'): string {
  switch (tone) {
    case 'root':
      return 'border-[#1B4D3E] bg-[#1B4D3E] text-[#FFFFFF] dark:border-[#4BA388] dark:bg-[#1B4D3E] dark:text-[#FFFFFF]';
    case 'sunnah':
      return 'border-[#1B4D3E]/50 bg-[#ECFDF5] text-[#1F1D1A] dark:border-[#4BA388]/50 dark:bg-[#0D2920] dark:text-[#EFECE6]';
    case 'negator':
      return 'border-[#881337]/35 bg-[#FFF1F2] text-[#1F1D1A] dark:border-[#FDA4AF]/35 dark:bg-[#2B1218] dark:text-[#EFECE6]';
    case 'affirmer':
      return 'border-[#8B5E34]/40 bg-[#FFFBEB] text-[#1F1D1A] dark:border-[#C48F5A]/40 dark:bg-[#261D12] dark:text-[#EFECE6]';
    case 'branch':
      return 'border-[#D4C49A] bg-[#F5EFE0] text-[#1F1D1A] dark:border-[#443828] dark:bg-[#1E1A15] dark:text-[#EFECE6]';
    case 'detail':
      return 'border-[#E6DFD3] bg-[#FFFFFF] text-[#1F1D1A] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#EFECE6]';
  }
}

function getTitleClasses(tone: TreeNodeTone = 'branch'): string {
  switch (tone) {
    case 'root':
      return 'text-[#FFFFFF]';
    case 'sunnah':
      return 'text-[#14532D] dark:text-[#6EE7B7]';
    case 'negator':
      return 'text-[#881337] dark:text-[#FDA4AF]';
    case 'affirmer':
      return 'text-[#8B5E34] dark:text-[#FCD34D]';
    case 'branch':
      return 'text-[#8B5E34] dark:text-[#C48F5A]';
    case 'detail':
      return 'text-[#1B4D3E] dark:text-[#4BA388]';
  }
}

export function MindMapNodeCard({
  node,
  depth = 0,
  defaultExpanded = true,
  colorCodingEnabled = true,
}: MindMapNodeCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const tone = node.tone || (depth === 0 ? 'root' : 'branch');

  const topGridColsClass =
    node.children && node.children.length >= 4
      ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
      : node.children && node.children.length === 3
        ? 'grid-cols-1 lg:grid-cols-3'
        : node.children && node.children.length === 2
          ? 'grid-cols-1 md:grid-cols-2'
          : 'grid-cols-1';

  return (
    <div className="flex flex-col items-stretch">
      {/* Node Card */}
      <div
        className={`rounded-lg border p-3.5 shadow-xs ${getToneClasses(tone)} ${
          depth === 0 ? 'mx-auto w-full max-w-xl text-center' : ''
        }`}
      >
        <div
          className={`flex items-center gap-2 ${
            depth === 0 ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className="min-w-0">
            <h4
              className={`font-heading text-lg font-bold leading-snug sm:text-xl ${getTitleClasses(tone)}`}
            >
              {node.title}
            </h4>
            {node.subtitle && (
              <p
                className={`mt-1 text-xs leading-relaxed sm:text-sm ${
                  tone === 'root'
                    ? 'text-[#FFFFFF]/90'
                    : 'text-[#5E584F] dark:text-[#A8A095]'
                }`}
              >
                <RichArabicText
                  text={node.subtitle}
                  variant="plainWithQuran"
                  colorCodingEnabled={colorCodingEnabled}
                />
              </p>
            )}
          </div>

          {hasChildren && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
              aria-label={expanded ? `طي فروع ${node.title}` : `توسيع فروع ${node.title}`}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded border ${
                tone === 'root'
                  ? 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                  : 'border-[#E6DFD3] bg-[#FAF7F2] text-[#5E584F] hover:text-[#1F1D1A] dark:border-[#2E2924] dark:bg-[#141210] dark:text-[#A8A095]'
              }`}
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        {node.points && node.points.length > 0 && (
          <ul
            className={`mt-2.5 space-y-1.5 text-right text-xs leading-relaxed sm:text-sm ${
              tone === 'root'
                ? 'text-[#FFFFFF]/95'
                : 'text-[#1F1D1A] dark:text-[#EFECE6]'
            }`}
          >
            {node.points.map((pt, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="mt-1 text-[10px] opacity-60">◆</span>
                <span className="flex-1">
                  <RichArabicText
                    text={pt}
                    variant={colorCodingEnabled ? 'sharh' : 'plainWithQuran'}
                    colorCodingEnabled={colorCodingEnabled}
                  />
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Connector & Child Branches */}
      {hasChildren && expanded && node.children && (
        depth === 0 ? (
          <div className="relative pt-4">
            <div
              aria-hidden="true"
              className="mx-auto h-4 w-px bg-[#8B5E34]/45 dark:bg-[#C48F5A]/45"
            />
            {node.children.length > 1 && (
              <div
                aria-hidden="true"
                className="mx-8 hidden h-px bg-[#8B5E34]/40 lg:block dark:bg-[#C48F5A]/40"
              />
            )}
            <div className={`grid gap-4 pt-2 ${topGridColsClass}`}>
              {node.children.map((child) => (
                <div key={child.id} className="flex min-w-0 flex-col">
                  <div
                    aria-hidden="true"
                    className="mx-auto hidden h-2.5 w-px bg-[#8B5E34]/40 lg:block dark:bg-[#C48F5A]/40"
                  />
                  <MindMapNodeCard
                    node={child}
                    depth={depth + 1}
                    defaultExpanded={defaultExpanded}
                    colorCodingEnabled={colorCodingEnabled}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-3 mr-3 space-y-2.5 border-r-2 border-[#8B5E34]/35 pr-3.5 dark:border-[#C48F5A]/35">
            {node.children.map((child) => (
              <div key={child.id} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute top-5 -right-3.5 h-0.5 w-3.5 bg-[#8B5E34]/35 dark:bg-[#C48F5A]/35"
                />
                <MindMapNodeCard
                  node={child}
                  depth={depth + 1}
                  defaultExpanded={defaultExpanded}
                  colorCodingEnabled={colorCodingEnabled}
                />
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
