import { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        data-testid="pwa-install-btn"
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-[#1B4D3E]/40 bg-[#1B4D3E]/10 px-2.5 py-1.5 text-xs font-semibold text-[#1B4D3E] hover:bg-[#1B4D3E]/15 dark:border-[#4BA388]/40 dark:bg-[#4BA388]/15 dark:text-[#4BA388]"
      >
        <Download className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>تثبيت التطبيق</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          data-testid="pwa-ios-install-btn"
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-[#E6DFD3] bg-[#FAF7F2] px-2.5 py-1.5 text-xs font-semibold text-[#5E584F] hover:border-[#8B5E34] dark:border-[#2E2924] dark:bg-[#141210] dark:text-[#A8A095]"
        >
          <Smartphone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>تثبيت للعمل أوفلاين</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="تثبيت التطبيق على iPhone و iPad"
          >
            <div className="w-full max-w-sm rounded-xl border border-[#E6DFD3] bg-[#FFFFFF] p-5 shadow-xl dark:border-[#2E2924] dark:bg-[#1D1A17]">
              <div className="flex items-center justify-between border-b border-[#E6DFD3] pb-3 dark:border-[#2E2924]">
                <h3 className="font-heading text-xl font-bold text-[#1F1D1A] dark:text-[#EFECE6]">
                  تثبيت المذكرة على جهازك
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="إغلاق"
                  className="flex h-7 w-7 items-center justify-center rounded border border-[#E6DFD3] text-[#5E584F] dark:border-[#2E2924] dark:text-[#A8A095]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[#5E584F] dark:text-[#A8A095]">
                <li>١. اضغط على زر «مشاركة» في شريط متصفح Safari.</li>
                <li>٢. اختر «إضافة إلى الشاشة الرئيسية» (Add to Home Screen).</li>
                <li>٣. ستعمل المذكرة وتحريرها معك حتى دون اتصال بالإنترنت.</li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-md bg-[#1B4D3E] py-2 text-xs font-bold text-white dark:bg-[#4BA388] dark:text-[#141210]"
              >
                حسناً
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
