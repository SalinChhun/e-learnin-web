'use client';

import React, { useState, useRef, useEffect } from 'react';
import { InfiniteScrollItem } from '@/lib/types/common';
import { usePartners } from '@/lib/hook/use-api-permission';

interface PartnerDropdownProps {
    selectedPartner: InfiniteScrollItem | null;
    onPartnerSelect: (partner: InfiniteScrollItem) => void;
    onPartnerClear: () => void;
}

const PartnerDropdown: React.FC<PartnerDropdownProps> = ({ selectedPartner, onPartnerSelect, onPartnerClear }) => {
    const partnersQuery = usePartners();
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
        if (scrollHeight - scrollTop <= clientHeight * 1.5 && partnersQuery.hasNextPage && !partnersQuery.isFetchingNextPage) {
            partnersQuery.fetchNextPage();
        }
    };

    const handleSelect = (partner: InfiniteScrollItem) => {
        onPartnerSelect(partner);
        setIsOpen(false);
    }

    return (
        <div className="row">
            <div className="col-12">
                <div className="wl-input-container" ref={dropdownRef}>
                    <span className="wl-input-title wl-text-primary">
                        Partner <span className="wl-input-required">*</span>
                    </span>
                    <div className="dropdown">
                        <input
                            type="text"
                            className="w-100"
                            placeholder="Search partner name, code"
                            value={selectedPartner ? selectedPartner.title : partnersQuery.searchValue}
                            onChange={(e) => {
                                if (selectedPartner) onPartnerClear();
                                partnersQuery.setSearchValue(e.target.value);
                                setIsOpen(true);
                            }}
                            onClick={() => setIsOpen(!isOpen)}
                        />
                        {(selectedPartner || partnersQuery.searchValue) && (
                            <span
                                className="wl-clear-btn"
                                onClick={() => {
                                    if(selectedPartner) onPartnerClear();
                                    partnersQuery.setSearchValue('');
                                }}
                            />
                        )}
                        <div className={`w-100 dropdown-menu wl-dropdown-menu p-0 ${isOpen ? 'show' : ''}`}>
                            <div className="w-100 d-flex flex-column">
                                <div className="border-bottom wl-px-12 wl-py-10">
                                    <span className="fw-medium">Partner</span>
                                </div>
                                <div
                                    className="w-100 d-flex flex-column wl-max-height-220 overflow-x-hidden overflow-y-auto p-1"
                                    onScroll={handleScroll}
                                >
                                    {partnersQuery.items.length > 0 ? partnersQuery.items.map((partner) => (
                                        <div
                                            key={partner.value._uniqueKey || partner.id}
                                            className="wl-dropdown-item"
                                            onClick={() => handleSelect(partner)}
                                        >
                                            <div className="d-flex flex-column wl-gap-2">
                                                <label>{partner.title}</label>
                                                <label className="wl-caption opacity-75">{partner.subtitle}</label>
                                            </div>
                                        </div>
                                    )) : partnersQuery.isLoading ?
                                            <div className='m-auto '>
                                                <span className="visually-hidden">Loading...</span>
                                        </div>
                                        : <div className="text-center p-2">No partners found</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerDropdown; 