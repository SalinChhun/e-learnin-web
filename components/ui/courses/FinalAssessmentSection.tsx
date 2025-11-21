'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface FinalAssessmentSectionProps {
    status?: string
    score?: number | null
    courseId?: string | number | null
}

export default function FinalAssessmentSection({
    status,
    score,
    courseId
}: FinalAssessmentSectionProps) {
    const router = useRouter()
    const isCompleted = status?.toLowerCase() === 'completed'

    const handleTakeExam = () => {
        // Handle exam navigation
        if (courseId) {
            router.push(`/my-courses/${courseId}/exam`)
        }
    }

    const handleViewCertificate = () => {
        // Handle view certificate
        if (courseId) {
            // Navigate to certificate page
            console.log('View certificate for course:', courseId)
            // router.push(`/courses/${courseId}/certificate`)
        }
    }

    if (isCompleted) {
        return (
            <div
                style={{
                    backgroundColor: '#D1FAE5',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Decorative line */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '200px',
                    height: '2px',
                    backgroundColor: '#9CA3AF',
                    borderRadius: '1px',
                    transform: 'rotate(-45deg)',
                    transformOrigin: 'bottom right'
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    <Image width={48} height={48} src="/icon/complete-exam.svg" alt="Exam completed icon" />
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '400', color: '#1F2937', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>Exam</span>
                            <span style={{ color: '#F97316' }}>✨</span>
                            <span>Completed!</span>
                        </h3>
                        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, fontWeight: '400' }}>
                            You scored {score !== undefined ? `${score}%` : '100%'}. Congratulations! You passed the assessment.
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleViewCertificate}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#00A63E',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background-color 0.2s',
                        whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#008530'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#00A63E'
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                    </svg>
                    View Certificate
                </button>
            </div>
        )
    }

    // In Progress - Show "Ready for Your Final Assessment?"
    return (
        <div
            style={{
                backgroundColor: '#DBEAFE',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <Image width={48} height={48} src="/icon/ready-exam.svg" alt="Course icon" />
                <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '400', color: '#1F2937', margin: '0 0 4px 0' }}>
                        Ready for Your Final Assessment?
                    </h3>
                    <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, fontWeight: '400' }}>
                        Test your knowledge and earn your certificate. You can take the exam.
                    </p>
                </div>
            </div>
            <button
                type="button"
                onClick={handleTakeExam}
                style={{
                    padding: '12px 24px',
                    backgroundColor: '#003D7A',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s',
                    whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#002855'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#003D7A'
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
                        fill="white"
                    />
                </svg>
                Take Exam Now
            </button>
        </div>
    )
}

