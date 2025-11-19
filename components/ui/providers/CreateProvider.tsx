"use client"
import '@/styles/custom.css'
import {Modal, Spinner} from "react-bootstrap";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {createProviderSchema} from "@/validators/create-provider.schema";
import useProviderMutation from "@/lib/hook/use-provider-mutation";
import React from "react";
import {PatternFormat} from "react-number-format";
import {formatPhoneNumberForSave, formatPhoneNumberReplaceCountryCode} from "@/utils/utils";

interface Props {
    isOpen: boolean;
    handleClose: () => void;
}


export default function CreateProvider({isOpen, handleClose}: Props) {

    const createProviderMutation = useProviderMutation.useCreateProvider();

    // TODO: use form handler
    type CreatePartnerFormData = z.infer<typeof createProviderSchema>;
    const {
        register,
        watch,
        resetField,
        reset,
        handleSubmit,
        trigger,
        setValue,
        control,
        formState: {errors}
    } = useForm<CreatePartnerFormData>({
        resolver: zodResolver<any>(createProviderSchema),
        // mode: 'onBlur',
        defaultValues: {
            name: '',
            phone: '',
            email: '',
            description: '',
        }
    });

    const isValidRequiredField = watch('name');

    const onSubmit = async (data: any) => {

        const requestBody = {
            name: data.name,
            phone: formatPhoneNumberForSave(data.phone),
            email: data.email,
            description: data.description,
        }
        try {
            await createProviderMutation.mutateAsync(requestBody);
            reset();
        } catch (error) {
           console.log('error', error)
        }
    }


    return (
        <Modal contentClassName="wl-width-480 modal-content wl-modal-content d-flex flex-column" show={isOpen} centered={true}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="wl-page-header wl-border-bottom-none p-3">
                    <div className="wl-header-content">
                        <div className="wl-header-title-container">
                            <span className="wl-title-sm">Create Provider</span>
                        </div>
                    </div>
                </div>

                <div className="d-flex flex-column gap-4 p-3">
                    <div className="d-flex flex-column gap-3">
                        <div className="row">
                            <div className="col-12">
                                <div className="wl-input-container">
                                    <span className="wl-input-title wl-text-primary">Provider Name <span className="wl-input-required">*</span></span>
                                    <div className="wl-position-relative">
                                        <input
                                            type="text"
                                            className="w-100"
                                            placeholder="ABC Solutions Co., Ltd."
                                            {...register('name')}
                                        />
                                        <span onClick={() => setValue('name', '')}
                                              className="wl-clear-btn"></span>
                                    </div>
                                </div>
                            </div>
                            {errors?.name && (
                                <span className="text-danger">{errors?.name?.message}</span>
                            )}
                        </div>

                        <div className="row">
                            <div className="col-12">
                                <div className="wl-input-container">
                                    <span className="wl-input-title wl-text-primary">Email</span>
                                    <div className="wl-position-relative">
                                        <input
                                            type="email"
                                            className="w-100"
                                            placeholder="example@mail.com"
                                            {...register('email')}
                                        />
                                        <span onClick={() => setValue('email', '')} className="wl-clear-btn"></span>
                                    </div>
                                </div>
                            </div>
                            {errors?.email && (
                                <span className="text-danger">{errors?.email?.message}</span>
                            )}
                        </div>

                        <div className="row">
                            <div className="wl-input-container">
                                <span className="wl-input-title wl-text-primary">Mobile Number</span>
                                <div className="wl-group-element-wrapper">
                                    <div className="dropdown">
                                        <div
                                            data-bs-toggle="dropdown"
                                            className="wl-first-element wl-dropdown-toggle wl-toggle-outline"
                                        >
                                            +855
                                        </div>
                                        <div className="w-100 dropdown-menu wl-dropdown-menu">
                                            <div className="wl-dropdown-item wl-active">+855</div>
                                        </div>
                                    </div>
                                    <div className="w-100 wl-position-relative">
                                        <PatternFormat
                                            mask={""}
                                            className="w-100 wl-last-element"
                                            // name="phone"
                                            placeholder="00-000-0000"
                                            maxLength={50}
                                            type="text"
                                            value={formatPhoneNumberReplaceCountryCode(watch('phone'))}
                                            {...register('phone')}
                                            format="## ### ####"
                                            onValueChange={(values) => {
                                                setValue('phone', values.value);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            {errors?.phone && (
                                <span className="text-danger">{errors?.phone?.message}</span>
                            )}
                        </div>

                        <div className="row">
                            <div className="col-12">
                                <div className="wl-input-container">
                                    <span className="wl-input-title wl-text-primary">Description</span>
                                    <div className="wl-form-element d-flex flex-column gap-2">
                                  <textarea
                                      // rows="2"
                                      // name="message"
                                      className="wl-form-element"
                                      placeholder="Describe what this provider do"
                                      {...register('description')}
                                  ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-end align-items-center gap-2 p-3">
                    <button
                        onClick={handleClose}
                        type="button"
                        className="wl-btn-primary-text"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={createProviderMutation.isLoading || !isValidRequiredField}
                        type="submit"
                        className="wl-btn-primary wl-width-115"
                    >
                        {
                            createProviderMutation.isLoading ?
                                <Spinner animation="border" style={{width: 18, height: 18}} role="status">
                                </Spinner>
                                :
                                'Create Provider'
                        }
                    </button>
                </div>
            </form>
        </Modal>
    );
}
