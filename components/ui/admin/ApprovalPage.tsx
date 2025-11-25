'use client'

import {useCallback, useRef} from 'react'
import {Spinner} from 'react-bootstrap'
import PageHeader from '@/components/ui/bar/PageHeader'
import {
    useFetchAllEnrollmentsInfinite,
    useApproveEnrollment,
    useRejectEnrollment,
    useRemoveEnrollment
} from '@/lib/hook/use-course'
import dayjs from 'dayjs'

export default function ApprovalPage() {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const {
        enrollments,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error
    } = useFetchAllEnrollmentsInfinite(10)

    const {mutation: approveMutation, isPending: isApproving} = useApproveEnrollment()
    const {mutation: rejectMutation, isPending: isRejecting} = useRejectEnrollment()
    const {mutation: removeMutation, isPending: isRemoving} = useRemoveEnrollment()

    // Infinite scroll handler
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const {scrollTop, scrollHeight, clientHeight} = e.currentTarget

        // Load more when user scrolls to 80% of the container
        if (
            scrollHeight - scrollTop <= clientHeight * 1.2 &&
            hasNextPage &&
            !isFetchingNextPage &&
            !isLoading
        ) {
            fetchNextPage()
        }
    }, [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage])

    const handleApprove = (enrollmentId: number, userName: string) => {
        if (confirm(`Are you sure you want to approve enrollment for ${userName}?`)) {
            approveMutation(enrollmentId, {
                onSuccess: () => {
                    // Query will be invalidated automatically
                }
            })
        }
    }

    const handleReject = (enrollmentId: number, userName: string) => {
        if (confirm(`Are you sure you want to reject enrollment for ${userName}?`)) {
            rejectMutation(enrollmentId, {
                onSuccess: () => {
                    // Query will be invalidated automatically
                }
            })
        }
    }

    const handleRemove = (enrollmentId: number, userName: string) => {
        if (confirm(`Are you sure you want to remove enrollment for ${userName}? This action cannot be undone.`)) {
            removeMutation(enrollmentId, {
                onSuccess: () => {
                    // Query will be invalidated automatically
                }
            })
        }
    }

    const getStatusBadge = (status: string) => {
        const statusLower = status.toLowerCase()
        if (statusLower === 'completed') {
            return {
                bg: '#D1FAE5',
                text: '#065F46',
                label: 'Completed'
            }
        } else if (statusLower === 'in progress') {
            return {
                bg: '#DBEAFE',
                text: '#1E40AF',
                label: 'In Progress'
            }
        } else if (statusLower === 'pending request' || statusLower === 'pending') {
            return {
                bg: '#FEF3C7',
                text: '#92400E',
                label: 'Pending'
            }
        } else if (statusLower === 'rejected') {
            return {
                bg: '#FEE2E2',
                text: '#991B1B',
                label: 'Rejected'
            }
        } else {
            return {
                bg: '#F3F4F6',
                text: '#6B7280',
                label: status
            }
        }
    }

    return (
        <div style={{padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh'}}>
            {/* Header Section */}
            <div style={{marginBottom: '32px'}}>
                <PageHeader
                    title="Enrollment Approval"
                    subtitle="Review and manage course enrollment requests"
                />
            </div>

            {/* Enrollments List */}
            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                style={{
                    maxHeight: 'calc(100vh - 140px)',
                    overflowY: 'auto'
                }}
            >
                {isLoading ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '40px'
                    }}>
                        <Spinner animation="border"/>
                    </div>
                ) : error ? (
                    <div style={{
                        padding: '24px',
                        textAlign: 'center',
                        color: '#EF4444'
                    }}>
                        <p>Error loading enrollments. Please try again later.</p>
                    </div>
                ) : enrollments.length === 0 ? (
                    <div style={{
                        padding: '24px',
                        textAlign: 'center',
                        color: '#6B7280'
                    }}>
                        <p>No enrollments found.</p>
                    </div>
                ) : (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    {enrollments.map((enrollment) => {
                        const statusBadge = getStatusBadge(enrollment.status)
                        const isPending = enrollment.status.toLowerCase() === 'pending request' || enrollment.status.toLowerCase() === 'pending'
                        const isProcessing = isApproving || isRejecting || isRemoving

                        return (
                            <div
                                key={enrollment.enrollment_id}
                                style={{
                                    backgroundColor: 'white',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px'
                                }}
                            >
                                {/* Header Row */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    gap: '16px'
                                }}>
                                    <div style={{flex: 1}}>
                                        <h3 style={{
                                            fontSize: '18px',
                                            fontWeight: '600',
                                            color: '#1F2937',
                                            margin: '0 0 8px 0'
                                        }}>
                                            {enrollment.course_title}
                                        </h3>
                                        <p style={{
                                            fontSize: '14px',
                                            color: '#6B7280',
                                            margin: '0 0 12px 0'
                                        }}>
                                            {enrollment.course_description}
                                        </p>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                            flexWrap: 'wrap'
                                        }}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    backgroundColor: statusBadge.bg,
                                                    color: statusBadge.text,
                                                    borderRadius: '16px',
                                                    fontSize: '12px',
                                                    fontWeight: '500'
                                                }}>
                                                    {statusBadge.label}
                                                </span>
                                            <span style={{fontSize: '14px', color: '#6B7280'}}>
                                                    {enrollment.course_category}
                                                </span>
                                        </div>
                                    </div>
                                </div>

                                {/* User Info Row */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '16px',
                                    padding: '16px',
                                    backgroundColor: '#F9FAFB',
                                    borderRadius: '8px'
                                }}>
                                    <div>
                                        <p style={{fontSize: '12px', color: '#6B7280', margin: '0 0 4px 0'}}>User</p>
                                        <p style={{fontSize: '14px', fontWeight: '500', color: '#1F2937', margin: 0}}>
                                            {enrollment.user_name}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{fontSize: '12px', color: '#6B7280', margin: '0 0 4px 0'}}>Email</p>
                                        <p style={{fontSize: '14px', color: '#1F2937', margin: 0}}>
                                            {enrollment.user_email}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{
                                            fontSize: '12px',
                                            color: '#6B7280',
                                            margin: '0 0 4px 0'
                                        }}>Department</p>
                                        <p style={{fontSize: '14px', color: '#1F2937', margin: 0}}>
                                            {enrollment.department}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{fontSize: '12px', color: '#6B7280', margin: '0 0 4px 0'}}>Enrolled
                                            Date</p>
                                        <p style={{fontSize: '14px', color: '#1F2937', margin: 0}}>
                                            {dayjs(enrollment.enrolled_date).format('MMM D, YYYY')}
                                        </p>
                                    </div>
                                    {enrollment.progress_percentage > 0 && (
                                        <div>
                                            <p style={{
                                                fontSize: '12px',
                                                color: '#6B7280',
                                                margin: '0 0 4px 0'
                                            }}>Progress</p>
                                            <p style={{fontSize: '14px', color: '#1F2937', margin: 0}}>
                                                {enrollment.progress_percentage}%
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div style={{
                                    display: 'flex',
                                    gap: '12px',
                                    justifyContent: 'flex-end',
                                    flexWrap: 'wrap'
                                }}>
                                    {isPending && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleApprove(enrollment.enrollment_id, enrollment.user_name)}
                                                disabled={isProcessing}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#10B981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    transition: 'background-color 0.2s',
                                                    opacity: isProcessing ? 0.6 : 1
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isProcessing) {
                                                        e.currentTarget.style.backgroundColor = '#059669'
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isProcessing) {
                                                        e.currentTarget.style.backgroundColor = '#10B981'
                                                    }
                                                }}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                     stroke="currentColor" strokeWidth="2">
                                                    <polyline points="20 6 9 17 4 12"/>
                                                </svg>
                                                Approve
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleReject(enrollment.enrollment_id, enrollment.user_name)}
                                                disabled={isProcessing}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#EF4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    transition: 'background-color 0.2s',
                                                    opacity: isProcessing ? 0.6 : 1
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isProcessing) {
                                                        e.currentTarget.style.backgroundColor = '#DC2626'
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isProcessing) {
                                                        e.currentTarget.style.backgroundColor = '#EF4444'
                                                    }
                                                }}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                     stroke="currentColor" strokeWidth="2">
                                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                                </svg>
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(enrollment.enrollment_id, enrollment.user_name)}
                                        disabled={isProcessing}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#6B7280',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'background-color 0.2s',
                                            opacity: isProcessing ? 0.6 : 1
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isProcessing) {
                                                e.currentTarget.style.backgroundColor = '#4B5563'
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isProcessing) {
                                                e.currentTarget.style.backgroundColor = '#6B7280'
                                            }
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" strokeWidth="2">
                                            <path
                                                d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                        </svg>
                                        Remove
                                    </button>
                                </div>
                            </div>
                        )
                    })}

                    {/* Loading indicator for infinite scroll */}
                    {isFetchingNextPage && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '20px'
                        }}>
                            <Spinner animation="border" size="sm"/>
                        </div>
                    )}

                    {/* End of list message */}
                    {!hasNextPage && enrollments.length > 0 && (
                        <div style={{
                            padding: '20px',
                            textAlign: 'center',
                            color: '#6B7280',
                            fontSize: '14px'
                        }}>
                            <p>No more enrollments to load</p>
                        </div>
                    )}
                    </div>
                )}
            </div>
        </div>
    )
}

