'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useFetchPublicCourses from '@/lib/hook/use-course'
import PageHeader from "@/components/ui/bar/PageHeader";
import CategorySelect from '@/components/shared/CategorySelect';
import { formatRelativeTime } from '@/lib/utils/dateUtils';
import CourseCardsGrid from '@/components/shared/CourseCardsGrid';

interface Course {
    id: number
    title: string
    category: string
    description: string
    enrollment_status?: boolean
    learners: number
    duration: string
    created_at?: string
}

export default function PublicCoursesContainer() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search_value') || '')
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchParams.get('search_value') || '')
    const [selectedCategoryId, setSelectedCategoryId] = useState(searchParams.get('category_id') || '')
    
    const { courses: apiCourses, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFetchPublicCourses()
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

    // Map API courses to component Course interface
    const mappedCourses: Course[] = apiCourses.map((course: any) => ({
        id: course.id,
        title: course.title,
        category: course.category,
        description: course.description,
        learners: course.learner_count || 0,
        enrollment_status: course.enrollment_status,
        duration: formatRelativeTime(course.created_at),
        created_at: course.created_at
    }))

    // Handle View Details click
    const handleViewDetails = (course: any) => {
        router.push(`/courses/${course.id}`)
    }

    // Update URL params when search or category changes
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())
        
        if (debouncedSearchQuery) {
            params.set('search_value', debouncedSearchQuery)
        } else {
            params.delete('search_value')
        }
        
        if (selectedCategoryId) {
            params.set('category_id', selectedCategoryId)
        } else {
            params.delete('category_id')
        }
        
        params.set('page_number', '0')
        params.set('page_size', '10')
        params.set('sort_columns', 'id:desc')
        
        router.push(`?${params.toString()}`, { scroll: false })
    }, [debouncedSearchQuery, selectedCategoryId, router, searchParams])

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

    return (
        <div className="w-100 h-100 d-flex flex-column gap-4" style={{padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh', width: '100%', overflowX: 'auto'}}>
            <PageHeader/>
            {/* Search and Filter Bar */}
            <div className="d-flex justify-content-between align-items-center gap-3">
                <div className="d-flex align-items-center gap-3" style={{flex: 1}}>
                    <div className="position-relative" style={{flex: 1}}>
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
                                height: '32px',
                                padding: '12px 16px 12px 44px',
                                backgroundColor: '#F3F4F6',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s',
                                boxSizing: 'border-box',
                                lineHeight: '20px'
                            }}
                            onFocus={(e) => e.target.style.backgroundColor = '#FFFFFF'}
                            onBlur={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                        />
                    </div>
                    <div className="position-relative">
                        <CategorySelect
                            value={selectedCategoryId}
                            onChange={setSelectedCategoryId}
                            variant="filter"
                            showAllOption={true}
                        />
                    </div>
                </div>
            </div>

            {/* Course Cards Grid */}
            <CourseCardsGrid
                courses={mappedCourses}
                isLoading={isLoading}
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={hasNextPage}
                onScroll={handleScroll}
                onViewDetails={handleViewDetails}
                apiCourses={apiCourses}
            />
        </div>
    )
}

