export interface ColumnDef<T> {
    accessor: keyof T;
    header: string;
    enableSorting?: boolean;
    enableHiding?: boolean;
}


export interface CustomColumnDef<T> {
    id?: string;
    accessor: string;
    accessorKey: string;
    header: string;
    enableSorting: boolean;
    enableHiding: boolean;
    className?: string;
    cell?: (info: { row: { original: T } }) => React.ReactNode;
}


export interface SortState {
    column: string | null;
    direction: 'asc' | 'desc' | null;
}
