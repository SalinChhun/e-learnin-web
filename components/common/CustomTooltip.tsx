'use client'
import React from 'react';
import '@/styles/custom.css'

interface CustomTooltipProps {
    placement?: 'top' | 'top-start' | 'top-end' | 'right' | 'right-start' | 'right-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end';
    title: string;
    children: React.ReactNode;
    className?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ 
    placement = 'top', 
    title, 
    children, 
    className = '' 
}) => {

    if (!title || title === '') {
        return <>{children}</>;
    }

    return (
        <span 
            className={`wl-tooltip-container ${className}`}
            data-position={placement}
        >
            {children}
            <span className="wl-tooltip">
                {title}
            </span>
        </span>
    );
};

export default CustomTooltip;