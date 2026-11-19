import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'حدث خطأ غير متوقع في التطبيق.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      let friendlyText =
        'حدث خلل مؤقت أثناء مزامنة البيانات أو عرض الصفحة. تعديلاتك المحلية محفوظة بأمان.';
      if (this.state.errorMessage.includes('Missing or insufficient permissions')) {
        friendlyText =
          'تعذر الوصول إلى هذه العملية في قاعدة البيانات لعدم توفر الصلاحية المناسبة. تأكد من تسجيل الدخول بحسابك.';
      }

      return (
        <div
          dir="rtl"
          className="flex min-h-screen items-center justify-center bg-[#FAF7F2] p-6 text-[#1F1D1A] dark:bg-[#141210] dark:text-[#EFECE6]"
        >
          <div className="w-full max-w-md rounded-xl border border-[#D4C49A] bg-[#FFFFFF] p-6 text-center shadow-lg dark:border-[#443828] dark:bg-[#1D1A17]">
            <AlertTriangle
              className="mx-auto mb-3 h-10 w-10 text-[#8B5E34] dark:text-[#C48F5A]"
              aria-hidden="true"
            />
            <h2 className="font-heading text-2xl font-bold">
              تنبيه في استرداد الصفحة
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5E584F] dark:text-[#A8A095]">
              {friendlyText}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, errorMessage: '' });
                window.location.reload();
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#1B4D3E] px-4 py-2 text-sm font-bold text-white hover:opacity-90 dark:bg-[#4BA388] dark:text-[#141210]"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>إعادة تحميل المذكرة</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
