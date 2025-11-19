"use client"

import React from 'react';
import dayjs, { Dayjs } from 'dayjs';

interface CalendarMonthProps {
    month: Dayjs;
    startDate: Dayjs;
    endDate: Dayjs;
    onDateSelect: (date: Dayjs) => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onMonthChange: (newMonth: Dayjs, side: 'left' | 'right') => void;
    side: 'left' | 'right'; 
    hideOtherMonthDays?: boolean;
}

interface CalendarDay {
    date: Dayjs;
    isCurrentMonth: boolean;
    isToday: boolean;
    isInRange: boolean;
    isRangeStart: boolean;
    isRangeEnd: boolean;
    isDisabled?: boolean;
    isSelectable: boolean;
}

export function CalendarMonth({
    month,
    startDate,
    endDate,
    onDateSelect,
    onPrevMonth,
    onNextMonth,
    onMonthChange, // New direct month change handler
    side,
    hideOtherMonthDays = false
}: CalendarMonthProps) {

    const currentDate = dayjs();

    const months: string[] = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const generateYears = (): number[] => {
        const currentYear = dayjs().year();
        const endYear = currentYear + 10;
        const years: number[] = [];
        
        for (let year = 2010; year <= endYear; year++) {
            years.push(year);
        }
        
        return years;
    };
    
    const years = generateYears();

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const monthIndex = parseInt(e.target.value, 10);
        const newMonth = month.month(monthIndex);
        onMonthChange(newMonth, side);
    };


    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const year = parseInt(e.target.value, 10);
        const newMonth = month.year(year);
        onMonthChange(newMonth, side);
    };

    const generateCalendarDays = (): CalendarDay[] => {
        const firstDayOfMonth = month.startOf('month');
        const lastDayOfMonth = month.endOf('month');

        let startDay = firstDayOfMonth.day() === 1 ? firstDayOfMonth : firstDayOfMonth.subtract((firstDayOfMonth.day() + 6) % 7, 'day');

        if (hideOtherMonthDays) {
            startDay = firstDayOfMonth;
        }

        let endDay = lastDayOfMonth.day() === 0 ? lastDayOfMonth : lastDayOfMonth.add(7 - lastDayOfMonth.day(), 'day');

        if (hideOtherMonthDays) {
            endDay = lastDayOfMonth;
        }

        const days: CalendarDay[] = [];

        if (hideOtherMonthDays) {
            const dayOfWeek = firstDayOfMonth.day(); // 0 = Sunday, 1 = Monday, etc.
            const daysToAdd = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to 0 = Monday format

            for (let i = 0; i < daysToAdd; i++) {
                days.push({
                    date: firstDayOfMonth.subtract(i + 1, 'day'),
                    isCurrentMonth: false,
                    isToday: false,
                    isInRange: false,
                    isRangeStart: false,
                    isRangeEnd: false,
                    isDisabled: true,
                    isSelectable: false
                });
            }

            days.reverse();
        }

        let currentDay = hideOtherMonthDays ? firstDayOfMonth : startDay;
        const finalDay = hideOtherMonthDays ? lastDayOfMonth : endDay;

        while (currentDay.isSameOrBefore(finalDay, 'day')) {
            const isCurrentMonthDay = currentDay.month() === month.month();

            if (hideOtherMonthDays && !isCurrentMonthDay) {
                currentDay = currentDay.add(1, 'day');
                continue;
            }

            const isInRange = currentDay.isAfter(startDate, 'day') && currentDay.isBefore(endDate, 'day');
            const isRangeStart = currentDay.isSame(startDate, 'day');
            const isRangeEnd = currentDay.isSame(endDate, 'day');
            const isToday = currentDay.isSame(currentDate, 'day');

            let isSelectable = isCurrentMonthDay;

            if (side === 'left' && isRangeEnd) {
                isSelectable = false;
            } else if (side === 'right' && isRangeStart) {
                isSelectable = false;
            }

            days.push({
                date: currentDay,
                isCurrentMonth: isCurrentMonthDay,
                isToday: isToday,
                isInRange,
                isRangeStart: side === 'left' && isRangeStart,
                isRangeEnd: side === 'right' && isRangeEnd,
                isDisabled: !isSelectable || !currentDay.isValid(),
                isSelectable
            });

            currentDay = currentDay.add(1, 'day');
        }

        if (hideOtherMonthDays) {
            const totalDaysAdded = days.length;
            const remainingCells = 42 - totalDaysAdded; // 6 rows x 7 days = 42 total cells

            for (let i = 1; i <= remainingCells; i++) {
                days.push({
                    date: lastDayOfMonth.add(i, 'day'),
                    isCurrentMonth: false,
                    isToday: false,
                    isInRange: false,
                    isRangeStart: false,
                    isRangeEnd: false,
                    isDisabled: true,
                    isSelectable: false
                });
            }
        }

        return days;
    };

    const calendarDays = generateCalendarDays();

    return (
        <div className="calendar-section">
            <div className="wl-calendar-header">
                <div className="d-flex flex-grow-1 align-items-center gap-2">
                    <div className="w-100 d-flex flex-grow-1">
                        <select
                            className="w-100"
                            value={month.month()}
                            onChange={handleMonthChange}
                        >
                            {months.map((monthName, index) => (
                                <option key={index} value={index}>{monthName}</option>
                            ))}
                        </select>
                    </div>
                    <select
                        style={{ width: 110 }}
                        value={month.year()}
                        onChange={handleYearChange}
                    >
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                <div className="d-inline-flex align-items-center gap-1">
                    <button
                        className="wl-btn-primary-text"
                        aria-label="Previous month"
                        onClick={onPrevMonth}
                    >
                    </button>
                    <button
                        className="wl-btn-primary-text"
                        aria-label="Next month"
                        onClick={onNextMonth}
                    >
                    </button>
                </div>
            </div>
            <div className="wl-calendar-body">
                <div className="wl-weekday-wrapper">
                    {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(day => (
                        <div key={day} className="wl-weekday-text">{day}</div>
                    ))}
                </div>
                <div className="wl-datepicker-wrapper">
                    {calendarDays.map((day, index) => (
                        <button
                            key={index}
                            disabled={!day.isCurrentMonth || day.isDisabled || !day.isSelectable}
                            className={`wl-calendar-item 
                                ${!day.isCurrentMonth ? 'wl-other-month' : ''}
                                ${!day.isCurrentMonth && hideOtherMonthDays ? 'wl-hidden-day' : ''}
                                ${day.isInRange ? 'in-range' : ''}
                                ${day.isRangeStart ? 'range-start' : ''}
                                ${day.isRangeEnd ? 'range-end' : ''}
                                ${!day.isCurrentMonth || day.isDisabled ? 'disabled' : ''}
                                ${side === 'left' && day.isRangeStart ? 'start-date-highlight' : ''}
                                ${side === 'right' && day.isRangeEnd ? 'end-date-highlight' : ''}
                            `}
                            aria-label={day.date.format('YYYY-MM-DD')}
                            onClick={() => day.isSelectable && onDateSelect(day.date)}
                        >
                            {hideOtherMonthDays && !day.isCurrentMonth ? '' : day.date.date()}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
