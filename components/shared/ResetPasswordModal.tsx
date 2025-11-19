"use client"

import PasswordInput from "@/components/ui/users/PasswordInput";
import useUserMutation from "@/lib/hook/use-user-mutation";
import { zodResolver } from "@hookform/resolvers/zod";
import {Modal, Spinner} from "react-bootstrap";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { TogglePasswordVisibility } from "./TogglePasswordVisibility";
import '@/styles/custom.css';

export interface ResetPasswordPopupProps {
    isOpen: boolean;
    handleClose: () => void;
    title: string;
    description: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closeOnOutsideClick?: boolean;
    buttonPosition?: 'top' | 'bottom' | 'none';
    width?: string;
    centered?: boolean;
    id?: string;
    buttonText?: string;
    buttonClassName?: string;
    selectedRow?: any;
    isResetPassword ?: boolean
}

type AllPasswordFormFields = {
    is_generated_password: boolean;
    password: string;
    confirm_password?: string;
    current_password?: string;
  };

export default function ResetPasswordPopupProps({ isOpen,
    handleClose,
    closeOnOutsideClick = true,
    id,
    selectedRow,
    isResetPassword = false
}: ResetPasswordPopupProps) {

  const resetPasswordUserMutation = useUserMutation.useResetUserPassword();

  const createPasswordSchema = () => {
    const baseSchema = {
        is_generated_password: z.boolean(),
        password: z.string().nonempty("Password is required").refine(
            (value) => {
                if (value.length >= 15) return true;
                if (value.length >= 8) {
                    const hasLetters = /[a-zA-Z]/.test(value);
                    const hasNumbers = /\d/.test(value);
                    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

                    if (value.startsWith("OBP!@#$%")) return true;

                    return hasLetters && hasNumbers && hasSpecialChars;
                }

                return false;
            },
            {
                message: "Password must be at least 8 characters with letters, numbers, and special characters",
            }
        ),
        confirm_password: z.string().optional(),
    };

    if (isResetPassword) {
        return z.object({
            ...baseSchema,
            current_password: z.string().nonempty("Current password is required"),
        }).refine(
            (data) => {
                if (!data.is_generated_password) {
                    return !!data.confirm_password && data.confirm_password === data.password;
                }
                return true;
            },
            {
                message: "Passwords do not match",
                path: ["confirm_password"],
            }
        );
    } else {
        return z.object(baseSchema).refine(
            (data) => {
                if (!data.is_generated_password) {
                    return !!data.confirm_password && data.confirm_password === data.password;
                }
                return true;
            },
            {
                message: "Passwords do not match",
                path: ["confirm_password"],
            }
        );
    }
};

const passwordSchema = createPasswordSchema();
type PasswordFormData = z.infer<typeof passwordSchema>;

    const {
        register,
        watch,
        resetField,
        reset,
        handleSubmit,
        trigger,
        setValue,
        control,
        formState: { errors, isSubmitSuccessful, isSubmitted }
    } = useForm<AllPasswordFormFields>({
        resolver: zodResolver<any>(passwordSchema),
        mode: 'onSubmit',
        reValidateMode: 'onChange',
        defaultValues: {
            current_password: '',
            password: '',
            confirm_password: '',
            is_generated_password: false,
        }
    });
    
const onSubmit = async (data: any) => {

        const reqBody: {
            new_password: string;
            is_generated_password: boolean;
            current_password?: string; // Make this optional with the ? operator
        } = {
            new_password: data.password,
            is_generated_password: data.is_generated_password
        };
    

        // Add current_password if in reset mode
        if (isResetPassword && 'current_password' in data) {
            reqBody.current_password = data.current_password;
        }

        resetPasswordUserMutation.mutation({userId:selectedRow?.id , requestBody: reqBody})
        reset();
    }


    return (
        <Modal
            show={isOpen}
            onHide={closeOnOutsideClick ? handleClose : undefined}
            centered={true}
            contentClassName={`wl-modal-content d-flex flex-column wl-width-480`}
            backdrop={closeOnOutsideClick ? true : 'static'}
            keyboard={true}
            id={id}
        >
            {/* Content */}
            <Modal.Body>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="wl-page-header wl-border-bottom-none p-3">
                        <div className="wl-header-content">
                            <div className="wl-header-title-container">
                                <span className="wl-title-sm">Change Passowrd</span>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex flex-column gap-4 p-3">

                        <div className="d-flex flex-column gap-3">
                        {isResetPassword  && 
                        <div className="row">
                                <div className="wl-position-relative">
                                    <input className="w-100"
                                        type={true ? "text" : "password"}
                                        id="passwordInput" required  {...register('current_password')} />
                                    <div
                                        className="wl-icon-container cursor-pointer">
                                        <TogglePasswordVisibility showPassword={true}
                                            onToggle={() => {}} />
                                    </div>
                                </div>
                        </div>}

                            {/*TODO: Password input*/}
                            <PasswordInput register={register} errors={errors} name="password" setValue={setValue} watch={watch} />
                        </div>
                    </div>

                    <div className="d-flex justify-content-end align-items-center gap-2 p-3">
                        <button data-bs-dismiss="modal" type="button" className="wl-btn-primary-text" onClick={handleClose} > Cancel </button>
                        <button
                            disabled={resetPasswordUserMutation.isLoading}
                            type="submit"
                            className="wl-btn-primary wl-width-75"
                        >
                            {
                                resetPasswordUserMutation.isLoading ?
                                    <Spinner animation="border" style={{width: 18, height: 18}} role="status">
                                    </Spinner>
                                    :
                                    'Update'
                            }
                        </button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    );
}
