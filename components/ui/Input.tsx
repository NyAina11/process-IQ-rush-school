import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, required, className = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-2 w-full ${className}`}>
        {label && (
          <label className="text-sm font-semibold text-slate-700 ml-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-3 bg-white border rounded-[4px] text-base text-slate-800 placeholder:text-slate-400
              transition-all focus:ring-4 focus:outline-none
              ${leftIcon ? 'pl-12' : ''}
              ${error 
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10' 
                : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
              }
            `}
            {...props}
          />
        </div>
        {error && (
          <div className="flex items-center gap-1.5 ml-1 text-rose-500 text-xs font-bold animate-slide-in">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
