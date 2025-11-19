import { CustomColumnDef } from '@/lib/types/table';
import React, { useState, useEffect, useRef } from 'react';
import { IconComponent } from '../shared/IconComponent';
import { IconEnum } from '@/lib/enums/enums';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';

// Types
export interface ActionMenuItem {
    label: string;
    icon: string;
    action: (row: any) => void;
    modalTarget?: string;
    hideWhen?: (row: any) => boolean;
}

interface DataTableProps<T> {
    data: T[];
    columns: CustomColumnDef<T>[];
    isLoading?: boolean;
    actionItems?: ActionMenuItem[];
    enableSelection?: boolean;
    onRowSelect?: (selectedRows: T[]) => void;
    onSelectAll?: (selected: boolean) => void;
    onRowClick?: (row: T) => void;
    selectedRowIds?: string[]; // Allow parent to control selection
}

const DataTable = <T extends { id: string }>({
    data,
    columns,
    isLoading = false,
    actionItems = [],
    enableSelection = false,
    onRowSelect,
    onSelectAll,
    onRowClick,
    selectedRowIds = [],
}: DataTableProps<T>) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tableRef = useRef<HTMLTableElement>(null);

    // Get sort parameters from URL (format: sort_columns=columnName%3Adirection)
    const sortParam = searchParams.get('sort_columns') || '';
    let sortColumn = '';
    let sortDirection: 'asc' | 'desc' = 'desc';

    if (sortParam) {
        const sortParts = decodeURIComponent(sortParam).split(':');
        if (sortParts.length === 2) {
            sortColumn = sortParts[0];
            sortDirection = sortParts[1] as 'asc' | 'desc';
        }
    }

    // Track the currently open dropdown
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    // Selected rows state - sync with parent if selectedRowIds prop is provided
    const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
    const isControlled = selectedRowIds !== undefined;
    
    // Sync internal state with parent's selectedRowIds prop
    useEffect(() => {
        if (isControlled) {
            const newSelectedRows: Record<string, boolean> = {};
            if (selectedRowIds && selectedRowIds.length > 0) {
                selectedRowIds.forEach(id => {
                    if (id) {
                        newSelectedRows[id] = true;
                    }
                });
            }
            setSelectedRows(newSelectedRows);
        }
    }, [selectedRowIds.join(','), isControlled]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openDropdownId && tableRef.current && !tableRef.current.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openDropdownId]);

    // Handle sort
    const handleSort = (column: string) => {
        const params = new URLSearchParams(searchParams.toString());

        let direction: 'asc' | 'desc';

        if (sortColumn === column) {
            // Toggle direction if same column
            direction = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            // Default to desc for new column
            direction = 'desc';
        }

        // Create the sort_columns parameter in format: columnName:direction
        const sortValue = `${column}:${direction}`;

        // Update URL parameter
        params.set('sort_columns', sortValue);

        // Remove old sort parameters if they exist
        params.delete('sort');
        params.delete('direction');

        // Push to URL - this will trigger API refetch with your service
        router.push(`?${params.toString()}`, { scroll: false });
    };

    // Handle dropdown toggle
    const handleDropdownToggle = (rowId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenDropdownId(prev => prev === rowId ? null : rowId);
    };

    // Handle row selection
    const handleRowSelect = (id: string, selected: boolean) => {
        if (!enableSelection) return;

        const newSelectedRows = { ...selectedRows, [id]: selected };
        setSelectedRows(newSelectedRows);

        if (onRowSelect) {
            const selectedItems = data.filter(item => newSelectedRows[item.id]);
            onRowSelect(selectedItems);
        }
    };

    // Handle select all
    const handleSelectAll = () => {
        if (!enableSelection) return;

        const allSelected = Object.keys(selectedRows).length === data.length &&
            Object.values(selectedRows).every(Boolean);

        const newSelectedRows: Record<string, boolean> = {};

        if (!allSelected) {
            data.forEach(item => {
                newSelectedRows[item.id] = true;
            });
        }

        setSelectedRows(newSelectedRows);

        if (onSelectAll) {
            onSelectAll(!allSelected);
        }
    };

    // Check if all rows are selected
    const areAllRowsSelected = () => {
        return data.length > 0 &&
            Object.keys(selectedRows).length === data.length &&
            Object.values(selectedRows).every(Boolean);
    };

    // Check if indeterminate (some rows selected, but not all)
    const isIndeterminate = () => {
        const selectedCount = Object.values(selectedRows).filter(Boolean).length;
        return selectedCount > 0 && selectedCount < data.length;
    };

    // Render sort icon
    const renderSortIcon = (column: string) => {
        if (sortColumn !== column) {
            return null;
        }

        return sortDirection === 'asc'
            ? <IconComponent icon={IconEnum.SORT_ASC} />
            : <IconComponent icon={IconEnum.SORT_DESC} />;
    };

    // Reset selected rows when data changes (only if not controlled by parent)
    useEffect(() => {
        if (!isControlled) {
            setSelectedRows({});
        }
    }, [data, isControlled]);

    //TODO: Calculate dropdown position
    const calculateDropdownPosition = (rowId: string) => {
        const button = document.querySelector(`[data-row-id="${rowId}"] .wl-table-button-wrapper button`);
        if (!button) return { top: 0, left: 0 };

        const rect = button.getBoundingClientRect();
        const dropdownHeight = 200; // Estimate or adjust based on your dropdown height
        const spaceBelow = window.innerHeight - rect.bottom; // Space available below the button
        const openUpwards = spaceBelow < dropdownHeight; // Flip if not enough space below

        const top = openUpwards
            ? rect.top + window.scrollY - dropdownHeight // Position above the button
            : rect.bottom + window.scrollY; // Position below the button
        const left = rect.right - 255; // Align right edge with button (match wl-width-255rem)

        return {
            top: Math.max(top, 0), // Prevent going off the top of the screen
            left: Math.max(left, 0), // Prevent going off the left of the screen
        };
    };

    return (
        <div className="h-100 d-flex flex-column overflow-hidden">
            <div className="wl-table-container">
                <table className="wl-responsive-table" ref={tableRef}>
                    {
                        data.length !== 0 && (
                            <thead>
                                <tr>
                                    {enableSelection && (
                                        <th className="wl-col-checkbox">
                                            <label className="d-flex justify-content-center align-items-center">
                                                <input
                                                    id="WLCheckAllId"
                                                    type="checkbox"
                                                    checked={areAllRowsSelected()}
                                                    ref={el => {
                                                        if (el) {
                                                            el.indeterminate = isIndeterminate();
                                                        }
                                                    }}
                                                    onChange={handleSelectAll}
                                                />
                                            </label>
                                        </th>
                                    )}
                                    {columns.map((column) => (
                                        <th
                                            key={column.accessorKey}
                                            className={column.className || `wl-col-${column.accessorKey.toLowerCase()}`}
                                        >
                                            {column.enableSorting ? (
                                                <button
                                                    style={{ color: 'var(--Forgrounds-FG-DISABLED-VALUE)' }}
                                                    className="d-flex align-items-center gap-1 ps-0"
                                                    onClick={() => handleSort(column.accessorKey)}
                                                >
                                                    {column.header}
                                                    {renderSortIcon(column.accessorKey)}
                                                </button>
                                            ) : (
                                                column.header
                                            )}
                                        </th>
                                    ))}
                                    {actionItems.length > 0 && <th className="wl-col-more-action"></th>}
                                </tr>
                            </thead>
                        )
                    }

                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length + (actionItems.length > 0 ? 1 : 0) + (enableSelection ? 1 : 0)} className="text-center">
                                    <div className="d-flex justify-content-center align-items-center p-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                {/*<td colSpan={columns.length + (actionItems.length > 0 ? 1 : 0) + (enableSelection ? 1 : 0)}*/}
                                {/*    className="text-center p-4">*/}
                                {/*    No results found*/}
                                {/*</td>*/}
                                <td className="h-100 d-flex flex-column justify-content-center align-items-center text-center" style={{alignItems: 'center'}}>
                                    <div className="d-flex flex-column justify-content-center align-items-center gap-3">
                                        <figure>
                                            <Image width={88} height={64} src="/icon/common/user-empty-state.svg"
                                                   alt="Icon image"/>
                                        </figure>
                                        <div className="d-flex flex-column wl-gap-2">
                                            <span className="wl-body-sm">No user created.</span>
                                            <label className="wl-caption opacity-50">Please click 'Create' at the top
                                                right to add one.</label>
                                        </div>
                                    </div>
                                </td>

                            </tr>
                        ) : (
                            data.map((row, index) => (
                                <tr
                                    key={index}
                                    data-row-id={row.id}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    style={onRowClick ? {cursor: 'pointer'} : {}}
                                >
                                    {enableSelection && (
                                        <td>
                                            <label className="d-flex justify-content-center align-items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`WLCheckboxRow${index + 1}Id`}
                                                    checked={!!selectedRows[row.id]}
                                                    onChange={(e) => {
                                                        e.stopPropagation(); // Prevent row click when checking
                                                        handleRowSelect(row.id, e.target.checked);
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </label>
                                        </td>
                                    )}
                                    {columns.map((column) => (
                                        <td
                                            key={column.accessorKey}
                                            className={column.className || `wl-col-${column.accessorKey.toLowerCase()}`}
                                        >
                                            {column.cell ? (
                                                column.cell({ row: { original: row } })
                                            ) : (
                                                (row as any)[column.accessorKey]
                                            )}
                                        </td>
                                    ))}
                                    {actionItems.length > 0 && (
                                        <td className="wl-overflow-visible">
                                            <div className="dropdown wl-table-button-wrapper">
                                                <button
                                                    type="button"
                                                    className="wl-btn-primary-outline wl-btn-sm wl-position-relative"
                                                    onClick={(e) => handleDropdownToggle(row.id, e)}
                                                    aria-expanded={openDropdownId === row.id}
                                                >
                                                    <span className="wl-icon wl-icon-more"></span>
                                                </button>
                                                {openDropdownId === row.id && (
                                                    <div className="dropdown-menu dropdown-menu-end wl-dropdown-menu wl-width-255rem show"
                                                         style={{
                                                             position: 'fixed',
                                                             ...calculateDropdownPosition(row.id),
                                                             zIndex: 1000,
                                                         }}
                                                    >
                                                        {actionItems
                                                            .filter(item => !item.hideWhen || !item.hideWhen(row))
                                                            .map((item, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="wl-dropdown-item"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setOpenDropdownId(null);
                                                                        item.action(row);
                                                                    }}
                                                                >
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        <span className={`wl-icon ${item.icon}`}></span>
                                                                        {item.label}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;