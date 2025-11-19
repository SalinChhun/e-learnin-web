import React from 'react';
import '@/styles/custom.css'
import {Controller} from "react-hook-form";

const SelectComponent = ({
                             control,           // From react-hook-form
                             register,          // From react-hook-form
                             errors,            // Error object from react-hook-form
                             defaultValue,      // Default status value
                             name,              // Field name for form registration
                             options = [],      // Options data for the select
                             disabled = false,  // Whether the select is disabled
                         }: any) => {
    return (
        <>
            <div
                className="w-100 wl-toggle-outline select-container"
            >
                <Controller
                    name={name}
                    control={control}
                    defaultValue={defaultValue}
                    render={({ field }) => (
                        <>
                            <select
                                {...field}
                                {...register(name)}
                                className="w-100"
                                disabled={disabled}
                                style={{
                                    boxShadow: 'none',
                                    WebkitAppearance: 'none',
                                    MozAppearance: 'none'
                                }}
                            >
                                {options.map((option: any) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}
                />
            </div>
            {errors?.name && (
                <span className="text-danger">{errors?.name?.message}</span>
            )}
        </>
    );
};

export default SelectComponent;