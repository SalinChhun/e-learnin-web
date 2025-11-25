'use client'

import { useState, useEffect } from 'react'

interface TimeSpentCounterProps {
    initialSeconds?: number
}

export default function TimeSpentCounter({ initialSeconds = 0 }: TimeSpentCounterProps) {
    const [timeSpent, setTimeSpent] = useState(initialSeconds)
    
    useEffect(() => {
        // Start timer when component mounts
        const interval = setInterval(() => {
            setTimeSpent(prev => prev + 1)
        }, 1000)
        
        return () => clearInterval(interval)
    }, [])

    // Format time spent as HH:MM:SS
    const formatTimeSpent = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }

    return (
        <div style={{
            position: 'fixed',
            top: '15px',
            right: '30px',
            backgroundColor: '#10B981',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 1000,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 4V8L10.6667 9.33333" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7.99998 14.6667C11.6819 14.6667 14.6666 11.6819 14.6666 8.00001C14.6666 4.31811 11.6819 1.33334 7.99998 1.33334C4.31808 1.33334 1.33331 4.31811 1.33331 8.00001C1.33331 11.6819 4.31808 14.6667 7.99998 14.6667Z" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Time Spent {formatTimeSpent(timeSpent)}</span>
        </div>
    )
}



