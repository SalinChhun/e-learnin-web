'use client'

import React, { useRef, useEffect, ReactNode, RefObject } from 'react';

interface ClickOutsideProps {
    onClickOutside: () => void;
    active?: boolean;
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    excludeRefs?: RefObject<HTMLElement | null>[];
}

/**
 * ClickOutside - A component that detects clicks outside its children and calls a callback
 * 
 * @param onClickOutside Function called when a click outside is detected
 * @param active Whether the click detection is active (default: true)
 * @param children The content to render
 * @param className Optional CSS class
 * @param style Optional inline styles
 * @param excludeRefs Array of refs that should not trigger the onClickOutside callback when clicked
 */
const ClickOutside: React.FC<ClickOutsideProps> = ({
    onClickOutside,
    active = true,
    children,
    className,
    style,
    excludeRefs = []
}) => {
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!active) return;

        const handleClickOutside = (event: MouseEvent) => {
            // Check if the click was outside our component
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                // Check if the click was on any of the excluded elements
                const clickedOnExcluded = excludeRefs.some(ref =>
                    ref.current && ref.current.contains(event.target as Node)
                );

                if (!clickedOnExcluded) {
                    onClickOutside();
                }
            }
        };

        // Listen for mousedown events (more reliable than click)
        document.addEventListener('mousedown', handleClickOutside);

        // Clean up
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [active, onClickOutside, excludeRefs]);

    return (
        <div ref={wrapperRef} className={className} style={style}>
            {children}
        </div>
    );
};

export default ClickOutside;