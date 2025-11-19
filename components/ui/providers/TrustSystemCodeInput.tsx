import React, {useState} from "react";
import useCopyToClipboard from "@/lib/hook/use-copy-to-clipboard";
import toastService from "@/utils/toastService";

const TrustSystemCodeInput = ({
                                  register,          // From react-hook-form
                                  errors,            // Error object from react-hook-form
                                  name,              // Field name for form registration
                                  setValue,          // From react-hook-form
                                  watch,             // From react-hook-form
                                  systemGenerated,   // Boolean value to check if the trust system code is system generated
                              }: any) => {

    const [useGeneratedPassword, setUseGeneratedPassword] = useState(systemGenerated || false);

    const generateSecureCode = (): string => {
        // Generate a secure random code similar to a client secret
        const characters = 'abcdef0123456789';
        const codeLength = 32; // 32 characters long
        let result = '';

        for (let i = 0; i < codeLength; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }

        return result;
    };

    const toggleGeneratedPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        setUseGeneratedPassword(isChecked);
        setValue('is_generated_trust_system_code', isChecked);

        if (isChecked) {
            const newCode = generateSecureCode();
            setValue('trust_system_code', newCode);
        } else {
            setValue('confirm_password', '');
            setValue('trust_system_code', '');
        }
    };

    const regenerateTrustSystemCode = () => {
        const newTrustSystemCode = generateSecureCode();
        setValue('trust_system_code', newTrustSystemCode);
        setValue('password', newTrustSystemCode);
    };

    const [_, copy] = useCopyToClipboard();
    const copyTrustSystemCode = () => {
        copy(watch('trust_system_code') || '');
        toastService.success('Trust system code copied');
    };

    return (
        <>
            <div className="row">
                <div className="col-12">
                    <div className="d-flex align-items-center">
                        <input
                            type="checkbox"
                            id="checkboxGeneratePasswordId"
                            {...register('is_generated_trust_system_code')}
                            checked={useGeneratedPassword}
                            onChange={toggleGeneratedPassword}
                        />
                        <label className="wl-button-md" htmlFor="checkboxGeneratePasswordId"
                        >Use system-generated trust system code</label
                        >
                    </div>
                </div>
            </div>

            {useGeneratedPassword ? (
                <div className="d-flex flex-column gap-2">
                    <div className="row">
                        <div className="col-12">
                            <div className="wl-input-container">
                                <div className="wl-position-relative">
                                    <input
                                        type="text"
                                        className="wl-icon-multiple w-100"
                                        readOnly
                                        {...register(name)}
                                    />
                                    <div
                                        className="wl-position-right-8 d-inline-flex align-items-center gap-2"
                                    >
                                        <span
                                            className="wl-tooltip-container"
                                            data-position="top"
                                            onClick={regenerateTrustSystemCode}
                                        >
                                            <span className="wl-icon wl-icon-change-gray"></span>
                                            <span className="wl-tooltip">Re-generate</span>
                                        </span>
                                        <span
                                            className="wl-tooltip-container"
                                            data-position="top"
                                            onClick={copyTrustSystemCode}
                                        >
                                            <span className="wl-icon wl-icon-copy-gray"></span>
                                            <span className="wl-tooltip">Copy</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="row">
                    <div className="col-12">
                        <div className="wl-input-container">
                            <span className="wl-input-title wl-text-primary">
                                Trust System Code
                                <span className="wl-input-required">*</span> 
                            </span>
                            <div className="wl-position-relative">
                                <input
                                    type="text"
                                    className="w-100"
                                    placeholder=""
                                    {...register(name)}
                                    maxLength={200}
                                />
                                <span onClick={() => setValue('trust_system_code', '')} className="wl-clear-btn"></span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
export default TrustSystemCodeInput;