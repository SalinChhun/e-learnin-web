'use client'

import { Modal } from 'react-bootstrap'

interface CertificatePreviewModalProps {
    isOpen: boolean
    onClose: () => void
    template: {
        id: number
        name: string
        description: string
        template_image_url: string
    } | null
}

export default function CertificatePreviewModal({ isOpen, onClose, template }: CertificatePreviewModalProps) {
    const handleDownloadSample = () => {
        if (template?.template_image_url) {
            // Create a temporary anchor element to download the image
            const link = document.createElement('a')
            link.href = template.template_image_url
            link.download = `${template.name.replace(/\s+/g, '_')}_sample.png`
            link.target = '_blank'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    if (!template) return null

    return (
        <Modal
            show={isOpen}
            onHide={onClose}
            centered
            size="lg"
            backdrop={true}
            keyboard={true}
        >
            <Modal.Header style={{ borderBottom: '1px solid #E5E7EB', padding: '24px' }}>
                <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', margin: '0 0 4px 0' }}>
                                Certificate Preview
                            </h2>
                            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                                {template.name}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '24px',
                                color: '#6B7280',
                                cursor: 'pointer',
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
                                e.currentTarget.style.backgroundColor = '#F3F4F6'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                        >
                            ×
                        </button>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body style={{ padding: '24px' }}>
                <div style={{
                    width: '100%',
                    minHeight: '400px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundColor: '#F9FAFB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #E5E7EB'
                }}>
                    {template.template_image_url ? (
                        <img
                            src={template.template_image_url}
                            alt={template.name}
                            style={{
                                width: '100%',
                                height: 'auto',
                                objectFit: 'contain',
                                maxHeight: '600px'
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '100%',
                            height: '400px',
                            background: 'linear-gradient(135deg, #003D7A 0%, #3B82F6 100%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '48px',
                            color: 'white',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                border: '3px solid white',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '32px'
                            }}>
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h3 style={{
                                fontSize: '32px',
                                fontWeight: '700',
                                margin: '0 0 24px 0',
                                letterSpacing: '1px'
                            }}>
                                Professional Achievement Certificate
                            </h3>
                            <p style={{
                                fontSize: '18px',
                                margin: '0 0 32px 0',
                                opacity: 0.9,
                                lineHeight: '1.6'
                            }}>
                                Awarded to <strong>John Doe</strong> for outstanding completion of <strong>Sample Course Name</strong>.
                            </p>
                            <div style={{
                                width: '200px',
                                height: '2px',
                                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                margin: '0 auto 24px'
                            }} />
                            <p style={{
                                fontSize: '14px',
                                margin: 0,
                                opacity: 0.8,
                                fontStyle: 'italic'
                            }}>
                                Excellence in Learning
                            </p>
                        </div>
                    )}
                </div>
            </Modal.Body>

            <Modal.Footer style={{ borderTop: '1px solid #E5E7EB', padding: '24px', display: 'flex', justifyContent: 'space-between' }}>
                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: 'white',
                        color: '#374151',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F9FAFB'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white'
                    }}
                >
                    Close
                </button>
                <button
                    type="button"
                    onClick={handleDownloadSample}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#003D7A',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#002855'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#003D7A'
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Download Sample
                </button>
            </Modal.Footer>
        </Modal>
    )
}

