import { useEffect, useState } from 'react';
import {
  BookOpen,
  Check,
  Copy,
  Globe,
  Lock,
  LogIn,
  LogOut,
  RefreshCw,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { EditionViewMode, StudyEditionData } from '../types/edition';
import { countEditionChanges, EDITION_LIMITS } from '../utils/editionOverrides';
import { toArabicIndicDigits } from '../utils/studyHelpers';

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
  firebaseUser: User | null;
  authLoading: boolean;
  isOnline: boolean;
  localDisplayName: string;
  myEdition: StudyEditionData;
  viewMode: EditionViewMode;
  publicEditions: StudyEditionData[];
  loadingPublicEditions: boolean;
  hasPendingSync: boolean;
  onSignInGoogle: (preferredName: string) => Promise<void>;
  onSignOut: () => Promise<void>;
  onSaveProfileSettings: (settings: {
    displayName: string;
    bio: string;
    isPublic: boolean;
  }) => Promise<void>;
  onSelectViewMode: (mode: EditionViewMode) => void;
  onRefreshPublicEditions: () => Promise<void>;
  onForkSharedEdition: (shared: StudyEditionData) => void;
  onResetMyEdition: () => void;
}

export function AccountModal({
  open,
  onClose,
  firebaseUser,
  authLoading,
  isOnline,
  localDisplayName,
  myEdition,
  viewMode,
  publicEditions,
  loadingPublicEditions,
  hasPendingSync,
  onSignInGoogle,
  onSignOut,
  onSaveProfileSettings,
  onSelectViewMode,
  onRefreshPublicEditions,
  onForkSharedEdition,
  onResetMyEdition,
}: AccountModalProps) {
  const [nameInput, setNameInput] = useState(
    myEdition.displayName || localDisplayName
  );
  const [bioInput, setBioInput] = useState(myEdition.bio || '');
  const [isPublicInput, setIsPublicInput] = useState(myEdition.isPublic);
  const [saving, setSaving] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (open) {
      setNameInput(myEdition.displayName || localDisplayName);
      setBioInput(myEdition.bio || '');
      setIsPublicInput(myEdition.isPublic);
      setAuthError(null);
      setSavedFeedback(false);
      if (isOnline) {
        void onRefreshPublicEditions();
      }
    }
  }, [open, myEdition.displayName, myEdition.bio, myEdition.isPublic, localDisplayName, isOnline]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const myStats = countEditionChanges(myEdition);
  const shareUrl =
    typeof window !== 'undefined' && firebaseUser
      ? `${window.location.origin}/?edition=${firebaseUser.uid}`
      : '';

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput
      .trim()
      .slice(0, EDITION_LIMITS.displayNameMaxLength);
    if (!trimmed) {
      setAuthError('يرجى كتابة الاسم الذي يظهر على نسختك.');
      return;
    }
    setSaving(true);
    setAuthError(null);
    try {
      await onSaveProfileSettings({
        displayName: trimmed,
        bio: bioInput.trim().slice(0, EDITION_LIMITS.bioMaxLength),
        isPublic: isPublicInput,
      });
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2200);
    } catch {
      setAuthError('تعذر تحديث الإعدادات في السحابة حالياً، وتم حفظها محلياً.');
    } finally {
      setSaving(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      await onSignInGoogle(nameInput.trim() || localDisplayName);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('popup-closed-by-user')) {
        setAuthError('تم إغلاق نافذة تسجيل الدخول قبل إكمالها.');
      } else {
        setAuthError('تعذر تسجيل الدخول حالياً. تأكد من الاتصال بالإنترنت والسماح بالنوافذ المنبثقة.');
      }
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 sm:pt-14"
      role="dialog"
      aria-modal="true"
      aria-label="حسابي ونسخ المذكرة"
      data-testid="account-modal"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[#E6DFD3] bg-[#FFFFFF] shadow-2xl dark:border-[#2E2924] dark:bg-[#1D1A17]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6DFD3] bg-[#FAF7F2] px-5 py-4 dark:border-[#2E2924] dark:bg-[#141210]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D4C49A] bg-[#F5EFE0] text-[#1B4D3E] dark:border-[#443828] dark:bg-[#1E1A15] dark:text-[#4BA388]">
              <UserIcon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-heading text-2xl font-bold text-[#1F1D1A] dark:text-[#EFECE6]">
                الحساب الشخصي ونسخ المذكرة
              </h2>
              <p className="text-xs text-[#5E584F] dark:text-[#A8A095]">
                سجّل باسمك لتحرير نسختك الخاصة ومزامنتها عبر جميع أجهزتك ومشاركتها مع الآخرين.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق نافذة الحساب"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E6DFD3] bg-[#FFFFFF] text-[#5E584F] hover:text-[#1F1D1A] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#A8A095]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {/* Section 1: Edition Switcher */}
          <section aria-label="تبديل النسخة المعروضة" className="space-y-3">
            <h3 className="font-heading text-lg font-bold text-[#1B4D3E] dark:text-[#4BA388]">
              ١. اختيار النسخة المعروضة في المذكرة
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                data-testid="select-original-edition"
                onClick={() => {
                  onSelectViewMode({ kind: 'original' });
                  onClose();
                }}
                className={`flex flex-col items-start rounded-lg border p-3.5 text-right ${
                  viewMode.kind === 'original'
                    ? 'border-[#1B4D3E] bg-[#1B4D3E]/10 dark:border-[#4BA388] dark:bg-[#4BA388]/15'
                    : 'border-[#E6DFD3] bg-[#FAF7F2] hover:border-[#8B5E34] dark:border-[#2E2924] dark:bg-[#141210]'
                }`}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1F1D1A] dark:text-[#EFECE6]">
                    <BookOpen className="h-4 w-4 text-[#1B4D3E] dark:text-[#4BA388]" aria-hidden="true" />
                    النسخة الأصلية المحققة
                  </span>
                  {viewMode.kind === 'original' && (
                    <Check className="h-4 w-4 text-[#1B4D3E] dark:text-[#4BA388]" aria-hidden="true" />
                  )}
                </div>
                <span className="mt-1 text-xs leading-relaxed text-[#5E584F] dark:text-[#A8A095]">
                  النص الأصلي الكامل للمذكرة وبنك الأسئلة دون أي تغيير أو حذف.
                </span>
              </button>

              <button
                type="button"
                data-testid="select-my-edition"
                onClick={() => {
                  onSelectViewMode({ kind: 'mine' });
                  onClose();
                }}
                className={`flex flex-col items-start rounded-lg border p-3.5 text-right ${
                  viewMode.kind === 'mine'
                    ? 'border-[#8B5E34] bg-[#F5EFE0] dark:border-[#C48F5A] dark:bg-[#1E1A15]'
                    : 'border-[#E6DFD3] bg-[#FAF7F2] hover:border-[#8B5E34] dark:border-[#2E2924] dark:bg-[#141210]'
                }`}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1F1D1A] dark:text-[#EFECE6]">
                    <UserIcon className="h-4 w-4 text-[#8B5E34] dark:text-[#C48F5A]" aria-hidden="true" />
                    نسختي: {myEdition.displayName || localDisplayName}
                  </span>
                  {viewMode.kind === 'mine' && (
                    <Check className="h-4 w-4 text-[#8B5E34] dark:text-[#C48F5A]" aria-hidden="true" />
                  )}
                </div>
                <span className="mt-1 text-xs leading-relaxed text-[#5E584F] dark:text-[#A8A095]">
                  {myStats.total > 0
                    ? `${toArabicIndicDigits(myStats.total)} تعديلاً وإضافةً محفوظة في حسابك.`
                    : 'تعديلاتك وإضافاتك الخاصة تظهر هنا مع بقاء الأصل محفوظاً.'}
                </span>
              </button>
            </div>
          </section>

          {/* Section 2: Sign-in & Author Settings */}
          <section
            aria-label="إعدادات الحساب والاسم"
            className="space-y-4 rounded-xl border border-[#E6DFD3] bg-[#FAF7F2]/70 p-4 dark:border-[#2E2924] dark:bg-[#141210]/70"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-heading text-lg font-bold text-[#1F1D1A] dark:text-[#EFECE6]">
                ٢. الاسم الشخصي ومزامنة الحساب بين الأجهزة
              </h3>
              {firebaseUser ? (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="inline-flex items-center gap-1.5 rounded border border-[#E6DFD3] bg-[#FFFFFF] px-2.5 py-1 text-xs font-semibold text-[#5E584F] hover:text-red-700 dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#A8A095]"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>تسجيل الخروج</span>
                </button>
              ) : null}
            </div>

            {!firebaseUser && (
              <div className="rounded-lg border border-[#D4C49A] bg-[#F5EFE0]/70 p-3.5 text-xs leading-relaxed text-[#5E584F] dark:border-[#443828] dark:bg-[#1E1A15]/70 dark:text-[#A8A095]">
                <p className="font-semibold text-[#1F1D1A] dark:text-[#EFECE6]">
                  يمكنك التحرير بالاسم فوراً حتى دون اتصال بالإنترنت:
                </p>
                <p className="mt-1">
                  لتصل إلى تعديلاتك من أي جهاز آخر وتعرض نسختك للآخرين باسمك، اربط اسمك بتسجيل الدخول عبر حساب Google.
                </p>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={authLoading || !isOnline}
                  data-testid="google-signin-btn"
                  className="mt-3 inline-flex items-center gap-2 rounded-md bg-[#1B4D3E] px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50 dark:bg-[#4BA388] dark:text-[#141210]"
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {isOnline
                      ? 'تسجيل الدخول بحساب Google للمزامنة والمشاركة'
                      : 'يتطلب تسجيل الدخول الاتصال بالإنترنت (تعمل المسودة محلياً الآن)'}
                  </span>
                </button>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-3">
              <div>
                <label
                  htmlFor="author-display-name"
                  className="mb-1 block text-xs font-bold text-[#1F1D1A] dark:text-[#EFECE6]"
                >
                  الاسم المعروض في المذكرة:
                </label>
                <input
                  id="author-display-name"
                  data-testid="author-display-name-input"
                  type="text"
                  maxLength={EDITION_LIMITS.displayNameMaxLength}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="مثال: الشيخ عبد الرحمن / طالب علم..."
                  className="w-full rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-3 py-2 text-sm text-[#1F1D1A] focus:border-[#1B4D3E] focus:outline-none dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#EFECE6]"
                />
              </div>

              <div>
                <label
                  htmlFor="author-bio"
                  className="mb-1 block text-xs font-bold text-[#1F1D1A] dark:text-[#EFECE6]"
                >
                  وصف مختصر لنسختك (اختياري):
                </label>
                <input
                  id="author-bio"
                  type="text"
                  maxLength={EDITION_LIMITS.bioMaxLength}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="مثال: اختصارات وفوائد مضافة للمراجعة النهائية..."
                  className="w-full rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-3 py-2 text-sm text-[#1F1D1A] focus:border-[#1B4D3E] focus:outline-none dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#EFECE6]"
                />
              </div>

              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-[#E6DFD3] bg-[#FFFFFF] p-3 dark:border-[#2E2924] dark:bg-[#1D1A17]">
                <div className="flex items-center gap-2.5">
                  {isPublicInput ? (
                    <Globe className="h-4 w-4 text-[#1B4D3E] dark:text-[#4BA388]" aria-hidden="true" />
                  ) : (
                    <Lock className="h-4 w-4 text-[#8B5E34] dark:text-[#C48F5A]" aria-hidden="true" />
                  )}
                  <div>
                    <div className="text-xs font-bold text-[#1F1D1A] dark:text-[#EFECE6]">
                      عرض نسختي للآخرين (نشر عام)
                    </div>
                    <div className="text-[11px] text-[#5E584F] dark:text-[#A8A095]">
                      عند التفعيل يمكن لأي مستخدم تصفح نسختك باسمك دون أن يغيّر فيها.
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isPublicInput}
                  onChange={(e) => setIsPublicInput(e.target.checked)}
                  data-testid="toggle-public-edition"
                  className="h-4 w-4 accent-[#1B4D3E]"
                />
              </label>

              {authError && (
                <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                  {authError}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    data-testid="save-account-settings-btn"
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#1B4D3E] px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50 dark:bg-[#4BA388] dark:text-[#141210]"
                  >
                    {savedFeedback ? (
                      <>
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>تم حفظ الاسم والإعدادات</span>
                      </>
                    ) : (
                      <span>حفظ الاسم وإعدادات النسخة</span>
                    )}
                  </button>

                  {firebaseUser && isPublicInput && (
                    <button
                      type="button"
                      onClick={handleCopyShareLink}
                      className="inline-flex items-center gap-1.5 rounded-md border border-[#D4C49A] bg-[#F5EFE0] px-3 py-2 text-xs font-semibold text-[#8B5E34] hover:bg-[#EDE4CC] dark:border-[#443828] dark:bg-[#1E1A15] dark:text-[#C48F5A]"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>تم نسخ الرابط</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>نسخ رابط مشاركة نسختي</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {myStats.total > 0 && (
                  <button
                    type="button"
                    onClick={onResetMyEdition}
                    className="text-xs font-semibold text-red-700 hover:underline dark:text-red-400"
                  >
                    تصفير تعديلاتي والبدء من الأصل
                  </button>
                )}
              </div>

              {hasPendingSync && (
                <p className="text-xs font-medium text-[#8B5E34] dark:text-[#C48F5A]">
                  توجد تعديلات محفوظة محلياً بانتظار المزامنة السحابية عند توفر الاتصال وتسجيل الدخول.
                </p>
              )}
            </form>
          </section>

          {/* Section 3: Shared Editions by Other Users */}
          <section aria-label="نسخ المشتركين المنشورة" className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#1B4D3E] dark:text-[#4BA388]" aria-hidden="true" />
                <h3 className="font-heading text-lg font-bold text-[#1F1D1A] dark:text-[#EFECE6]">
                  ٣. نسخ المحررين الآخرين المعروضة
                </h3>
              </div>
              <button
                type="button"
                onClick={onRefreshPublicEditions}
                disabled={loadingPublicEditions || !isOnline}
                className="inline-flex items-center gap-1 rounded border border-[#E6DFD3] bg-[#FAF7F2] px-2.5 py-1 text-xs font-semibold text-[#5E584F] hover:text-[#1F1D1A] disabled:opacity-50 dark:border-[#2E2924] dark:bg-[#141210] dark:text-[#A8A095]"
              >
                <RefreshCw
                  className={`h-3 w-3 ${loadingPublicEditions ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                <span>تحديث القائمة</span>
              </button>
            </div>

            {publicEditions.length === 0 ? (
              <div className="rounded-lg border border-[#E6DFD3] bg-[#FAF7F2] p-4 text-center text-xs text-[#5E584F] dark:border-[#2E2924] dark:bg-[#141210] dark:text-[#A8A095]">
                {loadingPublicEditions
                  ? 'جاري تحميل النسخ المنشورة...'
                  : 'لا توجد نسخ منشورة من مستخدمين آخرين بعد. فعّل خيار «عرض نسختي للآخرين» لتظهر نسختك هنا.'}
              </div>
            ) : (
              <div className="space-y-2.5">
                {publicEditions.map((ed) => {
                  const stats = countEditionChanges(ed);
                  const isActiveShared =
                    viewMode.kind === 'shared' && viewMode.uid === ed.uid;
                  const isMine = firebaseUser && firebaseUser.uid === ed.uid;
                  return (
                    <div
                      key={ed.uid}
                      className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3.5 ${
                        isActiveShared
                          ? 'border-[#1B4D3E] bg-[#1B4D3E]/5 dark:border-[#4BA388] dark:bg-[#4BA388]/10'
                          : 'border-[#E6DFD3] bg-[#FAF7F2]/60 dark:border-[#2E2924] dark:bg-[#141210]/60'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#1F1D1A] dark:text-[#EFECE6]">
                            {ed.displayName}
                          </span>
                          {isMine && (
                            <span className="rounded bg-[#F5EFE0] px-2 py-0.5 text-[11px] font-semibold text-[#8B5E34] dark:bg-[#1E1A15] dark:text-[#C48F5A]">
                              نسختك
                            </span>
                          )}
                        </div>
                        {ed.bio && (
                          <p className="mt-0.5 text-xs text-[#5E584F] dark:text-[#A8A095]">
                            {ed.bio}
                          </p>
                        )}
                        <div className="mt-1 text-[11px] text-[#5E584F] dark:text-[#A8A095]">
                          {toArabicIndicDigits(stats.total)} تعديلاً وإضافةً
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (isMine) {
                              onSelectViewMode({ kind: 'mine' });
                            } else {
                              onSelectViewMode({
                                kind: 'shared',
                                uid: ed.uid,
                                displayName: ed.displayName,
                              });
                            }
                            onClose();
                          }}
                          className="rounded-md bg-[#1B4D3E] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 dark:bg-[#4BA388] dark:text-[#141210]"
                        >
                          عرض النسخة
                        </button>
                        {!isMine && (
                          <button
                            type="button"
                            onClick={() => {
                              onForkSharedEdition(ed);
                              onClose();
                            }}
                            className="rounded-md border border-[#D4C49A] bg-[#F5EFE0] px-2.5 py-1.5 text-xs font-semibold text-[#8B5E34] hover:bg-[#EDE4CC] dark:border-[#443828] dark:bg-[#1E1A15] dark:text-[#C48F5A]"
                          >
                            نسخها لمسودتي
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
