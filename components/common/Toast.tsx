"use client";
import { JSX, useEffect, useState } from "react";

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    duration?: number;
    isVisible: boolean;
    onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({
                                         message = "Operation successful",
                                         type = "success",
                                         duration = 3000,
                                         isVisible = false,
                                         onClose
                                     }) => {
    const [isShown, setIsShown] = useState<boolean>(isVisible);

    useEffect(() => {
        setIsShown(isVisible);

        if (isVisible) {
            const timer = setTimeout(() => {
                setIsShown(false);
                if (onClose) onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    // Determine the icon based on type
    const getIcon = (): JSX.Element => {
        switch (type) {
            case 'success':
                return <span className="wl-lead-icon wl-icon-tick"></span>;
            case 'error':
                return <span className="wl-lead-icon wl-icon-close"></span>;
            case 'warning':
                return <span className="wl-lead-icon wl-icon-tick"></span>;
            case 'info':
                return <span className="wl-lead-icon wl-icon-tick"></span>;
            default:
                return <span className="wl-lead-icon wl-icon-tick"></span>;
        }
    };

    return (
        <div className={`toast wl-snackbar wl-snackbar-${type} ${isShown ? 'show' : ''}`}>
            <div className="toast-body wl-snackbar-body d-flex align-items-center gap-2">
                {getIcon()}
                <div className="fw-medium text-white">{message}</div>
                <button
                    type="button"
                    className="wl-btn-close"
                    onClick={() => {
                        setIsShown(false);
                        if (onClose) onClose();
                    }}
                >
                    <span className="wl-icon-close"></span>
                </button>
            </div>
        </div>
    );
};

export default Toast;