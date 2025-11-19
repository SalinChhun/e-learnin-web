import {TogglePasswordVisibility} from "@/components/shared/TogglePasswordVisibility";
import PasswordInputComponent from "@/components/shared/PasswordInputComponent";
import {useState} from "react";
import useCopyToClipboard from "@/lib/hook/use-copy-to-clipboard";
import toastService from "@/utils/toastService";

const PasswordInput = ({
                           register,          // From react-hook-form
                           errors,            // Error object from react-hook-form
                           name,              // Field name for form registration
                           setValue,          // From react-hook-form
                           watch,             // From react-hook-form
                       }: any) => {

    const [useGeneratedPassword, setUseGeneratedPassword] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState("OBP!@#$%");
    const [showPassword, setShowPassword] = useState(false);

    const toggleGeneratedPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        setUseGeneratedPassword(isChecked);
        setValue('is_generated_password', isChecked);
        if (event.target.checked) {
            setValue('password', generatedPassword);
        } else {
            setValue('password', '');
            setValue('confirm_password', '');
        }
    };

    const regeneratePassword = () => {
        const newPassword = `OBP!@#$%${Math.floor(Math.random() * 1000)}`;
        setGeneratedPassword(newPassword);
        setValue('password', newPassword);
    };

    const [_, copy] = useCopyToClipboard();
    const copyPassword = () => {
        copy(watch('password') || '');
        toastService.success('Password copied to clipboard');
    };

    return (
        <>
            <div className="row">
                <div className="col-12">
                    <div className="d-flex align-items-center">
                        <input
                            type="checkbox"
                            id="checkboxGeneratePasswordId"
                            {...register('is_generated_password')}
                            checked={useGeneratedPassword}
                            onChange={toggleGeneratedPassword}
                        />
                        <label className="wl-button-md" htmlFor="checkboxGeneratePasswordId"
                        >Use system-generated password</label
                        >
                    </div>
                </div>
            </div>

            {/*TODO: Use system-generated password input*/}
            {useGeneratedPassword ? (
                <div className="d-flex flex-column gap-2">
                    <div className="row">
                        <div className="col-12">
                            <div className="wl-input-container">
                                <div className="wl-position-relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="wl-icon-multiple w-100"
                                        placeholder="Enter Password"
                                        value={generatedPassword}
                                        readOnly
                                        {...register(name)}
                                    />
                                    <div
                                        className="wl-position-right-8 d-inline-flex align-items-center gap-2"
                                    >
                                                  <span
                                                      className="wl-tooltip-container"
                                                      data-position="top"
                                                      onClick={regeneratePassword}
                                                  >
                                                <span className="wl-icon wl-icon-change-gray"></span>
                                                <span className="wl-tooltip">Re-generate</span>
                                                </span>
                                        <span
                                            className="wl-tooltip-container"
                                            data-position="top"
                                            onClick={copyPassword}
                                        >
                                                    <span className="wl-icon wl-icon-copy-gray"></span>
                                                    <span className="wl-tooltip">Copy</span>
                                                  </span>
                                        <span
                                            className="wl-tooltip-container"
                                            data-position="top"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                                    <TogglePasswordVisibility showPassword={showPassword}
                                                                              onToggle={() => setShowPassword(!showPassword)}/>
                                                     <span
                                                         className="wl-tooltip">{showPassword ? "Hide" : "Show"} password
                                                </span>
                                              </span>
                                    </div>
                                </div>
                                {errors?.password && (
                                    <span className="text-danger">{errors?.password?.message}</span>
                                )}
                                <span className="wl-caption wl-text-secondary"
                                >Secure password has been generated. Make sure to save
                                            somewhere safe.</span
                                >
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="d-flex flex-column gap-2">
                    <div className="row">
                        {/* Password Input */}
                        <div className="col-6 wl-padding-right-8">
                            <div className="wl-input-container">
                                            <span className="wl-input-title wl-text-primary">
                                              Password <span className="wl-input-required">*</span>
                                            </span>
                                <div className="wl-position-relative">
                                    <PasswordInputComponent
                                        register={register}
                                        errors={errors}
                                        name="password"
                                    />
                                </div>
                            </div>
                            {errors?.password &&!useGeneratedPassword && (
                                <span className="text-danger">{errors?.password?.message}</span>
                            )}
                        </div>

                        {/* Confirm Password Input */}
                        <div className="col-6 wl-padding-left-8">
                            <div className="wl-input-container">
                                            <span className="wl-input-title wl-text-primary">
                                              Confirm password <span className="wl-input-required">*</span>
                                            </span>
                                <div className="wl-position-relative">
                                    <PasswordInputComponent
                                        register={register}
                                        errors={errors}
                                        name="confirm_password"
                                    />
                                </div>
                            </div>
                            {errors?.confirm_password && !useGeneratedPassword && (
                                <span className="text-danger">{errors?.confirm_password?.message}</span>
                            )}
                        </div>
                    </div>
                    <span className="wl-caption wl-text-secondary">
                        Use a password of at least 15 characters or 8 characters with letters and numbers.
                    </span>
                </div>
            )}
        </>
    );
}
export default PasswordInput;