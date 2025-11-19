'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Spinner } from 'react-bootstrap'
import { useRouter } from 'next/navigation'
import BackButton from '@/components/shared/BackButton'
import PageHeader from '@/components/ui/bar/PageHeader'
import { useCreateQuiz } from '@/lib/hook/use-quiz'
import { useFetchAllCourses } from '@/lib/hook/use-course'
import { createQuizSchema, CreateQuizOutput } from '@/validators/quiz.schema'
import { CreateQuestionRequest } from '@/service/quiz.service'

export default function CreateQuizPage() {
    const router = useRouter()
    const { mutation: createQuizMutation, isPending: isCreating } = useCreateQuiz()
    const { courses, isLoading: isLoadingCourses } = useFetchAllCourses(100) // Fetch all courses for dropdown
    const [actionType, setActionType] = useState<'create' | null>(null)
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        control,
    } = useForm<CreateQuizOutput>({
        resolver: zodResolver(createQuizSchema),
        mode: 'onChange',
        defaultValues: {
            title: '',
            description: '',
            type: '1',
            course_id: 0 as unknown as number,
            duration_minutes: 30,
            passing_score: 70,
            questions: [
                {
                    question_text: '',
                    question_type: 'MULTIPLE_CHOICE',
                    points: 10,
                    answer_explanation: '',
                    order_sequence: 1,
                    image_url: '',
                    video_url: '',
                    file_url: '',
                    voice_url: '',
                    options: [
                        { option_text: '', is_correct: false, order_sequence: 1 },
                        { option_text: '', is_correct: false, order_sequence: 2 }
                    ]
                }
            ]
        },
    })
    
    const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
        control,
        name: 'questions'
    })

    const onSubmit = (data: CreateQuizOutput) => {
        setActionType('create')

        const quizData = {
            title: data.title,
            description: data.description,
            type: data.type,
            course_id: data.course_id,
            duration_minutes: data.duration_minutes,
            passing_score: data.passing_score
        }

        const questions: CreateQuestionRequest[] = data.questions.map((q, index) => {
            const baseQuestion: CreateQuestionRequest = {
                question_text: q.question_text,
                question_type: q.question_type,
                points: q.points,
                answer_explanation: q.answer_explanation || undefined,
                order_sequence: index + 1,
                image_url: q.image_url || undefined,
                video_url: q.video_url || undefined,
                file_url: q.file_url || undefined,
                voice_url: q.voice_url || undefined,
            }

            // Only include options for MULTIPLE_CHOICE and TRUE_FALSE
            if (q.question_type === 'MULTIPLE_CHOICE' || q.question_type === 'TRUE_FALSE') {
                baseQuestion.options = (q.options || []).map((opt, optIndex) => ({
                    option_text: opt.option_text,
                    is_correct: opt.is_correct,
                    order_sequence: optIndex + 1
                }))
            } else {
                // Explicitly set to undefined for SHORT_ANSWER and ESSAY
                baseQuestion.options = undefined
            }

            return baseQuestion
        })

        createQuizMutation(quizData, questions, {
            onSuccess: () => {
                router.push('/admin-management')
            },
            onError: () => {
                setActionType(null)
            }
        })
    }

    const handleCreate = handleSubmit(onSubmit)

    const addQuestion = () => {
        const currentQuestions = watch('questions')
        appendQuestion({
            question_text: '',
            question_type: 'MULTIPLE_CHOICE',
            points: 10,
            answer_explanation: '',
            order_sequence: currentQuestions.length + 1,
            image_url: '',
            video_url: '',
            file_url: '',
            voice_url: '',
            options: [
                { option_text: '', is_correct: false, order_sequence: 1 },
                { option_text: '', is_correct: false, order_sequence: 2 }
            ]
        })
    }

    return (
        <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '32px' }}>
                <BackButton title="Back to Admin Management" href="/admin-management" />
                <div style={{ marginTop: '16px' }}>
                    <PageHeader 
                        title="Create Quiz/Exam"
                        subtitle="Design assessments with multiple choice and open-ended questions"
                    />
                </div>
            </div>

            <form onSubmit={handleCreate}>
                {/* Basic Information Section */}
                <div style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '12px', 
                    padding: '32px', 
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    marginBottom: '24px'
                }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', margin: '0 0 24px 0' }}>
                        Basic Information
                    </h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <label style={{ 
                                display: 'block', 
                                fontSize: '14px', 
                                fontWeight: '500', 
                                color: '#374151', 
                                marginBottom: '8px' 
                            }}>
                                Quiz Title <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Banking Fundamentals Final Exam"
                                {...register('title')}
                                style={{
                                    width: '100%',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    height: '32px',
                                    padding: '0 12px',
                                    boxSizing: 'border-box'
                                }}
                            />
                            {errors.title && (
                                <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {errors.title.message}
                                </span>
                            )}
                        </div>

                        <div>
                            <label style={{ 
                                display: 'block', 
                                fontSize: '14px', 
                                fontWeight: '500', 
                                color: '#374151', 
                                marginBottom: '8px' 
                            }}>
                                Description <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <textarea
                                placeholder="Provide a detailed description of the quiz..."
                                rows={4}
                                {...register('description')}
                                style={{
                                    width: '100%',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                    padding: '8px 12px',
                                    boxSizing: 'border-box'
                                }}
                            />
                            {errors.description && (
                                <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {errors.description.message}
                                </span>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                            <div>
                                <label style={{ 
                                    display: 'block', 
                                    fontSize: '14px', 
                                    fontWeight: '500', 
                                    color: '#374151', 
                                    marginBottom: '8px' 
                                }}>
                                    Quiz Type <span style={{ color: '#EF4444' }}>*</span>
                                </label>
                                <select
                                    {...register('type')}
                                    style={{
                                        width: '100%',
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        backgroundColor: 'white',
                                        padding: '0 12px',
                                        height: '32px',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <option value="1">Quiz</option>
                                    <option value="2">Exam</option>
                                </select>
                                {errors.type && (
                                    <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                        {errors.type.message}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label style={{ 
                                    display: 'block', 
                                    fontSize: '14px', 
                                    fontWeight: '500', 
                                    color: '#374151', 
                                    marginBottom: '8px' 
                                }}>
                                    Course <span style={{ color: '#EF4444' }}>*</span>
                                </label>
                                {isLoadingCourses ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '32px' }}>
                                        <Spinner animation="border" size="sm" />
                                        <span style={{ fontSize: '14px', color: '#6B7280' }}>Loading courses...</span>
                                    </div>
                                ) : (
                                    <select
                                        {...register('course_id', { valueAsNumber: true })}
                                        style={{
                                            width: '100%',
                                            border: '1px solid #D1D5DB',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            outline: 'none',
                                            backgroundColor: 'white',
                                            padding: '0 12px',
                                            height: '32px',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <option value="">Select Course</option>
                                        {courses.map((course: any) => (
                                            <option key={course.id} value={course.id}>
                                                {course.title}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {errors.course_id && (
                                    <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                        {errors.course_id.message}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label style={{ 
                                    display: 'block', 
                                    fontSize: '14px', 
                                    fontWeight: '500', 
                                    color: '#374151', 
                                    marginBottom: '8px' 
                                }}>
                                    Duration (minutes) <span style={{ color: '#EF4444' }}>*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    {...register('duration_minutes', { valueAsNumber: true })}
                                    style={{
                                        width: '100%',
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        height: '32px',
                                        padding: '0 12px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                {errors.duration_minutes && (
                                    <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                        {errors.duration_minutes.message}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label style={{ 
                                    display: 'block', 
                                    fontSize: '14px', 
                                    fontWeight: '500', 
                                    color: '#374151', 
                                    marginBottom: '8px' 
                                }}>
                                    Passing Score (%) <span style={{ color: '#EF4444' }}>*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    {...register('passing_score', { valueAsNumber: true })}
                                    style={{
                                        width: '100%',
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        height: '32px',
                                        padding: '0 12px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                {errors.passing_score && (
                                    <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                        {errors.passing_score.message}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questions Section */}
                <div style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '12px', 
                    padding: '32px', 
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    marginBottom: '24px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', margin: 0 }}>
                            Questions
                        </h2>
                        <button
                            type="button"
                            onClick={addQuestion}
                            style={{
                                padding: '8px 16px',
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
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Add Question
                        </button>
                    </div>

                    {questionFields.map((question, questionIndex) => (
                        <QuestionForm
                            key={question.id}
                            questionIndex={questionIndex}
                            register={register}
                            control={control}
                            errors={errors}
                            watch={watch}
                            setValue={setValue}
                            onRemove={() => questionFields.length > 1 && removeQuestion(questionIndex)}
                            canRemove={questionFields.length > 1}
                        />
                    ))}

                    {errors.questions && (
                        <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                            {errors.questions.message}
                        </span>
                    )}
                </div>

                {/* Action Buttons */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: '12px',
                    marginTop: '32px'
                }}>
                    <button
                        type="submit"
                        disabled={isCreating}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#003D7A',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: isCreating ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s',
                            opacity: isCreating ? 0.6 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                            if (!isCreating) {
                                e.currentTarget.style.backgroundColor = '#002855'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isCreating) {
                                e.currentTarget.style.backgroundColor = '#003D7A'
                            }
                        }}
                    >
                        {isCreating && <Spinner animation="border" size="sm" style={{ width: 14, height: 14 }} />}
                        Create Quiz
                    </button>
                </div>
            </form>
        </div>
    )
}

// Question Form Component
interface QuestionFormProps {
    questionIndex: number
    register: any
    control: any
    errors: any
    watch: any
    setValue: any
    onRemove: () => void
    canRemove: boolean
}

function QuestionForm({ questionIndex, register, control, errors, watch, setValue, onRemove, canRemove }: QuestionFormProps) {
    const { fields: optionFields, append: appendOption, remove: removeOption, replace: replaceOptions } = useFieldArray({
        control,
        name: `questions.${questionIndex}.options`
    })

    const questionType = watch(`questions.${questionIndex}.question_type`)

    // Auto-set TRUE_FALSE options when question type changes
    // Clear options for SHORT_ANSWER and ESSAY
    useEffect(() => {
        if (questionType === 'TRUE_FALSE' && optionFields.length !== 2) {
            replaceOptions([
                { option_text: 'True', is_correct: false, order_sequence: 1 },
                { option_text: 'False', is_correct: false, order_sequence: 2 }
            ])
        } else if (questionType === 'SHORT_ANSWER' || questionType === 'ESSAY') {
            // Clear options for SHORT_ANSWER and ESSAY
            if (optionFields.length > 0) {
                replaceOptions([])
            }
        }
    }, [questionType, optionFields.length, replaceOptions])

    const addOption = () => {
        if (questionType === 'TRUE_FALSE') return // Don't allow adding options for TRUE_FALSE
        appendOption({
            option_text: '',
            is_correct: false,
            order_sequence: optionFields.length + 1
        })
    }

    return (
        <div style={{
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            backgroundColor: '#F9FAFB'
        }}>
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '20px',
                borderRadius: '8px',
            }}>
                {/* Circular blue badge with question number */}
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#003D7A',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    flexShrink: 0
                }}>
                    {questionIndex + 1}
                </div>
                
                {/* Question type in center */}
                <div style={{ flex: 1 }}>
                    <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: '#6B7280'
                    }}>
                        {questionType === 'MULTIPLE_CHOICE' ? 'Multiple-Choice' :
                         questionType === 'TRUE_FALSE' ? 'True/False' :
                         questionType === 'SHORT_ANSWER' ? 'Short Answer' :
                         questionType === 'ESSAY' ? 'Essay' : questionType}
                    </span>
                </div>
                
                {/* Red X icon for remove */}
                {canRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        style={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            flexShrink: 0
                        }}
                        title="Remove question"
                    >
                        <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 16 16" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path 
                                d="M12 4L4 12M4 4L12 12" 
                                stroke="#EF4444" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: '#374151', 
                        marginBottom: '8px' 
                    }}>
                        Question Text <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <textarea
                        placeholder="Enter your question here..."
                        rows={3}
                        {...register(`questions.${questionIndex}.question_text`)}
                        style={{
                            width: '100%',
                            border: '1px solid #D1D5DB',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            padding: '8px 12px',
                            boxSizing: 'border-box'
                        }}
                    />
                    {errors.questions?.[questionIndex]?.question_text && (
                        <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                            {errors.questions[questionIndex].question_text.message}
                        </span>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '14px', 
                            fontWeight: '500', 
                            color: '#374151', 
                            marginBottom: '8px' 
                        }}>
                            Question Type <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <select
                            {...register(`questions.${questionIndex}.question_type`)}
                            style={{
                                width: '100%',
                                border: '1px solid #D1D5DB',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                backgroundColor: 'white',
                                padding: '0 12px',
                                height: '32px',
                                boxSizing: 'border-box'
                            }}
                        >
                            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                            <option value="TRUE_FALSE">True/False</option>
                            <option value="SHORT_ANSWER">Short Answer</option>
                            <option value="ESSAY">Essay</option>
                        </select>
                        {errors.questions?.[questionIndex]?.question_type && (
                            <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                {errors.questions[questionIndex].question_type.message}
                            </span>
                        )}
                    </div>

                    <div>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '14px', 
                            fontWeight: '500', 
                            color: '#374151', 
                            marginBottom: '8px' 
                        }}>
                            Points <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            {...register(`questions.${questionIndex}.points`, { valueAsNumber: true })}
                            style={{
                                width: '100%',
                                border: '1px solid #D1D5DB',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                height: '32px',
                                padding: '0 12px',
                                boxSizing: 'border-box'
                            }}
                        />
                        {errors.questions?.[questionIndex]?.points && (
                            <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                {errors.questions[questionIndex].points.message}
                            </span>
                        )}
                    </div>
                </div>

                <div>
                    <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: '#374151', 
                        marginBottom: '8px' 
                    }}>
                        Answer Explanation
                    </label>
                    <textarea
                        placeholder="Explain why this answer is correct..."
                        rows={2}
                        {...register(`questions.${questionIndex}.answer_explanation`)}
                        style={{
                            width: '100%',
                            border: '1px solid #D1D5DB',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            padding: '8px 12px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Media URLs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '14px', 
                            fontWeight: '500', 
                            color: '#374151', 
                            marginBottom: '8px' 
                        }}>
                            Image URL
                        </label>
                        <input
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            {...register(`questions.${questionIndex}.image_url`)}
                            style={{
                                width: '100%',
                                border: '1px solid #D1D5DB',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                height: '32px',
                                padding: '0 12px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '14px', 
                            fontWeight: '500', 
                            color: '#374151', 
                            marginBottom: '8px' 
                        }}>
                            Video URL
                        </label>
                        <input
                            type="url"
                            placeholder="https://example.com/video.mp4"
                            {...register(`questions.${questionIndex}.video_url`)}
                            style={{
                                width: '100%',
                                border: '1px solid #D1D5DB',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                height: '32px',
                                padding: '0 12px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '14px', 
                            fontWeight: '500', 
                            color: '#374151', 
                            marginBottom: '8px' 
                        }}>
                            File URL
                        </label>
                        <input
                            type="url"
                            placeholder="https://example.com/file.pdf"
                            {...register(`questions.${questionIndex}.file_url`)}
                            style={{
                                width: '100%',
                                border: '1px solid #D1D5DB',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                height: '32px',
                                padding: '0 12px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '14px', 
                            fontWeight: '500', 
                            color: '#374151', 
                            marginBottom: '8px' 
                        }}>
                            Voice/Audio URL
                        </label>
                        <input
                            type="url"
                            placeholder="https://example.com/audio.mp3"
                            {...register(`questions.${questionIndex}.voice_url`)}
                            style={{
                                width: '100%',
                                border: '1px solid #D1D5DB',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                height: '32px',
                                padding: '0 12px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                </div>

                {/* Options - Only show for MULTIPLE_CHOICE and TRUE_FALSE */}
                {(questionType === 'MULTIPLE_CHOICE' || questionType === 'TRUE_FALSE') && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <label style={{ 
                                fontSize: '14px', 
                                fontWeight: '500', 
                                color: '#374151'
                            }}>
                                Options <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            {questionType === 'MULTIPLE_CHOICE' && (
                                <button
                                    type="button"
                                    onClick={addOption}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: '#003D7A',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    + Add Option
                                </button>
                            )}
                        </div>

                        {optionFields.map((option, optionIndex) => {
                            const isChecked = watch(`questions.${questionIndex}.options.${optionIndex}.is_correct`)
                            return (
                                <div key={option.id} style={{
                                    display: 'flex',
                                    gap: '12px',
                                    alignItems: 'flex-start',
                                    marginBottom: '12px',
                                    padding: '12px',
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    border: '1px solid #E5E7EB'
                                }}>
                                    <input
                                        type={questionType === 'TRUE_FALSE' ? 'radio' : 'checkbox'}
                                        name={`question-${questionIndex}-correct`}
                                        checked={isChecked}
                                        onChange={(e) => {
                                            if (questionType === 'TRUE_FALSE') {
                                                // For TRUE_FALSE: uncheck all options first, then set the selected one
                                                optionFields.forEach((_, idx) => {
                                                    setValue(`questions.${questionIndex}.options.${idx}.is_correct`, idx === optionIndex)
                                                })
                                            } else {
                                                // For MULTIPLE_CHOICE: toggle the checkbox
                                                setValue(`questions.${questionIndex}.options.${optionIndex}.is_correct`, e.target.checked)
                                            }
                                        }}
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            marginTop: '4px',
                                            cursor: 'pointer',
                                            accentColor: '#003D7A',
                                            ...(isChecked && {backgroundColor: '#003D7A'})
                                        }}
                                    />
                                    <div style={{flex: 1}}>
                                        <input
                                            type="text"
                                            placeholder={`Option ${optionIndex + 1}`}
                                            {...register(`questions.${questionIndex}.options.${optionIndex}.option_text`)}
                                            style={{
                                                width: '100%',
                                                border: '1px solid #D1D5DB',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                outline: 'none',
                                                height: '32px',
                                                padding: '0 12px',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                        {errors.questions?.[questionIndex]?.options?.[optionIndex]?.option_text && (
                                            <span style={{
                                                color: '#EF4444',
                                                fontSize: '12px',
                                                marginTop: '4px',
                                                display: 'block'
                                            }}>
                                            {errors.questions[questionIndex].options[optionIndex].option_text.message}
                                        </span>
                                        )}
                                    </div>
                                    {optionFields.length > 2 && questionType !== 'TRUE_FALSE' && (
                                        <button
                                        type="button"
                                        onClick={() => removeOption(optionIndex)}
                                        style={{
                                         width: '24px',
                                         height: '24px',
                                         backgroundColor: 'transparent',
                                         border: 'none',
                                         cursor: 'pointer',
                                         display: 'flex',
                                         alignItems: 'center',
                                         justifyContent: 'center',
                                         padding: 0,
                                         flexShrink: 0
                                     }}
                                     title="Remove question"
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M12 4L4 12M4 4L12 12"
                                            stroke="#EF4444"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                            )
                        }
                        </div>
                        )
                        })}
                    </div>
                )}
                {errors.questions?.[questionIndex]?.message && (
                    <div>
                        <span style={{color: '#EF4444', fontSize: '12px', display: 'block'}}>
                            {errors.questions[questionIndex].message}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}

