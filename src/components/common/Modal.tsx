'use client'

import React, { useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'lg' | 'xl';
  scrollable?: boolean;
  centered?: boolean;
  isAnimating?: boolean;
  onBackdropClick?: () => void;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
  scrollable = true,
  centered = true,
  isAnimating = false,
  onBackdropClick
}) => {
  const { t } = useTranslation();

  // ESC key handling and body scroll management
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      // Add event listener for ESC key
      document.addEventListener('keydown', handleEscKey);
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Focus management - focus the modal on open
      const modalElement = document.querySelector('.modal[tabindex="-1"]') as HTMLElement;
      if (modalElement) {
        modalElement.focus();
      }
    } else {
      // Restore body scroll when modal closes
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      if (onBackdropClick) {
        onBackdropClick();
      } else {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  const modalDialogClasses = [
    'modal-dialog',
    `modal-${size}`,
    centered && 'modal-dialog-centered',
    scrollable && 'modal-dialog-scrollable'
  ].filter(Boolean).join(' ');

  return (
    <>
      <div 
        className={`modal ${isAnimating ? 'fade' : 'fade show'}`}
        style={{ display: 'block', zIndex: 1050 }} 
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        onClick={handleBackdropClick}
      >
        <div className={modalDialogClasses} onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h4 id="modal-title" className="modal-title">
                {title}
              </h4>
              <button 
                type="button" 
                className="close" 
                onClick={onClose}
                aria-label={t('common.actions.close')}
                title={t('common.actions.close')}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div id="modal-description" className="modal-body">
              {children}
            </div>
          </div>
        </div>
      </div>
      <div 
        className={`modal-backdrop ${isAnimating ? 'fade' : 'fade show'}`}
        style={{ zIndex: 1040 }}
      />
    </>
  );
};

export default Modal;