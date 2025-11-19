'use client'

import { useRouter } from 'next/navigation'
import { Spinner } from 'react-bootstrap'
import CourseCard from '@/components/ui/admin/CourseCard'
import { useFetchAllCourses } from '@/lib/hook/use-course'
import dayjs from 'dayjs'

interface Course {
    id: string
    title: string
    date: string
    learners: number
    status: 'Published' | 'Draft'
}

export default function RecentCourses() {
    const router = useRouter()
    const { courses: apiCourses, isLoading, error } = useFetchAllCourses(3)

    // Map API courses to component Course interface
    const recentCourses: Course[] = apiCourses.map((course: any) => ({
        id: course.id.toString(),
        title: course.title,
        date: course.created_at ? dayjs(course.created_at).format('MMM D, YYYY') : 'N/A',
        learners: course.learner_count || 0,
        status: course.status
    }))

    return (
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
                    onClick={() => router.push('/admin-management/all-course')}
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
            ) : recentCourses.length === 0 ? (
                <div style={{ 
                    padding: '24px', 
                    textAlign: 'center', 
                    color: '#6B7280' 
                }}>
                    <p>No courses found. Create your first course to get started.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {recentCourses.map((course) => (
                        <CourseCard
                            key={course.id}
                            id={course.id}
                            title={course.title}
                            date={course.date}
                            learners={course.learners}
                            status={course.status}
                            onEdit={(id) => {
                                router.push(`/admin-management/edit-course/${id}`)
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

