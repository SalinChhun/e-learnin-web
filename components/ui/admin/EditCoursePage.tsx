'use client'

import { useState, useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Spinner } from 'react-bootstrap'
import { useRouter, useParams } from 'next/navigation'
import BackButton from '@/components/shared/BackButton'
import PageHeader from '@/components/ui/bar/PageHeader'
import CategorySelect from '@/components/shared/CategorySelect'
import RichTextEditor from '@/components/shared/RichTextEditor'
import SelectAssignees from '@/components/shared/SelectAssignees'
import SingleDatePicker from '@/components/shared/SingleDatePicker'
import { useUpdateCourse, useCourseDetails } from '@/lib/hook/use-course'
import { createCourseSchema, CreateCourseOutput } from '@/validators/course.schema'
import dayjs from 'dayjs'

export default function EditCoursePage() {
    const router = useRouter()
    const params = useParams()
    const courseId = params?.id as string
    const { mutation: updateCourseMutation, isPending: isUpdating } = useUpdateCourse()
    const { course, isLoading: isLoadingCourse, error: courseError } = useCourseDetails(courseId)
    const [actionType, setActionType] = useState<'draft' | 'publish' | null>(null)
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<CreateCourseOutput>({
        resolver: zodResolver(createCourseSchema),
        mode: 'onChange',
        defaultValues: {
            courseTitle: '',
            description: '',
            instructions: '',
            category: 0 as unknown as number,
            duration: '',
            startDate: '',
            endDate: '',
            assignmentType: 'Individual',
            selectedAssignees: [],
            enableCertificate: false,
            certificateTemplate: 'Default Template',
            courseContent: ''
        },
    })
    console.log('watch(\'selectedAssignees\')', watch('selectedAssignees'))
    // Format duration from days and hours to string (e.g., "4 days" or "8 hours")
    const formatDuration = (days: number, hours: number): string => {
        if (days > 0 && hours > 0) {
            return `${days} ${days === 1 ? 'day' : 'days'} ${hours} ${hours === 1 ? 'hour' : 'hours'}`
        } else if (days > 0) {
            return `${days} ${days === 1 ? 'day' : 'days'}`
        } else if (hours > 0) {
            return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
        }
        return '4 days'
    }

    // Load course data into form when course is fetched
    useEffect(() => {
        if (course) {
            const assignmentType = course.assignment_type === '01' ? 'Individual' : (course.assignment_type === '02' ? 'Team' : 'Individual')
            const duration = formatDuration(course.estimated_days || 0, course.duration_hours || 0)
            
            // Format dates to YYYY-MM-DD format - handle different possible date field names
            const startDate = course.start_date 
                ? dayjs(course.start_date).format('YYYY-MM-DD') 
                : (course.created_at ? dayjs(course.created_at).format('YYYY-MM-DD') : '')
            const endDate = course.due_date 
                ? dayjs(course.due_date).format('YYYY-MM-DD') 
                : ''
            
            // Map learners to string array for selectedAssignees (handle both array and undefined)
            // API returns learners array, not user_ids
            const assignees = Array.isArray(course.learners) 
                ? course.learners.map((id: number) => id.toString())
                : []
            reset({
                courseTitle: course.title || '',
                description: course.description || '',
                instructions: (course as any).instructions || '',
                category: course.category_id || 0,
                duration: duration,
                startDate: startDate,
                endDate: endDate,
                assignmentType: assignmentType,
                selectedAssignees: assignees,
                enableCertificate: (course as any).enable_certificate || false,
                certificateTemplate: (course as any).certificate_template || 'Default Template',
                courseContent: course.course_content || ''
            })
            console.log('course ->', course)
            console.log('assignees ->', assignees)
        }
    }, [course, reset])

    const handleAssigneesChange = (assigneeIds: string[]) => {
        setValue('selectedAssignees', assigneeIds, { shouldValidate: true })
    }

    const todayDate = useMemo(() => new Date().toISOString().split('T')[0], [])
    const startDate = watch('startDate')
    const endDateMinDate = useMemo(() => startDate || todayDate, [startDate, todayDate])

    // Parse duration string (e.g., "4 days" or "8 hours") to get days and hours
    const parseDuration = (duration: string): { days: number; hours: number } => {
        const durationLower = duration.toLowerCase().trim()
        const daysMatch = durationLower.match(/(\d+)\s*days?/)
        const hoursMatch = durationLower.match(/(\d+)\s*hours?/)
        
        const days = daysMatch ? parseInt(daysMatch[1], 10) : 0
        const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0
        
        // If only days provided, estimate hours (assuming 2 hours per day)
        // If only hours provided, calculate days (assuming 2 hours per day)
        if (days > 0 && hours === 0) {
            return { days, hours: days * 2 }
        } else if (hours > 0 && days === 0) {
            return { days: Math.ceil(hours / 2), hours }
        } else if (days > 0 && hours > 0) {
            return { days, hours }
        }
        
        // Default fallback
        return { days: 4, hours: 8 }
    }

    const onSubmit = (data: CreateCourseOutput, isDraft: boolean) => {
        if (!courseId) return

        setActionType(isDraft ? 'draft' : 'publish')

        const { days, hours } = parseDuration(data.duration)
        const assignmentTypeCode = data.assignmentType === 'Individual' ? '01' : '02'
        
        // Map selected assignees to user_ids (convert string IDs to numbers)
        const learners = (data.selectedAssignees || []).length > 0
            ? (data.selectedAssignees || []).map(id => parseInt(id, 10)).filter(id => !isNaN(id))
            : []

        const courseData = {
            title: data.courseTitle,
            description: data.description,
            category_id: data.category,
            duration_hours: hours,
            estimated_days: days,
            due_date: data.endDate,
            is_public: !isDraft, // Draft is not public, published courses are public
            image_url: course?.image_url || '', // Keep existing image_url
            course_content: data.courseContent || '',
            assignment_type: assignmentTypeCode,
            status: isDraft ? '1' : '2', // 1 = draft, 2 = published
            learners: learners
        }

        updateCourseMutation(courseId, courseData, {
            isDraft,
            onSuccess: () => {
                router.push('/admin-management')
            },
            onError: () => {
                setActionType(null)
            }
        })
    }

    const handleSaveDraft = handleSubmit((data) => onSubmit(data, true))
    const handlePublish = handleSubmit((data) => onSubmit(data, false))
    
    // Check if course is a draft
    const isDraft = course?.status === '1' || course?.status === 'Draft' || course?.status === 'draft'

    // Show loading state while fetching course
    if (isLoadingCourse) {
        return (
            <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spinner animation="border" />
            </div>
        )
    }

    // Show error state if course not found
    if (courseError || !course) {
        return (
            <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
                <BackButton title="Back to Admin Management" href="/admin-management" />
                <div style={{ marginTop: '32px', textAlign: 'center', color: '#EF4444' }}>
                    <p>Course not found or error loading course data.</p>
                </div>
            </div>
        )
    }

    const isCreating = isUpdating

    return (
        <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '32px' }}>
                <BackButton title="Back to Admin Management" href="/admin-management" />
                <div style={{ marginTop: '16px' }}>
                    <PageHeader 
                        title="Edit Course"
                        subtitle="Update course information and settings"
                    />
                </div>
            </div>

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
                            Course Title <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Banking Fundamentals"
                            {...register('courseTitle')}
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
                        {errors.courseTitle && (
                            <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                {errors.courseTitle.message}
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
                            placeholder="Provide a detailed description of what learners will gain from this course..."
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

                    <div>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '14px', 
                            fontWeight: '500', 
                            color: '#374151', 
                            marginBottom: '8px' 
                        }}>
                            Instructions
                        </label>
                        <textarea
                            placeholder="Any specific instructions or prerequisites for the course..."
                            rows={3}
                            {...register('instructions')}
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
                        {errors.instructions && (
                            <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                {errors.instructions.message}
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div>
                            <label style={{ 
                                display: 'block', 
                                fontSize: '14px', 
                                fontWeight: '500', 
                                color: '#374151', 
                                marginBottom: '8px' 
                            }}>
                                Category <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <CategorySelect
                                value={watch('category')?.toString() || ''}
                                onChange={(value) => setValue('category', parseInt(value, 10) || 0, { shouldValidate: true })}
                                variant="form"
                                placeholder="Select Category"
                            />
                            {errors.category && (
                                <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {errors.category.message}
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
                                Duration <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., 4 days"
                                {...register('duration')}
                                style={{
                                    width: '100%',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    height: '32px',
                                    padding: '0 12px'
                                }}
                            />
                            {errors.duration && (
                                <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {errors.duration.message}
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
                                Start Date <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <SingleDatePicker
                                value={watch('startDate') || ''}
                                onChange={(date) => setValue('startDate', date, { shouldValidate: true })}
                                placeholder="Select start date"
                                minDate={todayDate}
                            />
                            {errors.startDate && (
                                <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {errors.startDate.message}
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
                                End Date <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <SingleDatePicker
                                value={watch('endDate') || ''}
                                onChange={(date) => setValue('endDate', date, { shouldValidate: true })}
                                placeholder="Select end date"
                                minDate={endDateMinDate}
                            />
                            {errors.endDate && (
                                <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {errors.endDate.message}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Content Section */}
            <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '12px', 
                padding: '32px', 
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                marginBottom: '24px'
            }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', margin: '0 0 8px 0' }}>
                    Course Content
                </h2>
                <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 24px 0' }}>
                    Create your course content with full formatting freedom
                </p>
                
                <RichTextEditor
                    value={watch('courseContent') || ''}
                    onChange={(value) => setValue('courseContent', value, { shouldValidate: true })}
                    placeholder="Start writing your course content here..."
                />
                {errors.courseContent && (
                    <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        {errors.courseContent.message}
                    </span>
                )}
            </div>

            {/* Assign To Section */}
            <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '12px', 
                padding: '32px', 
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                marginBottom: '24px'
            }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', margin: '0 0 24px 0' }}>
                    Assign To
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
                            Assignment Type
                        </label>
                        <select
                            {...register('assignmentType')}
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
                            <option value="Individual">Individual</option>
                            <option value="Team">Team</option>
                        </select>
                        {errors.assignmentType && (
                            <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                {errors.assignmentType.message}
                            </span>
                        )}
                    </div>

                    <SelectAssignees
                        value={watch('selectedAssignees') || []}
                        onChange={handleAssigneesChange}
                        placeholder="Search users, teams, or departments..."
                        label="Select Assignees"
                    />
                </div>
            </div>

            {/* Choice Certificate Section */}
            <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '12px', 
                padding: '32px', 
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                marginBottom: '24px'
            }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', margin: '0 0 24px 0' }}>
                    Choice Certificate
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            {...register('enableCertificate')}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '14px', color: '#374151' }}>
                            Enable certificate upon course completion
                        </span>
                    </label>

                    {watch('enableCertificate') && (
                        <div>
                            <label style={{ 
                                display: 'block', 
                                fontSize: '14px', 
                                fontWeight: '500', 
                                color: '#374151', 
                                marginBottom: '8px' 
                            }}>
                                Certificate Template
                            </label>
                            <select
                                {...register('certificateTemplate')}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    backgroundColor: 'white',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <option value="Default Template">Default Template</option>
                                <option value="Professional Template">Professional Template</option>
                                <option value="Custom Template">Custom Template</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '12px',
                marginTop: '32px'
            }}>
                {/* For draft courses: Show both Update and Publish buttons */}
                {isDraft && (
                    <>
                        <button
                            type="button"
                            onClick={handleSaveDraft}
                            disabled={isCreating}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: 'white',
                                color: '#003D7A',
                                border: '1px solid #003D7A',
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
                                    e.currentTarget.style.backgroundColor = '#F9FAFB'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isCreating) {
                                    e.currentTarget.style.backgroundColor = 'white'
                                }
                            }}
                        >
                            {isCreating && actionType === 'draft' && <Spinner animation="border" size="sm" style={{ width: 14, height: 14 }} />}
                            Update
                        </button>
                        <button
                            type="button"
                            onClick={handlePublish}
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
                            {isCreating && actionType === 'publish' && <Spinner animation="border" size="sm" style={{ width: 14, height: 14 }} />}
                            Publish
                        </button>
                    </>
                )}
                {/* For published courses: Show only Update Course button */}
                {!isDraft && (
                    <button
                        type="button"
                        onClick={handlePublish}
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
                        {isCreating && actionType === 'publish' && <Spinner animation="border" size="sm" style={{ width: 14, height: 14 }} />}
                        Update Course
                    </button>
                )}
            </div>
        </div>
    )
}

