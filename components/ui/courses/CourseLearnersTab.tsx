'use client'

import { useState } from 'react'
import { Spinner, Modal } from 'react-bootstrap'
import { useCourseLearners, useApproveEnrollment, useRejectEnrollment, useRemoveEnrollment, useAddLearners } from '@/lib/hook/use-course'
import Image from 'next/image'
import SelectAssignees from '@/components/shared/SelectAssignees'

interface CourseLearnersTabProps {
    courseId: string | number | null | undefined
}

export default function CourseLearnersTab({ courseId }: CourseLearnersTabProps) {
    const [currentPage, setCurrentPage] = useState(0)
    const pageSize = 10
    const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject' | 'remove' | null; enrollmentId: number | null; learnerName: string }>({
        type: null,
        enrollmentId: null,
        learnerName: ''
    })
    const [isAddLearnerModalOpen, setIsAddLearnerModalOpen] = useState(false)
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

    const { learnersData, isLoading, error, refetch } = useCourseLearners(courseId, {
        sort_columns: 'id:desc',
        page_number: currentPage,
        page_size: pageSize
    })

    const { mutation: approveMutation, isPending: isApproving } = useApproveEnrollment()
    const { mutation: rejectMutation, isPending: isRejecting } = useRejectEnrollment()
    const { mutation: removeMutation, isPending: isRemoving } = useRemoveEnrollment()
    const { mutation: addLearnersMutation, isPending: isAddingLearners } = useAddLearners()

    const handleApprove = (enrollmentId: number, learnerName: string) => {
        setConfirmAction({ type: 'approve', enrollmentId, learnerName })
    }

    const handleReject = (enrollmentId: number, learnerName: string) => {
        setConfirmAction({ type: 'reject', enrollmentId, learnerName })
    }

    const handleRemove = (enrollmentId: number, learnerName: string) => {
        setConfirmAction({ type: 'remove', enrollmentId, learnerName })
    }

    const handleConfirm = () => {
        if (!confirmAction.enrollmentId || !confirmAction.type) return

        const options = {
            onSuccess: () => {
                setConfirmAction({ type: null, enrollmentId: null, learnerName: '' })
                refetch()
            }
        }

        if (confirmAction.type === 'approve') {
            approveMutation(confirmAction.enrollmentId, options)
        } else if (confirmAction.type === 'reject') {
            rejectMutation(confirmAction.enrollmentId, options)
        } else if (confirmAction.type === 'remove') {
            removeMutation(confirmAction.enrollmentId, options)
        }
    }

    const handleCloseConfirm = () => {
        setConfirmAction({ type: null, enrollmentId: null, learnerName: '' })
    }

    const handleOpenAddLearnerModal = () => {
        setIsAddLearnerModalOpen(true)
        setSelectedUserIds([])
    }

    const handleCloseAddLearnerModal = () => {
        setIsAddLearnerModalOpen(false)
        setSelectedUserIds([])
    }

    const handleAddLearners = () => {
        if (!courseId || selectedUserIds.length === 0) return

        const courseIdNum = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId
        const userIds = selectedUserIds.map(id => parseInt(id, 10))

        if (isNaN(courseIdNum)) return

        addLearnersMutation(
            courseIdNum,
            {
                course_id: courseIdNum,
                user_ids: userIds
            },
            {
                onSuccess: () => {
                    setIsAddLearnerModalOpen(false)
                    setSelectedUserIds([])
                    refetch()
                }
            }
        )
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return { 
                    bg: '#D1FAE5', 
                    text: '#065F46', 
                    icon: (
                        <Image width={12} height={12} src="/icon/complete.svg" alt="Icon image"/>
                    )
                }
            case 'in progress':
                return { 
                    bg: '#DBEAFE', 
                    text: '#1E40AF', 
                    icon: (
                        <Image width={12} height={12} src="/icon/progress.svg" alt="Icon image"/>
                    )
                }
            case 'pending request':
                return { 
                    bg: '#FEF3C7', 
                    text: '#92400E', 
                    icon: (
                        <Image width={12} height={12} src="/icon/pending.svg" alt="Icon image"/>
                    )
                }
            default:
                return { bg: '#F3F4F6', text: '#374151', icon: '•' }
        }
    }

    if (isLoading) {
        return (
            <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spinner animation="border" />
            </div>
        )
    }

    if (error) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#EF4444' }}>
                Failed to load learners. Please try again.
            </div>
        )
    }

    if (!learnersData) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                No learners found.
            </div>
        )
    }

    const { learners, completedCount, inProgressCount, pendingCount, totalPages, hasPrevious, hasNext } = learnersData

    return (
        <div>
            {/* Summary Section */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: '0 0 8px 0' }}>
                        Enrolled Learners
                    </h3>
                    <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                        {completedCount} completed • {inProgressCount} in progress • {pendingCount} pending
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleOpenAddLearnerModal}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#003D7A',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#002855'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#003D7A'
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Add Learner
                </button>
            </div>

            {/* Learners Table */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                                    Name
                                </th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                                    Department
                                </th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                                    Status
                                </th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                                    Progress
                                </th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                                    Date
                                </th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {learners.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                                        No learners enrolled yet.
                                    </td>
                                </tr>
                            ) : (
                                learners.map((learner) => {
                                    const statusStyle = getStatusColor(learner.status)
                                    return (
                                        <tr key={learner.enrollment_id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                            <td style={{ padding: '16px', textAlign: 'left' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', alignItems: 'flex-start' }}>
                                                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1F2937', marginBottom: '4px', lineHeight: '1.4', textAlign: 'left' }}>
                                                        {learner.name}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.4', textAlign: 'left' }}>
                                                        {learner.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                                                {learner.department}
                                            </td>
                                            <td style={{ padding: '16px', display: 'table-cell' }}>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '2px 12px',
                                                    backgroundColor: statusStyle.bg,
                                                    color: statusStyle.text,
                                                    borderRadius: '16px',
                                                    fontSize: '12px',
                                                    fontWeight: '500'
                                                }}>
                                                    {typeof statusStyle.icon === 'string' ? (
                                                        <span>{statusStyle.icon}</span>
                                                    ) : (
                                                        statusStyle.icon
                                                    )}
                                                    {learner.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', minWidth: '120px' }}>
                                                {(() => {
                                                    const statusLower = learner.status.toLowerCase()
                                                    let displayProgress = learner.progress_percentage
                                                    
                                                    if (statusLower === 'pending request') {
                                                        displayProgress = 0
                                                    } else if (statusLower === 'completed') {
                                                        displayProgress = 100
                                                    }
                                                    // For 'in progress', use the actual progress_percentage
                                                    
                                                    return (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{
                                                                flex: 1,
                                                                height: '8px',
                                                                backgroundColor: '#E5E7EB',
                                                                borderRadius: '4px',
                                                                overflow: 'hidden'
                                                            }}>
                                                                <div style={{
                                                                    width: `${displayProgress}%`,
                                                                    height: '100%',
                                                                    backgroundColor: '#003D7A',
                                                                    transition: 'width 0.3s'
                                                                }} />
                                                            </div>
                                                            <span style={{ fontSize: '12px', color: '#6B7280', minWidth: '40px' }}>
                                                                {displayProgress}%
                                                            </span>
                                                        </div>
                                                    )
                                                })()}
                                            </td>
                                            <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                                                {formatDate(learner.enrolled_date)}
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {learner.status.toLowerCase() === 'pending request' ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleApprove(learner.enrollment_id, learner.name)}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    backgroundColor: '#10B981',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '6px',
                                                                    fontSize: '12px',
                                                                    fontWeight: '500',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <polyline points="20 6 9 17 4 12" />
                                                                </svg>
                                                                Approve
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleReject(learner.enrollment_id, learner.name)}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    backgroundColor: '#EF4444',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '6px',
                                                                    fontSize: '12px',
                                                                    fontWeight: '500',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <line x1="18" y1="6" x2="6" y2="18" />
                                                                    <line x1="6" y1="6" x2="18" y2="18" />
                                                                </svg>
                                                                Reject
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemove(learner.enrollment_id, learner.name)}
                                                            style={{
                                                                padding: '6px 12px',
                                                                backgroundColor: '#EF4444',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                fontSize: '12px',
                                                                fontWeight: '500',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                                                <circle cx="9" cy="7" r="4" />
                                                                <line x1="17" y1="8" x2="23" y2="8" />
                                                                <line x1="20" y1="5" x2="20" y2="11" />
                                                            </svg>
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{
                        padding: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid #E5E7EB'
                    }}>
                        <button
                            type="button"
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={!hasPrevious}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: hasPrevious ? 'white' : '#F3F4F6',
                                color: hasPrevious ? '#374151' : '#9CA3AF',
                                border: '1px solid #D1D5DB',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: hasPrevious ? 'pointer' : 'not-allowed'
                            }}
                        >
                            &lt; Back
                        </button>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: currentPage === page ? '#003D7A' : 'white',
                                        color: currentPage === page ? 'white' : '#374151',
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: currentPage === page ? '600' : '500',
                                        cursor: 'pointer',
                                        minWidth: '40px'
                                    }}
                                >
                                    {page + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                            disabled={!hasNext}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: hasNext ? 'white' : '#F3F4F6',
                                color: hasNext ? '#374151' : '#9CA3AF',
                                border: '1px solid #D1D5DB',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: hasNext ? 'pointer' : 'not-allowed'
                            }}
                        >
                            Next &gt;
                        </button>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            <Modal
                show={confirmAction.type !== null}
                onHide={handleCloseConfirm}
                centered
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {confirmAction.type === 'approve' ? 'Approve Enrollment' : 
                         confirmAction.type === 'reject' ? 'Reject Enrollment' : 
                         'Remove Enrollment'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Are you sure you want to {confirmAction.type === 'approve' ? 'approve' : 
                                                   confirmAction.type === 'reject' ? 'reject' : 
                                                   'remove'} the enrollment {confirmAction.type === 'approve' ? 'request' : ''} for{' '}
                        <strong>{confirmAction.learnerName}</strong>?
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type="button"
                        onClick={handleCloseConfirm}
                        disabled={isApproving || isRejecting || isRemoving}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'transparent',
                            color: '#6B7280',
                            border: '1px solid #D1D5DB',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isApproving || isRejecting || isRemoving}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: confirmAction.type === 'approve' ? '#10B981' : '#EF4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        {isApproving || isRejecting || isRemoving ? (
                            <>
                                <Spinner animation="border" size="sm" style={{ width: '14px', height: '14px', marginRight: '8px' }} />
                                {confirmAction.type === 'approve' ? 'Approving...' : 
                                 confirmAction.type === 'reject' ? 'Rejecting...' : 
                                 'Removing...'}
                            </>
                        ) : (
                            confirmAction.type === 'approve' ? 'Approve' : 
                            confirmAction.type === 'reject' ? 'Reject' : 
                            'Remove'
                        )}
                    </button>
                </Modal.Footer>
            </Modal>

            {/* Add Learner Modal */}
            <Modal
                show={isAddLearnerModalOpen}
                onHide={handleCloseAddLearnerModal}
                centered
                backdrop="static"
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add Learners</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ marginBottom: '20px' }}>
                        <SelectAssignees
                            value={selectedUserIds}
                            onChange={setSelectedUserIds}
                            label="Select Learners"
                            placeholder="Search users to add as learners..."
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type="button"
                        onClick={handleCloseAddLearnerModal}
                        disabled={isAddingLearners}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'transparent',
                            color: '#6B7280',
                            border: '1px solid #D1D5DB',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleAddLearners}
                        disabled={isAddingLearners || selectedUserIds.length === 0}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: selectedUserIds.length === 0 ? '#9CA3AF' : '#003D7A',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: selectedUserIds.length === 0 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isAddingLearners ? (
                            <>
                                <Spinner animation="border" size="sm" style={{ width: '14px', height: '14px', marginRight: '8px' }} />
                                Adding...
                            </>
                        ) : (
                            'Add Learners'
                        )}
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

