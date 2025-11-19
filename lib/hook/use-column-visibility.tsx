import { CustomColumnDef } from '@/lib/types/table';
import { getFromLocalStorage } from '@/utils/localStorage';
import { useState, useEffect } from 'react';

export const useColumnVisibility = <T extends Record<string, any>>(
    columns: CustomColumnDef<T>[],
    localStorageKey: string
) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [columnVisibility, setColumnVisibility] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        try {
            const initialVisibility = columns.reduce((acc, column) => {
                const columnId = column.id || column.accessorKey.toString();
                const saved = getFromLocalStorage<{ [key: string]: boolean }>(
                    localStorageKey,
                    { [columnId]: true }
                );
                return { ...acc, [columnId]: saved[columnId] ?? true };
            }, {} as { [key: string]: boolean });

            setColumnVisibility(initialVisibility);
        } catch (error) {
            console.error('Error loading column visibility from localStorage:', error);
            const defaultVisibility = columns.reduce((acc, column) => {
                const columnId = column.id || column.accessorKey.toString();
                return { ...acc, [columnId]: true };
            }, {});
            setColumnVisibility(defaultVisibility);
        } finally {
            setIsLoading(false);
        }
    }, [columns, localStorageKey]);

    return { isLoading, columnVisibility, setColumnVisibility };
};