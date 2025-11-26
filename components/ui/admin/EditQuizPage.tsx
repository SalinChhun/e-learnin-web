'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Spinner } from 'react-bootstrap'
import { useRouter, useParams } from 'next/navigation'
import BackButton from '@/components/shared/BackButton'
import PageHeader from '@/components/ui/bar/PageHeader'
import { useUpdateQuiz, useQuizDetails } from '@/lib/hook/use-quiz'
import { useFetchAllCourses } from '@/lib/hook/use-course'
import { createQuizSchema, CreateQuizOutput } from '@/validators/quiz.schema'

export default function EditQuizPage() {
    const router = useRouter()
    const params = useParams()
    const quizId = params?.id as string
    const { mutation: updateQuizMutation, isPending: isUpdating } = useUpdateQuiz()
    const { quiz, isLoading: isLoadingQuiz, error: quizError } = useQuizDetails(quizId)
    const { courses, isLoading: isLoadingCourses } = useFetchAllCourses(100)
    const [actionType, setActionType] = useState<'update' | null>(null)
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        control,
        reset,
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
            questions: []
        },
    })
    
    const { fields: questionFields, append: appendQuestion, remove: removeQuestion, replace: replaceQuestions } = useFieldArray({
        control,
        name: 'questions'
    })

    // Load quiz data into form when quiz is fetched
    useEffect(() => {
        if (quiz && !isLoadingCourses && courses.length > 0) {
            // Convert type: "Quiz" -> "1", "Exam" -> "2"
            const type = quiz.type === 'Exam' ? '2' : '1'
            
            // Map questions with their options
            const questions = (quiz.questions || []).map((q: any) => ({
                question_text: q.question_text || '',
                question_type: q.question_type || 'MULTIPLE_CHOICE',
                points: q.points || 10,
                answer_explanation: q.answer_explanation || '',
                order_sequence: q.order_sequence || 1,
                image_url: q.image_url || '',
                video_url: q.video_url || '',
                file_url: q.file_url || '',
                voice_url: q.voice_url || '',
                options: (q.options || []).map((opt: any) => ({
                    option_text: opt.option_text || '',
                    is_correct: opt.is_correct || false,
                    order_sequence: opt.order_sequence || 1
                }))
            }))

            // Ensure course_id is a number and exists in courses list
            const courseId = quiz.course_id ? Number(quiz.course_id) : 0
            const courseExists = courses.some((c: any) => c.id === courseId)

            reset({
                title: quiz.title || '',
                description: quiz.description || '',
                type: type,
                course_id: courseExists ? courseId : 0,
                duration_minutes: quiz.duration_minutes || 30,
                passing_score: quiz.passing_score || 70,
                questions: questions
            })
        }
    }, [quiz, reset, courses, isLoadingCourses])

    const onSubmit = (data: CreateQuizOutput) => {
        setActionType('update')

        // Prepare questions with IDs for update
        const questions = data.questions.map((q, index) => {
            const existingQuestion = quiz?.questions?.[index]
            const baseQuestion: any = {
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

            // Include question ID if it exists (for updates)
            if (existingQuestion?.id) {
                baseQuestion.id = existingQuestion.id
            }

            // Only include options for MULTIPLE_CHOICE and TRUE_FALSE
            if (q.question_type === 'MULTIPLE_CHOICE' || q.question_type === 'TRUE_FALSE') {
                baseQuestion.options = (q.options || []).map((opt, optIndex) => ({
                    option_text: opt.option_text,
                    is_correct: opt.is_correct,
                    order_sequence: optIndex + 1
                }))
            }

            return baseQuestion
        })

        const updateData = {
            title: data.title,
            description: data.description,
            type: data.type,
            course_id: data.course_id,
            duration_minutes: data.duration_minutes,
            passing_score: data.passing_score,
            questions: questions
        }

        updateQuizMutation(quizId, updateData, {
            onSuccess: () => {
                router.push('/admin-management/all-quiz')
            },
            onError: () => {
                setActionType(null)
            }
        })
    }

    const handleUpdate = handleSubmit(onSubmit)

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

    if (isLoadingQuiz) {
        return (
            <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spinner animation="border" />
            </div>
        )
    }

    if (quizError) {
        return (
            <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
                <BackButton title="Back to Admin Management" href="/admin-management" />
                <div style={{ marginTop: '24px', textAlign: 'center', color: '#EF4444' }}>
                    <p>Error loading quiz. Please try again later.</p>
                </div>
            </div>
        )
    }

    return (
        <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '32px' }}>
                <PageHeader
                    title="Edit Quiz/Exam"
                    subtitle="Update quiz details and questions"
                />
            </div>

            {/* Form */}
            <form onSubmit={handleUpdate}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    marginBottom: '24px'
                }}>
                    {/* Basic Information */}
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginBottom: '24px' }}>
                        Basic Information
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                                {...register('title')}
                                style={{
                                    width: '100%',
                                    border: errors.title ? '1px solid #EF4444' : '1px solid #D1D5DB',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    height: '40px',
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
                                {...register('description')}
                                rows={4}
                                style={{
                                    width: '100%',
                                    border: errors.description ? '1px solid #EF4444' : '1px solid #D1D5DB',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    padding: '12px',
                                    boxSizing: 'border-box',
                                    resize: 'vertical'
                                }}
                            />
                            {errors.description && (
                                <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {errors.description.message}
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
                                    Quiz Type <span style={{ color: '#EF4444' }}>*</span>
                                </label>
                                <select
                                    {...register('type')}
                                    style={{
                                        width: '100%',
                                        border: errors.type ? '1px solid #EF4444' : '1px solid #D1D5DB',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        height: '40px',
                                        padding: '0 12px',
                                        boxSizing: 'border-box',
                                        backgroundColor: 'white'
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
                                <select
                                    {...register('course_id', { valueAsNumber: true })}
                                    disabled={isLoadingCourses}
                                    value={watch('course_id') || 0}
                                    style={{
                                        width: '100%',
                                        border: errors.course_id ? '1px solid #EF4444' : '1px solid #D1D5DB',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        height: '40px',
                                        padding: '0 12px',
                                        boxSizing: 'border-box',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <option value={0}>Select a course</option>
                                    {courses.map((course: any) => (
                                        <option key={course.id} value={Number(course.id)}>
                                            {course.title}
                                        </option>
                                    ))}
                                </select>
                                {errors.course_id && (
                                    <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                        {errors.course_id.message}
                                    </span>
                                )}
                            </div>
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
                                    Duration (minutes) <span style={{ color: '#EF4444' }}>*</span>
                                </label>
                                <input
                                    type="number"
                                    {...register('duration_minutes', { valueAsNumber: true })}
                                    style={{
                                        width: '100%',
                                        border: errors.duration_minutes ? '1px solid #EF4444' : '1px solid #D1D5DB',
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
                                    {...register('passing_score', { valueAsNumber: true })}
                                    style={{
                                        width: '100%',
                                        border: errors.passing_score ? '1px solid #EF4444' : '1px solid #D1D5DB',
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

                {/* Questions Section - Reuse the QuestionForm from CreateQuizPage */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    marginBottom: '24px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: 0 }}>
                            Questions
                        </h3>
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
                                cursor: 'pointer'
                            }}
                        >
                            + Add Question
                        </button>
                    </div>

                    {questionFields.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>
                            <p>No questions yet. Add your first question to get started.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                        </div>
                    )}

                    {errors.questions && (
                        <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '8px', display: 'block' }}>
                            {errors.questions.message}
                        </span>
                    )}
                </div>

                {/* Submit Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                        type="button"
                        onClick={() => router.push('/admin-management/all-quiz')}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'transparent',
                            color: '#6B7280',
                            border: '1px solid #D1D5DB',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isUpdating}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#003D7A',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: isUpdating ? 'not-allowed' : 'pointer',
                            opacity: isUpdating ? 0.6 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {isUpdating && actionType === 'update' && <Spinner animation="border" size="sm" style={{ width: 14, height: 14 }} />}
                        Update Quiz
                    </button>
                </div>
            </form>
        </div>
    )
}

// Question Form Component - Reused from CreateQuizPage
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
                        {...register(`questions.${questionIndex}.question_text`)}
                        rows={3}
                        style={{
                            width: '100%',
                            border: errors.questions?.[questionIndex]?.question_text ? '1px solid #EF4444' : '1px solid #D1D5DB',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            padding: '12px',
                            boxSizing: 'border-box',
                            resize: 'vertical'
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
                                border: errors.questions?.[questionIndex]?.question_type ? '1px solid #EF4444' : '1px solid #D1D5DB',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                height: '40px',
                                padding: '0 12px',
                                boxSizing: 'border-box',
                                backgroundColor: 'white'
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
                            {...register(`questions.${questionIndex}.points`, { valueAsNumber: true })}
                            style={{
                                width: '100%',
                                border: errors.questions?.[questionIndex]?.points ? '1px solid #EF4444' : '1px solid #D1D5DB',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                height: '40px',
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
                        {...register(`questions.${questionIndex}.answer_explanation`)}
                        rows={2}
                        style={{
                            width: '100%',
                            border: '1px solid #D1D5DB',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            padding: '12px',
                            boxSizing: 'border-box',
                            resize: 'vertical'
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
                                            title="Remove option"
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

