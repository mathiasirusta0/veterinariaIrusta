import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'teal-subtle';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  children: ReactNode;
}

export const PrimaryButton: React.FC<ButtonProps> = ({
  children,
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  disabled,
  size = 'md',
  onClick,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'min-h-[36px] px-3 py-1.5 text-xs',
    md: 'min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-bold',
    lg: 'min-h-[48px] px-6 py-3 text-sm sm:text-base font-black',
  }[size];

  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      onClick={(e) => {
        triggerHaptic('light');
        if (onClick) onClick(e);
      }}
      className={`rounded-xl font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 flex-shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 flex-shrink-0" />}
        </>
      )}
    </button>
  );
};

export const SecondaryButton: React.FC<ButtonProps> = ({
  children,
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  disabled,
  size = 'md',
  onClick,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'min-h-[36px] px-3 py-1.5 text-xs',
    md: 'min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-bold',
    lg: 'min-h-[48px] px-6 py-3 text-sm sm:text-base font-bold',
  }[size];

  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      onClick={(e) => {
        triggerHaptic('light');
        if (onClick) onClick(e);
      }}
      className={`rounded-xl font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs active:scale-95 transition-all flex items-center justify-center gap-2 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 flex-shrink-0 text-slate-500" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 flex-shrink-0 text-slate-500" />}
        </>
      )}
    </button>
  );
};

export const DangerButton: React.FC<ButtonProps> = ({
  children,
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  disabled,
  size = 'md',
  onClick,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'min-h-[36px] px-3 py-1.5 text-xs',
    md: 'min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-bold',
    lg: 'min-h-[48px] px-6 py-3 text-sm sm:text-base font-black',
  }[size];

  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      onClick={(e) => {
        triggerHaptic('medium');
        if (onClick) onClick(e);
      }}
      className={`rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 flex-shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 flex-shrink-0" />}
        </>
      )}
    </button>
  );
};
