import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4 font-sans text-white">
          <div className="bg-[#252525] border border-red-500/30 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <AlertTriangle size={32} />
              <h2 className="text-xl font-bold">Terjadi Kesalahan Aplikasi</h2>
            </div>
            
            <p className="text-gray-300 mb-4 text-sm">
              Maaf, aplikasi mengalami kendala saat memuat halaman ini.
            </p>

            {this.state.error && (
              <div className="bg-black/30 p-3 rounded-lg border border-white/5 mb-6 overflow-auto max-h-40">
                <p className="text-red-400 font-mono text-xs break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={() => window.location.reload()} 
                className="flex-1 bg-brand-red hover:bg-red-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw size={18} /> Muat Ulang
              </button>
              <button 
                onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                }}
                className="px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm transition-colors"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
