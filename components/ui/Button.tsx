import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-[4px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed border';

  const variants = {
    primary: 'bg-[#f0f7ff] border-[#3b7cf4] text-[#3b7cf4] hover:bg-[#3b7cf4] hover:text-white shadow-sm shadow-blue-100',
    secondary: 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-200 hover:text-slate-700 shadow-sm shadow-slate-100',
    outline: 'bg-white border-slate-200 text-slate-600 hover:border-[#3b7cf4] hover:text-[#3b7cf4]',
    ghost: 'bg-transparent border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700',
    danger: 'bg-rose-50 border-rose-400 text-rose-600 hover:bg-rose-500 hover:text-white shadow-sm shadow-rose-100',
    success: 'bg-emerald-50 border-emerald-400 text-emerald-600 hover:bg-emerald-500 hover:text-white shadow-sm shadow-emerald-100',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[9px]',
    md: 'px-5 py-2.5 text-[10px]',
    lg: 'px-8 py-3.5 text-[12px]',
    icon: 'p-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin mr-2" size={14} />
      ) : leftIcon ? (
        <span className="mr-2">{leftIcon}</span>
      ) : null}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;
