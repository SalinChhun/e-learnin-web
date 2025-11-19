
'use client'

import { usePathname } from "next/navigation";

export default function SimplePageLabel() {
    const pathname = usePathname();

    const formatSegment = (segment: string) => {
        // Handle specific case for API-related terms
        if (segment.toLowerCase() === 'apis-permission') return 'APIs Permission';
        if (segment.toLowerCase() === 'apis-management') return 'APIs Management';

        // Handle hyphenated words
        if (segment.includes('-')) {
            return segment
                .split('-')
                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        }

        // Default: capitalize first letter
        return segment.charAt(0).toUpperCase() + segment.slice(1);
    };

    const formattedPathname = pathname === '/'
        ? 'Users'
        : pathname
            .replace(/^\/+/, '')
            .split('/')
            .map(formatSegment)
            .join(' > ');

    return (
        <div className="wl-page-header">
            <div className="wl-header-content">
                <div className="wl-header-title-container" />
                <nav aria-label="breadcrumb" className="wl-breadcrumb">
                    <ol className="breadcrumb mb-0">
                        <li className="breadcrumb-item active">{formattedPathname}</li>
                    </ol>
                </nav>
            </div>
            <div className="wl-header-actions" />
        </div>
    );
}
