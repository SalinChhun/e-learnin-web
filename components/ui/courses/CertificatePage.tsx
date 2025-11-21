'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Spinner } from 'react-bootstrap'
import { useCertificateTemplateByCourse, useCourseDetails, useMyCourses } from '@/lib/hook/use-course'
import { useGetMyProfile } from '@/lib/hook/use-common'
import { useSession } from 'next-auth/react'
import dayjs from 'dayjs'
import Image from 'next/image'
import BackButton from '@/components/shared/BackButton'

interface CertificatePageProps {
    courseId?: string
}

export default function CertificatePage({ courseId }: CertificatePageProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session } = useSession()
    const courseIdFromParams = courseId || searchParams.get('courseId')
    
    const { templateData, hasTemplate, isLoading: isLoadingTemplate } = useCertificateTemplateByCourse(courseIdFromParams)
    
    // Check if template exists (API returns hasTemplate: false when no template)
    const templateExists = templateData && (templateData.hasTemplate !== false) && templateData.id
    const { course, isLoading: isLoadingCourse } = useCourseDetails(courseIdFromParams)
    const { myCoursesData } = useMyCourses()
    const { data: profile } = useGetMyProfile()
    
    // Find enrollment info from my courses
    const enrollmentInfo = myCoursesData?.courses?.find(c => c.course_id.toString() === courseIdFromParams?.toString())

    const isLoading = isLoadingTemplate || isLoadingCourse

    // Generate certificate ID
    const generateCertificateId = () => {
        const prefix = 'PPCB-'
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let result = ''
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return prefix + result
    }

    const certificateId = generateCertificateId()
    const userName = session?.user?.name || profile?.data?.full_name || 'User'
    const courseTitle = course?.title || templateData?.courseTitle || 'Course'
    const completionDate = enrollmentInfo?.completed_date || new Date().toISOString()
    const score = enrollmentInfo?.progress_percentage || 100

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A'
        return dayjs(dateString).format('MMM D, YYYY')
    }

    const handleDownload = () => {
        // TODO: Implement certificate download
        console.log('Download certificate')
    }

    if (isLoading) {
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
                    <span style={{ color: '#6B7280' }}>Loading certificate...</span>
                </div>
            </div>
        )
    }

    // Show message if no template assigned
    if (!templateExists) {
        return (
            <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
                <div style={{ marginBottom: '24px' }}>
                    <BackButton title="Back to Course" href={`/my-courses/${courseIdFromParams}/learn`} />
                </div>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '48px',
                    textAlign: 'center',
                    maxWidth: '600px',
                    margin: '0 auto',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: '#FEF3C7',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px'
                    }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1F2937', margin: '0 0 16px 0' }}>
                        {templateData?.message || 'No Certificate Template Assigned'}
                    </h2>
                    <p style={{ fontSize: '16px', color: '#6B7280', margin: '0 0 32px 0' }}>
                        {templateData?.message || 'This course does not have a certificate template assigned. Please contact your administrator.'}
                    </p>
                    {templateData?.courseTitle && (
                        <p style={{ fontSize: '14px', color: '#9CA3AF', margin: '0 0 16px 0' }}>
                            Course: {templateData.courseTitle}
                        </p>
                    )}
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
        )
    }

    return (
        <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <BackButton title="Back to Course" href={`/my-courses/${courseIdFromParams}/learn`} />
                <button
                    onClick={handleDownload}
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
                        gap: '8px',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#002855'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#003D7A'
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download Certificate
                </button>
            </div>

            {/* Certificate Display */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 'calc(100vh - 200px)'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    border: '4px solid #003D7A',
                    borderRadius: '12px',
                    padding: '64px',
                    maxWidth: '900px',
                    width: '100%',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    position: 'relative'
                }}>
                    {/* Logo/Icon at top */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginBottom: '32px'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            backgroundColor: '#003D7A',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '16px'
                        }}>
                            <Image width={48} height={48} src="/icon/common/graduate-cap.png" alt="Certificate icon" />
                        </div>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#003D7A',
                            margin: 0
                        }}>
                            PPCBank E-Learning
                        </h3>
                    </div>

                    {/* Certificate Title */}
                    <h1 style={{
                        fontSize: '36px',
                        fontWeight: '600',
                        color: '#1F2937',
                        textAlign: 'center',
                        margin: '0 0 48px 0'
                    }}>
                        Certificate of Completion
                    </h1>

                    {/* Certificate Body */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '48px',
                        fontSize: '18px',
                        color: '#4B5563',
                        lineHeight: '1.8'
                    }}>
                        <p style={{ margin: '0 0 16px 0' }}>This is to certify that</p>
                        <p style={{
                            fontSize: '28px',
                            fontWeight: '600',
                            color: '#003D7A',
                            margin: '0 0 16px 0'
                        }}>
                            {userName}
                        </p>
                        <p style={{ margin: '0 0 16px 0' }}>has successfully completed the course</p>
                        <p style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            color: '#1F2937',
                            margin: '0 0 16px 0'
                        }}>
                            {courseTitle}
                        </p>
                        <p style={{ margin: 0 }}>with a score of {score}%</p>
                    </div>

                    {/* Footer */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginTop: '64px',
                        paddingTop: '32px',
                        borderTop: '1px solid #E5E7EB'
                    }}>
                        <div>
                            <p style={{
                                fontSize: '14px',
                                color: '#6B7280',
                                margin: '0 0 8px 0'
                            }}>
                                Completion Date
                            </p>
                            <p style={{
                                fontSize: '16px',
                                fontWeight: '500',
                                color: '#1F2937',
                                margin: 0
                            }}>
                                {formatDate(completionDate)}
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{
                                fontSize: '14px',
                                color: '#6B7280',
                                margin: '0 0 8px 0'
                            }}>
                                PPCBank E-Learning
                            </p>
                            <p style={{
                                fontSize: '14px',
                                color: '#6B7280',
                                margin: 0
                            }}>
                                Authorized Signature
                            </p>
                        </div>
                    </div>

                    {/* Certificate ID */}
                    <div style={{
                        textAlign: 'center',
                        marginTop: '32px',
                        paddingTop: '16px',
                        borderTop: '1px solid #E5E7EB'
                    }}>
                        <p style={{
                            fontSize: '12px',
                            color: '#9CA3AF',
                            margin: 0
                        }}>
                            Certificate ID: {certificateId}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

