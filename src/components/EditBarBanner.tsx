import {
  CheckCircle2,
  CloudOff,
  Edit3,
  Eye,
  RotateCcw,
  Save,
  WifiOff,
} from 'lucide-react';
import type { EditionViewMode } from '../types/edition';
import { toArabicIndicDigits } from '../utils/studyHelpers';

interface EditBarBannerProps {
  editMode: boolean;
  viewMode: EditionViewMode;
  authorDisplayName: string;
  isOnline: boolean;
  isSignedIn: boolean;
  hasUnsavedChanges: boolean;
  hasPendingSync: boolean;
  isSyncing: boolean;
  syncFeedback: string | null;
  changesCount: number;
  onSaveAndSync: () => Promise<void>;
  onDiscardUnsaved: () => void;
  onExitEditMode: () => void;
  onSwitchToOriginal: () => void;
  onSwitchToMineAndEdit: () => void;
  onOpenAccount: () => void;
}

export function EditBarBanner({
  editMode,
  viewMode,
  authorDisplayName,
  isOnline,
  isSignedIn,
  hasUnsavedChanges,
  hasPendingSync,
  isSyncing,
  syncFeedback,
  changesCount,
  onSaveAndSync,
  onDiscardUnsaved,
  onExitEditMode,
  onSwitchToOriginal,
  onSwitchToMineAndEdit,
  onOpenAccount,
}: EditBarBannerProps) {
  const showBanner =
    editMode ||
    viewMode.kind !== 'original' ||
    !isOnline ||
    hasPendingSync ||
    Boolean(syncFeedback);

  if (!showBanner) return null;

  return (
    <div className="mb-4 space-y-2">
      {/* Offline / Pending Sync Notice */}
      {(!isOnline || hasPendingSync) && (
        <div
          data-testid="offline-sync-banner"
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-400/60 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-900 dark:border-amber-600/40 dark:bg-amber-950/40 dark:text-amber-200"
        >
          <div className="flex items-center gap-2">
            {!isOnline ? (
              <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <CloudOff className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <span>
              {!isOnline
                ? 'وضع عدم الاتصال — يمكنك تصفح المذكرة وتحريرها وحفظها محلياً، وستُفعّل التعديلات تلقائياً فور عودة الإنترنت.'
                : isSignedIn
                  ? 'توجد تعديلات محلية بانتظار المزامنة مع حسابك...'
                  : 'تعديلاتك محفوظة محلياً على هذا الجهاز. سجّل دخولك باسمك وحساب Google لرفعها ومزامنتها على أجهزتك.'}
            </span>
          </div>
          {!isSignedIn && isOnline && (
            <button
              type="button"
              onClick={onOpenAccount}
              className="rounded border border-amber-700/40 bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-950 hover:bg-amber-200 dark:border-amber-500/40 dark:bg-amber-900/60 dark:text-amber-100"
            >
              تسجيل الدخول للمزامنة
            </button>
          )}
        </div>
      )}

      {/* Viewing Another Author's Shared Edition */}
      {viewMode.kind === 'shared' && !editMode && (
        <div
          data-testid="shared-edition-banner"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#1B4D3E]/30 bg-[#ECFDF5]/70 px-4 py-3 dark:border-[#4BA388]/30 dark:bg-[#0D2920]/60"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-[#1B4D3E] sm:text-sm dark:text-[#6EE7B7]">
            <Eye className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>تتصفح الآن نسخة المحرر: «{viewMode.displayName}»</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onSwitchToMineAndEdit}
              className="inline-flex items-center gap-1 rounded border border-[#1B4D3E]/40 bg-[#FFFFFF] px-3 py-1.5 text-xs font-bold text-[#1B4D3E] dark:border-[#4BA388]/40 dark:bg-[#1D1A17] dark:text-[#4BA388]"
            >
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>التبديل لتحرير نسختي</span>
            </button>
            <button
              type="button"
              onClick={onSwitchToOriginal}
              className="rounded border border-[#E6DFD3] bg-[#FAF7F2] px-3 py-1.5 text-xs font-semibold text-[#5E584F] hover:text-[#1F1D1A] dark:border-[#2E2924] dark:bg-[#141210] dark:text-[#A8A095]"
            >
              العودة للنسخة الأصلية
            </button>
          </div>
        </div>
      )}

      {/* Viewing My Customized Edition (Read Mode) */}
      {viewMode.kind === 'mine' && !editMode && (
        <div
          data-testid="mine-edition-banner"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#D4C49A] bg-[#F5EFE0]/70 px-4 py-2.5 dark:border-[#443828] dark:bg-[#1E1A15]/70"
        >
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#8B5E34] sm:text-sm dark:text-[#C48F5A]">
            <span>
              تعرض الآن نسختك الخاصة ({authorDisplayName}) —{' '}
              {toArabicIndicDigits(changesCount)} تعديلاً وإضافةً
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onSwitchToMineAndEdit}
              className="inline-flex items-center gap-1 rounded bg-[#8B5E34] px-3 py-1.5 text-xs font-bold text-white dark:bg-[#C48F5A] dark:text-[#141210]"
            >
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>تفعيل وضع التحرير</span>
            </button>
            <button
              type="button"
              onClick={onSwitchToOriginal}
              className="rounded border border-[#D4C49A] bg-[#FAF7F2] px-3 py-1.5 text-xs font-semibold text-[#5E584F] dark:border-[#443828] dark:bg-[#141210] dark:text-[#A8A095]"
            >
              معاينة النسخة الأصلية
            </button>
          </div>
        </div>
      )}

      {/* Active Edit Mode Action Bar */}
      {editMode && (
        <div
          data-testid="edit-mode-bar"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-[#8B5E34]/60 bg-[#F5EFE0] p-3.5 shadow-xs dark:border-[#C48F5A]/50 dark:bg-[#1E1A15]"
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded bg-[#8B5E34] px-2.5 py-1 text-xs font-bold text-white dark:bg-[#C48F5A] dark:text-[#141210]">
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>وضع التحرير مفعّل</span>
            </span>
            <span className="text-xs font-bold text-[#1F1D1A] sm:text-sm dark:text-[#EFECE6]">
              نسخة: {authorDisplayName}
            </span>
            <span className="text-xs text-[#5E584F] dark:text-[#A8A095]">
              ({toArabicIndicDigits(changesCount)} تعديلاً • النسخة الأصلية محفوظة كما هي)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {syncFeedback && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1B4D3E] dark:text-[#6EE7B7]">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                {syncFeedback}
              </span>
            )}

            {hasUnsavedChanges && (
              <button
                type="button"
                onClick={onDiscardUnsaved}
                className="inline-flex items-center gap-1 rounded-md border border-[#D4C49A] bg-[#FAF7F2] px-3 py-1.5 text-xs font-semibold text-[#5E584F] hover:text-red-700 dark:border-[#443828] dark:bg-[#141210] dark:text-[#A8A095]"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>تراجع</span>
              </button>
            )}

            <button
              type="button"
              onClick={onSaveAndSync}
              disabled={isSyncing}
              data-testid="save-edition-btn"
              className="inline-flex items-center gap-1.5 rounded-md bg-[#1B4D3E] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:opacity-90 disabled:opacity-50 dark:bg-[#4BA388] dark:text-[#141210]"
            >
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {isSyncing
                  ? 'جاري الحفظ...'
                  : isOnline && isSignedIn
                    ? 'حفظ التعديلات ومزامنتها'
                    : 'حفظ التعديلات (محلياً للمزامنة لاحقاً)'}
              </span>
            </button>

            <button
              type="button"
              onClick={onExitEditMode}
              data-testid="exit-edit-mode-btn"
              className="rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-3 py-1.5 text-xs font-semibold text-[#1F1D1A] hover:border-[#8B5E34] dark:border-[#2E2924] dark:bg-[#1D1A17] dark:text-[#EFECE6]"
            >
              إنهاء التحرير
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
