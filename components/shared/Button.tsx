'use client';

import { MouseEvent } from 'react';
import {Spinner} from "react-bootstrap";

// Define the props interface
interface Props {
    text: string;
    action?: () => void; // Optional action for button/reset types
    loading?: boolean; // Optional loading state
    className?: string; // Optional custom className
    type?: 'button' | 'submit' | 'reset'; // Optional type with HTML button types
}

const Button = ({
    text,
    action,
    loading = false,
    className = '',
    type = 'button', // Default to 'button'
}: Props) => {
    // Handle click event (only for non-submit buttons with an action)
    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        if (type !== 'submit' && action && !loading) {
            action(); // Trigger action if provided and not loading
        } else{
            e.stopPropagation();
        }
    };

    return (
        <button
            type={type} // Set button type (submit, button, reset)
            className={`wl-button ${className} ${loading ? 'loading' : ''}`}
            onClick={handleClick} // Only attach onClick for action-based buttons
            disabled={loading} // Disable during loading
        >
            {loading ? (
                <Spinner animation="border" style={{width: 20, height: 20}} role="status">
                </Spinner>
            ) : (
                text
            )}
        </button>
    );
};

export default Button;