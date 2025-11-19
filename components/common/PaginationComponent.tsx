import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// Define the Pagination interface exactly as provided
export interface Pagination {
    last: boolean;
    first: boolean;
    size: number;
    empty: boolean;
    total_pages: number;
    current_page: number;
    current_total_elements: number;
    total_elements: number;
}

interface PaginationComponentProps {
    pagination: Pagination | null;
    isLoading?: boolean;
    defaultPageSize?: number;
    defaultPage?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
}

const PaginationComponent: React.FC<PaginationComponentProps> = ({
    pagination,
    isLoading = false,
    defaultPageSize = 10,
    defaultPage = 0,
    onPageChange,
    onPageSizeChange,
}) => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const currentPage = Number(searchParams.get('page_number') ?? defaultPage);
    const currentSize = Number(searchParams.get('page_size') ?? defaultPageSize);

    const paginationData = pagination || {
        last: true,
        first: true,
        size: currentSize,
        empty: true,
        total_pages: 1,
        current_page: currentPage + 1, 
        current_total_elements: 0,
        total_elements: 0,
    };

    const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

    const handlePageChange = (page: number) => {
        if (isLoading) return;

        if (page !== paginationData.current_page) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('page_number', String(page)); 
            router.push(`?${params.toString()}`, { scroll: false });

            if (onPageChange) {
                onPageChange(page);
            }
        }
    };

    const handlePageSizeChange = (pageSize: number) => {
        if (isLoading) return;

        if (pageSize !== paginationData.size) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('page_size', String(pageSize));
            params.set('page_number', '0');
            router.push(`?${params.toString()}`, { scroll: false });

            if (onPageSizeChange) {
                onPageSizeChange(pageSize);
            }
        }
    };

    const isFirstPage = paginationData.first || paginationData.current_page === 0;
    const isLastPage = paginationData.last || paginationData.current_page === paginationData.total_pages - 1;
    const startItem = paginationData.current_page * paginationData.size + 1;
    const endItem = Math.min(
        paginationData.total_elements || 0,
        (paginationData.current_page + 1) * paginationData.size
    );
    const itemsDisplay = paginationData.total_elements ? 
        `${endItem} of ${paginationData.total_elements}` : 
        "0 of 0";

    return (
        <div className="wl-pagination">
            <div className="wl-menu-option-wrapper">
                <span className="wl-menu-title">Page rows</span>
                <div>
                    <select
                        value={paginationData.size}
                        className="wl-select"
                        onChange={(e) => {
                            e.preventDefault();
                            handlePageSizeChange(Number(e.target.value));
                        }}
                    >
                        {PAGE_SIZE_OPTIONS.map((pageSize) => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <span className="wl-page-number">
                {itemsDisplay} 
            </span>

            <div className="wl-navigation-wrapper">
                <button
                    type="button"
                    className={`wl-navigation-button ${isFirstPage ? 'disabled' : ''}`}
                    onClick={() => handlePageChange(0)}
                    disabled={isFirstPage || isLoading}
                    aria-label="Go to first page"
                >
                    <span className="wl-navigation-icon wl-navigation-last"></span>
                </button>
                <button
                    type="button"
                    className={`wl-navigation-button ${isFirstPage ? 'disabled' : ''}`}
                    onClick={() => handlePageChange(paginationData.current_page - 1)}
                    disabled={isFirstPage || isLoading}
                    aria-label="Go to previous page"
                >
                    <span className="wl-navigation-icon wl-navigation-previous"></span>
                </button>
                <button
                    type="button"
                    className={`wl-navigation-button ${isLastPage ? 'disabled' : ''}`}
                    onClick={() => handlePageChange(paginationData.current_page + 1)}
                    disabled={isLastPage || isLoading}
                    aria-label="Go to next page"
                >
                    <span className="wl-navigation-icon wl-navigation-next"></span>
                </button>
                <button
                    type="button"
                    className={`wl-navigation-button ${isLastPage ? 'disabled' : ''}`}
                    onClick={() => handlePageChange(paginationData.total_pages - 1)}
                    disabled={isLastPage || isLoading}
                    aria-label="Go to last page"
                >
                    <span className="wl-navigation-icon  wl-navigation-first"></span>
                </button>
            </div>
        </div>
    );
};

export default PaginationComponent; 

