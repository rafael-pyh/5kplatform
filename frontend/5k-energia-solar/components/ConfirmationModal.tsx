'use client';

import { memo } from 'react';
import { createPortal } from 'react-dom';
import Button from '@/components/ui/Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full">
            {/* Close Button */}
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fechar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Content */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
              <p className="text-gray-600 text-sm mb-6">{message}</p>

              {/* Buttons */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  {cancelText}
                </Button>
                <Button
                  variant={isDangerous ? 'danger' : 'success'}
                  onClick={onConfirm}
                  disabled={isLoading}
                >
                  {confirmText}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}

export default memo(ConfirmationModal);
