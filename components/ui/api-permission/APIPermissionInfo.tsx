'use client'

import { DateFormatEnum, PopupTypeEnum, RowActionEnum, StatusEnum } from "@/lib/enums/enums";
import { Action, Resource } from "@/lib/enums/permissionEnums";
import usePermissions from "@/lib/hook/usePermissions";
import { usePopupStore } from "@/lib/store";
import { extractBusinessType, formatPhoneNumber } from "@/utils/utils";
import React from 'react';
import { Modal, Tooltip } from "react-bootstrap";
import CopyText from "@/components/common/CopyText";
import CustomTooltip from "@/components/common/CustomTooltip";
import dayjs from 'dayjs';
import LabelStatus from "@/components/shared/LabelStatus";

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

const APIPermissionInfo: React.FC<ConfirmationPopupProps> = ({
    isOpen,
    handleClose,
    selectedRowData,
    size = 'xl',
    closeOnOutsideClick = true,
    width = 'wl-width-480',
    centered = true,
    id,
}) => {

    const modalSize = size === 'xl' ? undefined : size;
    const { openPopup } = usePopupStore();
    const { hasResourcePermission } = usePermissions();

    const handleUpdate = () => {
        openPopup(PopupTypeEnum.API_PERMISSION_EDIT, { selectedRow: selectedRowData });
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
                                <span className="wl-title-sm">{selectedRowData?.partner_name || ''}</span>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex flex-column gap-4 p-3">


                        <div className="wl-list">
                            <ul className="wl-list-information">
                                <li>
                                    <div className="wl-width-130 d-flex">
                                        <label
                                            className="wl-boy-sm wl-width-130 wl-text-tertiary text-nowrap"
                                        >Partner Code</label
                                        >
                                    </div>
                                    <div className="w-100 d-flex dlex-grow-1">
                                            {/* <label className="wl-text-ellipsis">{selectedRowData?.partner_code || ''}</label> */}
                                            <CopyText data={selectedRowData?.partner_code} message="Partner code" />
                                    </div>
                                </li>
                                <li>
                                    <div className="wl-width-130 d-flex">
                                        <label
                                            className="wl-boy-sm wl-width-130 wl-text-tertiary text-nowrap"
                                        >Partner Name</label
                                        >
                                    </div>
                                    <div className="w-100 d-flex dlex-grow-1">
                                        <label className="text-start">{selectedRowData?.partner_name || ''}</label>
                                    </div>
                                </li>
                                <li>
                                    <div className="wl-width-130 d-flex">
                                        <label
                                            className="wl-boy-sm wl-width-130 wl-text-tertiary text-nowrap"
                                        >API Category</label
                                        >
                                    </div>
                                    <div className="w-100 d-flex dlex-grow-1">
                                        <label className="text-start">{selectedRowData?.category_name || ''}</label>
                                    </div>
                                </li>
                                <li>
                                    <div className="wl-width-130 d-flex">
                                        <label
                                            className="wl-boy-sm wl-width-130 wl-text-tertiary text-nowrap"
                                        >API Name</label
                                        >
                                    </div>
                                    <div className="w-100 d-flex dlex-grow-1">
                                        <label className="text-start">{selectedRowData?.api_endpoint_name || ''}</label>
                                    </div>
                                </li>
                                <li>
                                    <div className="wl-width-130 d-flex">
                                        <label
                                            className="wl-boy-sm wl-width-130 wl-text-tertiary text-nowrap"
                                        >API URL</label
                                        >
                                    </div>
                                    <div className="w-100 d-flex dlex-grow-1">
                                        <CustomTooltip title={selectedRowData?.api_endpoint_path} placement="top">
                                            <label className="text-start">{selectedRowData?.api_endpoint_path || ''}</label>
                                        </CustomTooltip>
                                    </div>
                                </li>
                                <li>
                                    <div className="wl-width-130 d-flex">
                                        <label
                                            className="wl-boy-sm wl-width-130 wl-text-tertiary text-nowrap"
                                        >Latest Modify</label
                                        >
                                    </div>
                                    <div className="w-100 d-flex dlex-grow-1">
                                        <label className="text-start">{selectedRowData?.update_at && dayjs(selectedRowData?.update_at).format(DateFormatEnum.CUSTOM_DATE)}</label>
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
                                        <LabelStatus status={selectedRowData?.status} />
                                    </div>
                                </li>
                            
                            </ul>
                        </div>
                    </div>
                    {hasResourcePermission(Resource.PARTNER, Action.UPDATE) &&
                        <div className="d-flex justify-content-end align-items-center gap-2 p-3">
                            {/* {selectedRowData?.status === StatusEnum.INACTIVE ?
                                <button type="button" className="wl-btn-primary-outline" onClick={handleActivePartner}>  Reactive </button>
                                :
                                <button type="button" className="wl-btn-danger-outline" onClick={handleInactivePartner} >  Deactive </button>
                            } */}
                            <button
                                type="button"
                                className="wl-btn-primary-outline wl-btn-action wl-icon-pen"
                                onClick={handleUpdate}
                            >
                                Edit
                            </button>
                        </div>}
                </Modal.Body>
            </Modal>
        </>
    );
};

export default APIPermissionInfo;
