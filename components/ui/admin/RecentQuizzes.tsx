'use client'

import { useRouter } from 'next/navigation'
import { Spinner } from 'react-bootstrap'
import QuizCard from '@/components/ui/admin/QuizCard'
import { useFetchQuizzes } from '@/lib/hook/use-quiz'
import dayjs from 'dayjs'

interface Quiz {
    id: string
    title: string
    type: string
    courseTitle?: string
    date: string
    duration: number
    passingScore: number
}

export default function RecentQuizzes() {
    const router = useRouter()
    const { quizzes: apiQuizzes, isLoading, error } = useFetchQuizzes(3)

    // Map API quizzes to component Quiz interface
    const recentQuizzes: Quiz[] = apiQuizzes.map((quiz: any) => ({
        id: quiz.id.toString(),
        title: quiz.title,
        type: quiz.type || 'Quiz',
        courseTitle: quiz.course_title,
        date: quiz.created_at ? dayjs(quiz.created_at).format('MMM D, YYYY') : 'N/A',
        duration: quiz.duration_minutes || 0,
        passingScore: quiz.passing_score || 0
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
                    Recent Quiz/Exam
                </h2>
                <button
                    type="button"
                    onClick={() => router.push('/admin-management/all-quiz')}
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

            {/* Quiz List */}
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
                    <p>Error loading quizzes. Please try again later.</p>
                </div>
            ) : recentQuizzes.length === 0 ? (
                <div style={{ 
                    padding: '24px', 
                    textAlign: 'center', 
                    color: '#6B7280' 
                }}>
                    <p>No quizzes found. Create your first quiz to get started.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {recentQuizzes.map((quiz) => (
                        <QuizCard
                            key={quiz.id}
                            id={quiz.id}
                            title={quiz.title}
                            type={quiz.type}
                            courseTitle={quiz.courseTitle}
                            date={quiz.date}
                            duration={quiz.duration}
                            passingScore={quiz.passingScore}
                            onEdit={(id) => {
                                router.push(`/admin-management/edit-quiz/${id}`)
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

