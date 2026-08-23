import React from 'react';
import { triggerHaptic } from '../../utils/haptics';

export interface FilterOption<T extends string = string> {
  id: T;
  label: string;
  badge?: number;
  icon?: string;
}

interface FilterBarProps<T extends string = string> {
  options: FilterOption<T>[];
  activeId: T;
  onSelect: (id: T) => void;
  label?: string;
  className?: string;
}

export const FilterBar = <T extends string = string>({
  options,
  activeId,
  onSelect,
  label,
  className = '',
}: FilterBarProps<T>): React.ReactElement => {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full ${className}`}>
      {label && (
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-1">
          {label}:
        </span>
      )}
      <div className="flex items-center gap-1.5 flex-nowrap">
        {options.map((opt) => {
          const isActive = activeId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onSelect(opt.id);
              }}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap touch-manipulation flex-shrink-0 ${
                isActive
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 border border-slate-200/60'
              }`}
            >
              {opt.icon && <span>{opt.icon}</span>}
              <span>{opt.label}</span>
              {opt.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {opt.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
