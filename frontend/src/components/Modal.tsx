import React, { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true
}) => {
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl'
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        {title && (
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {title}
                            </h3>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <span className="material-symbols-outlined text-gray-500">close</span>
                            </button>
                        )}
                    </div>
                )}
                
                {/* Body */}
                <div className="p-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
