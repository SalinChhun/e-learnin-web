'use client'
import React from 'react';

export interface ToggleSwitchProps {
    id: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    id,
    checked,
    onChange,
    label,
    disabled = false
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.checked);
    };

    return (
        <div className="row">
            <div className="col-12">
                <div className="d-flex align-items-center gap-2">
                    <label className="wl-switch-container">
                        <input
                            type="checkbox"
                            role="switch"
                            id={id}
                            checked={checked}
                            onChange={handleChange}
                            disabled={disabled}
                        />
                        <div className="wl-switch-slider" />
                    </label>
                    <label htmlFor={id} className="wl-cursor-pointer">
                        {label}
                    </label>
                </div>
            </div>
        </div>
    );
};

export default ToggleSwitch;
