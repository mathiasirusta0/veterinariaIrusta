import React from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';

export type AlertType = 'danger' | 'warning' | 'info' | 'success';

interface ClinicalAlertProps {
  type?: AlertType;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

export const ClinicalAlert: React.FC<ClinicalAlertProps> = ({
  type = 'warning',
  title,
  message,
  action,
  onDismiss,
}) => {
  const styles: Record<
    AlertType,
    { container: string; text: string; icon: React.ReactNode }
  > = {
    danger: {
      container: 'bg-rose-50 border-rose-200/90 text-rose-900',
      text: 'text-rose-700',
      icon: <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />,
    },
    warning: {
      container: 'bg-amber-50 border-amber-200/90 text-amber-900',
      text: 'text-amber-700',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
    },
    info: {
      container: 'bg-teal-50 border-teal-200/90 text-teal-950',
      text: 'text-teal-700',
      icon: <Info className="w-5 h-5 text-teal-600 flex-shrink-0" />,
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200/90 text-emerald-900',
      text: 'text-emerald-700',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    },
  };

  const current = styles[type];

  return (
    <div
      role="alert"
      className={`border rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 shadow-2xs transition-all w-full max-w-full ${current.container}`}
    >
      <div className="mt-0.5">{current.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-xs sm:text-sm tracking-tight">{title}</div>
        {message && (
          <p className={`text-xs mt-0.5 leading-relaxed ${current.text}`}>
            {message}
          </p>
        )}
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-2 text-xs font-bold underline hover:opacity-80 transition-opacity"
          >
            {action.label}
          </button>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
          aria-label="Cerrar alerta"
        >
          <AlertCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
