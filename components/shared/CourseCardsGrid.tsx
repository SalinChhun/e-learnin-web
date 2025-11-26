'use client'

import React, { useRef, useCallback } from 'react'
import Image from 'next/image'

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

interface CourseCardsGridProps {
    courses: Course[]
    isLoading: boolean
    isFetchingNextPage: boolean
    hasNextPage: boolean
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void
    onViewDetails: (course: any) => void
    apiCourses: any[]
}

export default function CourseCardsGrid({
    courses,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    onScroll,
    onViewDetails,
    apiCourses
}: CourseCardsGridProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        onScroll(e)
    }, [onScroll])

    return (
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
            {isLoading && courses.length === 0 ? (
                <div className="w-100 d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <span style={{ color: '#9CA3AF' }}>Loading courses...</span>
                </div>
            ) : courses.length === 0 ? (
                <div className="w-100 d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <span style={{ color: '#9CA3AF' }}>No courses found</span>
                </div>
            ) : (
                courses.map((course) => {
                    return (
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
                                {course.enrollment_status && (
                                    <span
                                        style={{
                                            position: 'absolute',
                                            top: '12px',
                                            right: '12px',
                                            padding: '4px 12px',
                                            backgroundColor: '#DBEAFE',
                                            color: '#193CB8',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        Enrolled
                                    </span>
                                )}
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
                            <div style={{
                                padding: '20px',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                            }}>
                                <div className="d-flex justify-content-between align-items-start">
                                    <h3 style={{
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: '#1F2937',
                                        margin: 0,
                                        flex: 1
                                    }}>
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
                                <p style={{ fontSize: '14px', color: '#9CA3AF', margin: 0, lineHeight: '1.5' }}>
                                    {course.description}
                                </p>
                                <div className="d-flex align-items-center gap-3" style={{ marginTop: 'auto' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <Image width={16} height={16} src="/icon/learner.svg" alt="Icon image"
                                            unoptimized />
                                        <span style={{ fontSize: '14px', color: '#9CA3AF' }}>
                                            {course.learners} learners
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <Image width={16} height={16} src="/icon/duation.svg" alt="Icon image"
                                            unoptimized />
                                        <span style={{ fontSize: '14px', color: '#9CA3AF' }}>
                                            {course.duration}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* View Details Button */}
                            <div style={{ padding: '0 20px 20px 20px' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        // Find the original course data from apiCourses
                                        const originalCourse = apiCourses.find((c: any) => c.id === course.id)
                                        onViewDetails(originalCourse || course)
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
                                    <Image width={16} height={16} src="/icon/view-details.svg" alt="Icon image"
                                        unoptimized />
                                    <span>View Details</span>
                                </button>
                            </div>
                        </div>
                    )
                })
            )}

            {/* Loading indicator for infinite scroll */}
            {isFetchingNextPage && (
                <div className="w-100 d-flex justify-content-center align-items-center" style={{ padding: '20px' }}>
                    <span style={{ color: '#9CA3AF' }}>Loading more courses...</span>
                </div>
            )}
        </div>
    )
}

