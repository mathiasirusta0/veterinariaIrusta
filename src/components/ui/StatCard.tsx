import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title?: string;
  label?: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'teal' | 'emerald' | 'amber' | 'rose' | 'slate' | 'sky' | string;
  color?: 'teal' | 'emerald' | 'amber' | 'rose' | 'slate' | 'sky' | string;
  trend?: {
    label: string;
    isPositive?: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  label,
  value,
  subtitle,
  icon: Icon,
  variant = 'slate',
  color,
  trend,
}) => {
  const cardTitle = title || label || '';
  const activeTheme = color || variant || 'slate';

  const variantStyles: Record<string, { card: string; title: string; value: string; iconBox: string }> = {
    teal: {
      card: 'bg-teal-50/80 border-teal-200/90',
      title: 'text-teal-800',
      value: 'text-teal-900',
      iconBox: 'bg-teal-100 text-teal-700',
    },
    emerald: {
      card: 'bg-emerald-50/80 border-emerald-200/90',
      title: 'text-emerald-800',
      value: 'text-emerald-900',
      iconBox: 'bg-emerald-100 text-emerald-700',
    },
    amber: {
      card: 'bg-amber-50/80 border-amber-200/90',
      title: 'text-amber-800',
      value: 'text-amber-900',
      iconBox: 'bg-amber-100 text-amber-700',
    },
    rose: {
      card: 'bg-rose-50/80 border-rose-200/90',
      title: 'text-rose-800',
      value: 'text-rose-900',
      iconBox: 'bg-rose-100 text-rose-700',
    },
    sky: {
      card: 'bg-sky-50/80 border-sky-200/90',
      title: 'text-sky-800',
      value: 'text-sky-900',
      iconBox: 'bg-sky-100 text-sky-700',
    },
    slate: {
      card: 'bg-white border-slate-200/90',
      title: 'text-slate-500',
      value: 'text-slate-900',
      iconBox: 'bg-slate-100 text-slate-600',
    },
  };

  const current = variantStyles[activeTheme] || variantStyles.slate;

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl border shadow-2xs space-y-1.5 sm:space-y-2 transition-all w-full max-w-full overflow-hidden ${current.card}`}
    >
      <div className="flex items-start justify-between gap-1.5 min-w-0">
        <span className={`font-bold uppercase text-[10px] tracking-wider truncate min-w-0 flex-1 ${current.title}`}>
          {cardTitle}
        </span>
        {Icon && (
          <div className={`p-1.5 rounded-xl flex-shrink-0 ${current.iconBox}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className={`text-xl sm:text-2xl font-black font-mono tracking-tight break-words truncate min-w-0 ${current.value}`}>
        {value}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center justify-between gap-1.5 pt-0.5 text-[10px] sm:text-[11px] min-w-0">
          {subtitle && <span className="text-slate-500 font-medium truncate min-w-0 flex-1">{subtitle}</span>}
          {trend && (
            <span
              className={`font-mono font-bold flex-shrink-0 ${
                trend.isPositive ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
