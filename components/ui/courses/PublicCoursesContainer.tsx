'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useFetchPublicCourses from '@/lib/hook/use-course'
import PageHeader from "@/components/ui/bar/PageHeader";
import CategorySelect from '@/components/shared/CategorySelect';
import Image from "next/image";

interface Course {
    id: number
    title: string
    category: string
    description: string
    learners: number
    duration: string
}

export default function PublicCoursesContainer() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const scrollContainerRef = useRef<HTMLDivElement>(null)
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
        duration: course.estimated_days ? `${course.estimated_days} ${course.estimated_days === 1 ? 'Day' : 'Days'}` : 'N/A'
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
            <div
                ref={scrollContainerRef}
                className="d-flex flex-wrap gap-3 hide-scrollbar"
                onScroll={handleScroll}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'auto',
                    paddingBottom: '20px',
                    alignContent: 'flex-start',
                    width: '100%',
                    scrollbarWidth: 'none', // Firefox
                    msOverflowStyle: 'none', // IE and Edge
                    WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
                }}
            >
                {isLoading && mappedCourses.length === 0 ? (
                    <div className="w-100 d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                        <span style={{ color: '#9CA3AF' }}>Loading courses...</span>
                    </div>
                ) : mappedCourses.length === 0 ? (
                    <div className="w-100 d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                        <span style={{ color: '#9CA3AF' }}>No courses found</span>
                    </div>
                ) : (
                    mappedCourses.map((course) => (
                    <div
                        key={course.id}
                        style={{
                            width: 'calc(33.333% - 11px)',
                            minWidth: '320px',
                            flexShrink: 0,
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                        }}
                    >
                        {/* Top Blue Section */}
                        <div
                            style={{
                                backgroundColor: '#003D7A',
                                height: '160px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '12px 12px 0 0',
                                position: 'relative'
                            }}
                        >
                            {/* Enrolled Status Tag */}
                            {/*<span*/}
                            {/*    style={{*/}
                            {/*        position: 'absolute',*/}
                            {/*        top: '12px',*/}
                            {/*        right: '12px',*/}
                            {/*        padding: '4px 12px',*/}
                            {/*        backgroundColor: '#60A5FA',*/}
                            {/*        color: 'white',*/}
                            {/*        borderRadius: '12px',*/}
                            {/*        fontSize: '12px',*/}
                            {/*        fontWeight: '500',*/}
                            {/*        whiteSpace: 'nowrap'*/}
                            {/*    }}*/}
                            {/*>*/}
                            {/*    Enrolled*/}
                            {/*</span>*/}
                            <svg
                                width="72"
                                height="72"
                                viewBox="0 0 64 64"
                                fill="none"
                            >
                                <path
                                    d="M12 20V44C12 45.5913 12.6321 47.1174 13.7574 48.2426C14.8826 49.3679 16.4087 50 18 50H46C47.5913 50 49.1174 49.3679 50.2426 48.2426C51.3679 47.1174 52 45.5913 52 44V20C52 18.4087 51.3679 16.8826 50.2426 15.7574C49.1174 14.6321 47.5913 14 46 14H18C16.4087 14 14.8826 14.6321 13.7574 15.7574C12.6321 16.8826 12 18.4087 12 20Z"
                                    stroke="white"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M20 26L32 34L44 26"
                                    stroke="white"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                        {/* Content Section */}
                        <div style={{padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px'}}>
                            <div className="d-flex justify-content-between align-items-start">
                                <h3 style={{fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: 0, flex: 1}}>
                                    {course.title}
                                </h3>
                                <span
                                    style={{
                                        padding: '4px 12px',
                                        backgroundColor: '#DBEAFE',
                                        color: '#003D7A',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        whiteSpace: 'nowrap',
                                        marginLeft: '8px'
                                    }}
                                >
                                    {course.category}
                                </span>
                            </div>
                            <p style={{fontSize: '14px', color: '#9CA3AF', margin: 0, lineHeight: '1.5'}}>
                                {course.description}
                            </p>
                            <div className="d-flex align-items-center gap-3" style={{marginTop: 'auto'}}>
                                <div className="d-flex align-items-center gap-2">
                                    <Image width={16} height={16} src="/icon/learner.svg" alt="Icon image" unoptimized/>
                                    <span style={{fontSize: '14px', color: '#9CA3AF'}}>
                                        {course.learners} learners
                                    </span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <Image width={16} height={16} src="/icon/duation.svg" alt="Icon image" unoptimized/>
                                    <span style={{fontSize: '14px', color: '#9CA3AF'}}>
                                        {course.duration}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* View Details Button */}
                        <div style={{padding: '0 20px 20px 20px'}}>
                            <button
                                type="button"
                                onClick={() => {
                                    // Find the original course data from apiCourses
                                    const originalCourse = apiCourses.find((c: any) => c.id === course.id)
                                    handleViewDetails(originalCourse || course)
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    backgroundColor: '#003D7A',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'background-color 0.2s',
                                    lineHeight: '20px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#002855'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#003D7A'
                                }}
                            >
                                <Image width={16} height={16} src="/icon/view-details.svg" alt="Icon image" unoptimized/>
                                <span>View Details</span>
                            </button>
                        </div>
                    </div>
                    ))
                )}
                
                {/* Loading indicator for infinite scroll */}
                {isFetchingNextPage && (
                    <div className="w-100 d-flex justify-content-center align-items-center" style={{ padding: '20px' }}>
                        <span style={{ color: '#9CA3AF' }}>Loading more courses...</span>
                    </div>
                )}
            </div>
        </div>
    )
}

