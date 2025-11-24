'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import { Spinner } from 'react-bootstrap'
import PageHeader from '@/components/ui/bar/PageHeader'
import CourseCard from '@/components/ui/admin/CourseCard'
import { useFetchAllCoursesInfinite } from '@/lib/hook/use-course'
import dayjs from 'dayjs'
import {useRouter, useSearchParams} from "next/navigation";

export default function AllCoursesPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search_value') || '')
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchParams.get('search_value') || '')
    
    const { 
        courses: apiCourses, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage, 
        isLoading, 
        error 
    } = useFetchAllCoursesInfinite(10, debouncedSearchQuery || undefined)

    // Debounce search query
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }
        
        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery)
        }, 500)
        
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [searchQuery])

    // Update URL params when search changes
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())
        
        if (debouncedSearchQuery) {
            params.set('search_value', debouncedSearchQuery)
        } else {
            params.delete('search_value')
        }
        
        router.push(`?${params.toString()}`, { scroll: false })
    }, [debouncedSearchQuery, router, searchParams])

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

    const handleCreateCourse = () => {
        router.push('/admin-management/create-course')
    }

    return (
        <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '24px'
                }}>
                    <div>
                        <PageHeader 
                            title="All Courses"
                            subtitle="Manage and edit all your courses"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleCreateCourse}
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
                            height: 'fit-content'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#002855'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#003D7A'
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Create Course
                    </button>
                </div>
                
                {/* Search Bar */}
                <div style={{ position: 'relative', maxWidth: '400px' }}>
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none',
                            zIndex: 1
                        }}
                    >
                        <path
                            d="M8.25 14.25C11.5637 14.25 14.25 11.5637 14.25 8.25C14.25 4.93629 11.5637 2.25 8.25 2.25C4.93629 2.25 2.25 4.93629 2.25 8.25C2.25 11.5637 4.93629 14.25 8.25 14.25Z"
                            stroke="#9CA3AF"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M15.75 15.75L12.4875 12.4875"
                            stroke="#9CA3AF"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            height: '40px',
                            padding: '10px 16px 10px 44px',
                            backgroundColor: '#F3F4F6',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'all 0.2s',
                            boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                            e.target.style.backgroundColor = '#FFFFFF'
                            e.target.style.boxShadow = '0 0 0 3px rgba(0, 61, 122, 0.1)'
                        }}
                        onBlur={(e) => {
                            e.target.style.backgroundColor = '#F3F4F6'
                            e.target.style.boxShadow = 'none'
                        }}
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

