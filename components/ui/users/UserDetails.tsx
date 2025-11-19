'use client'

import { PopupTypeEnum, RowActionEnum, StatusEnum } from "@/lib/enums/enums";
import { Action, RES_PERM_ACTION, Resource } from '@/lib/enums/permissionEnums';
import useRoleMutation from '@/lib/hook/use-role-mutation';
import usePermissions from "@/lib/hook/usePermissions";
import { usePopupStore } from "@/lib/store";
import Image from "next/image";
import React from 'react';
import { Modal } from "react-bootstrap";

export interface ConfirmationPopupProps {
    isOpen: boolean;
    handleClose: () => void;
    selectedRowData: any;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closeOnOutsideClick?: boolean;
    buttonPosition?: 'top' | 'bottom' | 'none';
    width?: string;
    centered?: boolean;
    id?: string;
    buttonText?: string;
    buttonClassName?: string;
}

const UserDetails: React.FC<ConfirmationPopupProps> = ({
                                                                 isOpen,
                                                                 handleClose,
                                                                 selectedRowData,
                                                                 size = 'md',
                                                                 closeOnOutsideClick = true,
                                                                 width = 'wl-width-480',
                                                                 centered = true,
                                                                 id,
                                                             }) => {


    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const modalSize = size === 'md' ? undefined : size;
    const {openPopup,openNestedPopup} = usePopupStore();
    const roleQuery = useRoleMutation.useFetchRoles();
    const { hasAnyPermission } = usePermissions();
    
    const handleChangePassword = (row:any) => {
        openNestedPopup(PopupTypeEnum.RESET_PASSOWRD, { selectedRow: row });
    }

    const handleUpdate = () => {
        openPopup(PopupTypeEnum.UPDATE_USER, { selectedRow: selectedRowData ,handleChangePassword:handleChangePassword});
    }
    
    const handleInactiveUser = () => {
        openPopup(PopupTypeEnum.INACTIVATE_USER, { title: 'Deactivate User',   description: `Are you sure want to deactivate <strong>${selectedRowData?.full_name}</strong>?` , selectedRows: [selectedRowData], actionType: RowActionEnum.USER });
    }

    const handleActiveUser = () => {
        openPopup(PopupTypeEnum.REACTIVATE_USER, { title: 'Reactivate User', description: `Are you sure want to Reactivate <b>${selectedRowData?.full_name}</b>? They will no longer be able to log in until reactivated. `, selectedRows: [selectedRowData], actionType: RowActionEnum.USER });
    }

    return (
        <>
            <Modal
                show={isOpen}
                onHide={closeOnOutsideClick ? handleClose : undefined}
                centered={centered}
                size={modalSize as any}
                dialogClassName={width}
                contentClassName={`wl-modal-content d-flex flex-column wl-width-480`}
                backdrop={closeOnOutsideClick ? true : 'static'}
                keyboard={true}
                id={id}
            >
                {/* Content */}
                <Modal.Body>
                    <div className="wl-page-header wl-border-bottom-none p-3">
                        <div className="wl-header-content">
                            <div className="wl-header-title-container">
                                <span className="wl-title-sm">{selectedRowData?.full_name || ''}</span>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex flex-column gap-4 p-3">
                        <div
                            className="d-flex flex-column gap-4 justify-content-center align-items-center"
                        >
                            <div className="wl-avatar-wrapper">
                                <figure>
                                    {
                                        selectedRowData?.image ?
                                            <Image
                                                style={{objectFit: 'cover'}}
                                                width={120}
                                                height={120}
                                                src={selectedRowData?.image}
                                                alt="User Profile"
                                            />
                                            :
                                        <span className="wl-figure-placeholder"></span>
                                    }
                                </figure>
                            </div>
                        </div>

                        <div className="wl-list">
                            <ul className="wl-list-information">
                                <li>
                                    <div className="wl-width-130 d-flex">
                                        <label
                                            className="wl-boy-sm wl-width-130 wl-text-tertiary text-nowrap"
                                        >Full Name</label
                                        >
                                    </div>
                                    <div className="w-100 d-flex dlex-grow-1">
                                        <label className="text-start">{selectedRowData?.full_name || ''}</label>
                                    </div>
                                </li>
                                <li>
                                    <div className="wl-width-130 d-flex">
                                        <label
                                            className="wl-boy-sm wl-width-130 wl-text-tertiary text-nowrap"
                                        >Department</label
                                        >
                                    </div>
                                    <div className="w-100 d-flex dlex-grow-1">
                                        <label className="text-start">{selectedRowData?.department || ''}</label>
                                    </div>
                                </li>
                                <li>
                                    <div className="wl-width-130 d-flex">
                                        <label
                                            className="wl-boy-sm wl-width-130 wl-text-tertiary text-nowrap"
                                        >Email Address</label
                                        >
                                    </div>
                                    <div className="w-100 d-flex dlex-grow-1">
                                        <label className="text-start">{selectedRowData?.email || ''}</label>
                                    </div>
                                </li>
                                <li>
                                    <div className="wl-width-130 d-flex">
                                        <label
                                            className="wl-boy-sm wl-width-130 wl-text-tertiary text-nowrap"
                                        >Username</label
                                        >
                                    </div>
                                    <div className="w-100 d-flex dlex-grow-1">
                                        <label className="text-start">{selectedRowData?.username || ''}</label>
                                    </div>
                                </li>
                                <li>
                                    <div className="wl-width-130 d-flex">
                                        <label
                                            className="wl-boy-sm wl-width-130 wl-text-tertiary text-nowrap"
                                        >Role</label
                                        >
                                    </div>
                                    <div className="w-100 d-flex dlex-grow-1">
                                        <label className="text-start">{selectedRowData?.role || ''}</label>
                                    </div>
                                </li>
                                <li>
                                    <div className="wl-width-130 d-flex">
                                        <label
                                            className="wl-boy-sm wl-width-130 wl-text-tertiary text-nowrap"
                                        >Status</label
                                        >
                                    </div>
                                    <div className="w-100 d-flex dlex-grow-1">
                                        <span
                                            className={selectedRowData?.status == 'Active' ? `d-inline-flex wl-badge-guide wl-badge-guide-paid` : `d-inline-flex wl-badge-guide wl-badge-guide-partially`}
                                        >{selectedRowData?.status || ''}</span
                                        >
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {hasAnyPermission([RES_PERM_ACTION.USER_UPDATE]) && (
                    <div className="d-flex justify-content-end align-items-center gap-2 p-3">
                        { selectedRowData?.status === StatusEnum.INACTIVE ?
                            <button    type="button"    className="wl-btn-primary-outline"    onClick={handleActiveUser}>  Reactive </button>
                            :
                            <button type="button" className="wl-btn-danger-outline" onClick={handleInactiveUser} >  Deactive </button>
                        }

                        <button
                            type="button"
                            className="wl-btn-primary-outline wl-btn-action wl-icon-pen"
                            onClick={handleUpdate}
                        >
                            Edit
                        </button>
                        </div>)}
                </Modal.Body>
            </Modal>
        </>
    );
};

export default UserDetails;
