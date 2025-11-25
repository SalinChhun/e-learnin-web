"use client"
import Button from '@/components/shared/Button';
import SelectComponent from "@/components/shared/SelectComponent";
import UploadImage from "@/components/shared/UploadImage";
import { RoleEnum, UserStatusEnum } from "@/lib/enums/enums";
import useRoleMutation from "@/lib/hook/use-role-mutation";
import useUserMutation from "@/lib/hook/use-user-mutation";
import fileService from "@/service/file-upload.service";
import '@/styles/custom.css';
import { getImageName } from "@/utils/getImageName";
import toast from "@/utils/toastService";
import { updateUserSchema } from "@/validators/create-user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Modal, Spinner } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { z } from "zod";


interface Props {
    isOpen: boolean;
    handleClose: () => void;
    handleChangePassword: (row:any) => void;
    selectedRow?: any;
    onSuccess?: () => void;
}


const UpdateUser: React.FC<Props> =({isOpen, handleClose, handleChangePassword, selectedRow, onSuccess}: Props) => {

    const updateUserMutation = useUserMutation.useUpdateUser();
    const {roleQuery} = useRoleMutation.useFetchRoles();
    const getDefaultRoleId = () => {
        if (selectedRow?.role) {
            return selectedRow.role.toLowerCase() === 'admin' ?
                roleQuery?.data?.find((r: any) => r.name?.toLowerCase() === RoleEnum.ADMIN.toLowerCase())?.id :
                roleQuery?.data?.find((r: any) => r.name?.toLowerCase() === RoleEnum.USER.toLowerCase())?.id;
        }

        // Default to USER role if no selected row or no role in selected row
        return roleQuery?.data?.find((r: any) => r.name?.toLowerCase() === RoleEnum.USER.toLowerCase())?.id || '4';
    };


    // TODO: use form handler
    type CreateUserFormData = z.infer<typeof updateUserSchema>;
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
    } = useForm<CreateUserFormData>({
        resolver: zodResolver<any>(updateUserSchema),
        // mode: 'onBlur',
        defaultValues: {
            full_name: selectedRow ? selectedRow?.full_name : '',
            department: selectedRow ? selectedRow?.department || '' : '',
            email: selectedRow ? selectedRow?.email : '',
            username: selectedRow ? selectedRow?.username : '',
            role: getDefaultRoleId(),
            status: selectedRow?.status?.toLowerCase() == ('active') ? UserStatusEnum.ACTIVE : UserStatusEnum.INACTIVE,
            image: '',
            image_removed: false,
        }
    });

    const onSubmit = async (data: any) => {

        let image = getImageName(selectedRow?.image!);

        //TODO: Check if image is removed
        if (data.image_removed && data.image_removed === true) {
            image = '';
        }

        //TODO: Upload image
        if (data.image && data.image.length > 0) {
            try {
                const fileResponse = await fileService.uploadImage(data.image[0]);
                console.log('fileResponse', fileResponse);
                image = fileResponse.data.data.image_url;
            } catch (error) {
                toast.error('Upload image failed');
                return;
            }
        }

        const requestBody = {
            user_id: selectedRow?.id,
            full_name: data.full_name,
            email: data.email,
            role_id: data.role,
            username: data.username,
            department: data.department,
            status: data.status,
            image: image,
        }
        try {
            await updateUserMutation.mutateAsync(requestBody);
            if (onSuccess) {
                onSuccess();
            }
            reset();
        } catch (e) {
            // ignore, toast handled in hook
        }
    }


    return (
        <Modal contentClassName="wl-width-480 modal-content wl-modal-content d-flex flex-column" show={isOpen}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="wl-page-header wl-border-bottom-none p-3">
                    <div className="wl-header-content">
                        <div className="wl-header-title-container">
                            <span className="wl-title-sm">Update User</span>
                        </div>
                    </div>
                </div>

                <div className="d-flex flex-column gap-4 p-3">
                    {/*TODO: Upload Image*/}
                    <UploadImage
                        imageUrl={selectedRow?.image}
                        register={register}
                        errors={errors}
                        name="image"
                        setValue={setValue}
                    />

                    <div className="d-flex flex-column gap-3">
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="wl-input-container">
                                    <span className="wl-input-title wl-text-primary"
                                    >Full Name <span className="wl-input-required">*</span></span
                                    >
                                    <div className="wl-position-relative">
                                        <input
                                            type="text"
                                            className="w-100"
                                            placeholder="Enter Full Name"
                                            {...register('full_name')}
                                        />
                                        <span onClick={()=>setValue('full_name', '')} className="wl-clear-btn"></span>
                                    </div>
                                </div>
                            </div>
                            {errors?.full_name && (
                                <span className="text-danger">{errors?.full_name?.message}</span>
                            )}
                        </div>

                        <div className="row">
                            <div className="col-12">
                                <div className="wl-input-container">
                                    <span className="wl-input-title wl-text-primary">
                                        Department
                                    </span>
                                    <div className="wl-position-relative">
                                        <input
                                            type="text"
                                            className="w-100"
                                            placeholder="Sales, Operation, etc."
                                            {...register('department')}
                                        />
                                        <span onClick={()=>setValue('department', '')} className="wl-clear-btn"></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12">
                                <div className="wl-input-container">
                        <span className="wl-input-title wl-text-primary">
                            Email Address
                            <span className="wl-input-required">*</span></span>
                                    <div className="wl-position-relative">
                                        <input
                                            type="email"
                                            className="w-100"
                                            placeholder="example@mail.com"
                                            {...register('email')}
                                        />
                                        <span onClick={()=>setValue('email', '')} className="wl-clear-btn"></span>
                                    </div>
                                </div>
                            </div>
                            {errors?.email && (
                                <span className="text-danger">{errors?.email?.message}</span>
                            )}
                        </div>

                        {/*/!*TODO: Username Input*!/*/}
                        <div className="wl-input-container">
                            <span className="wl-input-title wl-text-primary">
                                Username
                                <span className="wl-input-required">*</span></span>
                            <div className="wl-position-relative">
                                <input
                                    type="text"
                                    className={` w-100`}
                                    value={watch('username')}
                                    disabled={true}
                                />
                            </div>
                        </div>

                        <Button className="wl-btn-primary-outline wl-btn-action wl-icon-pen  wl-width-160" text='Change Password' action={()=> {handleChangePassword(selectedRow)}} />

                        {/*TODO: Role selection*/}
                        <div className="row">
                            <div className="col-12">
                                <div className="wl-input-container">
                                    <span className="wl-input-title wl-text-primary">
                                        Role <span className="wl-input-required">*</span>
                                    </span>
                                    <SelectComponent
                                        control={control}
                                        register={register}
                                        errors={errors}
                                        name="role"
                                        options={roleQuery?.data?.map((item: any) => ({
                                            value: item?.id,
                                            label: item?.name
                                        })) || []}
                                    />
                                </div>
                            </div>
                        </div>

                        {/*TODO: Status selection*/}
                        <div className="row">
                            <div className="col-12">
                                <div className="wl-input-container">
                                    <span className="wl-input-title wl-text-primary">
                                        Status <span className="wl-input-required">*</span>
                                    </span>
                                    <SelectComponent
                                        control={control}
                                        register={register}
                                        errors={errors}
                                        name="status"
                                        options={[
                                            { value: '1', label: 'Active' },
                                            { value: '2', label: 'Inactive' },
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-end align-items-center gap-2 p-3">
                    <button
                        data-bs-dismiss="modal"
                        type="button"
                        className="wl-btn-primary-text"
                        onClick={handleClose}
                    >
                        Cancel
                    </button>
                    <button
                        disabled={updateUserMutation.isLoading}
                        type="submit"
                        style={{backgroundColor: '#003D7A', color: '#FFFFFF'}}
                    >
                        {
                            updateUserMutation.isLoading ?
                                <Spinner animation="border" style={{width: 18, height: 18}} role="status">
                                </Spinner>
                                :
                                'Update User'
                        }
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default UpdateUser;
