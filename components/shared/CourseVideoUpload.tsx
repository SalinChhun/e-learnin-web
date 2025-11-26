'use client'

import { useState } from 'react'
import { Spinner } from 'react-bootstrap'
import toast from '@/utils/toastService'

interface CourseVideoUploadProps {
    videoPreview: string | null
    isUploadingVideo: boolean
    isCreating: boolean
    errors?: { message?: string }
    onVideoFileChange: (file: File | null) => void
    onRemoveVideo: () => void
}

export default function CourseVideoUpload({
    videoPreview,
    isUploadingVideo,
    isCreating,
    errors,
    onVideoFileChange,
    onRemoveVideo
}: CourseVideoUploadProps) {
    const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            // Validate file is a video
            if (!file.type.startsWith('video/')) {
                toast.error('Please upload a video file')
                event.target.value = '' // Clear input
                return
            }

            // Validate file size (max 100MB)
            const MAX_SIZE = 100 * 1024 * 1024 // 100MB in bytes
            if (file.size > MAX_SIZE) {
                toast.error('Video file size must be 100MB or smaller')
                event.target.value = '' // Clear input
                return
            }

            onVideoFileChange(file)
        }
    }

    return (
        <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '32px', 
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
        }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', margin: '0 0 8px 0' }}>
                Course Video
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 24px 0' }}>
                Select a video for your course. The video will be uploaded when you publish or save as draft. (optional)
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {videoPreview ? (
                    <div style={{ position: 'relative', width: '100%', maxWidth: '800px' }}>
                        <video
                            src={videoPreview}
                            controls
                            style={{
                                width: '100%',
                                borderRadius: '8px',
                                maxHeight: '400px',
                                backgroundColor: '#000'
                            }}
                        />
                        <button
                            type="button"
                            onClick={onRemoveVideo}
                            style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                padding: '6px 12px',
                                backgroundColor: '#EF4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#DC2626'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#EF4444'
                            }}
                        >
                            Remove Video
                        </button>
                    </div>
                ) : (
                    <div
                        style={{
                            position: 'relative',
                            border: '2px dashed #D1D5DB',
                            borderRadius: '8px',
                            padding: '32px',
                            textAlign: 'center',
                            backgroundColor: '#F9FAFB',
                            cursor: (isUploadingVideo || isCreating) ? 'not-allowed' : 'pointer',
                            transition: 'border-color 0.2s',
                            opacity: (isUploadingVideo || isCreating) ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (!isUploadingVideo && !isCreating) {
                                e.currentTarget.style.borderColor = '#003D7A'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isUploadingVideo && !isCreating) {
                                e.currentTarget.style.borderColor = '#D1D5DB'
                            }
                        }}
                    >
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoFileChange}
                            disabled={isUploadingVideo || isCreating}
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                top: 0,
                                left: 0,
                                opacity: 0,
                                cursor: (isUploadingVideo || isCreating) ? 'not-allowed' : 'pointer',
                                zIndex: 1
                            }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <svg
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#6B7280"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polygon points="23 7 16 12 23 17 23 7" />
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            </svg>
                            <div>
                                <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                                    Click to select video
                                </span>
                                <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' }}>
                                    MP4, MOV, AVI, Max. 100MB
                                </p>
                                <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '4px 0 0 0', fontStyle: 'italic' }}>
                                    Video will be uploaded when you publish or save
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                {errors?.message && (
                    <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        {errors.message}
                    </span>
                )}
            </div>
        </div>
    )
}

