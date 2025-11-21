'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner } from 'react-bootstrap'
import Image from 'next/image'
import { useMyCourses } from '@/lib/hook/use-course'
import TabGroup from '@/components/shared/TabGroup'
import PageHeader from '@/components/ui/bar/PageHeader'
import { getDisplayProgress } from '@/lib/utils/courseProgress'
import dayjs from 'dayjs'

type TabFilter = 'all' | 'in-progress' | 'completed'

export default function MyCoursesPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<TabFilter>('all')
    const { myCoursesData, isLoading, error } = useMyCourses()

    // Filter courses based on active tab
    const filteredCourses = useMemo(() => {
        if (!myCoursesData?.courses) return []
        
        switch (activeTab) {
            case 'in-progress':
                return myCoursesData.courses.filter(course => {
                    const statusLower = course.status.toLowerCase()
                    return statusLower === 'in progress'
                })
            case 'completed':
                return myCoursesData.courses.filter(course => {
                    const statusLower = course.status.toLowerCase()
                    return statusLower === 'completed'
                })
            default:
                return myCoursesData.courses
        }
    }, [myCoursesData, activeTab])

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A'
        return dayjs(dateString).format('MMM D, YYYY')
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
        } else {
            return {
                bg: '#FEF3C7',
                text: '#92400E',
                label: status
            }
        }
    }

    const getProgressPercentage = (course: any) => {
        return getDisplayProgress(course.status, course.progress_percentage)
    }

    const handleContinueLearning = (courseId: number) => {
        router.push(`/my-courses/${courseId}/learn`)
    }

    if (isLoading) {
        return (
            <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <Spinner animation="border" />
                    <span style={{ color: '#6B7280' }}>Loading your courses...</span>
                </div>
            </div>
        )
    }

    if (error || !myCoursesData) {
        return (
            <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
                <div style={{ 
                    marginTop: '24px', 
                    padding: '40px', 
                    backgroundColor: 'white', 
                    borderRadius: '12px', 
                    textAlign: 'center',
                    color: '#EF4444'
                }}>
                    {error ? 'Failed to load courses. Please try again.' : 'No courses found'}
                </div>
            </div>
        )
    }

    const { totalCourses, inProgress, completed, certificates } = myCoursesData

    return (
        <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <PageHeader 
                    title="My Courses"
                    subtitle="Your enrolled courses and learning progress."
                />
            </div>

            {/* Summary Cards */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '16px', 
                marginBottom: '24px' 
            }}>
                {/* Total Courses */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#DBEAFE',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke="#1E40AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: '600', color: '#1F2937' }}>
                                {totalCourses}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6B7280' }}>
                                Total Courses
                            </div>
                        </div>
                    </div>
                </div>

                {/* In Progress */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#DBEAFE',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="#1E40AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: '600', color: '#1F2937' }}>
                                {inProgress}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6B7280' }}>
                                In Progress
                            </div>
                        </div>
                    </div>
                </div>

                {/* Completed */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#D1FAE5',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#065F46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: '600', color: '#1F2937' }}>
                                {completed}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6B7280' }}>
                                Completed
                            </div>
                        </div>
                    </div>
                </div>

                {/* Certificates */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#FEF3C7',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke="#92400E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: '600', color: '#1F2937' }}>
                                {certificates}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6B7280' }}>
                                Certificates
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <TabGroup
                tabs={[
                    { id: 'all', label: 'All Courses', badge: totalCourses },
                    { id: 'in-progress', label: 'In Progress', badge: inProgress },
                    { id: 'completed', label: 'Completed', badge: completed }
                ]}
                activeTab={activeTab}
                onTabChange={(tabId) => setActiveTab(tabId as TabFilter)}
            />

            {/* Course List */}
            {filteredCourses.length === 0 ? (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '40px',
                    textAlign: 'center',
                    color: '#9CA3AF'
                }}>
                    No courses found
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredCourses.map((course) => {
                        const statusBadge = getStatusBadge(course.status)
                        const progress = getProgressPercentage(course)
                        const isCompleted = course.status.toLowerCase() === 'completed'
                        const isPending = course.status.toLowerCase() === 'pending request'
                        const isRejected = course.status.toLowerCase() === 'rejected'

                        return (
                            <div
                                key={course.enrollment_id}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                    display: 'flex',
                                    gap: '20px',
                                    alignItems: 'flex-start'
                                }}
                            >
                                {/* Blue Book Icon */}
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    backgroundColor: '#003D7A',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Image width={32} height={32} src="/icon/common/graduate-cap.png" alt="Course icon" />
                                </div>

                                {/* Course Content */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {/* Title and Status */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: '0 0 8px 0' }}>
                                                {course.title}
                                            </h3>
                                            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 12px 0' }}>
                                                {course.description}
                                            </p>
                                        </div>
                                        <span style={{
                                            padding: '4px 12px',
                                            backgroundColor: statusBadge.bg,
                                            color: statusBadge.text,
                                            borderRadius: '16px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            whiteSpace: 'nowrap',
                                            height: 'fit-content'
                                        }}>
                                            {statusBadge.label}
                                        </span>
                                    </div>

                                    {/* Duration and Date */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        fontSize: '14px',
                                        color: '#6B7280'
                                    }}>
                                        <Image width={16} height={16} src="/icon/clock.svg" alt="Icon image" unoptimized/>
                                        <span>{course.estimated_days} {course.estimated_days === 1 ? 'Day' : 'Days'}</span>
                                        <span style={{fontSize: '8px'}}>•</span>
                                        {isCompleted && course.completed_date ? (
                                            <span>Completed: {formatDate(course.completed_date)}</span>
                                        ) : (
                                            <span>Due: {formatDate(course.due_date)}</span>
                                        )}
                                    </div>

                                    {/* Progress Bar */}
                                    <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                        <div style={{
                                            flex: 1,
                                            height: '8px',
                                            backgroundColor: '#E5E7EB',
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${progress}%`,
                                                height: '100%',
                                                backgroundColor: '#003D7A',
                                                transition: 'width 0.3s'
                                            }} />
                                        </div>
                                        <span style={{ fontSize: '14px', color: '#6B7280', minWidth: '50px', textAlign: 'right' }}>
                                            {progress}%
                                        </span>
                                    </div>

                                    {/* Continue Learning Button */}
                                    {!isPending && !isRejected && (
                                        <button
                                            type="button"
                                            onClick={() => handleContinueLearning(course.course_id)}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: '#003D7A',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                alignSelf: 'flex-start',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#002855'
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '#003D7A'
                                            }}
                                        >
                                            Continue Learning
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

