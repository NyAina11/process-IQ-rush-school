import React, { forwardRef } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  required?: boolean;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, required, options, className = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-2 w-full ${className}`}>
        {label && (
          <label className="text-sm font-semibold text-slate-700 ml-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative group">
          <select
            ref={ref}
            className={`
              w-full px-4 py-3 bg-white border rounded-[4px] text-base text-slate-800 appearance-none
              transition-all focus:ring-4 focus:outline-none cursor-pointer
              ${error
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
              }
            `}
            {...props}
          >
            {props.placeholder && <option value="">{props.placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled} className={opt.disabled ? "font-bold bg-slate-100" : ""}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors">
            <ChevronDown size={18} />
          </div>
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

Select.displayName = 'Select';

export default Select;
