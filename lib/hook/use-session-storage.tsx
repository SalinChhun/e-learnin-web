"use client"
import {useCallback, useEffect} from 'react'
import { useState } from 'react'
import {useSearchParams} from "next/navigation";

export type UseSessionStorageOptions = {
    /**
     * Function for converting to string.
     *
     * @default JSON.stringify
     */
    serialize: (value: unknown) => string

    /**
     * Function to convert stored string to object value.
     *
     * @default JSON.parse
     */
    deserialize: (value: string) => unknown
}

export const isBrowser: boolean = ((): boolean => typeof window !== 'undefined')();

/**
 * Modified `useState` hook that syncs with useSessionStorage.
 *
 * @param key
 * @param initialValue
 * @param options
 *
 * @see https://react-hooks-library.vercel.app/core/useSessionStorage
 */
export function useSessionStorage<T>(
    key: string,
    initialValue: T,
    options?: UseSessionStorageOptions
): [T, (value: T) => void] {

    const searchParams = useSearchParams()
    const [storedValue, setStoredValue] = useState(initialValue)
    const { deserialize = JSON.parse, serialize = JSON.stringify } = options || {}

    useEffect(() => {
        try {
            const item = localStorage.getItem(key)
            item && setStoredValue(deserialize(item))
        } catch (error) {
            console.error(error)
        }
    }, [deserialize, key, searchParams]);

    const setValue = useCallback(
        (value: T) => {
            try {
                setStoredValue(value)
                localStorage.setItem(key, serialize(value))
            } catch (error) {
                console.error(error)
            }
        },
        [key, serialize]
    )

    return [storedValue, setValue]
}