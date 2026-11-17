import type { EvidenceType, Lecture, NumberedEvidence, SearchResult } from '../types/book';

const ARABIC_DIACRITICS_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

/**
 * Normalizes Arabic text for search by removing tashkeel/diacritics,
 * unifying alef/hamza forms, ta marbuta, and alef maqsura.
 */
export function normalizeArabicForSearch(input: string): string {
  return input
    .replace(ARABIC_DIACRITICS_REGEX, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[«»﴿﴾""''()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function toArabicIndicDigits(num: number): string {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num)
    .split('')
    .map((ch) => (ch >= '0' && ch <= '9' ? digits[Number(ch)] : ch))
    .join('');
}

export function getEvidenceTypeLabel(type: EvidenceType): string {
  switch (type) {
    case 'quran':
      return 'قرآن كريم';
    case 'hadith':
      return 'حديث شريف';
    case 'athar':
      return 'أثر / قول سلف';
    case 'rational':
      return 'دليل عقلي / لغوي';
  }
}

export interface FlattenedEvidence extends NumberedEvidence {
  lectureId: string;
  lectureTitle: string;
  topicId: string;
  topicTitle: string;
  subElementTitle?: string;
}

export function extractAllEvidences(lectures: Lecture[]): FlattenedEvidence[] {
  const results: FlattenedEvidence[] = [];
  for (const lecture of lectures) {
    for (const topic of lecture.topics) {
      for (const ev of topic.evidences) {
        results.push({
          ...ev,
          lectureId: lecture.id,
          lectureTitle: lecture.title,
          topicId: topic.id,
          topicTitle: topic.title,
        });
      }
      for (const sub of topic.sharhElements) {
        if (sub.evidences) {
          for (const ev of sub.evidences) {
            results.push({
              ...ev,
              lectureId: lecture.id,
              lectureTitle: lecture.title,
              topicId: topic.id,
              topicTitle: topic.title,
              subElementTitle: sub.title,
            });
          }
        }
      }
    }
    if (lecture.qaItems) {
      for (const qa of lecture.qaItems) {
        if (qa.evidences) {
          for (const ev of qa.evidences) {
            results.push({
              ...ev,
              lectureId: lecture.id,
              lectureTitle: lecture.title,
              topicId: qa.id,
              topicTitle: `سؤال ${toArabicIndicDigits(qa.number)}: ${qa.question}`,
            });
          }
        }
      }
    }
  }
  return results;
}

export function countTopicEvidences(lecture: Lecture): number {
  let total = 0;
  for (const topic of lecture.topics) {
    total += topic.evidences.length;
    for (const sub of topic.sharhElements) {
      if (sub.evidences) total += sub.evidences.length;
    }
  }
  if (lecture.qaItems) {
    for (const qa of lecture.qaItems) {
      if (qa.evidences) total += qa.evidences.length;
    }
  }
  return total;
}

function buildSnippet(text: string, rawQuery: string): string {
  const normText = normalizeArabicForSearch(text);
  const normQuery = normalizeArabicForSearch(rawQuery);
  const idx = normText.indexOf(normQuery);
  if (idx === -1) {
    return text.slice(0, 140) + (text.length > 140 ? '...' : '');
  }
  // Approximate slice on original text using normalized ratio
  const ratio = text.length / Math.max(normText.length, 1);
  const approxStart = Math.max(0, Math.floor(idx * ratio) - 45);
  const approxEnd = Math.min(text.length, approxStart + 160);
  const prefix = approxStart > 0 ? '...' : '';
  const suffix = approxEnd < text.length ? '...' : '';
  return prefix + text.slice(approxStart, approxEnd).trim() + suffix;
}

export function searchLectures(lectures: Lecture[], query: string): SearchResult[] {
  const normQuery = normalizeArabicForSearch(query);
  if (!normQuery || normQuery.length < 2) {
    return [];
  }

  const results: SearchResult[] = [];

  for (const lecture of lectures) {
    for (const topic of lecture.topics) {
      if (topic.matn && normalizeArabicForSearch(topic.matn.text).includes(normQuery)) {
        results.push({
          lectureId: lecture.id,
          lectureTitle: lecture.title,
          topicId: topic.id,
          topicTitle: topic.title,
          matchType: 'matn',
          snippet: buildSnippet(topic.matn.text, query),
        });
      }

      const sharhBlob = [
        topic.title,
        topic.summary,
        ...topic.sharhElements.flatMap((el) => [
          el.title,
          ...el.paragraphs,
          ...(el.bulletItems ? el.bulletItems.map((b) => `${b.label} ${b.detail}`) : []),
        ]),
      ].join(' ');

      if (normalizeArabicForSearch(sharhBlob).includes(normQuery)) {
        const matchedPara =
          topic.sharhElements
            .flatMap((el) => el.paragraphs)
            .find((p) => normalizeArabicForSearch(p).includes(normQuery)) || topic.summary;

        results.push({
          lectureId: lecture.id,
          lectureTitle: lecture.title,
          topicId: topic.id,
          topicTitle: topic.title,
          matchType: 'sharh',
          snippet: buildSnippet(matchedPara, query),
        });
      }

      const allTopicEvs = [
        ...topic.evidences,
        ...topic.sharhElements.flatMap((el) => el.evidences ?? []),
      ];

      for (const ev of allTopicEvs) {
        const evText = `${ev.text} ${ev.reference} ${ev.inference ?? ''}`;
        if (normalizeArabicForSearch(evText).includes(normQuery)) {
          results.push({
            lectureId: lecture.id,
            lectureTitle: lecture.title,
            topicId: topic.id,
            topicTitle: topic.title,
            matchType: 'evidence',
            snippet: buildSnippet(`${ev.text} (${ev.reference})`, query),
          });
          break;
        }
      }
    }

    if (lecture.qaItems) {
      for (const qa of lecture.qaItems) {
        const qaBlob = `${qa.question} ${qa.answerParagraphs.join(' ')}`;
        if (normalizeArabicForSearch(qaBlob).includes(normQuery)) {
          results.push({
            lectureId: lecture.id,
            lectureTitle: lecture.title,
            topicId: qa.id,
            topicTitle: `سؤال ${toArabicIndicDigits(qa.number)}: ${qa.question}`,
            matchType: 'qa',
            snippet: buildSnippet(qa.answerParagraphs[0] || qa.question, query),
          });
        }
      }
    }
  }

  return results;
}
