import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'teal' | 'emerald' | 'amber' | 'rose' | 'slate';
  trend?: {
    label: string;
    isPositive?: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'slate',
  trend,
}) => {
  const variantStyles = {
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
    slate: {
      card: 'bg-white border-slate-200/90',
      title: 'text-slate-500',
      value: 'text-slate-900',
      iconBox: 'bg-slate-100 text-slate-600',
    },
  };

  const current = variantStyles[variant];

  return (
    <div
      className={`p-4 rounded-2xl border shadow-2xs space-y-2 transition-all w-full max-w-full ${current.card}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`font-bold uppercase text-[10px] tracking-wider truncate ${current.title}`}>
          {title}
        </span>
        {Icon && (
          <div className={`p-1.5 rounded-xl flex-shrink-0 ${current.iconBox}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className={`text-2xl font-black font-mono tracking-tight ${current.value}`}>
        {value}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center justify-between gap-2 pt-0.5 text-[11px]">
          {subtitle && <span className="text-slate-500 font-medium truncate">{subtitle}</span>}
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
