import assert from 'node:assert/strict';
import test from 'node:test';
import { LECTURES, QUESTION_BANK } from '../data/index.ts';
import type { QuestionBankItem, SharhSubElement } from '../types/book.ts';
import {
  addCustomQuestion,
  addSharhSubElement,
  countEditionChanges,
  createEmptyEdition,
  deleteCanonicalQuestion,
  deleteSharhSubElement,
  mergeGuestDraftIntoUserEdition,
  mergeLecturesWithEdition,
  mergeQuestionBankWithEdition,
  restoreCanonicalQuestion,
  restoreMatnOriginal,
  restoreSharhSubElement,
  sanitizeEditionForFirestore,
  setMatnOverride,
  setQuestionOverride,
  setSharhSubElementOverride,
} from './editionOverrides.ts';
import {
  clearPendingSync,
  enqueuePendingSync,
  flushPendingSync,
  getPendingSync,
  loadLocalDraft,
  saveLocalDraft,
  type StorageLike,
} from './offlineSyncQueue.ts';

function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

test('Original lectures and question bank remain untouched when edition is null or empty', () => {
  const empty = createEmptyEdition('user_1', 'أبو عبد الله');
  const mergedLectures = mergeLecturesWithEdition(LECTURES, empty);
  const mergedQuestions = mergeQuestionBankWithEdition(QUESTION_BANK, empty);

  assert.equal(mergedLectures.length, LECTURES.length);
  assert.equal(mergedLectures[0].topics[0].matn?.text, LECTURES[0].topics[0].matn?.text);
  assert.equal(mergedQuestions.length, QUESTION_BANK.length);
});

test('Matn and Sharh edits, deletions, additions, and restorations work non-destructively', () => {
  const baseTopic = LECTURES[0].topics[0];
  const baseFirstSharh = baseTopic.sharhElements[0];
  let edition = createEmptyEdition('user_1', 'أحمد');

  // Edit Matn
  edition = setMatnOverride(edition, baseTopic.id, {
    title: 'المتن المعدل',
    text: 'نص متن مخصص للتجربة',
  });
  // Edit first sharh sub-element
  edition = setSharhSubElementOverride(edition, baseTopic.id, baseFirstSharh.id, {
    title: 'عنوان شرح مخصص',
    conciseSummary: 'ملخص مركز مخصص',
    paragraphs: ['فقرة شرح معدلة'],
  });
  // Delete second sharh sub-element if present
  const secondSharh = baseTopic.sharhElements[1];
  if (secondSharh) {
    edition = deleteSharhSubElement(edition, baseTopic.id, secondSharh.id);
  }
  // Add new sharh sub-element
  const customEl: SharhSubElement = {
    id: 'custom-el-1',
    orderLabel: 'فائدة مضافة',
    title: 'تنبيه عقدي مهم',
    conciseSummary: 'خلاصة الفائدة المضافة',
    paragraphs: ['تفصيل الفائدة المضافة مع آية ﴿قُلْ هُوَ اللَّهُ أَحَدٌ﴾.'],
  };
  edition = addSharhSubElement(edition, baseTopic.id, customEl);

  const merged = mergeLecturesWithEdition(LECTURES, edition);
  const mergedTopic = merged[0].topics[0];
  assert.equal(mergedTopic.matn?.text, 'نص متن مخصص للتجربة');
  assert.equal(mergedTopic.sharhElements[0].title, 'عنوان شرح مخصص');
  assert.equal(mergedTopic.sharhElements[0].conciseSummary, 'ملخص مركز مخصص');
  if (secondSharh) {
    assert.equal(
      mergedTopic.sharhElements.some((el) => el.id === secondSharh.id),
      false
    );
  }
  assert.equal(
    mergedTopic.sharhElements.some((el) => el.id === 'custom-el-1'),
    true
  );

  // Original data was NEVER mutated
  assert.notEqual(LECTURES[0].topics[0].matn?.text, 'نص متن مخصص للتجربة');

  // Restore Matn & deleted Sharh
  edition = restoreMatnOriginal(edition, baseTopic.id);
  if (secondSharh) {
    edition = restoreSharhSubElement(edition, baseTopic.id, secondSharh.id);
  }
  const restored = mergeLecturesWithEdition(LECTURES, edition)[0].topics[0];
  assert.equal(restored.matn?.text, baseTopic.matn?.text);
  if (secondSharh) {
    assert.equal(
      restored.sharhElements.some((el) => el.id === secondSharh.id),
      true
    );
  }
});

