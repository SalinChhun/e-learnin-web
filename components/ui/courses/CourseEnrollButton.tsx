'use client'

import Image from "next/image";
import { Spinner } from 'react-bootstrap';
import { useEnrollCourse, useCheckEnrollment } from '@/lib/hook/use-course';
import usePermissions from '@/lib/hook/usePermissions';

interface CourseEnrollButtonProps {
    courseId: string | number | null | undefined;
}

export default function CourseEnrollButton({ courseId }: CourseEnrollButtonProps) {
    const { mutation: enrollMutation, isPending: isEnrolling } = useEnrollCourse()
    const { enrollmentStatus, isLoading: isLoadingEnrollment, refetch: refetchEnrollment } = useCheckEnrollment(courseId)
    const isEnrolled = enrollmentStatus?.is_enrolled || false
    
    // Don't show button while checking enrollment status
    if (isLoadingEnrollment) {
        return null
    }
    
    const handleEnroll = () => {
        if (!courseId) return

        const courseIdNum = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId
        
        if (isNaN(courseIdNum)) return
        
        enrollMutation(
            {
                course_id: courseIdNum
            },
            {
                onSuccess: () => {
                    refetchEnrollment()
                }
            }
        )
    }

    return (
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280', fontSize: '14px'}}>
            <button
                type="button"
                onClick={handleEnroll}
                disabled={isEnrolling || isEnrolled}
                style={{
                    padding: '12px 24px',
                    backgroundColor: isEnrolled ? '#9CA3AF' : '#00A63E',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: (isEnrolling || isEnrolled) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s',
                    height: 'fit-content',
                    opacity: (isEnrolling || isEnrolled) ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                    if (!isEnrolling && !isEnrolled) {
                        e.currentTarget.style.backgroundColor = '#008530'
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isEnrolling && !isEnrolled) {
                        e.currentTarget.style.backgroundColor = '#00A63E'
                    }
                }}
            >
                {isEnrolling ? (
                    <>
                        <Spinner animation="border" size="sm" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                        Enrolling...
                    </>
                ) : isEnrolled ? (
                    <>
                        <Image width={16} height={16} src="/icon/request-join.svg" alt="Icon image"/>
                        Enrolled
                    </>
                ) : (
                    <>
                        <Image width={16} height={16} src="/icon/request-join.svg" alt="Icon image"/>
                        Request to Join
                    </>
                )}
            </button>
        </div>
    )
}



