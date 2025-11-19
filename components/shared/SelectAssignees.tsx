'use client'

import { useState, useRef, useEffect } from 'react'
import { useUsers } from '@/lib/hook/use-user-mutation'
import { InfiniteScrollItem } from '@/lib/types/common'

interface SelectAssigneesProps {
    value?: string[]
    onChange?: (assigneeIds: string[]) => void
    placeholder?: string
    label?: string
}

export default function SelectAssignees({ 
    value = [], 
    onChange,
    placeholder = "Search users, teams, or departments...",
    label = "Select Assignees"
}: SelectAssigneesProps) {
    // Separate state for dropdown visibility and user loading
    const [dropdownOpen, setDropdownOpen] = useState(false);
    // Enable user loading in background to fetch and match selected users, but don't show dropdown
    const [usersEnabled, setUsersEnabled] = useState(value.length > 0);
    const usersQuery = useUsers(usersEnabled);
    const [selectedAssignees, setSelectedAssignees] = useState<InfiniteScrollItem[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const hasSyncedRef = useRef(false);
    const valueStringRef = useRef<string>('');

    // Keep users enabled if we have value but haven't found all users yet (load in background)
    useEffect(() => {
        if (value.length > 0) {
            setUsersEnabled(true);
            // Check if we've found all selected users
            const foundIds = selectedAssignees.map(a => 
                a.value.id?.toString() || a.value.user_id?.toString() || a.id.toString()
            );
            const missingIds = value.filter(id => !foundIds.includes(id));
            
            // If we have missing users and there are more pages, fetch next page
            // Use a small delay to avoid rapid fire requests
            if (missingIds.length > 0 && usersQuery.hasNextPage && !usersQuery.isFetchingNextPage && !usersQuery.isLoading) {
                const timeoutId = setTimeout(() => {
                    usersQuery.fetchNextPage();
                }, 100);
                return () => clearTimeout(timeoutId);
            }
        }
    }, [value.length, selectedAssignees.length, usersQuery.hasNextPage, usersQuery.isFetchingNextPage, usersQuery.isLoading, usersQuery.fetchNextPage]);

    // Sync value prop with internal state when users are loaded
    useEffect(() => {
        const currentValueString = value.join(',');
        
        // Reset sync if value changed
        if (valueStringRef.current !== currentValueString) {
            hasSyncedRef.current = false;
            valueStringRef.current = currentValueString;
        }

        if (value.length > 0 && usersQuery.items.length > 0) {
            // Find users that match the value IDs
            const matchedAssignees = usersQuery.items.filter((item: InfiniteScrollItem) => {
                const itemId = item.value.id?.toString() || item.value.user_id?.toString() || item.id.toString();
                return value.includes(itemId);
            });
            
            // Update selected assignees, preserving existing ones and adding new matches
            const existingIds = selectedAssignees.map(a => 
                a.value.id?.toString() || a.value.user_id?.toString() || a.id.toString()
            );
            const newMatches = matchedAssignees.filter(a => {
                const aId = a.value.id?.toString() || a.value.user_id?.toString() || a.id.toString();
                return !existingIds.includes(aId);
            });
            
            if (newMatches.length > 0 || !hasSyncedRef.current) {
                // Combine existing and new matches, remove ones not in value
                const allMatches = [...selectedAssignees, ...newMatches].filter(a => {
                    const aId = a.value.id?.toString() || a.value.user_id?.toString() || a.id.toString();
                    return value.includes(aId);
                });
                setSelectedAssignees(allMatches);
                hasSyncedRef.current = true;
            }
        } else if (value.length === 0 && selectedAssignees.length > 0) {
            // Clear selection if value is empty
            setSelectedAssignees([]);
            hasSyncedRef.current = false;
            valueStringRef.current = '';
        }
    }, [value, usersQuery.items]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    const handleAssigneeToggle = (assignee: InfiniteScrollItem) => {
        const isSelected = selectedAssignees.some(a => a.id === assignee.id);
        let newAssignees: InfiniteScrollItem[];
        
        if (isSelected) {
            // Uncheck: remove from selection
            newAssignees = selectedAssignees.filter(a => a.id !== assignee.id);
        } else {
            // Check: add to selection
            newAssignees = [...selectedAssignees, assignee];
        }
        
        setSelectedAssignees(newAssignees);
        
        // Notify parent component
        if (onChange) {
            const assigneeIds = newAssignees.map(a => 
                a.value.id?.toString() || a.value.user_id?.toString() || a.id.toString()
            );
            onChange(assigneeIds);
        }
    }

    const handleAssigneeRemove = (assignee: InfiniteScrollItem) => {
        const newAssignees = selectedAssignees.filter(a => a.id !== assignee.id);
        setSelectedAssignees(newAssignees);
        
        // Notify parent component
        if (onChange) {
            const assigneeIds = newAssignees.map(a => 
                a.value.id?.toString() || a.value.user_id?.toString() || a.id.toString()
            );
            onChange(assigneeIds);
        }
    }

    return (
        <div>
            <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '8px' 
            }}>
                {label}
            </label>
            <div style={{ position: 'relative' }} ref={dropdownRef}>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={usersQuery.searchValue}
                    onChange={(e) => {
                        usersQuery.setSearchValue(e.target.value);
                        if (!usersEnabled) setUsersEnabled(true);
                        if (!dropdownOpen) setDropdownOpen(true);
                    }}
                    onFocus={() => {
                        if (!usersEnabled) setUsersEnabled(true);
                        setDropdownOpen(true);
                    }}
                    style={{
                        width: '100%',
                        height: '32px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        padding: '0 12px'
                    }}
                />
                {/* Dropdown menu - only show when dropdown is open */}
                {dropdownOpen && usersEnabled && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '4px',
                        backgroundColor: 'white',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000,
                        maxHeight: '300px',
                        overflowY: 'auto'
                    }}>
                        <div style={{
                            padding: '12px',
                            borderBottom: '1px solid #E5E7EB',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151'
                        }}>
                            {label}
                        </div>
                        <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                            {usersQuery.isLoading && usersQuery.items.length === 0 ? (
                                <div style={{ padding: '16px', textAlign: 'center', color: '#6B7280' }}>
                                    Loading...
                                </div>
                            ) : usersQuery.items.length === 0 ? (
                                <div style={{ padding: '16px', textAlign: 'center', color: '#6B7280' }}>
                                    No users found
                                </div>
                            ) : (
                                <>
                                    {usersQuery.items.map((item: InfiniteScrollItem) => {
                                        const isSelected = selectedAssignees.some(a => a.id === item.id);
                                        return (
                                            <div
                                                key={item.value._uniqueKey || item.id}
                                                onClick={() => handleAssigneeToggle(item)}
                                                style={{
                                                    padding: '12px 16px',
                                                    cursor: 'pointer',
                                                    backgroundColor: isSelected ? '#F3F4F6' : 'white',
                                                    borderBottom: '1px solid #F3F4F6',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = isSelected ? '#F3F4F6' : 'white';
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleAssigneeToggle(item)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{
                                                        width: '18px',
                                                        height: '18px',
                                                        cursor: 'pointer',
                                                        accentColor: '#003D7A',
                                                        flexShrink: 0
                                                    }}
                                                />
                                                <div style={{ 
                                                    display: 'flex', 
                                                    flexDirection: 'column', 
                                                    gap: '4px',
                                                    flex: 1
                                                }}>
                                                    <div style={{ fontSize: '14px', color: '#1F2937', fontWeight: '500' }}>
                                                        {item.title}
                                                    </div>
                                                    {item.subtitle && (
                                                        <div style={{ fontSize: '12px', color: '#6B7280' }}>
                                                            {item.subtitle}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {usersQuery.hasNextPage && (
                                        <div
                                            onClick={() => usersQuery.fetchNextPage()}
                                            style={{
                                                padding: '12px',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                color: '#003D7A',
                                                fontSize: '14px',
                                                borderTop: '1px solid #E5E7EB'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#F9FAFB';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'white';
                                            }}
                                        >
                                            {usersQuery.isFetchingNextPage ? 'Loading more...' : 'Load more'}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {/* Selected assignees chips */}
            {selectedAssignees.length > 0 && (
                <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '8px', 
                    marginTop: '12px' 
                }}>
                    {selectedAssignees.map((assignee) => (
                        <span
                            key={assignee.value._uniqueKey || assignee.id}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                backgroundColor: '#E5E7EB',
                                borderRadius: '16px',
                                fontSize: '14px',
                                color: '#374151',
                                height: '32px'
                            }}
                        >
                            {assignee.title}
                            <button
                                type="button"
                                onClick={() => handleAssigneeRemove(assignee)}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    padding: 0,
                                    color: '#6B7280',
                                    fontSize: '16px',
                                    lineHeight: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '18px',
                                    height: '18px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#374151';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = '#6B7280';
                                }}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}

