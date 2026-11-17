import { useMemo } from 'react';
import type { SharhPatternType } from '../types/book';
import {
  SHARH_PATTERNS,
  tokenizeMatnText,
  tokenizeSharhText,
  type InlineToken,
  type InlineTokenKind,
} from '../utils/patternColorizer';

interface RichArabicTextProps {
  text: string;
  variant?: 'sharh' | 'matn' | 'plainWithQuran';
  colorCodingEnabled?: boolean;
  spotlightPattern?: SharhPatternType | null;
}

const PATTERN_CLASS_MAP: Record<string, string> = Object.fromEntries(
  SHARH_PATTERNS.map((p) => [p.id, `${p.lightClass} ${p.darkClass}`])
);

function getTokenClasses(
  kind: InlineTokenKind,
  colorCodingEnabled: boolean,
  spotlightPattern?: SharhPatternType | null
): string {
  // Quranic verses ALWAYS use KFGQPC Uthmanic Script HAFS regardless of color-coding toggle
  if (kind === 'quran') {
    const dim =
      spotlightPattern && spotlightPattern !== 'quran' ? 'opacity-35' : '';
    const color = colorCodingEnabled
      ? `${PATTERN_CLASS_MAP.quran} font-normal`
      : '';
    return `font-quran text-[1.15em] leading-[2.05] inline ${color} ${dim}`.trim();
  }

  if (!colorCodingEnabled) {
    return '';
  }

  if (kind === 'matnSects') {
    return 'text-[#881337] dark:text-[#FDA4AF] font-semibold';
  }
  if (kind === 'matnCreed') {
    return 'text-[#1B4D3E] dark:text-[#4BA388] font-bold';
  }
  if (kind === 'matnParen') {
    return 'text-[#6B6257] dark:text-[#B5ABA0] text-[0.94em]';
  }

  if (kind === 'plain') {
    return spotlightPattern ? 'opacity-45' : '';
  }

  const cls = PATTERN_CLASS_MAP[kind] || '';
  const dim =
    spotlightPattern && spotlightPattern !== kind ? 'opacity-35' : '';
  return `${cls} ${dim}`.trim();
}

export function RichArabicText({
  text,
  variant = 'sharh',
  colorCodingEnabled = true,
  spotlightPattern = null,
}: RichArabicTextProps) {
  const tokens: InlineToken[] = useMemo(() => {
    if (variant === 'matn') return tokenizeMatnText(text);
    if (variant === 'sharh') return tokenizeSharhText(text);
    // plainWithQuran: only isolate Quranic verses so every ayah uses KFGQPC Hafs
    const parts = text.split(/(﴿[^﴾]+﴾)/g);
    return parts
      .filter(Boolean)
      .map((part) => ({
        text: part,
        kind: part.startsWith('﴿') && part.endsWith('﴾') ? 'quran' : 'plain',
      }));
  }, [text, variant]);

  return (
    <>
      {tokens.map((tok, idx) => {
        const cls = getTokenClasses(
          tok.kind,
          colorCodingEnabled,
          spotlightPattern
        );
        if (!cls) return <span key={idx}>{tok.text}</span>;
        return (
          <span key={idx} className={cls}>
            {tok.text}
          </span>
        );
      })}
    </>
  );
}
