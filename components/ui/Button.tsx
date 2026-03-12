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
  const baseStyles = 'inline-flex items-center justify-center rounded-[4px] font-bold transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100';

  const variants = {
    primary: 'bg-gradient-to-r from-brand to-primary text-white shadow-lg shadow-brand/25 hover:shadow-brand/40 hover:-translate-y-0.5',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    outline: 'bg-white border-2 border-slate-200 text-slate-600 hover:border-brand hover:text-brand',
    ghost: 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700',
    danger: 'bg-rose-500 text-white shadow-lg shadow-rose-500/25 hover:bg-rose-600',
    success: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-10 py-4 text-lg',
    icon: 'p-3',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin mr-2" size={20} />
      ) : leftIcon ? (
        <span className="mr-2">{leftIcon}</span>
      ) : null}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;
