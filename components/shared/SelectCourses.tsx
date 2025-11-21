'use client'

import { useState, useRef, useEffect } from 'react'
import { useFetchAllCourses } from '@/lib/hook/use-course'
import { Spinner } from 'react-bootstrap'

interface SelectCoursesProps {
    value?: number[]
    onChange?: (courseIds: number[]) => void
    placeholder?: string
    label?: string
}

export default function SelectCourses({ 
    value = [], 
    onChange,
    placeholder = "Search courses...",
    label = "Select Courses"
}: SelectCoursesProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const { courses, isLoading } = useFetchAllCourses(100) // Fetch up to 100 courses
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [selectedCourses, setSelectedCourses] = useState<Array<{ id: number; title: string }>>([])

    // Sync selected courses from value prop
    useEffect(() => {
        if (value.length > 0 && courses.length > 0) {
            const selected = courses
                .filter((course: any) => value.includes(course.id))
                .map((course: any) => ({ id: course.id, title: course.title }))
            setSelectedCourses(selected)
        } else if (value.length === 0) {
            setSelectedCourses([])
        }
    }, [value, courses])

    // Filter courses based on search
    const filteredCourses = courses.filter((course: any) => 
        course.title?.toLowerCase().includes(searchValue.toLowerCase())
    )

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false)
            }
        }

        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [dropdownOpen])

    const handleCourseToggle = (course: any) => {
        const isSelected = selectedCourses.some(c => c.id === course.id)
        let newCourses: Array<{ id: number; title: string }>
        
        if (isSelected) {
            newCourses = selectedCourses.filter(c => c.id !== course.id)
        } else {
            newCourses = [...selectedCourses, { id: course.id, title: course.title }]
        }
        
        setSelectedCourses(newCourses)
        
        if (onChange) {
            onChange(newCourses.map(c => c.id))
        }
    }

    const handleCourseRemove = (courseId: number) => {
        const newCourses = selectedCourses.filter(c => c.id !== courseId)
        setSelectedCourses(newCourses)
        
        if (onChange) {
            onChange(newCourses.map(c => c.id))
        }
    }

    return (
        <div>
            <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '8px' 
            }}>
                {label}
            </label>
            <div style={{ position: 'relative' }} ref={dropdownRef}>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchValue}
                    onChange={(e) => {
                        setSearchValue(e.target.value)
                        if (!dropdownOpen) setDropdownOpen(true)
                    }}
                    onFocus={() => setDropdownOpen(true)}
                    style={{
                        width: '100%',
                        height: '40px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        padding: '0 12px'
                    }}
                />
                
                {/* Selected courses tags */}
                {selectedCourses.length > 0 && (
                    <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '8px', 
                        marginTop: '8px' 
                    }}>
                        {selectedCourses.map((course) => (
                            <span
                                key={course.id}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 10px',
                                    backgroundColor: '#EFF6FF',
                                    color: '#003D7A',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                }}
                            >
                                {course.title}
                                <button
                                    type="button"
                                    onClick={() => handleCourseRemove(course.id)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#003D7A',
                                        cursor: 'pointer',
                                        padding: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontSize: '14px',
                                        lineHeight: 1
                                    }}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                {/* Dropdown menu */}
                {dropdownOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '4px',
                        backgroundColor: 'white',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000,
                        maxHeight: '300px',
                        overflowY: 'auto'
                    }}>
                        {isLoading ? (
                            <div style={{ padding: '16px', textAlign: 'center' }}>
                                <Spinner animation="border" size="sm" />
                            </div>
                        ) : filteredCourses.length === 0 ? (
                            <div style={{ padding: '16px', color: '#6B7280', fontSize: '14px', textAlign: 'center' }}>
                                {searchValue ? 'No courses found' : 'No courses available'}
                            </div>
                        ) : (
                            filteredCourses.map((course: any) => {
                                const isSelected = selectedCourses.some(c => c.id === course.id)
                                return (
                                    <div
                                        key={course.id}
                                        onClick={() => handleCourseToggle(course)}
                                        style={{
                                            padding: '12px 16px',
                                            cursor: 'pointer',
                                            backgroundColor: isSelected ? '#EFF6FF' : 'white',
                                            borderBottom: '1px solid #F3F4F6',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.backgroundColor = '#F9FAFB'
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.backgroundColor = 'white'
                                            }
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => {}}
                                            style={{
                                                width: '16px',
                                                height: '16px',
                                                cursor: 'pointer'
                                            }}
                                        />
                                        <span style={{ 
                                            fontSize: '14px', 
                                            color: '#1F2937',
                                            flex: 1
                                        }}>
                                            {course.title}
                                        </span>
                                    </div>
                                )
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}


