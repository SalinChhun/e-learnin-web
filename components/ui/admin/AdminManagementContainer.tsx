'use client'

import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/bar/PageHeader'

interface AdminManagementContainerProps {
    sessionData: any
}

interface Course {
    id: string
    title: string
    date: string
    learners: number
    status: 'Published' | 'Draft'
}

export default function AdminManagementContainer({ sessionData }: AdminManagementContainerProps) {
    const router = useRouter()

    // Mock data for recent courses
    const recentCourses: Course[] = [
        { id: '1', title: 'Banking Fundamentals', date: 'Oct 1, 2025', learners: 45, status: 'Published' },
        { id: '2', title: 'Risk Management', date: 'Oct 5, 2025', learners: 38, status: 'Published' },
        { id: '3', title: 'Digital Transformation', date: 'Oct 20, 2025', learners: 0, status: 'Draft' }
    ]

    return (
        <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '32px' }}>
                <PageHeader 
                    title="Admin Management"
                    subtitle="Create and manage courses, quizzes, and certificates"
                />
            </div>

            {/* Action Cards Section */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '24px', 
                marginBottom: '32px' 
            }}>
                {/* Create New Course Card */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: '#3B82F6',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 7h8M8 11h8M8 15h4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: '0 0 8px 0' }}>
                            Create New Course
                        </h3>
                        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, lineHeight: '1.5' }}>
                            Design and publish new learning courses with lessons, quizzes, and assignments
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.push('/admin-management/create-course')}
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
                            gap: '8px',
                            transition: 'background-color 0.2s',
                            width: 'fit-content'
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
                        Create New
                    </button>
                </div>

                {/* Create Quiz/Exam Card */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: '#8B5CF6',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: '0 0 8px 0' }}>
                            Create Quiz/Exam
                        </h3>
                        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, lineHeight: '1.5' }}>
                            Build assessments with multiple choice and open-ended questions
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            // TODO: Navigate to create quiz/exam page
                            console.log('Create Quiz/Exam')
                        }}
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
                            gap: '8px',
                            transition: 'background-color 0.2s',
                            width: 'fit-content'
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
                        Create New
                    </button>
                </div>

                {/* Certificate Templates Card */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: '#10B981',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: '0 0 8px 0' }}>
                            Certificate Templates
                        </h3>
                        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, lineHeight: '1.5' }}>
                            Design and manage digital certificates for course completion
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            // TODO: Navigate to certificate templates page
                            console.log('Create Certificate Template')
                        }}
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
                            gap: '8px',
                            transition: 'background-color 0.2s',
                            width: 'fit-content'
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
                        Create New
                    </button>
                </div>
            </div>

            {/* Recent Courses Section */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '24px' 
                }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: 0 }}>
                        Recent Courses
                    </h2>
                    <button
                        type="button"
                        onClick={() => {
                            // TODO: Navigate to all courses page
                            console.log('View All')
                        }}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'transparent',
                            color: '#003D7A',
                            border: '1px solid #003D7A',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F0F9FF'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                    >
                        View All
                    </button>
                </div>

                {/* Course List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {recentCourses.map((course, index) => (
                        <div
                            key={course.id}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px 0',
                                borderBottom: index < recentCourses.length - 1 ? '1px solid #E5E7EB' : 'none'
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <h3 style={{ 
                                    fontSize: '16px', 
                                    fontWeight: '500', 
                                    color: '#1F2937', 
                                    margin: '0 0 8px 0' 
                                }}>
                                    {course.title}
                                </h3>
                                <p style={{ 
                                    fontSize: '14px', 
                                    color: '#6B7280', 
                                    margin: 0 
                                }}>
                                    {course.date} • {course.learners} learners
                                </p>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '16px' 
                            }}>
                                <span style={{
                                    padding: '4px 12px',
                                    backgroundColor: course.status === 'Published' ? '#10B981' : '#9CA3AF',
                                    color: 'white',
                                    borderRadius: '16px',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                }}>
                                    {course.status}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        // TODO: Navigate to edit course page
                                        console.log('Edit course', course.id)
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: 'transparent',
                                        color: '#003D7A',
                                        border: '1px solid #003D7A',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#F0F9FF'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent'
                                    }}
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

