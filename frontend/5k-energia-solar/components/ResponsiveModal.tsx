'use client';

import { ReactNode, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils/cn';

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  // Options
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  disableScroll?: boolean;
  // Bottom Sheet specific
  snapPoints?: number[]; // Alturas em porcentagem (ex: [25, 75, 100])
}

/**
 * Componente ResponsiveModal que renderiza um modal clássico em desktop
 * e um Persistent Bottom Sheet em mobile
 */
export default function ResponsiveModal({
  isOpen,
  onClose,
  children,
  title,
  className,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  disableScroll = true,
  snapPoints = [50, 100],
}: ResponsiveModalProps) {
  const isMobile = useIsMobile();

  // Gerenciar scroll do body
  useEffect(() => {
    if (!isOpen || !disableScroll) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, disableScroll]);

  // Gerenciar tecla Escape
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  // Bottom Sheet para mobile
  if (isMobile) {
    return <MobileBottomSheet onClose={onClose} snapPoints={snapPoints}>{children}</MobileBottomSheet>;
  }

  // Modal clássico para desktop
  return (
    <DesktopModal
      onClose={onClose}
      title={title}
      className={className}
      closeOnBackdropClick={closeOnBackdropClick}
    >
      {children}
    </DesktopModal>
  );
}

interface MobileBottomSheetProps {
  onClose: () => void;
  children: ReactNode;
  snapPoints?: number[];
}

/**
 * Bottom Sheet que funciona em mobile
 */
function MobileBottomSheet({ onClose, children, snapPoints = [50, 100] }: MobileBottomSheetProps) {
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const handleDragStart = useCallback((e: React.TouchEvent) => {
    const startY = e.touches[0].clientY;
    const sheet = (e.currentTarget as HTMLElement).querySelector('[data-sheet-content]') as HTMLElement;
    if (!sheet) return;

    const initialHeight = sheet.offsetHeight;

    const handleDragMove = (moveEvent: TouchEvent) => {
      const currentY = moveEvent.touches[0].clientY;
      const diff = currentY - startY;

      if (diff > 0) {
        // Puxando para baixo
        sheet.style.transform = `translateY(${diff}px)`;
        sheet.style.opacity = `${Math.max(0.5, 1 - diff / 300)}`;
      }
    };

    const handleDragEnd = (endEvent: TouchEvent) => {
      sheet.style.transition = 'all 0.3s ease-out';
      const currentY = endEvent.changedTouches[0].clientY;
      const diff = currentY - startY;

      // Se puxou mais de 20% da altura, fecha
      if (diff > initialHeight * 0.2) {
        sheet.style.transform = 'translateY(100%)';
        sheet.style.opacity = '0';
        setTimeout(onClose, 300);
      } else {
        sheet.style.transform = 'translateY(0)';
        sheet.style.opacity = '1';
      }

      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };

    document.addEventListener('touchmove', handleDragMove, { passive: true });
    document.addEventListener('touchend', handleDragEnd);
  }, [onClose]);

  return (
    <>
      {/* Backdrop - cobre toda a tela */}
      <div
        className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-300"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Bottom Sheet Container - fixado no bottom */}
      <div className="fixed -bottom-4 left-0 right-0 z-50 pointer-events-none">
        {/* Content */}
        <div
          data-sheet-content
          className="pointer-events-auto bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto transform transition-all duration-300 ease-out"
          style={{
            maxHeight: '85vh',
            animation: 'slideUp 0.3s ease-out',
          }}
          onTouchStart={handleDragStart}
        >
          {/* Drag Handle */}
          <div className="flex justify-center py-2 sticky top-0 bg-white border-b border-gray-200">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Content Wrapper */}
          <div>{children}</div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

interface DesktopModalProps {
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  closeOnBackdropClick?: boolean;
}

/**
 * Modal clássico para desktop
 */
function DesktopModal({
  onClose,
  children,
  title,
  className,
  closeOnBackdropClick = true,
}: DesktopModalProps) {
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnBackdropClick && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdropClick, onClose]
  );

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      aria-hidden="true"
    >
      {/* Modal */}
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
