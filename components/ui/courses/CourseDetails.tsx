'use client'

import React from 'react'
import { Modal } from 'react-bootstrap'

export interface CourseDetailsProps {
    isOpen: boolean
    handleClose: () => void
    selectedRowData: any
    size?: 'sm' | 'md' | 'lg' | 'xl'
    closeOnOutsideClick?: boolean
    width?: string
    centered?: boolean
    id?: string
}

const CourseDetails: React.FC<CourseDetailsProps> = ({
    isOpen,
    handleClose,
    selectedRowData,
    size = 'lg',
    closeOnOutsideClick = true,
    width = 'wl-width-720',
    centered = true,
    id,
}) => {
    const course = selectedRowData || {}
    const duration = course.estimated_days 
        ? `${course.estimated_days} ${course.estimated_days === 1 ? 'Day' : 'Days'}`
        : course.duration || 'N/A'

    const modalSize = size === 'md' ? undefined : size

    return (
        <Modal
            show={isOpen}
            onHide={closeOnOutsideClick ? handleClose : undefined}
            centered={centered}
            size={modalSize as any}
            dialogClassName={width}
            contentClassName="wl-modal-content d-flex flex-column"
            backdrop={closeOnOutsideClick ? true : 'static'}
            keyboard={true}
            id={id}
        >
            <Modal.Body style={{ padding: 0 }}>
                {/* Header Section with Blue Background */}
                <div
                    style={{
                        backgroundColor: '#003D7A',
                        padding: '40px 32px',
                        position: 'relative',
                        borderRadius: '12px 12px 0 0'
                    }}
                >
                    {/* Close Button */}
                    <button
                        type="button"
                        className="btn-close btn-close-white"
                        onClick={handleClose}
                        aria-label="Close"
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            opacity: 0.9
                        }}
                    />
                    
                    {/* Enrolled Status Tag */}
                    <span
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '48px',
                            padding: '4px 12px',
                            backgroundColor: '#60A5FA',
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Enrolled
                    </span>

                    {/* Course Icon */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                        <div
                            style={{
                                width: '120px',
                                height: '120px',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <svg
                                width="64"
                                height="64"
                                viewBox="0 0 64 64"
                                fill="none"
                            >
                                <path
                                    d="M12 20V44C12 45.5913 12.6321 47.1174 13.7574 48.2426C14.8826 49.3679 16.4087 50 18 50H46C47.5913 50 49.1174 49.3679 50.2426 48.2426C51.3679 47.1174 52 45.5913 52 44V20C52 18.4087 51.3679 16.8826 50.2426 15.7574C49.1174 14.6321 47.5913 14 46 14H18C16.4087 14 14.8826 14.6321 13.7574 15.7574C12.6321 16.8826 12 18.4087 12 20Z"
                                    stroke="white"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M20 26L32 34L44 26"
                                    stroke="white"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Course Title and Category */}
                    <div style={{ textAlign: 'center' }}>
                        <h2
                            style={{
                                fontSize: '28px',
                                fontWeight: '600',
                                color: 'white',
                                margin: '0 0 12px 0',
                                lineHeight: '1.3'
                            }}
                        >
                            {course.title || 'Course Title'}
                        </h2>
                        <span
                            style={{
                                padding: '6px 16px',
                                backgroundColor: '#DBEAFE',
                                color: '#003D7A',
                                borderRadius: '16px',
                                fontSize: '14px',
                                fontWeight: '500',
                                display: 'inline-block'
                            }}
                        >
                            {course.category || 'Category'}
                        </span>
                    </div>
                </div>

                {/* Content Section */}
                <div style={{ padding: '32px', backgroundColor: 'white' }}>
                    {/* Description */}
                    <div style={{ marginBottom: '32px' }}>
                        <h3
                            style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#1F2937',
                                margin: '0 0 12px 0'
                            }}
                        >
                            Description
                        </h3>
                        <p
                            style={{
                                fontSize: '16px',
                                color: '#6B7280',
                                lineHeight: '1.6',
                                margin: 0
                            }}
                        >
                            {course.description || 'No description available.'}
                        </p>
                    </div>

                    {/* Course Information Grid */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '24px',
                            marginBottom: '32px',
                            padding: '24px',
                            backgroundColor: '#F9FAFB',
                            borderRadius: '12px'
                        }}
                    >
                        {/* Duration */}
                        <div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '8px'
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                                    <circle cx="8" cy="8" r="7" stroke="#6B7280" strokeWidth="1.5"/>
                                    <path d="M8 4V8L11 10" stroke="#6B7280" strokeWidth="1.5"
                                          strokeLinecap="round"/>
                                </svg>
                                <span
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#6B7280'
                                    }}
                                >
                                    Duration
                                </span>
                            </div>
                            <p
                                style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#1F2937',
                                    margin: 0
                                }}
                            >
                                {duration}
                            </p>
                        </div>

                        {/* Learners */}
                        <div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '8px'
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                                    <path
                                        d="M8 8C9.10457 8 10 7.10457 10 6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6C6 7.10457 6.89543 8 8 8Z"
                                        fill="#6B7280"
                                    />
                                    <path
                                        d="M8 9C6.34315 9 2 9.89543 2 11.5V12.5C2 13.0523 2.44772 13.5 3 13.5H13C13.5523 13.5 14 13.0523 14 12.5V11.5C14 9.89543 9.65685 9 8 9Z"
                                        fill="#6B7280"
                                    />
                                </svg>
                                <span
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#6B7280'
                                    }}
                                >
                                    Learners
                                </span>
                            </div>
                            <p
                                style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#1F2937',
                                    margin: 0
                                }}
                            >
                                {course.learner_count || course.learners || 0}
                            </p>
                        </div>

                        {/* Status */}
                        <div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '8px'
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                                    <circle cx="8" cy="8" r="6" stroke="#6B7280" strokeWidth="1.5"/>
                                    <path d="M6 8L7.5 9.5L10 7" stroke="#6B7280" strokeWidth="1.5"
                                          strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#6B7280'
                                    }}
                                >
                                    Status
                                </span>
                            </div>
                            <p
                                style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#1F2937',
                                    margin: 0
                                }}
                            >
                                {course.status || 'Published'}
                            </p>
                        </div>
                    </div>

                    {/* Continue Learning Button */}
                    <button
                        type="button"
                        onClick={handleClose}
                        style={{
                            width: '100%',
                            padding: '14px 24px',
                            backgroundColor: '#003D7A',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#002855'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#003D7A'
                        }}
                    >
                        <span>Continue Learning</span>
                    </button>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default CourseDetails




