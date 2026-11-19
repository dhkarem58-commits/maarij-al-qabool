/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AccountModal } from './components/AccountModal';
import { BookmarksView } from './components/BookmarksView';
import { ComparisonTablesView } from './components/ComparisonTablesView';
import { CorrectionsModal } from './components/CorrectionsModal';
import { EditBarBanner } from './components/EditBarBanner';
import { EvidencesIndexView } from './components/EvidencesIndexView';
import { Header } from './components/Header';
import { MindMapTreesView } from './components/MindMapTreesView';
import { PatternLegendBar } from './components/PatternLegendBar';
import { QaSection } from './components/QaSection';
import { QuestionBankView } from './components/QuestionBankView';
import { RichArabicText } from './components/RichArabicText';
import { SearchModal } from './components/SearchModal';
import { SidebarToc } from './components/SidebarToc';
import { TopicCard } from './components/TopicCard';
import { WorkspaceToolbar } from './components/WorkspaceToolbar';
import { LECTURES, QUESTION_BANK } from './data';
import {
  auth,
  fetchPublicEditionsList,
  loadEditionByUid,
  loadUserProfile,
  saveEditionToFirestore,
  signInWithGooglePopup,
  signOutUser,
  subscribeMyEdition,
  upsertUserProfile,
} from './firebase';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import type {
  ActiveTab,
  DisplayMode,
  QuestionBankItem,
  SharhDetailLevel,
  SharhPatternType,
  SharhSubElement,
} from './types/book';
import type { EditionViewMode, StudyEditionData } from './types/edition';
import {
  addCustomQuestion,
  addSharhSubElement,
  countEditionChanges,
  createEmptyEdition,
  deleteCanonicalQuestion,
  deleteSharhSubElement,
  EDITION_LIMITS,
  getDeletedQuestionIds,
  mergeGuestDraftIntoUserEdition,
  mergeLecturesWithEdition,
  mergeQuestionBankWithEdition,
  removeAddedSharhSubElement,
  removeCustomQuestion,
  restoreCanonicalQuestion,
  restoreMatnOriginal,
  restoreSharhSubElement,
  restoreTopicOriginal,
  setMatnOverride,
  setQuestionOverride,
  setSharhSubElementOverride,
  setTopicMetaOverride,
  updateAddedSharhSubElement,
  updateCustomQuestion,
} from './utils/editionOverrides';
import {
  clearLocalDraft,
  clearPendingSync,
  enqueuePendingSync,
  flushPendingSync,
  getBrowserStorage,
  getPendingSync,
  loadLocalDraft,
  saveLocalDraft,
} from './utils/offlineSyncQueue';
import { countTopicEvidences, toArabicIndicDigits } from './utils/studyHelpers';

const STORAGE_KEYS = {
  bookmarks: 'maarij_bookmarks_v1',
  darkMode: 'maarij_dark_mode_v1',
  displayMode: 'maarij_display_mode_v1',
  detailLevel: 'maarij_detail_level_v1',
  colorCoding: 'maarij_color_coding_v1',
  fontScale: 'maarij_font_scale_v1',
  activeLecture: 'maarij_active_lecture_v1',
  localAuthorName: 'maarij_local_author_name_v1',
  activeViewMode: 'maarij_active_view_mode_v1',
};

function readStoredString(key: string, fallback: string): string {
  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function readStoredBookmarks(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.bookmarks);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function readStoredViewMode(): EditionViewMode {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.activeViewMode);
    if (!raw) return { kind: 'original' };
    const parsed = JSON.parse(raw) as EditionViewMode;
    if (parsed.kind === 'mine') return { kind: 'mine' };
    if (parsed.kind === 'shared' && parsed.uid) return parsed;
    return { kind: 'original' };
  } catch {
    return { kind: 'original' };
  }
}

