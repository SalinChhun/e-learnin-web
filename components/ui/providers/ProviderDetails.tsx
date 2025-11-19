'use client'

import {DateFormatEnum, PopupTypeEnum, RowActionEnum, StatusEnum} from "@/lib/enums/enums";
import {Action, RES_PERM_ACTION, Resource} from "@/lib/enums/permissionEnums";
import usePermissions from "@/lib/hook/usePermissions";
import {usePopupStore} from "@/lib/store";
import {formatPhoneNumber} from "@/utils/utils";
import React from 'react';
import {Modal} from "react-bootstrap";
import CustomTooltip from "@/components/common/CustomTooltip";
import dayjs from "dayjs";

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

const ProviderDetails: React.FC<ConfirmationPopupProps> = ({
                                                                 isOpen,
                                                                 handleClose,
                                                                 selectedRowData,
                                                                 size = 'md',
                                                                 closeOnOutsideClick = true,
                                                                 width = 'wl-width-480',
                                                                 centered = true,
                                                                 id,
                                                             }) => {

    const modalSize = size === 'md' ? undefined : size;
    const {openPopup} = usePopupStore();
    const { hasAnyPermission } = usePermissions();

    const handleUpdate = () => {
        openPopup(PopupTypeEnum.UPDATE_PARTNER, { selectedRow: selectedRowData });
    }
    const handleInactivePartner = () => {
        openPopup(PopupTypeEnum.INACTIVATE_PARTNER, { title: 'Deactivate Provider',   description: `Are you sure want to deactivate <strong>${selectedRowData?.name}</strong>?` , selectedRows: [selectedRowData], actionType: RowActionEnum.PARTNER });
    }

    const handleActivePartner = () => {
        openPopup(PopupTypeEnum.REACTIVATE_PARTNER, { title: 'Reactivate Provider', description: `Are you sure want to reactivate <b>${selectedRowData?.name}</b>?`, selectedRows: [selectedRowData], actionType: RowActionEnum.PARTNER });
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
                                <span className="wl-title-sm">{selectedRowData?.name || ''}</span>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex flex-column gap-4 p-3">


                        <div className="wl-list">
                            <ul className="wl-list-information">
                                <li>
                                    <div className="wl-width-130 d-flex">
                                        <label className="wl-boy-sm wl-width-130 wl-text-tertiary text-nowrap">Provider
                                            Name</label>
                                    </div>
                                    <div className="w-100 d-flex dlex-grow-1">
                                        <CustomTooltip title={selectedRowData?.name} placement="top">
                                            <label className="wl-text-ellipsis">{selectedRowData?.name || ''}</label>
                                        </CustomTooltip>
                                    </div>
                                </li>
                                <li>
                                    <div className="wl-width-130 d-flex">
                                        <label
                                            className="wl-boy-sm wl-width-130 wl-text-tertiary text-nowrap">Email</label
                                        >
                                    </div>
                                    <div className="w-100 d-flex dlex-grow-1">
                                        <label className="text-start">{selectedRowData?.email || ''}</label>
                                    </div>
                                </li>
                                <li>
                                    <div className="wl-width-130 d-flex">
                                        <label className="wl-boy-sm wl-width-130 wl-text-tertiary text-nowrap">Mobile
                                            Number</label>
                                    </div>
                                    <div className="w-100 d-flex dlex-grow-1">
                                        <label
                                            className="text-start">{formatPhoneNumber(selectedRowData?.phone, '855')}</label>
                                    </div>
                                </li>
                                <li>
                                    <div className="wl-width-130 d-flex">
                                        <label
                                            className="wl-boy-sm wl-width-130 wl-text-tertiary text-nowrap">Description</label>
                                    </div>
                                    <div className="w-100 d-flex dlex-grow-1">
                                        <label
                                            className="text-start">{selectedRowData?.description || ''}</label>
                                    </div>
                                </li>
                                <li>
                                    <div className="wl-width-130 d-flex">
                                        <label className="wl-boy-sm wl-width-130 wl-text-tertiary text-nowrap">Created
                                            Date</label>
                                    </div>
                                    <div className="w-100 d-flex dlex-grow-1">
                                        <label className="text-start">{dayjs(selectedRowData?.created_at).format(DateFormatEnum.CUSTOM_DATE) || ''}</label>
                                    </div>
                                </li>
                                <li>
                                    <div className="wl-width-130 d-flex">
                                        <label className="wl-boy-sm wl-width-130 wl-text-tertiary text-nowrap">Updated
                                            Date</label>
                                    </div>
                                    <div className="w-100 d-flex dlex-grow-1">
                                        <label className="text-start">{dayjs(selectedRowData?.updated_at).format(DateFormatEnum.CUSTOM_DATE) || ''}</label>
                                    </div>
                                </li>
                                <li>
                                    <div className="wl-width-130 d-flex">
                                        <label className="wl-boy-sm wl-width-130 wl-text-tertiary text-nowrap">Status</label>
                                    </div>
                                    <div className="w-100 d-flex dlex-grow-1">
                                        <span className={selectedRowData?.status == 'Active' ? `d-inline-flex wl-badge-guide wl-badge-guide-paid` : `d-inline-flex wl-badge-guide wl-badge-guide-partially`}>{selectedRowData?.status || ''}</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                    {hasAnyPermission([RES_PERM_ACTION.PROVIDER_UPDATE]) && (
                        <div className="d-flex justify-content-end align-items-center gap-2 p-3">
                            {selectedRowData?.status === StatusEnum.INACTIVE ?
                                <button type="button" className="wl-btn-primary-outline"
                                        onClick={handleActivePartner}> Reactive </button>
                                :
                                <button type="button" className="wl-btn-danger-outline"
                                        onClick={handleInactivePartner}> Deactive </button>
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

export default ProviderDetails;
