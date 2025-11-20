'use client'

import { useState, useRef } from 'react'
import { Modal, Spinner } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import fileService from '@/service/file-upload.service'
import { useCreateCertificateTemplate } from '@/lib/hook/use-course'
import SelectCourses from '@/components/shared/SelectCourses'
import toast from '@/utils/toastService'

const createCertificateTemplateSchema = z.object({
    name: z.string().min(1, 'Template name is required').max(200, 'Template name must be less than 200 characters'),
    description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
    template_image: z.any().optional(), // File validation handled in onSubmit
    status: z.string().default('1'), // Default to draft
    course_ids: z.array(z.number()).optional().default([]),
})

type CreateCertificateTemplateFormData = z.infer<typeof createCertificateTemplateSchema>

interface CreateCertificateTemplateModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function CreateCertificateTemplateModal({ isOpen, onClose }: CreateCertificateTemplateModalProps) {
    const { mutation: createTemplateMutation, isPending: isCreating } = useCreateCertificateTemplate()
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<CreateCertificateTemplateFormData>({
        resolver: zodResolver(createCertificateTemplateSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            description: '',
            template_image: undefined,
            status: '1', // Draft by default
            course_ids: [],
        },
    })

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]

        if (file) {
            // Validate file is an image
            if (!file.type.startsWith('image/')) {
                event.target.value = ''
                setSelectedFile(null)
                setImagePreview(null)
                toast.error('Please upload an image file (JPG/PNG)')
                return
            }

            // Validate file size (max 5MB)
            const MAX_SIZE = 5 * 1024 * 1024 // 5MB in bytes
            if (file.size > MAX_SIZE) {
                event.target.value = ''
                setSelectedFile(null)
                setImagePreview(null)
                toast.error('File size must be 5MB or smaller')
                return
            }

            // Store the file in state
            setSelectedFile(file)

            // Update form value
            setValue('template_image', file as any, { shouldValidate: true })

            // Read the file and update preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleRemoveImage = () => {
        setImagePreview(null)
        setSelectedFile(null)
        setValue('template_image', undefined)
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const onSubmit = async (data: CreateCertificateTemplateFormData) => {
        // Get the file from state or input element
        const file = selectedFile || fileInputRef.current?.files?.[0]

        // Check if image was uploaded
        if (!file) {
            toast.error('Please upload a certificate template image')
            return
        }

        let imageUrl = ''
        try {
            const fileResponse = await fileService.uploadImage(file)
            imageUrl = fileResponse.data.data.image_url
        } catch (error) {
            toast.error('Failed to upload image')
            return
        }

        const templateData = {
            name: data.name,
            description: data.description,
            template_image_url: imageUrl,
            status: data.status, // "1" = draft, "2" = active
            course_ids: data.course_ids && data.course_ids.length > 0 ? data.course_ids : undefined,
        }

        createTemplateMutation(templateData, {
            onSuccess: () => {
                reset()
                setImagePreview(null)
                setSelectedFile(null)
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                }
                onClose()
            },
        })
    }

    const handleClose = () => {
        if (!isCreating) {
            reset()
            setImagePreview(null)
            setSelectedFile(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            onClose()
        }
    }

    return (
        <Modal
            show={isOpen}
            onHide={handleClose}
            centered
            size="lg"
            backdrop={isCreating ? 'static' : true}
            keyboard={!isCreating}
        >
            <Modal.Header style={{ borderBottom: '1px solid #E5E7EB', padding: '24px' }}>
                <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', margin: '0 0 4px 0' }}>
                                Create Certificate Template
                            </h2>
                            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                                Design a new certificate template for your courses
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isCreating}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '24px',
                                color: '#6B7280',
                                cursor: isCreating ? 'not-allowed' : 'pointer',
                                padding: '0',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '4px',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (!isCreating) {
                                    e.currentTarget.style.backgroundColor = '#F3F4F6'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isCreating) {
                                    e.currentTarget.style.backgroundColor = 'transparent'
                                }
                            }}
                        >
                            ×
                        </button>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body style={{ padding: '24px' }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Template Name */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                Template Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Corporate Certificate"
                                {...register('name')}
                                disabled={isCreating}
                                style={{
                                    width: '100%',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    height: '40px',
                                    padding: '0 12px',
                                    boxSizing: 'border-box',
                                    backgroundColor: isCreating ? '#F9FAFB' : 'white'
                                }}
                            />
                            {errors.name && (
                                <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {errors.name.message}
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                Description
                            </label>
                            <textarea
                                placeholder="Brief description of this template"
                                rows={3}
                                {...register('description')}
                                disabled={isCreating}
                                style={{
                                    width: '100%',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                    padding: '8px 12px',
                                    boxSizing: 'border-box',
                                    backgroundColor: isCreating ? '#F9FAFB' : 'white'
                                }}
                            />
                            {errors.description && (
                                <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {errors.description.message}
                                </span>
                            )}
                        </div>

                        {/* Status Selection */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                Status
                            </label>
                            <select
                                {...register('status')}
                                disabled={isCreating}
                                style={{
                                    width: '100%',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    backgroundColor: isCreating ? '#F9FAFB' : 'white',
                                    padding: '0 12px',
                                    height: '40px',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <option value="1">Draft</option>
                                <option value="2">Active</option>
                            </select>
                            {errors.status && (
                                <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {errors.status.message}
                                </span>
                            )}
                        </div>

                        {/* Assign Courses */}
                        <div>
                            <SelectCourses
                                value={watch('course_ids') || []}
                                onChange={(courseIds) => setValue('course_ids', courseIds, { shouldValidate: true })}
                                placeholder="Search courses..."
                                label="Assign to Courses (Optional)"
                            />
                        </div>

                        {/* Certificate Template Design Upload */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                Certificate Template Design
                            </label>
                            {imagePreview ? (
                                <div style={{
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    backgroundColor: '#F9FAFB',
                                    position: 'relative'
                                }}>
                                    <img
                                        src={imagePreview}
                                        alt="Template preview"
                                        style={{
                                            width: '100%',
                                            maxHeight: '300px',
                                            objectFit: 'contain',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        disabled={isCreating}
                                        style={{
                                            position: 'absolute',
                                            top: '24px',
                                            right: '24px',
                                            background: 'white',
                                            border: '1px solid #D1D5DB',
                                            borderRadius: '6px',
                                            padding: '8px',
                                            cursor: isCreating ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M18 6L6 18M6 6l12 12" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div style={{
                                    border: '2px dashed #D1D5DB',
                                    borderRadius: '8px',
                                    padding: '48px 24px',
                                    textAlign: 'center',
                                    backgroundColor: '#F9FAFB',
                                    cursor: isCreating ? 'not-allowed' : 'pointer',
                                    transition: 'border-color 0.2s'
                                }}
                                onClick={() => {
                                    if (!isCreating) {
                                        fileInputRef.current?.click()
                                    }
                                }}
                                >
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 16px', color: '#9CA3AF' }}>
                                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 4px 0', fontWeight: '500' }}>
                                        Upload your certificate template design (JPG/PNG)
                                    </p>
                                    <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                                        Maximum file size: 5MB
                                    </p>
                                    <input
                                        id="template_image"
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png"
                                        onChange={handleImageChange}
                                        disabled={isCreating}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            )}
                            {errors.template_image && (
                                <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    {errors.template_image.message as string}
                                </span>
                            )}
                        </div>
                    </div>
                </form>
            </Modal.Body>

            <Modal.Footer style={{ borderTop: '1px solid #E5E7EB', padding: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                    type="button"
                    onClick={handleClose}
                    disabled={isCreating}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: 'white',
                        color: '#374151',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: isCreating ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s',
                        opacity: isCreating ? 0.6 : 1
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
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isCreating}
                    style={{
                        padding: '10px 20px',
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
                    Create Template
                </button>
            </Modal.Footer>
        </Modal>
    )
}

