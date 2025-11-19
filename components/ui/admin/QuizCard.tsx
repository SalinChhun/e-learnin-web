'use client'

import { useRouter } from 'next/navigation'

interface QuizCardProps {
    id: string | number
    title: string
    type: string
    courseTitle?: string
    date: string
    duration: number
    passingScore: number
    onEdit?: (id: string | number) => void
}

export default function QuizCard({ 
    id, 
    title, 
    type,
    courseTitle,
    date, 
    duration,
    passingScore,
    onEdit 
}: QuizCardProps) {
    const router = useRouter()
    
    const typeColor = type === 'Exam' ? '#EF4444' : '#8B5CF6'

    const handleEdit = () => {
        if (onEdit) {
            onEdit(id)
        } else {
            router.push(`/admin-management/edit-quiz/${id}`)
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
                // TODO: Navigate to quiz details page
                console.log('View quiz', id)
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
                    {date} • {duration} min • Pass: {passingScore}%
                    {courseTitle && ` • ${courseTitle}`}
                </p>
            </div>
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px' 
            }}>
                <span style={{
                    padding: '4px 12px',
                    backgroundColor: typeColor,
                    color: 'white',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '500'
                }}>
                    {type}
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

