import { JSX } from 'react';
import DatePicker from './DatePicker';

interface DatePickerWrapperProps {
    storageKey?: string;
}

/**
 * DatePickerWrapper - A wrapper component that handles URL integration for DatePicker
 * Uses App Router (next/navigation) APIs
 */
export default function DatePickerWrapper({
    storageKey = 'datepicker-default'
}: DatePickerWrapperProps): JSX.Element {
   
    return (
        <DatePicker
            // onDateChange={handleDateChange}
            storageKey={storageKey}
        />
    );
}