'use client'

import { useCallback, useRef } from 'react'
import { Spinner } from 'react-bootstrap'
import BackButton from '@/components/shared/BackButton'
import PageHeader from '@/components/ui/bar/PageHeader'
import QuizCard from '@/components/ui/admin/QuizCard'
import { useFetchAllQuizzesInfinite } from '@/lib/hook/use-quiz'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'

export default function AllQuizzesPage() {
    const router = useRouter()
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const { 
        quizzes: apiQuizzes, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage, 
        isLoading, 
        error 
    } = useFetchAllQuizzesInfinite(10)

    // Map API quizzes to component Quiz interface
    const quizzes = apiQuizzes.map((quiz: any) => ({
        id: quiz.id.toString(),
        title: quiz.title,
        type: quiz.type || 'Quiz',
        courseTitle: quiz.course_title,
        date: quiz.created_at ? dayjs(quiz.created_at).format('MMM D, YYYY') : 'N/A',
        duration: quiz.duration_minutes || 0,
        passingScore: quiz.passing_score || 0
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
        router.push(`/admin-management/edit-quiz/${id}`)
    }

    return (
        <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '32px' }}>
                <BackButton title="Back to Admin Management" href="/admin-management" />
                <div style={{ marginTop: '16px' }}>
                    <PageHeader 
                        title="All Quiz/Exam"
                        subtitle="Manage and edit all your quizzes and exams"
                    />
                </div>
            </div>

            {/* Quizzes List */}
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
                        <p>Error loading quizzes. Please try again later.</p>
                    </div>
                ) : quizzes.length === 0 ? (
                    <div style={{ 
                        padding: '24px', 
                        textAlign: 'center', 
                        color: '#6B7280' 
                    }}>
                        <p>No quizzes found. Create your first quiz to get started.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {quizzes.map((quiz) => (
                            <QuizCard
                                key={quiz.id}
                                id={quiz.id}
                                title={quiz.title}
                                type={quiz.type}
                                courseTitle={quiz.courseTitle}
                                date={quiz.date}
                                duration={quiz.duration}
                                passingScore={quiz.passingScore}
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
                        {!hasNextPage && quizzes.length > 0 && (
                            <div style={{ 
                                padding: '20px', 
                                textAlign: 'center', 
                                color: '#6B7280',
                                fontSize: '14px'
                            }}>
                                <p>No more quizzes to load</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

