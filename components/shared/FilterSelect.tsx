'use client';
import {useRouter, useSearchParams} from 'next/navigation';
import '@/styles/custom.css';
import React, { useRef, useState, useEffect } from 'react';

interface FilterOption {
    value: string;
    name: string;
}

interface Props {
    options: FilterOption[];
    defaultFilter?: string;
    param?: any;
    onFilterChange?: (filterId: string) => void;
}

const FilterSelect = ({
                          options,
                          onFilterChange,
                          param,
                          defaultFilter,
                      }: Props) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(defaultFilter || '');
    const [isFocused, setIsFocused] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Handle filter change
    const handleFilterChange = (filterId: string, name: string) => {
        // Update state
        setSelectedOption(name);
        setIsOpen(false);

        // Update URL with new status parameter
        const params = new URLSearchParams(searchParams.toString());
        params.set(param, filterId);

        // Push the new URL
        router.push(`?${params.toString()}`, { scroll: false });

        // Trigger callback if provided
        if (onFilterChange) {
            onFilterChange(filterId);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    return (
        <div
            ref={dropdownRef}
            onClick={() => {
                setIsOpen(!isOpen);
                handleFocus();
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            tabIndex={0}
            className="cus-drpw-con wl-dropdown-toggle select-container"
            style={{
                height: '38px',
                position: 'relative',
                outline: 'none',
                border: isFocused ? '1px solid #3665d0' : '1px solid #ccc',
                borderRadius: '8px',
                boxShadow: isFocused ? '0 0 0 3px rgba(54, 101, 208, 0.2)' : 'none',
                transition: 'all 0.2s ease-in-out',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    height: '100%',
                }}
            >
                <span style={{marginRight: '8px'}}>Business Type:</span>
                <div className="wl-width-80" style={{position: 'relative'}}>
                    {selectedOption || defaultFilter}
                </div>
            </div>

            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: '0',
                        width: '100%',
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderTop: 'none',
                        zIndex: 1000,
                        maxHeight: '200px',
                        overflowY: 'auto',
                        borderRadius: '8px',
                        marginTop: '4px',
                    }}
                >
                    <div
                        className={`cus-drpw ${selectedOption === defaultFilter ? 'selected' : ''}`}
                        style={{
                            borderTop: '1px solid #ccc',
                            padding: '8px',
                            cursor: 'pointer',
                        }}
                        onClick={() => handleFilterChange('', defaultFilter || '')}
                    >
                        {defaultFilter}
                    </div>
                    {options?.map((option, index) => (
                        <div
                            className={`cus-drpw ${selectedOption === option.name ? 'selected' : ''}`}
                            key={index}
                            style={{
                                padding: '8px',
                                cursor: 'pointer',
                            }}
                            onClick={() => handleFilterChange(option.value, option.name)}
                        >
                            {option.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FilterSelect;