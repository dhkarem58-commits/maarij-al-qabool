import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeArabicForSearch,
  toArabicIndicDigits,
  extractAllEvidences,
  countTopicEvidences,
  searchLectures,
} from './studyHelpers';
import {
  LECTURES,
  MIND_MAP_TREES,
  QUESTION_BANK,
  SPELLING_CORRECTIONS,
  SUB_ELEMENT_SUMMARIES,
} from '../data';
import { tokenizeMatnText, tokenizeSharhText } from './patternColorizer';
import type { Lecture } from '../types/book';

const sampleLectures: Lecture[] = [
  {
    id: 'lec-12',
    number: 12,
    arabicOrdinal: 'المحاضرة الثانية عشرة',
    title: 'خطبة الكتاب والتوحيد',
    subtitle: 'بيان التوحيد وشمول الكتاب والسنة',
    pageRange: '١ – ١٣',
    openingInvocation: 'الحمد لله',
    topics: [
      {
        id: 't-1',
        number: 1,
        title: 'الحمد والتنزيه',
        pageRef: 'ص ١ – ٢',
        summary: 'شرح خطبة المصنف',
        matn: {
          text: 'أَحْمَدُهُ تَعَالَى عَلَى جَزِيلِ إِنْعَامِهِ وَإِفْضَالِهِ',
        },
        sharhElements: [
          {
            id: 'se-1',
            orderLabel: 'أولاً',
            title: 'تنزيه الرب عن الولي والنصير',
            paragraphs: ['ليس له ولي من الذل سبحانه وتعالى.'],
            evidences: [
              {
                id: 'ev-sub-1',
                number: 1,
                type: 'hadith',
                text: 'من عادى لي وليا فقد آذنته بالحرب',
                reference: 'حديث قدسي رواه البخاري',
              },
            ],
          },
        ],
        evidences: [
          {
            id: 'ev-1',
            number: 1,
            type: 'quran',
            text: 'إِنْ تَنْصُرُوا اللَّهَ يَنْصُرْكُمْ',
            reference: 'محمد: ٧',
          },
        ],
      },
    ],
    qaItems: [
      {
        id: 'qa-1',
        number: 1,
        question: 'ما معنى ولاية الله؟',
        answerParagraphs: ['تكون تكريماً ومحبة للمؤمنين لا عن حاجة وذل.'],
      },
    ],
  },
];

test('normalizeArabicForSearch strips diacritics and normalizes hamza/ta marbuta', () => {
  assert.equal(normalizeArabicForSearch('أَحْمَدُهُ تَعَالَى'), 'احمده تعالي');
  assert.equal(normalizeArabicForSearch('الإِيْمَانُ وَالشَّرِيعَةُ'), 'الايمان والشريعه');
});

test('toArabicIndicDigits converts numbers accurately', () => {
  assert.equal(toArabicIndicDigits(12), '١٢');
  assert.equal(toArabicIndicDigits(107), '١٠٧');
});

test('extractAllEvidences and countTopicEvidences gather topic and sub-element evidences', () => {
  const flattened = extractAllEvidences(sampleLectures);
  assert.equal(flattened.length, 2);
  assert.equal(countTopicEvidences(sampleLectures[0]), 2);
});

test('searchLectures matches across Matn, Sharh, Evidence, and QA without diacritics', () => {
  const matnMatches = searchLectures(sampleLectures, 'جزيل انعامه');
  assert.equal(matnMatches.some((m) => m.matchType === 'matn'), true);

  const sharhMatches = searchLectures(sampleLectures, 'ولي من الذل');
  assert.equal(sharhMatches.some((m) => m.matchType === 'sharh'), true);

  const evMatches = searchLectures(sampleLectures, 'اذنته بالحرب');
  assert.equal(evMatches.some((m) => m.matchType === 'evidence'), true);

  const qaMatches = searchLectures(sampleLectures, 'تكريما ومحبه');
  assert.equal(qaMatches.some((m) => m.matchType === 'qa'), true);
});

