'use client'

import { useFetchCategories } from '@/lib/hook/use-course'
import { Category } from '@/service/course.service'

interface CategorySelectProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
    style?: React.CSSProperties
    variant?: 'filter' | 'form' // 'filter' for PublicCoursesContainer style, 'form' for CreateCoursePage style
    showAllOption?: boolean // Show "All Categories" option
}

export default function CategorySelect({
    value,
    onChange,
    placeholder = 'Select Category',
    disabled = false,
    style,
    variant = 'form',
    showAllOption = false
}: CategorySelectProps) {
    const { categories, isLoading: isLoadingCategories } = useFetchCategories()

    const baseStyle: React.CSSProperties = variant === 'filter' 
        ? {
            height: '44px',
            backgroundColor: isLoadingCategories ? '#E5E7EB' : '#F3F4F6',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#1F2937',
            outline: 'none',
            appearance: 'none',
            cursor: isLoadingCategories ? 'not-allowed' : 'pointer',
            minWidth: '180px',
            transition: 'all 0.2s',
            boxSizing: 'border-box',
            lineHeight: '20px',
            padding: '0 12px',
            ...style
        }
        : {
            width: '100%',
            border: '1px solid #D1D5DB',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            backgroundColor: 'white',
            cursor: isLoadingCategories ? 'not-allowed' : 'pointer',
            boxSizing: 'border-box',
            height: '44px',
            ...style
        }

    const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
        if (variant === 'filter' && !isLoadingCategories) {
            e.target.style.backgroundColor = '#FFFFFF'
        }
    }

    const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
        if (variant === 'filter' && !isLoadingCategories) {
            e.target.style.backgroundColor = '#F3F4F6'
        }
    }

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || isLoadingCategories}
            style={baseStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
        >
            {showAllOption && <option value="">All Categories</option>}
            {!showAllOption && <option value="">{placeholder}</option>}
            {categories.map((category: Category) => (
                <option key={category.id} value={category.id.toString()}>
                    {category.name}
                </option>
            ))}
        </select>
    )
}

