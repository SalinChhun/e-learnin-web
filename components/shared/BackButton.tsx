'use client'

import Link from 'next/link'

interface BackButtonProps {
    title: string
    href?: string
    onClick?: () => void
}

export default function BackButton({ title, href, onClick }: BackButtonProps) {
    const buttonContent = (
        <div
            style={{
                color: '#003D7A',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: onClick ? 'pointer' : 'pointer'
            }}
            onClick={onClick}
        >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="#003D7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {title}
        </div>
    )

    if (href) {
        return (
            <Link href={href} style={{ textDecoration: 'none' }}>
                {buttonContent}
            </Link>
        )
    }

    return buttonContent
}

