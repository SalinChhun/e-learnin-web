"use client"
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import { useState, useEffect, FormEvent, ChangeEvent } from "react";

interface Props {
    placeholder?: string
}

export default function SearchComponent({ placeholder }: Props) {
    const router = useRouter();
    const pathName = usePathname();
    const searchParams = useSearchParams();
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        const currentSearchValue = searchParams.get('search_value') || '';
        setSearchValue(currentSearchValue);
    }, [searchParams]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        params.set('page_number', '0');
        params.set('search_value', searchValue);

        router.push(`${pathName}?${params.toString()}`);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchValue(newValue);

        // If the input is cleared, update the URL immediately.
        if (newValue === '') {
            const params = new URLSearchParams(searchParams.toString());
            params.set('page_number', '0');
            params.delete('search_value');
            router.push(`${pathName}?${params.toString()}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="ks_focus ks_pos_rlt ks_mr10">
            <input
                style={{minHeight: '32px', maxHeight: '32px'}}
                className="wl-min-width-240 wl-text-ellipsis"
                type="search"
                placeholder={placeholder}
                value={searchValue}
                onChange={handleInputChange}
            />
        </form>
    )
}