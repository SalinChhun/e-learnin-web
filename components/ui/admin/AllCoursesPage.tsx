'use client'

import { useCallback, useRef } from 'react'
import { Spinner } from 'react-bootstrap'
import BackButton from '@/components/shared/BackButton'
import PageHeader from '@/components/ui/bar/PageHeader'
import CourseCard from '@/components/ui/admin/CourseCard'
import { useFetchAllCoursesInfinite } from '@/lib/hook/use-course'
import dayjs from 'dayjs'
import {useRouter} from "next/navigation";

export default function AllCoursesPage() {
    const router = useRouter()
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const { 
        courses: apiCourses, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage, 
        isLoading, 
        error 
    } = useFetchAllCoursesInfinite(10)

    // Map API courses to component Course interface
    const courses = apiCourses.map((course: any) => ({
        id: course.id.toString(),
        title: course.title,
        date: course.created_at ? dayjs(course.created_at).format('MMM D, YYYY') : 'N/A',
        learners: course.learner_count || 0,
        status: course.status
    }))

    // Infinite scroll handler
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
        
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

    const handleEdit = (id: string | number) => {
        router.push(`/admin-management/edit-course/${id}`)
    }

    return (
        <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '32px' }}>
                <BackButton title="Back to Admin Management" href="/admin-management" />
                <div style={{ marginTop: '16px' }}>
                    <PageHeader 
                        title="All Courses"
                        subtitle="Manage and edit all your courses"
                    />
                </div>
            </div>

            {/* Courses List */}
            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    maxHeight: 'calc(100vh - 200px)',
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
                        <Spinner animation="border" />
                    </div>
                ) : error ? (
                    <div style={{ 
                        padding: '24px', 
                        textAlign: 'center', 
                        color: '#EF4444' 
                    }}>
                        <p>Error loading courses. Please try again later.</p>
                    </div>
                ) : courses.length === 0 ? (
                    <div style={{ 
                        padding: '24px', 
                        textAlign: 'center', 
                        color: '#6B7280' 
                    }}>
                        <p>No courses found. Create your first course to get started.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {courses.map((course) => (
                            <CourseCard
                                key={course.id}
                                id={course.id}
                                title={course.title}
                                date={course.date}
                                learners={course.learners}
                                status={course.status}
                                onEdit={handleEdit}
                            />
                        ))}
                        
                        {/* Loading indicator for infinite scroll */}
                        {isFetchingNextPage && (
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center', 
                                padding: '20px' 
                            }}>
                                <Spinner animation="border" size="sm" />
                            </div>
                        )}
                        
                        {/* End of list message */}
                        {!hasNextPage && courses.length > 0 && (
                            <div style={{ 
                                padding: '20px', 
                                textAlign: 'center', 
                                color: '#6B7280',
                                fontSize: '14px'
                            }}>
                                <p>No more courses to load</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

