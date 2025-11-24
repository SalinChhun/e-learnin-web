'use client'

import Image from 'next/image'
import {useRouter} from 'next/navigation'
import React from "react";

interface FinalAssessmentSectionProps {
    status?: string
    score?: number | null
    examAttemptStatus?: string | null
    courseId?: string | number | null
}

export default function FinalAssessmentSection({
                                                   status,
                                                   score,
                                                   examAttemptStatus,
                                                   courseId
                                               }: FinalAssessmentSectionProps) {
    const router = useRouter()
    const isCompleted = status?.toLowerCase() === 'completed'
    const isInProgress = status?.toLowerCase() === 'in progress'
    const examPassed = examAttemptStatus?.toLowerCase() === 'passed'
    const examFailed = examAttemptStatus?.toLowerCase() === 'failed'
    const hasExamAttempt = examAttemptStatus !== null && examAttemptStatus !== undefined

    const handleTakeExam = () => {
        // Handle exam navigation
        if (courseId) {
            router.push(`/my-courses/${courseId}/exam`)
        }
    }

    const handleViewCertificate = () => {
        // Handle view certificate
        if (courseId) {
            router.push(`/my-courses/${courseId}/certificate`)
        }
    }

    // Show failed exam banner (red) - if exam_attempt_status is "failed"
    if (examFailed) {
        return (
            <div
                style={{
                    backgroundColor: '#FEE2E2',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <div style={{display: 'flex', alignItems: 'center', gap: '16px', flex: 1}}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: '#EF4444',
                        borderRadius: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
                                fill="white"
                            />
                        </svg>
                    </div>
                    <div>
                        <h3 style={{fontSize: '16px', fontWeight: '400', color: '#1F2937', margin: '0 0 4px 0'}}>
                            Exam Completed!
                        </h3>
                        <p style={{fontSize: '14px', color: '#6B7280', margin: 0, fontWeight: '400'}}>
                            You scored {score !== undefined ? `${score}%` : '0%'}. Please retake the exam to pass.
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleTakeExam}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#EF4444',
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
                        e.currentTarget.style.backgroundColor = '#DC2626'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#EF4444'
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 4v6h6M23 20v-6h-6"></path>
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                    </svg>
                    Retry Exam Now
                </button>
            </div>
        )
    }

    if (examPassed) {
        return (
            <div
                style={{
                    backgroundColor: '#D1FAE5',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <div style={{display: 'flex', alignItems: 'center', gap: '16px', flex: 1}}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: '#10B981',
                        borderRadius: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <Image width={24} height={24} src="/icon/complete-exam.svg" alt="Icon image" unoptimized/>
                    </div>
                    <div>
                        <h3 style={{fontSize: '16px', fontWeight: '400', color: '#1F2937', margin: '0 0 4px 0'}}>
                            Exam Passed!
                        </h3>
                        <p style={{fontSize: '14px', color: '#6B7280', margin: 0, fontWeight: '400'}}>
                            Congratulations! You scored {score !== undefined ? `${score}%` : '0%'}. You can now view your certificate.
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleViewCertificate}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#10B981',
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
                        e.currentTarget.style.backgroundColor = '#059669'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#10B981'
                    }}
                >
                    <Image width={24} height={24} src="/icon/complete-exam.svg" alt="Icon image" unoptimized/>
                    View Certificate
                </button>
            </div>
        )
    }

    if (isInProgress) {

        // In Progress or no exam attempt yet - Show "Ready for Your Final Assessment?"
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
                <div style={{display: 'flex', alignItems: 'center', gap: '16px', flex: 1}}>
                    <Image width={48} height={48} src="/icon/ready-exam.svg" alt="Course icon"/>
                    <div>
                        <h3 style={{fontSize: '16px', fontWeight: '400', color: '#1F2937', margin: '0 0 4px 0'}}>
                            Ready for Your Final Assessment?
                        </h3>
                        <p style={{fontSize: '14px', color: '#6B7280', margin: 0, fontWeight: '400'}}>
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
}
