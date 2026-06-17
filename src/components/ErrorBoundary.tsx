import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Copy, ChevronLeft, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught active crash:", error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      window.location.href = window.location.pathname;
    }
  };

  private handleCopyToClipboard = () => {
    const log = `Error: ${this.state.error?.message}\nStack: ${this.state.error?.stack}\nComponent Stack: ${this.state.errorInfo?.componentStack}`;
    navigator.clipboard.writeText(log);
    alert("Crash diagnostic log copied to clipboard! 📋");
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-slate-850 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-full flex items-center justify-center">
                <ShieldAlert size={28} />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">
                  Application Stopped Responding
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  TaskTogether encountered a critical rendering exception.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 max-h-48 overflow-y-auto">
              <p className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold leading-tight break-words">
                {this.state.error?.toString() || "Unknown rendering exception caught."}
              </p>
              {this.state.errorInfo?.componentStack && (
                <p className="text-[9px] font-mono text-slate-400 mt-2 leading-snug whitespace-pre-wrap leading-tight">
                  {this.state.errorInfo.componentStack}
                </p>
              )}
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow active:scale-98 transition-transform cursor-pointer"
              >
                <RefreshCw size={13} className="animate-spin-slow" />
                <span>Reload System Live Preview</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={this.handleCopyToClipboard}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-75 * text-slate-700 dark:text-slate-350 font-bold text-[10px] rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 active:scale-98 transition-transform"
                >
                  <Copy size={11} />
                  <span>Copy Diagnostic Log</span>
                </button>
                <button
                  onClick={this.handleReset}
                  className="py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-955/40 text-rose-600 dark:text-rose-400 font-bold text-[10px] rounded-lg border border-rose-100 dark:border-rose-900/50 flex items-center justify-center gap-1.5 active:scale-98 transition-transform"
                >
                  <span>Reset Local State</span>
                </button>
              </div>
            </div>

            <p className="text-[9px] text-center text-slate-400 font-mono tracking-wide">
              Security context remains locked. Offline caching enabled.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