test('Question Bank edit, delete, add, and restore preserve canonical items', () => {
  const firstQ = QUESTION_BANK[0];
  let edition = createEmptyEdition('user_2', 'سلمان');

  edition = setQuestionOverride(edition, firstQ.id, {
    question: 'سؤال معدل؟',
  });
  edition = deleteCanonicalQuestion(edition, QUESTION_BANK[1].id);

  const customQ: QuestionBankItem = {
    id: 'custom-q-1',
    questionNumber: 112,
    question: 'ما هي علامة أهل السنة؟',
    answerBlocks: [{ type: 'paragraph', text: 'اتباع الكتاب والسنة بفهم السلف.' }],
    relatedLectureId: LECTURES[0].id,
    relatedTopicId: LECTURES[0].topics[0].id,
    topicBadge: 'مبحث مضاف',
  };
  edition = addCustomQuestion(edition, customQ);

  const merged = mergeQuestionBankWithEdition(QUESTION_BANK, edition);
  assert.equal(merged.find((q) => q.id === firstQ.id)?.question, 'سؤال معدل؟');
  assert.equal(
    merged.some((q) => q.id === QUESTION_BANK[1].id),
    false
  );
  assert.equal(
    merged.some((q) => q.id === 'custom-q-1'),
    true
  );
  assert.equal(countEditionChanges(edition).questionsAdded, 1);

  edition = restoreCanonicalQuestion(edition, QUESTION_BANK[1].id);
  const afterRestore = mergeQuestionBankWithEdition(QUESTION_BANK, edition);
  assert.equal(
    afterRestore.some((q) => q.id === QUESTION_BANK[1].id),
    true
  );
});

test('Offline draft persistence and pending-sync queue flush cleanly on reconnect', async () => {
  const storage = createMemoryStorage();
  let edition = createEmptyEdition('user_offline', 'خالد');
  edition = setMatnOverride(edition, LECTURES[0].topics[0].id, {
    title: 'متن محرر أوفلاين',
    text: 'نص محفوظ محلياً أثناء انقطاع الشبكة',
  });

  saveLocalDraft(storage, 'user_offline', edition);
  const loaded = loadLocalDraft(storage, 'user_offline');
  assert.equal(loaded?.displayName, 'خالد');
  assert.equal(
    loaded?.topicOverrides[LECTURES[0].topics[0].id]?.matnText,
    'نص محفوظ محلياً أثناء انقطاع الشبكة'
  );

  enqueuePendingSync(storage, 'user_offline', edition);
  assert.ok(getPendingSync(storage, 'user_offline'));

  // Simulate failed upload while still offline
  const failed = await flushPendingSync(storage, 'user_offline', async () => {
    throw new Error('Network unavailable');
  });
  assert.equal(failed.flushed, false);
  assert.ok(getPendingSync(storage, 'user_offline'));

  // Simulate reconnect and successful upload
  let uploadedName = '';
  const succeeded = await flushPendingSync(storage, 'user_offline', async (ed) => {
    uploadedName = ed.displayName;
  });
  assert.equal(succeeded.flushed, true);
  assert.equal(uploadedName, 'خالد');
  assert.equal(getPendingSync(storage, 'user_offline'), null);

  clearPendingSync(storage, 'user_offline');
});

test('Sanitization enforces blueprint bounds and guest draft merges cleanly into signed-in account', () => {
  let guest = createEmptyEdition('guest', 'محرر زائر');
  guest = addCustomQuestion(guest, {
    id: 'guest-q-1',
    questionNumber: 112,
    question: 'سؤال زائر',
    answerBlocks: [{ type: 'paragraph', text: 'جواب' }],
    relatedLectureId: LECTURES[0].id,
    relatedTopicId: LECTURES[0].topics[0].id,
    topicBadge: 'توحيد',
  });

  const remote = createEmptyEdition('uid_999', 'الأستاذ عمر');
  const merged = mergeGuestDraftIntoUserEdition(guest, remote, 'uid_999', 'الأستاذ عمر');
  assert.equal(merged.addedQuestions.length, 1);
  assert.equal(merged.displayName, 'الأستاذ عمر');

  const sanitized = sanitizeEditionForFirestore(
    {
      ...merged,
      displayName: '  ' + 'أ'.repeat(120),
      bio: 'ب'.repeat(300),
    },
    'uid_999'
  );
  assert.equal(sanitized.displayName.length, 80);
  assert.equal(sanitized.bio.length, 200);
  assert.equal(sanitized.uid, 'uid_999');
});