test('LECTURES 12-17 integrity: complete topics, non-empty Sharh, sequential 1..N topic evidences, and corrections log', () => {
  assert.equal(LECTURES.length, 6);
  assert.deepEqual(
    LECTURES.map((l) => l.number),
    [12, 13, 14, 15, 16, 17]
  );

  for (const lecture of LECTURES) {
    assert.ok(lecture.topics.length >= 2, `${lecture.id} must have multiple topics`);
    for (const topic of lecture.topics) {
      assert.ok(topic.sharhElements.length > 0, `${topic.id} must have sharhElements`);
      for (const el of topic.sharhElements) {
        assert.ok(el.paragraphs.length > 0, `${el.id} must have unabridged paragraphs`);
      }
      assert.ok(topic.evidences.length > 0, `${topic.id} must have numbered evidences`);
      topic.evidences.forEach((ev, idx) => {
        assert.equal(ev.number, idx + 1, `${topic.id} evidence ${ev.id} must be numbered ${idx + 1}`);
      });
    }
  }

  // Verify Q&As exist in Lectures 13-17
  assert.ok((LECTURES[5].qaItems?.length ?? 0) === 6, 'Lecture 17 must have all 6 Q&As');
  assert.ok(SPELLING_CORRECTIONS.length >= 8, 'Corrections audit log must be populated');

  // Verify real Arabic search across Lectures 12-17
  const taifaMatches = searchLectures(LECTURES, 'الطائفة المنصورة');
  assert.ok(taifaMatches.some((m) => m.lectureId === 'lecture-17'));
});

test('SUB_ELEMENT_SUMMARIES covers 100% of all SharhSubElements across Lectures 12-17', () => {
  const allElementIds = LECTURES.flatMap((l) =>
    l.topics.flatMap((t) => t.sharhElements.map((el) => el.id))
  );
  assert.equal(allElementIds.length, 66);
  for (const id of allElementIds) {
    const digest = SUB_ELEMENT_SUMMARIES[id];
    assert.ok(typeof digest === 'string' && digest.trim().length > 20, `Missing or too-short digest for ${id}`);
  }
});

test('QUESTION_BANK contains all 22 solved questions (90..111) mapped to valid Lectures and Topics', () => {
  assert.equal(QUESTION_BANK.length, 22);
  assert.deepEqual(
    QUESTION_BANK.map((q) => q.questionNumber),
    Array.from({ length: 22 }, (_, i) => 90 + i)
  );

  for (const q of QUESTION_BANK) {
    const lec = LECTURES.find((l) => l.id === q.relatedLectureId);
    assert.ok(lec, `Question ${q.questionNumber} references unknown lecture ${q.relatedLectureId}`);
    const topic = lec.topics.find((t) => t.id === q.relatedTopicId);
    assert.ok(topic, `Question ${q.questionNumber} references unknown topic ${q.relatedTopicId}`);
    assert.ok(q.answerBlocks.length > 0, `Question ${q.questionNumber} must have answer blocks`);
  }
});

test('MIND_MAP_TREES contains all 9 hierarchical trees linked to valid Lectures and Topics', () => {
  assert.equal(MIND_MAP_TREES.length, 9);
  for (const tree of MIND_MAP_TREES) {
    const lec = LECTURES.find((l) => l.id === tree.relatedLectureId);
    assert.ok(lec, `Tree ${tree.id} references unknown lecture ${tree.relatedLectureId}`);
    const topic = lec.topics.find((t) => t.id === tree.relatedTopicId);
    assert.ok(topic, `Tree ${tree.id} references unknown topic ${tree.relatedTopicId}`);
    assert.ok(tree.root.children && tree.root.children.length >= 2, `Tree ${tree.id} must branch`);
  }
});

test('patternColorizer isolates Quranic verses and classifies Sharh/Matn patterns', () => {
  const sharhTokens = tokenizeSharhText(
    'قال الله تعالى: ﴿لَيْسَ كَمِثْلِهِ شَيْءٌ﴾. وخالف في ذلك الجهمية والمعتزلة. ومذهب أهل السنة إثباتاً بلا تكييف.'
  );
  assert.equal(sharhTokens.some((t) => t.kind === 'quran' && t.text.includes('لَيْسَ كَمِثْلِهِ')), true);
  assert.equal(sharhTokens.some((t) => t.kind === 'refutation'), true);
  assert.equal(sharhTokens.some((t) => t.kind === 'creedRule'), true);

  const matnTokens = tokenizeMatnText(
    'وَتَابِعِيهِمْ ﴿وَالَّذِينَ جَاءُوا مِنْ بَعْدِهِمْ﴾ — وَهُوَ — مَذْهَبُ أَهْلِ السُّنَّةِ وَالْجَمَاعَةِ خِلَافًا لِلْجَهْمِيَّةِ'
  );
  assert.equal(matnTokens.some((t) => t.kind === 'quran'), true);
  assert.equal(matnTokens.some((t) => t.kind === 'matnParen'), true);
  assert.equal(matnTokens.some((t) => t.kind === 'matnCreed'), true);
  assert.equal(matnTokens.some((t) => t.kind === 'matnSects'), true);
});
