import React, {useState} from 'react';
import {TogglePasswordVisibility} from "@/components/shared/TogglePasswordVisibility";

const PasswordInputComponent = ({
                                    register,          // From react-hook-form
                                    errors,            // Error object from react-hook-form
                                    name,              // Field name for form registration
                                }: any) => {

    const [showPassword, setShowPassword] = useState(false);


    return (
        <>
            <input
                type={showPassword ? "text" : "password"}
                className="w-100 wl-input"
                placeholder="Enter"
                {...register(name)}
            />
            <div onClick={() => setShowPassword(!showPassword)} className="wl-icon-container cursor-pointer">
                <TogglePasswordVisibility
                    showPassword={showPassword}
                    onToggle={() => setShowPassword(!showPassword)}
                />
            </div>
        </>
    );
};

export default PasswordInputComponent;