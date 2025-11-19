'use client';

import React from 'react';
import { Modal } from 'react-bootstrap';

// Button interface
interface ModalButton {
    label: string;
    className?: string;
    onClick: () => void;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    icon?: string;
}

// Modal Props Interface
interface ModalPopupProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closeOnOutsideClick?: boolean;
    buttonPosition?: 'top' | 'bottom' | 'none';
    buttons?: ModalButton[];
    customClass?: string;
    width?: string; // For custom width classes
    centered?: boolean;
    id?: string;
}

const ModalPopup: React.FC<ModalPopupProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    closeOnOutsideClick = true,
    buttonPosition = 'bottom',
    buttons = [],
    customClass = '',
    width = 'wl-width-480',
    centered = true,
    id
}) => {
    // Size mapping for React Bootstrap
    const modalSize = size === 'md' ? undefined : size;

    return (
        <Modal
            show={isOpen}
            onHide={closeOnOutsideClick ? onClose : undefined}
            centered={centered}
            size={modalSize as any}
            dialogClassName={width}
            contentClassName={`wl-modal-content d-flex flex-column ${customClass}`}
            backdrop={closeOnOutsideClick ? true : 'static'}
            keyboard={true} // Allow ESC key to close
            id={id}
        >
            {/* Header */}
            <div className="wl-page-header wl-border-bottom-none p-3">
                <div className="wl-header-content">
                    <div className="wl-header-title-container">
                        <span className="wl-title-sm">{title}</span>
                    </div>
                </div>
                {buttonPosition === 'top' && buttons.length > 0 && (
                    <div className="wl-header-actions">
                        <div className="d-inline-flex align-items-center gap-2">
                            {buttons.map((btn, index) => (
                                <button
                                    key={index}
                                    type={btn.type || 'button'}
                                    className={btn.className || 'btn btn-primary'}
                                    onClick={btn.onClick}
                                    disabled={btn.disabled}
                                >
                                    {btn.icon && <span className={btn.icon}></span>}
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {/* Only show the close button if we're not showing other buttons in the header */}
                {buttonPosition !== 'top' && (
                    <div className="wl-header-actions">
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            aria-label="Close"
                        ></button>
                    </div>
                )}
            </div>

            {/* Content */}
            <Modal.Body>
                {children}
            </Modal.Body>

            {/* Bottom Buttons (if positioned at bottom) */}
            {buttonPosition === 'bottom' && buttons.length > 0 && (
                <Modal.Footer>
                    {buttons.map((btn, index) => (
                        <button
                            key={index}
                            type={btn.type || 'button'}
                            className={btn.className || 'btn btn-primary'}
                            onClick={btn.onClick}
                            disabled={btn.disabled}
                        >
                            {btn.icon && <span className={btn.icon}></span>}
                            {btn.label}
                        </button>
                    ))}
                </Modal.Footer>
            )}
        </Modal>
    );
};

export default ModalPopup;