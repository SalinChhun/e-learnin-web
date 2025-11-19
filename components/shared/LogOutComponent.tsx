'use client'

import React from 'react';
import { Modal } from "react-bootstrap";
import { PopupTypeEnum, RowActionEnum } from "@/lib/enums/enums";
import { signOut } from "next-auth/react"

export interface ConfirmationPopupProps {
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
    selectedRows?: any;
    actionType?: RowActionEnum;
    type?: PopupTypeEnum,
}

const LogOutComponent: React.FC<ConfirmationPopupProps> = ({
    isOpen,
    handleClose,
    size = 'md',
    closeOnOutsideClick = false,
    width = 'wl-width-480',
    centered = true,
    id,

}) => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
    const modalSize = size === 'md' ? undefined : size;
    const handleLogout = () => {
            signOut({
                callbackUrl: `${basePath}/login`,
                redirect: true,
            })
    }

    return <Modal
        show={isOpen}
        onHide={closeOnOutsideClick ? handleClose : undefined}
        centered={centered}
        size={modalSize as any}
        dialogClassName={width}
        contentClassName={`wl-modal-content d-flex flex-column wl-width-360`}
        backdrop={closeOnOutsideClick ? true : 'static'}
        keyboard={true}
        id={id}
    >
        {/* Content */}
        <Modal.Body>
            <div className="wl-modal-header p-2 mb-3">
                <span className="wl-title-md">Log out </span>
            </div>
            <div className="wl-modal-body px-2 mb-3">
                <span className="wl-body-sm">
                Are you sure you want to log out?
                </span>
            </div>
            <div className="d-flex justify-content-end align-items-center gap-2 p-2">
                <button
                    data-bs-dismiss="modal"
                    type="button"
                    className="wl-btn-primary-text"
                    onClick={handleClose}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="wl-btn-primary"
                    data-bs-dismiss="modal"
                    onClick={handleLogout}
                >
                    {`Confirm`}
                </button>
            </div>
        </Modal.Body>
    </Modal>
}

export default LogOutComponent