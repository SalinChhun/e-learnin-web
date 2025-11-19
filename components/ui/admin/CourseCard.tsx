'use client'

import { useRouter } from 'next/navigation'

interface CourseCardProps {
    id: string | number
    title: string
    date: string
    learners: number
    status: string
    onEdit?: (id: string | number) => void
}

export default function CourseCard({ 
    id, 
    title, 
    date, 
    learners, 
    status,
    onEdit 
}: CourseCardProps) {
    const router = useRouter()
    
    // Handle both status codes ('1', '2') and status text ('Published', 'Draft')
    const isPublished = status === '2' || status === 'Published' || status === 'published'
    const statusText = isPublished ? 'Published' : 'Draft'
    const statusColor = isPublished ? '#10B981' : '#9CA3AF'

    const handleEdit = () => {
        if (onEdit) {
            onEdit(id)
        } else {
            router.push(`/admin-management/edit-course/${id}`)
        }
    }

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                border: '1px solid #E5E7EB',
                borderRadius: '20px',
                backgroundColor: 'white',
                transition: 'box-shadow 0.2s',
                cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
            }}
            onClick={() => {
                // TODO: Navigate to course details or edit page
                console.log('View course', id)
            }}
        >
            <div style={{ flex: 1 }}>
                <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '500', 
                    color: '#1F2937', 
                    margin: '0 0 8px 0' 
                }}>
                    {title}
                </h3>
                <p style={{ 
                    fontSize: '14px', 
                    color: '#6B7280', 
                    margin: 0 
                }}>
                    {date} • {learners} {learners === 1 ? 'learner' : 'learners'}
                </p>
            </div>
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px' 
            }}>
                <span style={{
                    padding: '4px 12px',
                    backgroundColor: statusColor,
                    color: 'white',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '500'
                }}>
                    {statusText}
                </span>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation()
                        handleEdit()
                    }}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: 'transparent',
                        color: '#003D7A',
                        border: '1px solid #003D7A',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F0F9FF'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                >
                    Edit
                </button>
            </div>
        </div>
    )
}

