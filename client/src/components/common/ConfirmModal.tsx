import React from 'react';
import Button from './Button';
import Card from './Card';
import clsx from 'clsx';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
  children?: React.ReactNode; 
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="p-6 w-full max-w-md space-y-4">
        <h3 className="text-xl font-bold text-lime-light glow-text-lime">{title}</h3>
        <p className="text-gray-300">{message}</p>
        {children} 
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ConfirmModal;