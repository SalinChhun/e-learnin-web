'use client'

import Image from 'next/image'
import dayjs from 'dayjs'

interface CourseHeaderCardProps {
    title: string
    category: string
    description: string
    durationHours: number
    estimatedDays: number
    dueDate: string
    status?: string
}

export default function CourseHeaderCard({
    title,
    category,
    description,
    durationHours,
    estimatedDays,
    dueDate,
    status
}: CourseHeaderCardProps) {
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A'
        return dayjs(dateString).format('MMM D, YYYY')
    }

    const getStatusBadge = () => {
        if (!status) return null
        const statusLower = status.toLowerCase()
        if (statusLower === 'completed') {
            return { bg: '#D1FAE5', text: '#065F46', label: 'Completed' }
        } else if (statusLower === 'in progress') {
            return { bg: '#DBEAFE', text: '#1E40AF', label: 'In Progress' }
        } else {
            return { bg: '#FEF3C7', text: '#92400E', label: status }
        }
    }

    return (
        <div
            style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                marginBottom: '24px',
                overflow: 'hidden',
                display: 'flex',
                position: 'relative'
            }}
        >
            {/* Blue Left Section */}
            <div
                style={{
                    backgroundColor: '#003D7A',
                    width: '192px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    color: 'white',
                    borderRadius: '12px'
                }}
            >
                {/* Graduation Cap Icon */}
                <Image width={48} height={48} src="/icon/common/graduate-cap.png" alt="Icon image"/>
                <span style={{
                    fontSize: '12px',
                    fontWeight: '400',
                    marginTop: '4px'
                }}>{durationHours} hours</span>
            </div>

            {/* Content Section */}
            <div style={{flex: 1, padding: '0 32px 0 32px', position: 'relative'}}>
                <h1 style={{ fontSize: '16px', fontWeight: '400', color: '#1F2937', margin: '0 0 12px 0', lineHeight: '1.2' }}>
                    {title}
                </h1>
                
                {/* Category Tag */}
                <div style={{ marginBottom: '16px' }}>
                    <span
                        style={{
                            padding: '2px 8px',
                            backgroundColor: '#60A5FA',
                            color: 'white',
                            borderRadius: '16px',
                            fontSize: '14px',
                            fontWeight: '400',
                            display: 'inline-block'
                        }}
                    >
                        {category}
                    </span>
                </div>

                <p style={{ fontSize: '16px', color: '#6B7280', margin: '0 0 20px 0', fontWeight: '400'}}>
                    {description}
                </p>

                <div className="d-flex align-items-center gap-4" style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9CA3AF', fontSize: '14px' }}>
                        <span>Due: {formatDate(dueDate)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9CA3AF', fontSize: '14px' }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="7" stroke="#9CA3AF" strokeWidth="1.5"/>
                            <path d="M8 4V8L11 10" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <span>{estimatedDays} {estimatedDays === 1 ? 'Day' : 'Days'}</span>
                    </div>
                </div>
            </div>
            
            {/* Status Badge - Top Right Corner (only shown if status prop is provided) */}
            {status && (() => {
                const statusBadge = getStatusBadge()
                return statusBadge ? (
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px'
                    }}>
                        <span style={{
                            padding: '4px 12px',
                            backgroundColor: statusBadge.bg,
                            color: statusBadge.text,
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: '500',
                            whiteSpace: 'nowrap'
                        }}>
                            {statusBadge.label}
                        </span>
                    </div>
                ) : null
            })()}
        </div>
    )
}

