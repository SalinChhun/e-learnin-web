'use client'

import { useSearchParams } from 'next/navigation'
import Image from "next/image";
import BackButton from '@/components/shared/BackButton';
import { useCourseDetails } from '@/lib/hook/use-course';
import { Spinner } from 'react-bootstrap';
import React, { useState } from "react";
import CourseEnrollButton from './CourseEnrollButton';
import CourseLearnersTab from './CourseLearnersTab';
import usePermissions from "@/lib/hook/usePermissions";

interface CourseDetailsPageProps {
    courseId?: string
}

export default function CourseDetailsPage({ courseId }: CourseDetailsPageProps) {
    const searchParams = useSearchParams()
    const courseIdFromParams = courseId || searchParams.get('id')
    const { userRole, UserRole, isAdmin } = usePermissions();
    const isLearner = userRole === UserRole.LEARNER;
    const { course, isLoading, error } = useCourseDetails(courseIdFromParams)
    const [activeTab, setActiveTab] = useState<'lessons' | 'learners'>('lessons')

    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        })
    }

    if (isLoading) {
        return (
            <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <Spinner animation="border" />
                    <span style={{ color: '#6B7280' }}>Loading course details...</span>
                </div>
            </div>
        )
    }

    if (error || !course) {
        return (
            <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
                <BackButton title="Back to Courses" href="/courses" />
                <div style={{ 
                    marginTop: '24px', 
                    padding: '40px', 
                    backgroundColor: 'white', 
                    borderRadius: '12px', 
                    textAlign: 'center',
                    color: '#EF4444'
                }}>
                    {error ? 'Failed to load course details. Please try again.' : 'Course not found'}
                </div>
            </div>
        )
    }

    return (
        <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <BackButton title="Back to Courses" href="/courses" />
                {
                    isLearner && <CourseEnrollButton courseId={courseIdFromParams} />
                }
            </div>

            {/* Course Header Card */}
            <div
                style={{
                    padding: '20px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    marginBottom: '24px',
                    overflow: 'hidden',
                    display: 'flex',
                    position: 'relative'
                }}
            >
                {/* Blue Left Section */}
                <div
                    style={{
                        backgroundColor: '#003D7A',
                        width: '192px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        color: 'white',
                        borderRadius: '12px'
                    }}
                >
                    {/* Graduation Cap Icon */}
                    <Image width={48} height={48} src="/icon/common/graduate-cap.png"
                           alt="Icon image"/>
                    <span style={{
                        fontSize: '12px',
                        fontWeight: '400',
                        marginTop: '4px'
                    }}>{course.duration_hours} hours</span>
                </div>

                {/* Content Section */}
                <div style={{flex: 1, padding: '0 32px 0 32px', position: 'relative'}}>
                    <h1 style={{ fontSize: '16px', fontWeight: '400', color: '#1F2937', margin: '0 0 12px 0', lineHeight: '1.2' }}>
                        {course.title}
                    </h1>
                    
                    {/* Category Tag */}
                    <div style={{ marginBottom: '16px' }}>
                        <span
                            style={{
                                padding: '2px 8px',
                                backgroundColor: '#60A5FA',
                                color: 'white',
                                borderRadius: '16px',
                                fontSize: '14px',
                                fontWeight: '400',
                                display: 'inline-block'
                            }}
                        >
                            {course.category}
                        </span>
                    </div>

                    <p style={{ fontSize: '16px', color: '#6B7280', margin: '0 0 20px 0', fontWeight: '400'}}>
                        {course.description}
                    </p>

                    <div className="d-flex align-items-center gap-4" style={{ marginTop: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9CA3AF', fontSize: '14px' }}>
                            <span>Due: {formatDate(course.due_date)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9CA3AF', fontSize: '14px' }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="8" r="7" stroke="#9CA3AF" strokeWidth="1.5"/>
                                <path d="M8 4V8L11 10" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <span>{course.estimated_days} {course.estimated_days === 1 ? 'Day' : 'Days'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs - Only show for ADMIN */}
            {isAdmin && (
                <div style={{ 
                    marginBottom: '24px',
                    display: 'inline-flex',
                    backgroundColor: '#F3F4F6',
                    borderRadius: '12px',
                    padding: '4px',
                    position: 'relative'
                }}>
                    <button
                        type="button"
                        onClick={() => setActiveTab('lessons')}
                        style={{
                            padding: '10px 24px',
                            backgroundColor: activeTab === 'lessons' ? 'white' : 'transparent',
                            color: '#1F2937',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: activeTab === 'lessons' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
                            position: 'relative',
                            zIndex: activeTab === 'lessons' ? 1 : 0
                        }}
                    >
                        Lessons
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('learners')}
                        style={{
                            padding: '10px 24px',
                            backgroundColor: activeTab === 'learners' ? 'white' : 'transparent',
                            color: '#1F2937',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: activeTab === 'learners' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
                            position: 'relative',
                            zIndex: activeTab === 'learners' ? 1 : 0
                        }}
                    >
                        Learners
                    </button>
                </div>
            )}

            {/* Tab Content */}
            {isAdmin && activeTab === 'learners' ? (
                <CourseLearnersTab courseId={courseIdFromParams} />
            ) : (
                <>
                    {/* Final Assessment Section */}
                    <div
                        style={{
                            backgroundColor: '#DBEAFE',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '24px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    <div
                        style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: '#003D7A',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
                                fill="white"
                            />
                        </svg>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '400', color: '#1F2937', margin: '0 0 4px 0' }}>
                            Ready for Your Final Assessment?
                        </h3>
                        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, fontWeight: '400' }}>
                            Test your knowledge and earn your certificate. You can take the exam.
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        // Handle exam navigation
                        console.log('Take exam')
                    }}
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
                        whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#002855'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#003D7A'
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
                            fill="white"
                        />
                    </svg>
                    Take Exam Now
                </button>
            </div>

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
                        dangerouslySetInnerHTML={{__html: course.course_content}}
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
                        //margin: 24px 0 16px 0;
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
                </>
            )}
        </div>
    )
}

