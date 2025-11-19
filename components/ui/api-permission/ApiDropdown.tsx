'use client';

import React, { useState, useRef, useEffect } from 'react';
import { InfiniteScrollItem } from '@/lib/types/common';
import { useApis, useAllApis } from '@/lib/hook/use-api-permission';
import { Spinner } from 'react-bootstrap';

interface ApiDropdownProps {
    selectedApi: InfiniteScrollItem | null;
    onApiSelect: (api: InfiniteScrollItem) => void;
    onApiClear: () => void;
    disabled?: boolean;
    partnerId?: number;
    categoryId?: number | null;
}

const ApiDropdown: React.FC<ApiDropdownProps> = ({ selectedApi, onApiSelect, onApiClear, disabled = false, partnerId, categoryId }) => {
    const apisQuery = partnerId && categoryId ? useApis(partnerId, categoryId) : useAllApis();
    console.log('partnerId:', partnerId);
    console.log('APIs Query:', apisQuery);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight * 1.5 && apisQuery.hasNextPage && !apisQuery.isFetchingNextPage) {
            apisQuery.fetchNextPage();
        }
    };
    
    const handleSelect = (api: InfiniteScrollItem) => {
        onApiSelect(api);
        setIsOpen(false);
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onApiClear();
    };
console.log('apisQuery.isFetchingNextPage', apisQuery.isFetchingNextPage)
    return (
        <div className="row">
            <div className="col-12">
                <div className="wl-input-container" ref={dropdownRef}>
                    <span className="wl-input-title wl-text-primary">
                        API Name <span className="wl-input-required">*</span>
                    </span>
                    <div className="dropdown">
                        <input
                            disabled={disabled}
                            type="text"
                            className="w-100"
                            placeholder={disabled ? 'Select Partner and Category first' : 'Search API name, path'}
                            value={selectedApi ? selectedApi.title : apisQuery.searchValue}
                            onChange={(e) => {
                                if (selectedApi) onApiClear();
                                apisQuery.setSearchValue(e.target.value);
                                setIsOpen(true);
                            }}
                            onClick={() => setIsOpen(!isOpen)}
                        />
                        {(selectedApi || apisQuery.searchValue) && (
                            <span
                                className="wl-clear-btn"
                                onClick={() => {
                                    if(selectedApi) onApiClear();
                                    apisQuery.setSearchValue('');
                                }}
                            />
                        )}
                        {/*<div
                            className={`w-100 wl-dropdown-toggle wl-toggle-outline d-flex justify-content-between ${disabled ? 'disabled' : ''}`}
                            onClick={() => !disabled && setIsOpen(!isOpen)}
                            style={{ opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
                        >
                            <span className="text-truncate">
                                {selectedApi ? selectedApi.subtitle : disabled ? 'Select Partner first' : 'Select'}
                            </span>
                            {selectedApi && !disabled && (
                                <span
                                    className="wl-clear-btn"
                                    onClick={handleClear}
                                    style={{ zIndex: 2 }}
                                />
                            )}
                        </div>*/}
                        <div className={`w-100 dropdown-menu wl-dropdown-menu p-0 ${isOpen ? 'show' : ''}`}>
                            <div className="w-100 d-flex flex-column">
                                <div className="border-bottom wl-px-12 wl-py-10">
                                    APIs
                                </div>
                                <div
                                    className="w-100 d-flex flex-column wl-max-height-220 overflow-x-hidden overflow-y-auto p-1"
                                    onScroll={handleScroll}
                                >
                                    { apisQuery.items.length > 0 ? apisQuery.items.map((api) => (
                                        <div
                                            key={api.value._uniqueKey || api.id}
                                            className="wl-dropdown-item"
                                            onClick={() => handleSelect(api)}
                                        >
                                            <div className="d-flex flex-column wl-gap-2">
                                                <label>{api.title}</label>
                                                <label className="wl-caption opacity-75">{api.subtitle}</label>
                                            </div>
                                        </div>
                                    )) : apisQuery.isLoading ?
                                        <div className='m-auto'>
                                            <span className="visually-hidden">Loading...</span>
                                      </div>
                                    : <div className="text-center p-2">No APIs found</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiDropdown; 