'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Spinner } from 'react-bootstrap'
import { useQuizByCourse, useStartQuiz, useSubmitQuiz } from '@/lib/hook/use-quiz'
import Image from 'next/image'

interface ExamPageProps {
    courseId?: string
}

export default function ExamPage({ courseId }: ExamPageProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const courseIdFromParams = courseId || searchParams.get('courseId')
    
    const { quiz, isLoading: isLoadingQuiz } = useQuizByCourse(courseIdFromParams)
    const { startQuiz, isPending: isStarting } = useStartQuiz()
    const { submitQuiz, isPending: isSubmitting } = useSubmitQuiz()
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<number, number>>({})
    const [timeRemaining, setTimeRemaining] = useState(0)
    const [isStarted, setIsStarted] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [score, setScore] = useState<number | null>(null)
    const [isPassed, setIsPassed] = useState<boolean | null>(null)

    // Initialize timer when quiz starts
    useEffect(() => {
        if (quiz && isStarted && !submitted && timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

            return () => clearInterval(timer)
        }
    }, [quiz, isStarted, submitted])

    // Auto-submit when time runs out
    useEffect(() => {
        if (timeRemaining === 0 && isStarted && !submitted && quiz && !isSubmitting) {
            const submitData = {
                quiz_id: quiz.id,
                answers: sortedQuestions.map((question) => ({
                    question_id: question.id,
                    selected_option_id: answers[question.id],
                    answer_text: question.options?.find(opt => opt.id === answers[question.id])?.option_text || ''
                }))
            }

            submitQuiz(submitData, {
                onSuccess: (response) => {
                    const submittedScore = response?.data?.percentage_score || response?.data?.score_percentage || 0
                    const passed = response?.data?.is_passed ?? false
                    setScore(submittedScore)
                    setIsPassed(passed)
                    setSubmitted(true)
                }
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeRemaining, isStarted, submitted, quiz?.id, isSubmitting])

    // Start quiz when component mounts
    useEffect(() => {
        if (quiz && !isStarted && !isStarting) {
            startQuiz(quiz.id, {
                onSuccess: () => {
                    setIsStarted(true)
                    setTimeRemaining(quiz.duration_minutes * 60)
                },
                onError: () => {
                    router.push(`/my-courses/${courseIdFromParams}/learn`)
                }
            })
        }
    }, [quiz, isStarted, isStarting])

    const sortedQuestions = useMemo(() => {
        if (!quiz?.questions) return []
        return [...quiz.questions].sort((a, b) => a.order_sequence - b.order_sequence)
    }, [quiz?.questions])

    const currentQuestion = sortedQuestions[currentQuestionIndex]
    const totalQuestions = sortedQuestions.length
    const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0

    const handleAnswerSelect = (optionId: number) => {
        if (submitted) return
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: optionId
        }))
    }

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1)
        }
    }

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
        }
    }

    const handleSubmit = useCallback(() => {
        if (submitted || isSubmitting || !quiz) return

        const submitData = {
            quiz_id: quiz.id,
            answers: sortedQuestions.map((question) => ({
                question_id: question.id,
                selected_option_id: answers[question.id],
                answer_text: question.options?.find(opt => opt.id === answers[question.id])?.option_text || ''
            }))
        }

            submitQuiz(submitData, {
                onSuccess: (response) => {
                    const submittedScore = response?.data?.percentage_score || response?.data?.score_percentage || 0
                    const passed = response?.data?.is_passed ?? false
                    setScore(submittedScore)
                    setIsPassed(passed)
                    setSubmitted(true)
                },
                onError: () => {
                    // Error handling is done in the hook
                }
            })
    }, [submitted, isSubmitting, quiz, sortedQuestions, answers, submitQuiz])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (isLoadingQuiz || isStarting) {
        return (
            <div style={{
                padding: '24px',
                backgroundColor: '#F9FAFB',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <Spinner animation="border" />
                    <span style={{ color: '#6B7280' }}>Loading exam...</span>
                </div>
            </div>
        )
    }

    if (!quiz) {
        return (
            <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
                <button
                    onClick={() => router.push(`/my-courses/${courseIdFromParams}/learn`)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#003D7A',
                        cursor: 'pointer',
                        fontSize: '14px',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    ← Exit Exam
                </button>
                <div style={{
                    marginTop: '24px',
                    padding: '40px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: '#EF4444'
                }}>
                    No exam found for this course
                </div>
            </div>
        )
    }

    // Show result page after submission
    if (submitted && score !== null && isPassed !== null) {
        const passingScore = quiz?.passing_score || 70

        // Show "Not Passed" screen
        if (!isPassed) {
            return (
                <div style={{
                    padding: '24px',
                    backgroundColor: '#F9FAFB',
                    minHeight: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{
                        backgroundColor: '#FEF3C7',
                        borderRadius: '12px',
                        padding: '48px',
                        textAlign: 'center',
                        maxWidth: '500px',
                        width: '100%',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            backgroundColor: '#EF4444',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            position: 'relative'
                        }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <div style={{
                                position: 'absolute',
                                bottom: '-4px',
                                right: '-4px',
                                width: '24px',
                                height: '24px',
                                backgroundColor: '#EF4444',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid white'
                            }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7"></path>
                                </svg>
                            </div>
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1F2937', margin: '0 0 16px 0' }}>
                            Exam Not Passed
                        </h2>
                        <p style={{ fontSize: '18px', fontWeight: '500', color: '#EF4444', margin: '0 0 16px 0' }}>
                            Your Score: {score}%
                        </p>
                        <p style={{ fontSize: '16px', color: '#1F2937', margin: '0 0 32px 0' }}>
                            You need at least {passingScore}% to pass. Please review the course materials and try again.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => {
                                    // Reset exam state to retry
                                    setCurrentQuestionIndex(0)
                                    setAnswers({})
                                    setSubmitted(false)
                                    setScore(null)
                                    setIsPassed(null)
                                    setIsStarted(false)
                                    setTimeRemaining(0)
                                    // Restart quiz
                                    if (quiz) {
                                        startQuiz(quiz.id, {
                                            onSuccess: () => {
                                                setIsStarted(true)
                                                setTimeRemaining(quiz.duration_minutes * 60)
                                            },
                                            onError: () => {
                                                router.push(`/my-courses/${courseIdFromParams}/learn`)
                                            }
                                        })
                                    }
                                }}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#E5E7EB',
                                    color: '#6B7280',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#D1D5DB'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#E5E7EB'
                                }}
                            >
                                Retry Exam
                            </button>
                            <button
                                onClick={() => router.push(`/my-courses/${courseIdFromParams}/learn`)}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#003D7A',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#002855'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#003D7A'
                                }}
                            >
                                Back to Course
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        // Show "Passed" success screen
        return (
            <div style={{
                padding: '24px',
                backgroundColor: '#F9FAFB',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <div style={{
                    backgroundColor: '#D1FAE5',
                    borderRadius: '12px',
                    padding: '48px',
                    textAlign: 'center',
                    maxWidth: '500px',
                    width: '100%'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: '#00A63E',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px'
                    }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#00A63E', margin: '0 0 16px 0' }}>
                        Congratulations!
                    </h2>
                    <p style={{ fontSize: '18px', fontWeight: '500', color: '#00A63E', margin: '0 0 16px 0' }}>
                        Your Score: {score}%
                    </p>
                    <p style={{ fontSize: '16px', color: '#1F2937', margin: '0 0 32px 0' }}>
                        You have successfully completed the exam. You can now download your certificate.
                    </p>
                    <button
                        onClick={() => router.push(`/my-courses/${courseIdFromParams}/certificate`)}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#003D7A',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#002855'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#003D7A'
                        }}
                    >
                        Continue to Certificate
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <button
                    onClick={() => router.push(`/my-courses/${courseIdFromParams}/learn`)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#003D7A',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    ← Exit Exam
                </button>
                <div style={{
                    backgroundColor: '#DBEAFE',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" stroke="#1E40AF" strokeWidth="1.5"/>
                        <path d="M8 4V8L11 10" stroke="#1E40AF" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span style={{ fontSize: '14px', color: '#1E40AF', fontWeight: '500' }}>
                        Time Remaining: {formatTime(timeRemaining)}
                    </span>
                </div>
            </div>

            {/* Question Card */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '32px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
                {/* Progress */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
                            Question {currentQuestionIndex + 1} of {totalQuestions}
                        </span>
                        <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
                            {Math.round(progress)}% Complete
                        </span>
                    </div>
                    <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: '#E5E7EB',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${progress}%`,
                            height: '100%',
                            backgroundColor: '#003D7A',
                            transition: 'width 0.3s'
                        }} />
                    </div>
                </div>

                {/* Question */}
                <h2 style={{
                    fontSize: '18px',
                    fontWeight: '500',
                    color: '#1F2937',
                    margin: '0 0 24px 0'
                }}>
                    {currentQuestion?.question_text}
                </h2>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                    {currentQuestion?.options
                        ?.sort((a, b) => a.order_sequence - b.order_sequence)
                        .map((option) => {
                            const isSelected = answers[currentQuestion.id] === option.id
                            return (
                                <div
                                    key={option.id}
                                    onClick={() => handleAnswerSelect(option.id)}
                                    style={{
                                        padding: '16px',
                                        backgroundColor: isSelected ? '#DBEAFE' : 'white',
                                        border: `2px solid ${isSelected ? '#003D7A' : '#E5E7EB'}`,
                                        borderRadius: '8px',
                                        cursor: submitted ? 'default' : 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!submitted && !isSelected) {
                                            e.currentTarget.style.borderColor = '#003D7A'
                                            e.currentTarget.style.backgroundColor = '#F3F4F6'
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!submitted && !isSelected) {
                                            e.currentTarget.style.borderColor = '#E5E7EB'
                                            e.currentTarget.style.backgroundColor = 'white'
                                        }
                                    }}
                                >
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        border: `2px solid ${isSelected ? '#003D7A' : '#9CA3AF'}`,
                                        backgroundColor: isSelected ? '#003D7A' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        {isSelected && (
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: 'white'
                                            }} />
                                        )}
                                    </div>
                                    <span style={{
                                        fontSize: '16px',
                                        color: '#1F2937',
                                        flex: 1
                                    }}>
                                        {option.option_text}
                                    </span>
                                </div>
                            )
                        })}
                </div>

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: 'white',
                            color: '#003D7A',
                            border: '1px solid #003D7A',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                            opacity: currentQuestionIndex === 0 ? 0.5 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        ← Previous
                    </button>
                    {currentQuestionIndex === totalQuestions - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || submitted}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: isSubmitting ? '#9CA3AF' : '#003D7A',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: isSubmitting || submitted ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <Spinner animation="border" size="sm" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Exam'
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
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
                                gap: '8px'
                            }}
                        >
                            Next →
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

