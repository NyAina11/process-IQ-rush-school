import React, { useEffect } from 'react';
import { AlertTriangle, X, Info } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
  type = 'danger',
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onCancel();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onCancel}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-[4px] shadow-2xl animate-in zoom-in-95 fade-in duration-200 overflow-hidden">
        {/* Header-like top border for danger */}
        {type === 'danger' && <div className="h-1 bg-rose-500 w-full" />}
        {type === 'info' && <div className="h-1 bg-[#3b7cf4] w-full" />}

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-[4px] shrink-0 ${
              type === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-[#3b7cf4]'
            }`}>
              {type === 'danger' ? <AlertTriangle size={24} /> : <Info size={24} />}
            </div>
            
            <div className="flex-1">
              <h3 className="text-[18px] font-black text-slate-900 tracking-tight leading-tight">
                {title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed font-medium">
                {message}
              </p>
            </div>

            <button 
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 border border-slate-200 rounded-[4px] hover:bg-slate-100 transition-all active:scale-95"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-[4px] transition-all active:scale-95 border ${
                type === 'danger' 
                  ? 'bg-rose-50 border-rose-400 text-rose-600 hover:bg-rose-100 shadow-sm shadow-rose-100' 
                  : 'bg-emerald-50 border-emerald-400 text-emerald-600 hover:bg-emerald-100 shadow-sm shadow-emerald-100'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
