export interface Pagination {
    last: boolean
    first: boolean
    size: number
    empty: boolean
    total_pages: number
    current_page: number
    current_total_elements: number
    total_elements: number
}

export interface BaseResponse<T> {
    data: T
}

export interface CommonCodeResponse{
    codes: CommonCode[]
}

export interface CommonCode{
    code: string
    value?: string
    name: string
}




export interface InfiniteScrollItem {
    id: number;
    title: string;
    subtitle?: string;
    value: any;
}

export interface InfiniteScrollProps {
    items: InfiniteScrollItem[];
    selectedItems?: InfiniteScrollItem[];
    onSelect: (item: InfiniteScrollItem) => void;
    onRemove?: (item: InfiniteScrollItem) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    title: string;
    isLoading?: boolean;
    hasNextPage?: boolean;
    fetchNextPage?: () => void;
    isFetchingNextPage?: boolean;
    searchValue: string;
    onSearchChange: (value: string) => void;
    multiple?: boolean;
    error?: string;
}