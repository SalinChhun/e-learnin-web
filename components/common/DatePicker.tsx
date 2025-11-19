"use client"

import React, { useState, useEffect, useCallback, useRef, JSX } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isToday from 'dayjs/plugin/isToday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekday from 'dayjs/plugin/weekday';
import ClickOutside from './ClickOutside';
import { filterPresets, PresetKey } from './filterPresets';
import { CalendarMonth } from './CalendarMonthProps';
import { DateFormatEnum } from '@/lib/enums/enums';

// Add dayjs plugins
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isToday);
dayjs.extend(weekOfYear);
dayjs.extend(weekday);

interface DatePickerProps {
    initialStartDate?: string;
    initialEndDate?: string;
    onDateChange?: (startDate: string, endDate: string) => void;
    storageKey?: string;
}

interface DateFilter {
    start_date: string;
    end_date: string;
    presetName?: string;
}

export default function DatePicker({
    initialStartDate,
    initialEndDate,
    onDateChange,
    storageKey = 'datepicker-default'
}: DatePickerProps): JSX.Element {
    const inputRef = useRef<HTMLInputElement>(null);
    const currentDateRef = useRef(dayjs());

    const [isCalendarVisible, setIsCalendarVisible] = useState<boolean>(false);

    const checkIfFilterIsSaved = useCallback((): boolean => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(storageKey) !== null;
    }, [storageKey]);

    const [startDate, setStartDate] = useState<Dayjs>(currentDateRef.current.subtract(1, 'month'));
    const [endDate, setEndDate] = useState<Dayjs>(currentDateRef.current);
    const [selectedPreset, setSelectedPreset] = useState<PresetKey>('custom');
    const [saveFilter, setSaveFilter] = useState<boolean>(false);

    const [leftMonth, setLeftMonth] = useState<Dayjs>(currentDateRef.current.startOf('month'));
    const [rightMonth, setRightMonth] = useState<Dayjs>(currentDateRef.current.startOf('month'));

    const [displayValue, setDisplayValue] = useState<string>('');

    const getPresetDates = (preset: PresetKey): { startDate: Dayjs, endDate: Dayjs } => {
        const now = currentDateRef.current;

        switch (preset) {
            case 'today':
                return {
                    startDate: now,
                    endDate: now
                };
            case 'yesterday':
                return {
                    startDate: now.subtract(1, 'day'),
                    endDate: now.subtract(1, 'day')
                };
            case 'this_week':
                return {
                    startDate: now.startOf('week'),
                    endDate: now.endOf('week')
                };
            case 'last_week':
                const lastWeek = now.subtract(1, 'week');
                return {
                    startDate: lastWeek.startOf('week'),
                    endDate: lastWeek.endOf('week')
                };
            case 'this_month':
                return {
                    startDate: now.startOf('month'),
                    endDate: now.endOf('month')
                };
            case 'last_month':
                return {
                    startDate: now.subtract(1, 'month').startOf('month'),
                    endDate: now.subtract(1, 'month').endOf('month')
                };
            case 'last_3_months':
                return {
                    startDate: now.subtract(3, 'month'),
                    endDate: now
                };
            case 'first_half':
                return {
                    startDate: now.month(0).startOf('month'),
                    endDate: now.month(5).endOf('month')
                };
            case 'second_half':
                return {
                    startDate: now.month(6).startOf('month'),
                    endDate: now.month(11).endOf('month')
                };
            case 'q1':
                return {
                    startDate: now.month(0).startOf('month'),
                    endDate: now.month(2).endOf('month')
                };
            case 'q2':
                return {
                    startDate: now.month(3).startOf('month'),
                    endDate: now.month(5).endOf('month')
                };
            case 'q3':
                return {
                    startDate: now.month(6).startOf('month'),
                    endDate: now.month(8).endOf('month')
                };
            case 'q4':
                return {
                    startDate: now.month(9).startOf('month'),
                    endDate: now.month(11).endOf('month')
                };
            case 'custom':
                return {
                    startDate: now.subtract(1, 'month'),
                    endDate: now
                };
            default: // Default to custom (current date - 1 month to current date)
                return {
                    startDate: now.subtract(1, 'month'),
                    endDate: now
                };
        }
    };

    useEffect(() => {
        const customDates = getPresetDates('custom');
        let initialStart = customDates.startDate;
        let initialEnd = customDates.endDate;
        let initialPreset = 'custom' as PresetKey;

        if (typeof window !== 'undefined' && checkIfFilterIsSaved()) {
            try {
                const savedData = JSON.parse(localStorage.getItem(storageKey) || '{}') as DateFilter;
                if (savedData.start_date && savedData.end_date) {
                    initialStart = dayjs(savedData.start_date);
                    initialEnd = dayjs(savedData.end_date);
                    if (savedData.presetName && Object.keys(filterPresets).includes(savedData.presetName)) {
                        initialPreset = savedData.presetName as PresetKey;
                    }
                }
            } catch (e) {
                console.error('Error parsing saved date filter', e);
            }
        }

        setStartDate(initialStart);
        setEndDate(initialEnd);
        setSelectedPreset(initialPreset);

        setLeftMonth(initialStart.startOf('month'));
        setRightMonth(initialEnd.startOf('month'));

        setSaveFilter(checkIfFilterIsSaved());
    }, [checkIfFilterIsSaved, storageKey]);

    useEffect(() => {
        setDisplayValue(`${startDate.format(DateFormatEnum.DISPLAY_DATE)} - ${endDate.format(DateFormatEnum.DISPLAY_DATE)}`);
    }, [startDate, endDate]);

    const handlePresetClick = (preset: PresetKey): void => {
        if (!filterPresets[preset]) return;

        const { startDate: newStartDate, endDate: newEndDate } = getPresetDates(preset);

        setStartDate(newStartDate);
        setEndDate(newEndDate);
        setSelectedPreset(preset);

        setSaveFilter(false);

        setLeftMonth(newStartDate.startOf('month'));
        setRightMonth(newEndDate.startOf('month'));

        // If both dates are in the same month, show consecutive months
        // if (newStartDate.format('YYYY-MM') === newEndDate.format('YYYY-MM')) {
        //     setRightMonth(newStartDate.add(1, 'month').startOf('month'));
        // }
    };

    const handleLeftPrevMonth = (): void => {
        setLeftMonth(leftMonth.subtract(1, 'month'));
    };

    const handleLeftNextMonth = (): void => {
        const newLeftMonth = leftMonth.add(1, 'month');
            setLeftMonth(newLeftMonth);
    }

    const handleRightPrevMonth = (): void => {
        const newRightMonth = rightMonth.subtract(1, 'month');
            setRightMonth(newRightMonth);
    };

    const handleRightNextMonth = (): void => {
        setRightMonth(rightMonth.add(1, 'month'));
    };

    const handleMonthChange = (newMonth: dayjs.Dayjs, side: 'left' | 'right'): void => {
        if (side === 'left') {
            setLeftMonth(newMonth);
        } else {
            setRightMonth(newMonth);
        }
    };

    const handleLeftDateSelect = (selectedDate: Dayjs): void => {
        setStartDate(selectedDate);

        if (selectedDate.isAfter(endDate)) {
            setEndDate(selectedDate.add(1, 'day'));
        }

        setSelectedPreset('custom');
        setSaveFilter(false);
    };

    const handleRightDateSelect = (selectedDate: Dayjs): void => {
        setEndDate(selectedDate);

        if (selectedDate.isBefore(startDate)) {
            setStartDate(selectedDate.subtract(1, 'day'));
            setLeftMonth(selectedDate);
        }

        setSelectedPreset('custom');
        setSaveFilter(false);
    };

    const handleSave = (): void => {

        const formattedStartDate = startDate.format('YYYYMMDD');
        const formattedEndDate = endDate.format('YYYYMMDD');

        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('start_date', formattedStartDate);
            url.searchParams.set('end_date', formattedEndDate);
            window.history.pushState({}, '', url);

            if (saveFilter) {
                localStorage.setItem(storageKey, JSON.stringify({
                    start_date: startDate.format(DateFormatEnum.DATE4),
                    end_date: endDate.format(DateFormatEnum.DATE4),
                    presetName: selectedPreset
                }));
            } else {
                localStorage.removeItem(storageKey);
            }
        }

        setIsCalendarVisible(false);
    };

    const handleClear = (): void => {
        handlePresetClick('custom');
        setSaveFilter(false)
    };

    const closeCalendar = (): void => {
        
        setIsCalendarVisible(false);
    };

    return (
        <>
            <div className="d-inline-flex align-items-center gap-2">
                <div className="wl-date-picker-container position-relative overflow-visible">
                    <input
                        style={{cursor: 'pointer'}}
                        ref={inputRef}
                        className="wl-datepicker wl-datepicker-range"
                        readOnly
                        type="text"
                        value={displayValue}
                        onClick={() => setIsCalendarVisible(!isCalendarVisible)}
                    />

                    {isCalendarVisible && (
                        <ClickOutside
                            onClickOutside={closeCalendar}
                            excludeRefs={[inputRef]}
                            className="wl-calendar-container"
                        >
                            <div className="wl-filter-options">
                                <div className="wl-filter-row">
                                    {(Object.keys(filterPresets) as PresetKey[]).map(presetKey => (
                                        <button
                                            key={presetKey}
                                            className={`wl-filter-btn ${selectedPreset === presetKey ? 'active' : ''}`}
                                            onClick={() => handlePresetClick(presetKey)}
                                        >
                                            {selectedPreset === presetKey && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" fill="currentColor">
                                                    <path d="M6.8377 13.4375C6.52173 13.4375 6.28475 13.319 6.07034 13.0538L3.1476 9.454C2.98397 9.25651 2.91626 9.07032 2.91626 8.87283C2.91626 8.42144 3.24916 8.09419 3.71183 8.09419C3.98831 8.09419 4.18015 8.19575 4.36635 8.42709L6.81513 11.5304L11.5942 3.95834C11.7861 3.65365 11.9779 3.5408 12.2939 3.5408C12.7509 3.5408 13.0782 3.86242 13.0782 4.30816C13.0782 4.48308 13.0274 4.66363 12.892 4.86676L7.6107 13.0369C7.43015 13.3077 7.1706 13.4375 6.8377 13.4375Z" />
                                                </svg>
                                            )}
                                            {filterPresets[presetKey].label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="dual-calendar-wrapper">
                                {/* Left Calendar - Start Date Selection */}
                                <CalendarMonth
                                    month={leftMonth}
                                    startDate={startDate}
                                    endDate={endDate}
                                    onDateSelect={handleLeftDateSelect}
                                    onPrevMonth={handleLeftPrevMonth}
                                    onNextMonth={handleLeftNextMonth}
                                    onMonthChange={handleMonthChange}
                                    side="left"
                                    hideOtherMonthDays={true}
                                />

                                {/* Right Calendar - End Date Selection */}
                                <CalendarMonth
                                    month={rightMonth}
                                    startDate={startDate}
                                    endDate={endDate}
                                    onDateSelect={handleRightDateSelect}
                                    onPrevMonth={handleRightPrevMonth}
                                    onNextMonth={handleRightNextMonth}
                                    onMonthChange={handleMonthChange}
                                    side="right"
                                    hideOtherMonthDays={true}
                                />
                            </div>

                            <div className="wl-calendar-footer">
                                <label className="d-inline-flex align-items-center gap-1">
                                    <div className="d-inline-flex align-items-center">
                                        <input
                                            id="wl-input-save-filter"
                                            type="checkbox"
                                            checked={saveFilter}
                                            onChange={(e) => setSaveFilter(e.target.checked)}
                                        />
                                        <label htmlFor="wl-input-save-filter">Save this date filtering for all time</label>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" fill="#828282">
                                        <path d="M7.99997 14.2556C4.77254 14.2556 2.11499 11.5981 2.11499 8.37064C2.11499 5.14885 4.77254 2.48566 7.99433 2.48566C11.2218 2.48566 13.885 5.14885 13.885 8.37064C13.885 11.5981 11.2274 14.2556 7.99997 14.2556ZM7.9774 6.49738C8.44008 6.49738 8.80683 6.11934 8.80683 5.65666C8.80683 5.18271 8.44008 4.81595 7.9774 4.81595C7.51473 4.81595 7.13669 5.18271 7.13669 5.65666C7.13669 6.11934 7.51473 6.49738 7.9774 6.49738ZM6.95049 11.6037H9.33721C9.61933 11.6037 9.84503 11.4062 9.84503 11.1128C9.84503 10.842 9.61933 10.6219 9.33721 10.6219H8.73912V7.99824C8.73912 7.61456 8.54728 7.36066 8.18617 7.36066H7.0577C6.77558 7.36066 6.54989 7.58071 6.54989 7.85154C6.54989 8.1393 6.77558 8.34243 7.0577 8.34243H7.62758V10.6219H6.95049C6.66273 10.6219 6.44268 10.842 6.44268 11.1128C6.44268 11.4062 6.66273 11.6037 6.95049 11.6037Z" />
                                    </svg>
                                </label>
                                <div className="d-inline-flex align-items-center gap-2">
                                    <button
                                        className="wl-btn-primary-text"
                                        onClick={handleClear}
                                    >
                                        Clear
                                    </button>
                                    <button
                                        className="wl-btn-primary"
                                        onClick={handleSave}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </ClickOutside>
                    )}
                </div>
            </div>
        </>
    );
}
