'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import ClickOutside from '@/components/common/ClickOutside'

interface SingleDatePickerProps {
    value: string
    onChange: (date: string) => void
    placeholder?: string
    minDate?: string
    maxDate?: string
    disabled?: boolean
}

export default function SingleDatePicker({
    value,
    onChange,
    placeholder = 'Select date',
    minDate,
    maxDate,
    disabled = false
}: SingleDatePickerProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs())
    const prevValueRef = useRef<string>(value)

    const selectedDate = useMemo(() => value ? dayjs(value) : null, [value])
    const min = useMemo(() => minDate ? dayjs(minDate) : null, [minDate])
    const max = useMemo(() => maxDate ? dayjs(maxDate) : null, [maxDate])

    useEffect(() => {
        if (value && value !== prevValueRef.current) {
            prevValueRef.current = value
            const date = dayjs(value)
            setCurrentMonth(date.startOf('month'))
        }
    }, [value])

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const generateYears = (): number[] => {
        const currentYear = dayjs().year()
        const years: number[] = []
        for (let year = currentYear - 10; year <= currentYear + 10; year++) {
            years.push(year)
        }
        return years
    }

    const generateCalendarDays = (): Array<{ date: Dayjs; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean; isDisabled: boolean }> => {
        const firstDayOfMonth = currentMonth.startOf('month')
        const startDay = firstDayOfMonth.subtract((firstDayOfMonth.day() + 6) % 7, 'day')
        const endDay = firstDayOfMonth.endOf('month').add(7 - firstDayOfMonth.endOf('month').day(), 'day')

        const days: Array<{ date: Dayjs; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean; isDisabled: boolean }> = []
        let currentDay = startDay

        while (currentDay.isBefore(endDay) || currentDay.isSame(endDay, 'day')) {
            const isToday = currentDay.isSame(dayjs(), 'day')
            const isSelected = selectedDate ? currentDay.isSame(selectedDate, 'day') : false
            const isCurrentMonth = currentDay.month() === currentMonth.month()
            
            let isDisabled = false
            if (min && currentDay.isBefore(min, 'day')) isDisabled = true
            if (max && currentDay.isAfter(max, 'day')) isDisabled = true

            days.push({
                date: currentDay,
                isCurrentMonth,
                isToday,
                isSelected,
                isDisabled
            })

            currentDay = currentDay.add(1, 'day')
        }

        return days
    }

    const handleDateSelect = (date: Dayjs) => {
        if (min && date.isBefore(min, 'day')) return
        if (max && date.isAfter(max, 'day')) return
        
        onChange(date.format('YYYY-MM-DD'))
        setIsOpen(false)
    }

    const handlePrevMonth = () => {
        setCurrentMonth(currentMonth.subtract(1, 'month'))
    }

    const handleNextMonth = () => {
        setCurrentMonth(currentMonth.add(1, 'month'))
    }

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const monthIndex = parseInt(e.target.value, 10)
        setCurrentMonth(currentMonth.month(monthIndex))
    }

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const year = parseInt(e.target.value, 10)
        setCurrentMonth(currentMonth.year(year))
    }

    const displayValue = selectedDate ? selectedDate.format('YYYY-MM-DD') : ''
    const calendarDays = generateCalendarDays()
    const years = generateYears()

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <input
                ref={inputRef}
                type="text"
                value={displayValue}
                placeholder={placeholder}
                readOnly
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    height: '32px',
                    padding: '0 12px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    backgroundColor: disabled ? '#F3F4F6' : 'white'
                }}
            />
            {isOpen && !disabled && (
                <ClickOutside
                    onClickOutside={() => setIsOpen(false)}
                    excludeRefs={[inputRef]}
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        zIndex: 1000,
                        marginTop: '4px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: '1px solid #E5E7EB',
                        padding: '16px',
                        minWidth: '300px'
                    }}
                >
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    color: '#374151',
                                    fontSize: '16px'
                                }}
                            >
                                ‹
                            </button>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <select
                                    value={currentMonth.month()}
                                    onChange={handleMonthChange}
                                    style={{
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '4px',
                                        // padding: '4px 8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {months.map((month, index) => (
                                        <option key={month} value={index}>
                                            {month}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={currentMonth.year()}
                                    onChange={handleYearChange}
                                    style={{
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '4px',
                                        // padding: '4px 8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {years.map(year => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="button"
                                onClick={handleNextMonth}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    color: '#374151',
                                    fontSize: '16px'
                                }}
                            >
                                ›
                            </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                                <div
                                    key={day}
                                    style={{
                                        textAlign: 'center',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        color: '#6B7280',
                                        padding: '4px'
                                    }}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                            {calendarDays.map((day, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    disabled={day.isDisabled}
                                    onClick={() => handleDateSelect(day.date)}
                                    style={{
                                        border: 'none',
                                        background: day.isSelected
                                            ? '#003D7A'
                                            : day.isToday
                                            ? '#E5E7EB'
                                            : 'transparent',
                                        color: day.isSelected
                                            ? 'white'
                                            : !day.isCurrentMonth
                                            ? '#D1D5DB'
                                            : day.isDisabled
                                            ? '#D1D5DB'
                                            : '#374151',
                                        borderRadius: '4px',
                                        padding: '8px',
                                        fontSize: '14px',
                                        cursor: day.isDisabled ? 'not-allowed' : 'pointer',
                                        opacity: day.isDisabled ? 0.5 : 1,
                                        fontWeight: day.isToday ? '600' : 'normal'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!day.isDisabled && !day.isSelected) {
                                            e.currentTarget.style.backgroundColor = '#F3F4F6'
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!day.isDisabled && !day.isSelected) {
                                            e.currentTarget.style.backgroundColor = 'transparent'
                                        }
                                    }}
                                >
                                    {day.date.date()}
                                </button>
                            ))}
                        </div>
                    </div>
                </ClickOutside>
            )}
        </div>
    )
}

