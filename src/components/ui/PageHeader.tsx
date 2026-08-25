import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export interface PageHeaderAction {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  title?: string;
}

interface PageHeaderProps {
  category?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: ReactNode;
  actions?: PageHeaderAction[];
  children?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  category,
  title,
  description,
  icon: Icon,
  badge,
  actions = [],
  children,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full max-w-full transition-all">
      <div className="min-w-0 flex-1 space-y-1">
        {category && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-bold text-teal-700 uppercase tracking-wider">
              {category}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2.5 flex-wrap min-w-0">
          {Icon && <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 flex-shrink-0" />}
          <h1 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight break-words whitespace-normal leading-snug">
            {title}
          </h1>
          {badge && <div className="flex-shrink-0">{badge}</div>}
        </div>

        {description && (
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed max-w-3xl">
            {description}
          </p>
        )}
      </div>

      {(actions.length > 0 || children) && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 flex-shrink-0 w-full sm:w-auto">
          {children}
          {actions.map((action, idx) => {
            const ActionIcon = action.icon;
            let btnClass = 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs';

            if (action.variant === 'secondary') {
              btnClass =
                'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs';
            } else if (action.variant === 'danger') {
              btnClass = 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs';
            } else if (action.variant === 'ghost') {
              btnClass = 'text-slate-600 hover:text-slate-900 hover:bg-slate-100';
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={action.disabled}
                onClick={() => {
                  triggerHaptic('light');
                  action.onClick();
                }}
                title={action.title || action.label}
                className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-initial w-full sm:w-auto ${btnClass}`}
              >
                {ActionIcon && <ActionIcon className="w-4 h-4 flex-shrink-0" />}
                <span className="whitespace-nowrap">{action.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
