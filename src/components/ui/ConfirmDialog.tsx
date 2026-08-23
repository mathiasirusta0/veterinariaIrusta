import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { PrimaryButton, SecondaryButton, DangerButton } from './Buttons';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDestructive = false,
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      icon={
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            isDestructive ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-teal-50 text-teal-600 border border-teal-200'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
        </div>
      }
    >
      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{message}</p>
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <SecondaryButton onClick={onClose} disabled={isLoading} size="sm">
          {cancelLabel}
        </SecondaryButton>
        {isDestructive ? (
          <DangerButton onClick={onConfirm} isLoading={isLoading} size="sm">
            {confirmLabel}
          </DangerButton>
        ) : (
          <PrimaryButton onClick={onConfirm} isLoading={isLoading} size="sm">
            {confirmLabel}
          </PrimaryButton>
        )}
      </div>
    </Modal>
  );
};
