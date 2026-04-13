import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-8">
          <div className="bg-white border-2 border-rose-200 rounded-[4px] p-8 max-w-lg w-full shadow-xl shadow-rose-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-[4px] bg-rose-50 border-2 border-rose-400 flex items-center justify-center text-rose-600">
                <AlertTriangle size={20} />
              </div>
              <h2 className="text-[14px] font-black uppercase tracking-widest text-rose-700">Erreur d'interface</h2>
            </div>
            <p className="text-sm text-slate-500 font-medium mb-2">Un composant a planté. Détails :</p>
            <pre className="bg-rose-50 border border-rose-200 rounded-[4px] p-4 text-[11px] text-rose-800 overflow-auto max-h-48 mb-6 font-mono">
              {this.state.error?.message}
              {'\n'}
              {this.state.error?.stack?.split('\n').slice(0, 5).join('\n')}
            </pre>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#f0f7ff] border-2 border-[#3b7cf4] text-[#3b7cf4] rounded-[4px] text-[10px] font-black uppercase tracking-widest hover:bg-[#3b7cf4] hover:text-white transition-all active:scale-95"
            >
              <RefreshCw size={12} /> Réessayer
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
