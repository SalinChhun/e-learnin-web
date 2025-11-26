'use client'

import {useSearchParams} from 'next/navigation'
import BackButton from '@/components/shared/BackButton';
import {useCourseDetails} from '@/lib/hook/use-course';
import {Spinner} from 'react-bootstrap';
import React, {useState} from "react";
import CourseEnrollButton from './CourseEnrollButton';
import CourseLearnersTab from './CourseLearnersTab';
import usePermissions from "@/lib/hook/usePermissions";
import TabGroup from '@/components/shared/TabGroup';
import CourseHeaderCard from '@/components/shared/CourseHeaderCard';
import CourseVideoPlayer from '@/components/shared/CourseVideoPlayer';

interface CourseDetailsPageProps {
    courseId?: string
}

export default function CourseDetailsPage({courseId}: CourseDetailsPageProps) {
    const searchParams = useSearchParams()
    const courseIdFromParams = courseId || searchParams.get('id')
    const {userRole, UserRole, isAdmin} = usePermissions();
    const isLearner = userRole === UserRole.LEARNER;
    const {course, isLoading, error} = useCourseDetails(courseIdFromParams)
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
            <div style={{
                padding: '24px',
                backgroundColor: '#F9FAFB',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px'}}>
                    <Spinner animation="border"/>
                    <span style={{color: '#6B7280'}}>Loading course details...</span>
                </div>
            </div>
        )
    }

    if (error || !course) {
        return (
            <div style={{padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh'}}>
                <BackButton title="Back to Courses" href="/courses"/>
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
        <div style={{padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh'}}>
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <BackButton title="Back to Courses" href="/courses"/>
                {/*{*/}
                {/*    isLearner && <CourseEnrollButton courseId={courseIdFromParams} />*/}
                {/*}*/}
                <CourseEnrollButton courseId={courseIdFromParams} enrollmentStatus={course?.enrollment_status}/>
            </div>

            {/* Tabs - Only show for ADMIN */}
            {isAdmin && (
                <TabGroup
                    tabs={[
                        {id: 'lessons', label: 'Lessons'},
                        {id: 'learners', label: 'Learners'}
                    ]}
                    activeTab={activeTab}
                    onTabChange={(tabId) => setActiveTab(tabId as 'lessons' | 'learners')}
                />
            )}

            {/* Course Header Card */}
            <CourseHeaderCard
                title={course.title}
                category={course.category}
                description={course.description}
                durationHours={course.duration_hours}
                estimatedDays={course.estimated_days}
                dueDate={course.due_date}
            />

            {/* Tab Content */}
            {isAdmin && activeTab === 'learners' ? (
                <CourseLearnersTab courseId={courseIdFromParams}/>
            ) : (
                <>
                    {/* Video Player Section */}
                    <CourseVideoPlayer videoUrl={course.video_url} />

                    {/* Course Content */}
                    {
                        course.course_content &&
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '32px',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}>

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
                    }
                </>
            )}
        </div>
    )
}

