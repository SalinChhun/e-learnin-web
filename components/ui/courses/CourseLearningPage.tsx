'use client'

import { useSearchParams } from 'next/navigation'
import Image from "next/image";
import BackButton from '@/components/shared/BackButton';
import { useMyCourseById } from '@/lib/hook/use-course';
import { Spinner } from 'react-bootstrap';
import React from "react";
import CourseHeaderCard from '@/components/shared/CourseHeaderCard';
import TimeSpentCounter from '@/components/shared/TimeSpentCounter';
import FinalAssessmentSection from './FinalAssessmentSection';
import dayjs from 'dayjs';

interface CourseLearningPageProps {
    courseId?: string
}

export default function CourseLearningPage({ courseId }: CourseLearningPageProps) {
    const searchParams = useSearchParams()
    const courseIdFromParams = courseId || searchParams.get('id')
    const { course, isLoading, error } = useMyCourseById(courseIdFromParams)

    // Get progress percentage
    const getProgress = () => {
        if (!course) return 0
        const statusLower = course.status.toLowerCase()
        if (statusLower === 'pending request') return 0
        if (statusLower === 'in progress') return course.progress_percentage || 0
        if (statusLower === 'completed') return 100
        return course.progress_percentage || 0
    }

    // Get status badge
    const getStatusBadge = () => {
        if (!course) return null
        const statusLower = course.status.toLowerCase()
        if (statusLower === 'completed') {
            return { bg: '#D1FAE5', text: '#065F46', label: 'Completed' }
        } else if (statusLower === 'in progress') {
            return { bg: '#DBEAFE', text: '#1E40AF', label: 'In Progress' }
        } else {
            return { bg: '#FEF3C7', text: '#92400E', label: course.status }
        }
    }

    if (isLoading) {
        return (
            <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <Spinner animation="border" />
                    <span style={{ color: '#6B7280' }}>Loading course...</span>
                </div>
            </div>
        )
    }

    if (error || !course) {
        return (
            <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
                <BackButton title="Back to My Courses" href="/my-courses" />
                <div style={{ 
                    marginTop: '24px', 
                    padding: '40px', 
                    backgroundColor: 'white', 
                    borderRadius: '12px', 
                    textAlign: 'center',
                    color: '#EF4444'
                }}>
                    {error ? 'Failed to load course. Please try again.' : 'Course not found'}
                </div>
            </div>
        )
    }

    const statusBadge = getStatusBadge()
    const progress = getProgress()

    return (
        <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh', position: 'relative' }}>
            {/* Time Spent Counter - Top Right */}
            <TimeSpentCounter initialSeconds={course?.time_spent_seconds || 0} />

            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <BackButton title="Back to My Courses" href="/my-courses" />
            </div>

            {/* Course Header Card */}
            <CourseHeaderCard
                title={course.title}
                category={course.category}
                description={course.description}
                durationHours={course.duration_hours}
                estimatedDays={course.estimated_days}
                dueDate={course.due_date}
                status={course.status}
            />

            {/* Final Assessment Section */}
            <FinalAssessmentSection
                status={course.status}
                score={course.percentage_score}
                examAttemptStatus={course.exam_attempt_status}
                courseId={courseIdFromParams}
            />

            {/* Video Player Section */}
            <div
                style={{
                    backgroundColor: '#000000',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    position: 'relative',
                    paddingTop: '56.25%', // 16:9 aspect ratio
                    overflow: 'hidden'
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                    onClick={() => {
                        // Handle video play
                        console.log('Play video')
                    }}
                >
                    {/* Play Button */}
                    <div
                        style={{
                            width: '80px',
                            height: '80px',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)'
                        }}
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="#003D7A">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>

                {/* Video Controls */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                >
                    <button
                        type="button"
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </button>
                    <div style={{ flex: 1, height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: '2px' }}>
                        <div style={{ width: '0%', height: '100%', backgroundColor: '#003D7A', borderRadius: '2px' }} />
                    </div>
                    <span style={{ color: 'white', fontSize: '12px', minWidth: '80px', textAlign: 'right' }}>
                        0:00 / 30 min
                    </span>
                    <button
                        type="button"
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Course Content */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '32px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
                {course.course_content ? (
                    <div
                        className="ql-editor"
                        dangerouslySetInnerHTML={{__html: course?.course_content || ''}}
                        style={{
                            padding: '0 !important',
                            fontSize: '16px',
                            color: '#4B5563',
                            lineHeight: '1.8',
                            fontFamily: 'inherit'
                        }}
                    />
                ) : (
                    <div style={{color: '#9CA3AF', textAlign: 'center', padding: '40px'}}>
                        No course content available
                    </div>
                )}
                <style jsx global>{`
                    .ql-editor {
                        font-size: 16px;
                        color: #4B5563;
                        line-height: 1.8;
                    }

                    .ql-editor p {
                        margin: 0 0 16px 0;
                    }

                    .ql-editor p:last-child {
                        margin-bottom: 0;
                    }

                    .ql-editor h1,
                    .ql-editor h2,
                    .ql-editor h3,
                    .ql-editor h4,
                    .ql-editor h5,
                    .ql-editor h6 {
                        color: #1F2937;
                        font-weight: 600;
                    }

                    .ql-editor h1 {
                        font-size: 24px;
                    }

                    .ql-editor h2 {
                        font-size: 22px;
                    }

                    .ql-editor h3 {
                        font-size: 20px;
                    }

                    .ql-editor h4 {
                        font-size: 18px;
                    }

                    .ql-editor ul,
                    .ql-editor ol {
                        margin: 16px 0;
                        padding-left: 24px;
                        color: #4B5563;
                    }

                    .ql-editor li {
                        margin: 8px 0;
                    }

                    .ql-editor a {
                        color: #003D7A;
                        text-decoration: underline;
                    }

                    .ql-editor a:hover {
                        color: #002855;
                    }

                    .ql-editor img {
                        max-width: 100%;
                        height: auto;
                        margin: 16px 0;
                        border-radius: 8px;
                    }

                    .ql-editor blockquote {
                        border-left: 4px solid #003D7A;
                        padding-left: 16px;
                        margin: 16px 0;
                        color: #6B7280;
                        font-style: italic;
                    }

                    .ql-editor code {
                        background-color: #F3F4F6;
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-family: 'Courier New', monospace;
                        font-size: 14px;
                    }

                    .ql-editor pre {
                        background-color: #F3F4F6;
                        padding: 16px;
                        border-radius: 8px;
                        overflow-x: auto;
                        margin: 16px 0;
                    }

                    .ql-editor pre code {
                        background-color: transparent;
                        padding: 0;
                    }

                    .ql-editor strong {
                        font-weight: 600;
                        color: #1F2937;
                    }

                    .ql-editor em {
                        font-style: italic;
                    }

                    .ql-editor u {
                        text-decoration: underline;
                    }

                    .ql-editor s {
                        text-decoration: line-through;
                    }
                `}</style>
            </div>
        </div>
    )
}