export default function App() {
  const isOnline = useOnlineStatus();
  const storage = useMemo(() => getBrowserStorage(), []);

  const [activeTab, setActiveTab] = useState<ActiveTab>('reader');
  const [activeLectureId, setActiveLectureId] = useState<string>(() => {
    const saved = readStoredString(STORAGE_KEYS.activeLecture, LECTURES[0].id);
    return LECTURES.some((l) => l.id === saved) ? saved : LECTURES[0].id;
  });
  const [activeTopicId, setActiveTopicId] = useState<string | undefined>(undefined);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    const saved = readStoredString(STORAGE_KEYS.displayMode, 'both');
    return saved === 'matn' || saved === 'sharh' || saved === 'both' ? saved : 'both';
  });
  const [detailLevel, setDetailLevel] = useState<SharhDetailLevel>(() => {
    const saved = readStoredString(STORAGE_KEYS.detailLevel, 'full');
    return saved === 'digest' ? 'digest' : 'full';
  });
  const [colorCodingEnabled, setColorCodingEnabled] = useState<boolean>(() => {
    const saved = readStoredString(STORAGE_KEYS.colorCoding, 'true');
    return saved !== 'false';
  });
  const [spotlightPattern, setSpotlightPattern] = useState<SharhPatternType | null>(
    null
  );
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const [fontScale, setFontScale] = useState<number>(() => {
    const raw = Number(readStoredString(STORAGE_KEYS.fontScale, '100'));
    return Number.isFinite(raw) && raw >= 85 && raw <= 135 ? raw : 100;
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return readStoredString(STORAGE_KEYS.darkMode, 'false') === 'true';
  });
  const [bookmarkedTopicIds, setBookmarkedTopicIds] = useState<string[]>(readStoredBookmarks);
  const [searchOpen, setSearchOpen] = useState(false);
  const [correctionsOpen, setCorrectionsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  // Auth, Editions & Edit Mode State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [localAuthorName, setLocalAuthorName] = useState<string>(() =>
    readStoredString(STORAGE_KEYS.localAuthorName, 'طالب علم')
  );
  const [viewMode, setViewMode] = useState<EditionViewMode>(readStoredViewMode);
  const [editMode, setEditMode] = useState(false);
  const [myEdition, setMyEdition] = useState<StudyEditionData>(() => {
    const savedGuest = loadLocalDraft(getBrowserStorage(), 'guest');
    return (
      savedGuest ||
      createEmptyEdition('guest', readStoredString(STORAGE_KEYS.localAuthorName, 'طالب علم'))
    );
  });
  const [lastCommittedEdition, setLastCommittedEdition] =
    useState<StudyEditionData>(myEdition);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [hasPendingSync, setHasPendingSync] = useState<boolean>(() =>
    Boolean(getPendingSync(getBrowserStorage(), 'guest'))
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const [sharedEdition, setSharedEdition] = useState<StudyEditionData | null>(null);
  const [publicEditions, setPublicEditions] = useState<StudyEditionData[]>([]);
  const [loadingPublicEditions, setLoadingPublicEditions] = useState(false);

  const myUnsubscribeRef = useRef<(() => void) | null>(null);

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem(STORAGE_KEYS.darkMode, String(darkMode));
    } catch {
      // ignore storage failures
    }
  }, [darkMode]);

  // Persist user preferences
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.displayMode, displayMode);
      window.localStorage.setItem(STORAGE_KEYS.detailLevel, detailLevel);
      window.localStorage.setItem(
        STORAGE_KEYS.colorCoding,
        String(colorCodingEnabled)
      );
      window.localStorage.setItem(STORAGE_KEYS.fontScale, String(fontScale));
      window.localStorage.setItem(STORAGE_KEYS.activeLecture, activeLectureId);
      window.localStorage.setItem(STORAGE_KEYS.localAuthorName, localAuthorName);
      window.localStorage.setItem(
        STORAGE_KEYS.activeViewMode,
        JSON.stringify(viewMode)
      );
    } catch {
      // ignore
    }
  }, [
    displayMode,
    detailLevel,
    colorCodingEnabled,
    fontScale,
    activeLectureId,
    localAuthorName,
    viewMode,
  ]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.bookmarks,
        JSON.stringify(bookmarkedTopicIds)
      );
    } catch {
      // ignore
    }
  }, [bookmarkedTopicIds]);

  // Global keyboard shortcut Cmd/Ctrl + K for Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load shared edition from URL ?edition=UID if present
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const sharedUid = params.get('edition');
    if (sharedUid && EDITION_LIMITS.uidPattern.test(sharedUid)) {
      loadEditionByUid(sharedUid)
        .then((ed) => {
          if (ed) {
            setSharedEdition(ed);
            setViewMode({
              kind: 'shared',
              uid: ed.uid,
              displayName: ed.displayName,
            });
          }
        })
        .catch(() => {
          // ignore invalid or private edition links silently
        });
    }
  }, []);

  // Load selected shared edition whenever viewMode switches to shared
  useEffect(() => {
    if (viewMode.kind === 'shared') {
      if (sharedEdition && sharedEdition.uid === viewMode.uid) return;
      loadEditionByUid(viewMode.uid)
        .then((ed) => {
          if (ed) setSharedEdition(ed);
        })
        .catch(() => {
          setViewMode({ kind: 'original' });
        });
    }
  }, [viewMode, sharedEdition]);

  // Firebase Auth listener & authenticated snapshot subscription
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setAuthReady(true);

      if (myUnsubscribeRef.current) {
        myUnsubscribeRef.current();
        myUnsubscribeRef.current = null;
      }

      if (!user) {
        const guestDraft = loadLocalDraft(storage, 'guest');
        const initialGuest =
          guestDraft || createEmptyEdition('guest', localAuthorName);
        setMyEdition(initialGuest);
        setLastCommittedEdition(initialGuest);
        setHasPendingSync(Boolean(getPendingSync(storage, 'guest')));
        return;
      }

      // Authenticated user: load profile + edition + merge any local offline guest edits
      const preferredName =
        localAuthorName !== 'طالب علم'
          ? localAuthorName
          : user.displayName || 'طالب علم';

      try {
        const [profile, remoteEd] = await Promise.all([
          loadUserProfile(user.uid).catch(() => null),
          loadEditionByUid(user.uid).catch(() => null),
        ]);

        const resolvedName =
          profile?.displayName || remoteEd?.displayName || preferredName;
        setLocalAuthorName(resolvedName);

        if (!profile) {
          await upsertUserProfile(user.uid, resolvedName).catch(() => {});
        }

        const localUserDraft = loadLocalDraft(storage, user.uid);
        const guestDraft = loadLocalDraft(storage, 'guest');

        let startingEdition =
          localUserDraft || remoteEd || createEmptyEdition(user.uid, resolvedName);
        if (guestDraft && countEditionChanges(guestDraft).total > 0) {
          startingEdition = mergeGuestDraftIntoUserEdition(
            guestDraft,
            startingEdition,
            user.uid,
            resolvedName
          );
          saveLocalDraft(storage, user.uid, startingEdition);
          enqueuePendingSync(storage, user.uid, startingEdition);
          clearLocalDraft(storage, 'guest');
        }

        setMyEdition(startingEdition);
        setLastCommittedEdition(startingEdition);
        setHasPendingSync(Boolean(getPendingSync(storage, user.uid)));

        // Flush queued edits if online
        if (navigator.onLine && getPendingSync(storage, user.uid)) {
          await flushPendingSync(storage, user.uid, (ed) =>
            saveEditionToFirestore(user.uid, ed)
          );
          setHasPendingSync(Boolean(getPendingSync(storage, user.uid)));
        }

        // Attach real-time listener for user's own edition ONLY while authenticated
        myUnsubscribeRef.current = subscribeMyEdition(
          user.uid,
          (snapshotEdition) => {
            if (!snapshotEdition) return;
            const pending = getPendingSync(storage, user.uid);
            if (pending) return; // Don't overwrite local pending offline edits
            setMyEdition((current) => {
              if (current.revision > snapshotEdition.revision) return current;
              saveLocalDraft(storage, user.uid, snapshotEdition);
              setLastCommittedEdition(snapshotEdition);
              return snapshotEdition;
            });
          },
          (err) => {
            console.error('Edition snapshot error:', err);
          }
        );
      } catch (err) {
        console.error('Error hydrating user account:', err);
      }
    });

    return () => {
      unsubAuth();
      if (myUnsubscribeRef.current) {
        myUnsubscribeRef.current();
      }
    };
  }, [storage]);

  // Automatic flush of offline queue as soon as internet reconnects
  useEffect(() => {
    if (!isOnline || !authReady || !firebaseUser) return;
    const pending = getPendingSync(storage, firebaseUser.uid);
    if (!pending) {
      setHasPendingSync(false);
      return;
    }

    let cancelled = false;
    setIsSyncing(true);
    flushPendingSync(storage, firebaseUser.uid, (ed) =>
      saveEditionToFirestore(firebaseUser.uid, ed)
    )
      .then((res) => {
        if (cancelled) return;
        setHasPendingSync(Boolean(getPendingSync(storage, firebaseUser.uid)));
        if (res.flushed) {
          setSyncFeedback('تم تفعيل ومزامنة تعديلاتك تلقائياً بعد عودة الإنترنت');
          setTimeout(() => setSyncFeedback(null), 4000);
        }
      })
      .finally(() => {
        if (!cancelled) setIsSyncing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOnline, authReady, firebaseUser, storage]);

  const activeOwnerKey = firebaseUser ? firebaseUser.uid : 'guest';

  // Helper to update working edition & persist local draft immediately
  const mutateMyEdition = useCallback(
    (updater: (prev: StudyEditionData) => StudyEditionData) => {
      setMyEdition((prev) => {
        const next = updater(prev);
        saveLocalDraft(storage, activeOwnerKey, next);
        return next;
      });
      setHasUnsavedChanges(true);
      setSyncFeedback(null);
    },
    [storage, activeOwnerKey]
  );

  const handleSaveAndSync = useCallback(async () => {
    saveLocalDraft(storage, activeOwnerKey, myEdition);

    if (!firebaseUser || !isOnline) {
      enqueuePendingSync(storage, activeOwnerKey, myEdition);
      setHasPendingSync(true);
      setLastCommittedEdition(myEdition);
      setHasUnsavedChanges(false);
      setSyncFeedback(
        !isOnline
          ? 'تم الحفظ محلياً (سيتم التفعيل تلقائياً عند الاتصال بالإنترنت)'
          : 'تم الحفظ في مسودتك المحلية (سجّل دخولك للمزامنة السحابية)'
      );
      setTimeout(() => setSyncFeedback(null), 4000);
      return;
    }

    setIsSyncing(true);
    try {
      await saveEditionToFirestore(firebaseUser.uid, myEdition);
      clearPendingSync(storage, firebaseUser.uid);
      setHasPendingSync(false);
      setLastCommittedEdition(myEdition);
      setHasUnsavedChanges(false);
      setSyncFeedback('تم حفظ التعديلات ومزامنتها في حسابك');
      setTimeout(() => setSyncFeedback(null), 3200);
    } catch {
      enqueuePendingSync(storage, firebaseUser.uid, myEdition);
      setHasPendingSync(true);
      setLastCommittedEdition(myEdition);
      setHasUnsavedChanges(false);
      setSyncFeedback('تعذر الاتصال بالخادم — حُفظت التعديلات في قائمة الانتظار المحلية');
      setTimeout(() => setSyncFeedback(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  }, [storage, activeOwnerKey, myEdition, firebaseUser, isOnline]);

  const handleDiscardUnsaved = () => {
    setMyEdition(lastCommittedEdition);
    saveLocalDraft(storage, activeOwnerKey, lastCommittedEdition);
    setHasUnsavedChanges(false);
  };

  const handleToggleEditMode = () => {
    if (!editMode) {
      if (viewMode.kind !== 'mine') {
        setViewMode({ kind: 'mine' });
      }
      setEditMode(true);
    } else {
      setEditMode(false);
    }
  };

  const handleRefreshPublicEditions = useCallback(async () => {
    if (!isOnline) return;
    setLoadingPublicEditions(true);
    try {
      const list = await fetchPublicEditionsList();
      setPublicEditions(list);
    } catch {
      // ignore if offline/unavailable
    } finally {
      setLoadingPublicEditions(false);
    }
  }, [isOnline]);

  const handleSignInGoogle = async (preferredName: string) => {
    setAuthLoading(true);
    try {
      if (preferredName.trim()) {
        setLocalAuthorName(
          preferredName.trim().slice(0, EDITION_LIMITS.displayNameMaxLength)
        );
      }
      await signInWithGooglePopup();
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setEditMode(false);
    setViewMode({ kind: 'original' });
  };

  const handleSaveProfileSettings = async (settings: {
    displayName: string;
    bio: string;
    isPublic: boolean;
  }) => {
    setLocalAuthorName(settings.displayName);
    const updatedEdition: StudyEditionData = {
      ...myEdition,
      displayName: settings.displayName,
      bio: settings.bio,
      isPublic: settings.isPublic,
      updatedAtMs: Date.now(),
    };
    setMyEdition(updatedEdition);
    setLastCommittedEdition(updatedEdition);
    saveLocalDraft(storage, activeOwnerKey, updatedEdition);

    if (firebaseUser && isOnline) {
      await Promise.all([
        upsertUserProfile(firebaseUser.uid, settings.displayName),
        saveEditionToFirestore(firebaseUser.uid, updatedEdition),
      ]);
      if (settings.isPublic) {
        await handleRefreshPublicEditions();
      }
    } else {
      enqueuePendingSync(storage, activeOwnerKey, updatedEdition);
      setHasPendingSync(true);
    }
  };

  const handleForkSharedEdition = (shared: StudyEditionData) => {
    const cloned: StudyEditionData = {
      ...shared,
      uid: activeOwnerKey,
      displayName: myEdition.displayName || localAuthorName,
      isPublic: myEdition.isPublic,
      revision: myEdition.revision + 1,
      updatedAtMs: Date.now(),
    };
    setMyEdition(cloned);
    saveLocalDraft(storage, activeOwnerKey, cloned);
    enqueuePendingSync(storage, activeOwnerKey, cloned);
    setHasPendingSync(true);
    setViewMode({ kind: 'mine' });
    setEditMode(true);
  };

  const handleResetMyEdition = () => {
    const fresh = createEmptyEdition(
      activeOwnerKey,
      myEdition.displayName || localAuthorName
    );
    fresh.bio = myEdition.bio;
    fresh.isPublic = myEdition.isPublic;
    fresh.revision = myEdition.revision + 1;
    setMyEdition(fresh);
    saveLocalDraft(storage, activeOwnerKey, fresh);
    setHasUnsavedChanges(true);
  };

  // Compute active edition & merged Lectures / Question Bank
  const activeEdition = useMemo<StudyEditionData | null>(() => {
    if (viewMode.kind === 'original') return null;
    if (viewMode.kind === 'mine') return myEdition;
    return sharedEdition;
  }, [viewMode, myEdition, sharedEdition]);

  const displayedLectures = useMemo(
    () => mergeLecturesWithEdition(LECTURES, activeEdition),
    [activeEdition]
  );

  const displayedQuestions = useMemo(
    () => mergeQuestionBankWithEdition(QUESTION_BANK, activeEdition),
    [activeEdition]
  );

  const modifiedQuestionIds = useMemo(() => {
    const map: Record<string, boolean> = {};
    if (activeEdition?.questionOverrides) {
      for (const id of Object.keys(activeEdition.questionOverrides)) {
        map[id] = true;
      }
    }
    return map;
  }, [activeEdition]);

  const customQuestionIds = useMemo(() => {
    const map: Record<string, boolean> = {};
    if (activeEdition?.addedQuestions) {
      for (const q of activeEdition.addedQuestions) {
        map[q.id] = true;
      }
    }
    return map;
  }, [activeEdition]);

  const deletedQuestionIds = useMemo(
    () => getDeletedQuestionIds(activeEdition),
    [activeEdition]
  );

  const nextQuestionNumber = useMemo(() => {
    return (
      displayedQuestions.reduce((max, q) => Math.max(max, q.questionNumber), 111) + 1
    );
  }, [displayedQuestions]);

  const currentLectureIndex = useMemo(
    () => Math.max(0, displayedLectures.findIndex((l) => l.id === activeLectureId)),
    [displayedLectures, activeLectureId]
  );
  const currentLecture = displayedLectures[currentLectureIndex] || displayedLectures[0];
  const canonicalLecture = LECTURES[currentLectureIndex] || LECTURES[0];
  const prevLecture =
    currentLectureIndex > 0 ? displayedLectures[currentLectureIndex - 1] : null;
  const nextLecture =
    currentLectureIndex < displayedLectures.length - 1
      ? displayedLectures[currentLectureIndex + 1]
      : null;

  const toggleBookmark = (topicId: string) => {
    setBookmarkedTopicIds((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const handleSelectLecture = (lectureId: string) => {
    setActiveLectureId(lectureId);
    setActiveTopicId(undefined);
    setActiveTab('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToTopic = (lectureId: string, topicId: string) => {
    setActiveLectureId(lectureId);
    setActiveTopicId(topicId);
    setActiveTab('reader');
    setTimeout(() => {
      const target = document.getElementById(topicId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  const handleOpenTree = (treeId: string) => {
    setSelectedTreeId(treeId);
    setActiveTab('trees');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Topic & Question Editing Handlers
  const handleSaveTopicMeta = (topicId: string, title: string, summary: string) => {
    mutateMyEdition((ed) => setTopicMetaOverride(ed, topicId, { title, summary }));
  };

  const handleSaveMatn = (topicId: string, title: string, text: string) => {
    mutateMyEdition((ed) => setMatnOverride(ed, topicId, { title, text }));
  };

  const handleDeleteMatn = (topicId: string) => {
    mutateMyEdition((ed) => setMatnOverride(ed, topicId, { deleted: true }));
  };

  const handleRestoreMatn = (topicId: string) => {
    mutateMyEdition((ed) => restoreMatnOriginal(ed, topicId));
  };

  const handleSaveSharhElement = (
    topicId: string,
    subElement: SharhSubElement,
    isCustom: boolean
  ) => {
    mutateMyEdition((ed) =>
      isCustom
        ? updateAddedSharhSubElement(ed, topicId, subElement.id, subElement)
        : setSharhSubElementOverride(ed, topicId, subElement.id, {
            orderLabel: subElement.orderLabel,
            title: subElement.title,
            conciseSummary: subElement.conciseSummary,
            paragraphs: subElement.paragraphs,
            highlightedQuote: subElement.highlightedQuote ?? null,
            bulletItems: subElement.bulletItems,
          })
    );
  };

  const handleDeleteSharhElement = (
    topicId: string,
    subElementId: string,
    isCustom: boolean
  ) => {
    mutateMyEdition((ed) =>
      isCustom
        ? removeAddedSharhSubElement(ed, topicId, subElementId)
        : deleteSharhSubElement(ed, topicId, subElementId)
    );
  };

  const handleRestoreSharhElement = (topicId: string, subElementId: string) => {
    mutateMyEdition((ed) => restoreSharhSubElement(ed, topicId, subElementId));
  };

  const handleAddSharhElement = (topicId: string, newElement: SharhSubElement) => {
    mutateMyEdition((ed) => addSharhSubElement(ed, topicId, newElement));
  };

  const handleRestoreTopic = (topicId: string) => {
    mutateMyEdition((ed) => restoreTopicOriginal(ed, topicId));
  };

  const handleSaveQuestion = (item: QuestionBankItem, isCustom: boolean) => {
    mutateMyEdition((ed) =>
      isCustom
        ? updateCustomQuestion(ed, item.id, item)
        : setQuestionOverride(ed, item.id, {
            questionNumber: item.questionNumber,
            question: item.question,
            topicBadge: item.topicBadge,
            relatedLectureId: item.relatedLectureId,
            relatedTopicId: item.relatedTopicId,
            answerBlocks: item.answerBlocks,
          })
    );
  };

  const handleDeleteQuestion = (questionId: string, isCustom: boolean) => {
    mutateMyEdition((ed) =>
      isCustom
        ? removeCustomQuestion(ed, questionId)
        : deleteCanonicalQuestion(ed, questionId)
    );
  };

  const handleRestoreQuestion = (questionId: string) => {
    mutateMyEdition((ed) => restoreCanonicalQuestion(ed, questionId));
  };

  const handleAddQuestion = (item: QuestionBankItem) => {
    mutateMyEdition((ed) => addCustomQuestion(ed, item));
  };

  const showPatternLegend =
    colorCodingEnabled &&
    (activeTab === 'reader' || activeTab === 'qbank' || activeTab === 'trees');

  const isEditingAllowed =
    editMode && viewMode.kind === 'mine';
  const myChangesStats = countEditionChanges(myEdition);
  const authorDisplayName = myEdition.displayName || localAuthorName;

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#FAF7F2] text-[#1F1D1A] dark:bg-[#141210] dark:text-[#EFECE6]"
    >
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAccount={() => setAccountOpen(true)}
        bookmarksCount={bookmarkedTopicIds.length}
        viewMode={viewMode}
        authorDisplayName={authorDisplayName}
        isSignedIn={Boolean(firebaseUser)}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <WorkspaceToolbar
          displayMode={displayMode}
          onDisplayModeChange={setDisplayMode}
          detailLevel={detailLevel}
          onDetailLevelChange={setDetailLevel}
          colorCodingEnabled={colorCodingEnabled}
          onToggleColorCoding={() => {
            setColorCodingEnabled((prev) => !prev);
            setSpotlightPattern(null);
          }}
          fontScale={fontScale}
          onFontScaleChange={setFontScale}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((d) => !d)}
          onOpenCorrections={() => setCorrectionsOpen(true)}
          showTocToggle={activeTab === 'reader'}
          showReaderControls={activeTab === 'reader'}
          onOpenMobileToc={() => setMobileTocOpen(true)}
          showEditToggle={activeTab === 'reader' || activeTab === 'qbank'}
          editMode={isEditingAllowed}
          onToggleEditMode={handleToggleEditMode}
        />

        <EditBarBanner
          editMode={isEditingAllowed}
          viewMode={viewMode}
          authorDisplayName={authorDisplayName}
          isOnline={isOnline}
          isSignedIn={Boolean(firebaseUser)}
          hasUnsavedChanges={hasUnsavedChanges}
          hasPendingSync={hasPendingSync}
          isSyncing={isSyncing}
          syncFeedback={syncFeedback}
          changesCount={myChangesStats.total}
          onSaveAndSync={handleSaveAndSync}
          onDiscardUnsaved={handleDiscardUnsaved}
          onExitEditMode={() => setEditMode(false)}
          onSwitchToOriginal={() => {
            setEditMode(false);
            setViewMode({ kind: 'original' });
          }}
          onSwitchToMineAndEdit={() => {
            setViewMode({ kind: 'mine' });
            setEditMode(true);
          }}
          onOpenAccount={() => setAccountOpen(true)}
        />

        {showPatternLegend && (
          <PatternLegendBar
            spotlightPattern={spotlightPattern}
            onSelectPattern={setSpotlightPattern}
          />
        )}

        {activeTab === 'reader' && (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <SidebarToc
              lectures={displayedLectures}
              activeLectureId={currentLecture.id}
              activeTopicId={activeTopicId}
              onSelectLecture={handleSelectLecture}
              onSelectTopic={handleNavigateToTopic}
              mobileOpen={mobileTocOpen}
              onCloseMobile={() => setMobileTocOpen(false)}
            />

            <div className="min-w-0 flex-1 space-y-6">
              {/* Lecture Hero Header */}
              <section
                aria-label="رأس المحاضرة"
                className="rounded-xl border border-[#E6DFD3] bg-[#FFFFFF] p-5 shadow-xs sm:p-7 dark:border-[#2E2924] dark:bg-[#1D1A17]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#8B5E34] dark:text-[#C48F5A]">
                  <span>{currentLecture.arabicOrdinal}</span>
                  <span className="tabular-nums">
                    {currentLecture.pageRange} •{' '}
                    {toArabicIndicDigits(currentLecture.topics.length)} عناصر •{' '}
                    {toArabicIndicDigits(countTopicEvidences(currentLecture))} دليلاً
                  </span>
                </div>

                <h1 className="mt-2 font-heading text-3xl font-bold leading-snug text-[#1B4D3E] sm:text-4xl dark:text-[#4BA388]">
                  {currentLecture.title}
                </h1>

                <p className="mt-2 text-sm leading-relaxed text-[#5E584F] sm:text-base dark:text-[#A8A095]">
                  {currentLecture.subtitle}
                </p>

                {currentLecture.openingInvocation && (
                  <div className="mt-4 rounded-lg border border-[#D4C49A]/80 bg-[#F5EFE0]/60 px-4 py-3 font-matn text-base leading-relaxed text-[#1F1D1A] dark:border-[#443828] dark:bg-[#1E1A15]/70 dark:text-[#EFECE6]">
                    <RichArabicText
                      text={currentLecture.openingInvocation}
                      variant="plainWithQuran"
                      colorCodingEnabled={colorCodingEnabled}
                    />
                  </div>
                )}
              </section>

              {/* Topics List */}
              {currentLecture.topics.map((topic) => {
                const canonicalTopic =
                  canonicalLecture.topics.find((t) => t.id === topic.id) || topic;
                return (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    lectureId={currentLecture.id}
                    lectures={displayedLectures}
                    allQuestions={displayedQuestions}
                    canonicalSharhElements={canonicalTopic.sharhElements}
                    hasCanonicalMatn={Boolean(canonicalTopic.matn)}
                    topicOverride={activeEdition?.topicOverrides?.[topic.id]}
                    displayMode={displayMode}
                    detailLevel={detailLevel}
                    colorCodingEnabled={colorCodingEnabled}
                    spotlightPattern={spotlightPattern}
                    fontScale={fontScale}
                    isBookmarked={bookmarkedTopicIds.includes(topic.id)}
                    editMode={isEditingAllowed}
                    modifiedQuestionIds={modifiedQuestionIds}
                    customQuestionIds={customQuestionIds}
                    nextQuestionNumber={nextQuestionNumber}
                    onToggleBookmark={toggleBookmark}
                    onOpenTree={handleOpenTree}
                    onSaveTopicMeta={handleSaveTopicMeta}
                    onSaveMatn={handleSaveMatn}
                    onDeleteMatn={handleDeleteMatn}
                    onRestoreMatn={handleRestoreMatn}
                    onSaveSharhElement={handleSaveSharhElement}
                    onDeleteSharhElement={handleDeleteSharhElement}
                    onRestoreSharhElement={handleRestoreSharhElement}
                    onAddSharhElement={handleAddSharhElement}
                    onRestoreTopic={handleRestoreTopic}
                    onSaveQuestion={handleSaveQuestion}
                    onDeleteQuestion={handleDeleteQuestion}
                    onRestoreQuestion={handleRestoreQuestion}
                    onAddQuestion={handleAddQuestion}
                  />
                );
              })}

              {/* Q&A Section (Hidden when viewing Matn Only) */}
              {displayMode !== 'matn' &&
                currentLecture.qaItems &&
                currentLecture.qaItems.length > 0 && (
                  <QaSection
                    lectureId={currentLecture.id}
                    title={currentLecture.qaSectionTitle}
                    items={currentLecture.qaItems}
                    fontScale={fontScale}
                    colorCodingEnabled={colorCodingEnabled}
                    spotlightPattern={spotlightPattern}
                  />
                )}

              {currentLecture.closingNote && (
                <div className="rounded-lg border border-[#E6DFD3] bg-[#FFFFFF] px-5 py-3.5 text-center text-sm font-medium text-[#5E584F] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#A8A095]">
                  {currentLecture.closingNote}
                </div>
              )}

              {/* Prev / Next Lecture Navigation */}
              <nav
                aria-label="التنقل بين المحاضرات"
                className="flex flex-wrap items-center justify-between gap-3 pt-2"
              >
                {prevLecture ? (
                  <button
                    type="button"
                    onClick={() => handleSelectLecture(prevLecture.id)}
                    className="flex items-center gap-2 rounded-lg border border-[#E6DFD3] bg-[#FFFFFF] px-4 py-3 text-right hover:border-[#1B4D3E] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:hover:border-[#4BA388]"
                  >
                    <ChevronRight className="h-4 w-4 text-[#1B4D3E] dark:text-[#4BA388]" aria-hidden="true" />
                    <div>
                      <div className="text-xs text-[#5E584F] dark:text-[#A8A095]">
                        المحاضرة السابقة
                      </div>
                      <div className="text-sm font-bold text-[#1F1D1A] dark:text-[#EFECE6]">
                        {prevLecture.arabicOrdinal}
                      </div>
                    </div>
                  </button>
                ) : (
                  <div />
                )}

                {nextLecture && (
                  <button
                    type="button"
                    onClick={() => handleSelectLecture(nextLecture.id)}
                    className="flex items-center gap-2 rounded-lg border border-[#E6DFD3] bg-[#FFFFFF] px-4 py-3 text-left hover:border-[#1B4D3E] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:hover:border-[#4BA388]"
                  >
                    <div>
                      <div className="text-xs text-[#5E584F] dark:text-[#A8A095]">
                        المحاضرة التالية
                      </div>
                      <div className="text-sm font-bold text-[#1F1D1A] dark:text-[#EFECE6]">
                        {nextLecture.arabicOrdinal}
                      </div>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-[#1B4D3E] dark:text-[#4BA388]" aria-hidden="true" />
                  </button>
                )}
              </nav>
            </div>
          </div>
        )}

        {activeTab === 'trees' && (
          <MindMapTreesView
            key={selectedTreeId || 'default-tree'}
            onNavigateToTopic={handleNavigateToTopic}
            colorCodingEnabled={colorCodingEnabled}
            initialTreeId={selectedTreeId}
          />
        )}

        {activeTab === 'qbank' && (
          <QuestionBankView
            questions={displayedQuestions}
            canonicalQuestions={QUESTION_BANK}
            lectures={displayedLectures}
            colorCodingEnabled={colorCodingEnabled}
            onNavigateToTopic={handleNavigateToTopic}
            onOpenTree={handleOpenTree}
            editMode={isEditingAllowed}
            modifiedQuestionIds={modifiedQuestionIds}
            customQuestionIds={customQuestionIds}
            deletedQuestionIds={deletedQuestionIds}
            onSaveQuestion={handleSaveQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onRestoreQuestion={handleRestoreQuestion}
            onAddQuestion={handleAddQuestion}
          />
        )}

        {activeTab === 'evidences' && (
          <EvidencesIndexView
            lectures={displayedLectures}
            colorCodingEnabled={colorCodingEnabled}
            onNavigateToTopic={handleNavigateToTopic}
          />
        )}

        {activeTab === 'comparisons' && (
          <ComparisonTablesView colorCodingEnabled={colorCodingEnabled} />
        )}

        {activeTab === 'bookmarks' && (
          <BookmarksView
            lectures={displayedLectures}
            bookmarkedTopicIds={bookmarkedTopicIds}
            onToggleBookmark={toggleBookmark}
            onNavigateToTopic={handleNavigateToTopic}
          />
        )}
      </main>

      <SearchModal
        open={searchOpen}
        lectures={displayedLectures}
        onClose={() => setSearchOpen(false)}
        onSelectResult={handleNavigateToTopic}
      />

      <CorrectionsModal
        open={correctionsOpen}
        onClose={() => setCorrectionsOpen(false)}
      />

      <AccountModal
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        firebaseUser={firebaseUser}
        authLoading={authLoading}
        isOnline={isOnline}
        localDisplayName={localAuthorName}
        myEdition={myEdition}
        viewMode={viewMode}
        publicEditions={publicEditions}
        loadingPublicEditions={loadingPublicEditions}
        hasPendingSync={hasPendingSync}
        onSignInGoogle={handleSignInGoogle}
        onSignOut={handleSignOut}
        onSaveProfileSettings={handleSaveProfileSettings}
        onSelectViewMode={(mode) => {
          setViewMode(mode);
          if (mode.kind !== 'mine') {
            setEditMode(false);
          }
        }}
        onRefreshPublicEditions={handleRefreshPublicEditions}
        onForkSharedEdition={handleForkSharedEdition}
        onResetMyEdition={handleResetMyEdition}
      />
    </div>
  );
}
