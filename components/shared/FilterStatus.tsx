'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Define the props interface with filter options and counts
interface FilterOption {
    id: string;
    label: string;
    count: number;
}

interface Props {
    filters: FilterOption[];
    defaultFilter?: string;
    params?: string;
    onFilterChange?: (filterId: string) => void;
}

const FilterStatus = ({
    filters,
    defaultFilter = '',
    onFilterChange,
    params = 'status'
}: Props) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [activeFilter, setActiveFilter] = useState<string>('');

    useEffect(() => {
        const statusFromUrl = searchParams.get(params)

        const initialFilter =
            statusFromUrl !== null && filters.some((f) => f.id === statusFromUrl)
                ? statusFromUrl
                : defaultFilter || (filters.length > 0 ? filters[0].id : "")

        setActiveFilter(initialFilter)
    }, [searchParams, defaultFilter, filters, params])

    const handleFilterChange = (filterId: string) => {
        setActiveFilter(filterId);

        const params = new URLSearchParams(searchParams.toString());
        params.set('status', filterId);
        params.delete('page_number');
        params.delete('page_size');
        
        router.push(`?${params.toString()}`, { scroll: false });

        if (onFilterChange) {
            onFilterChange(filterId);
        }
    };

    const handleTabClick = (filterId: string, event: React.MouseEvent) => {
        event.preventDefault();
        handleFilterChange(filterId);
    };

    return (
        <div className="wl-tabs-control" role="tablist" aria-orientation="horizontal">
            {filters.map((filter) => (
                <div
                    key={filter.id}
                    className="wl-tabs-bar"
                    role="tab"
                    aria-selected={activeFilter === filter.id}
                    aria-controls={`panel-${filter.id}`}
                >
                    <input
                        id={filter.id || "all-filter"}
                        aria-label={filter.label}
                        type="radio"
                        value={filter.id}
                        checked={activeFilter === filter.id}
                        name="wl-tabs-bar"
                        onChange={() => handleFilterChange(filter.id)}
                    />
                    <label
                        onClick={(e) => handleTabClick(filter.id, e)}
                        htmlFor={filter.id}
                        className="d-inline-flex align-items-center gap-1"
                    >
                        {filter.label}
                        <span>{filter.count}</span>
                    </label>
                    <div className="w-100">
                        <div className="wl-tabs-line" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FilterStatus;
