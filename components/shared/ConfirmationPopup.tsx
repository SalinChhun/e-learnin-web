"use client";

import React from "react";
import {Modal} from "react-bootstrap";
import {PopupTypeEnum, RowActionEnum} from "@/lib/enums/enums";
import useUserMutation from "@/lib/hook/use-user-mutation";
import useProviderMutation from "@/lib/hook/use-provider-mutation";
import useApiPermissionMutation from "@/lib/hook/use-api-permission";
import useAuthConfigMutation from "@/lib/hook/use-auth-config";
import useApiManagementMutation from "@/lib/hook/use-api-management";

export interface ConfirmationPopupProps {
  isOpen: boolean;
  handleClose: () => void;
  title: string;
  description: string;
  warning?: string;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnOutsideClick?: boolean;
  buttonPosition?: "top" | "bottom" | "none";
  width?: string;
  centered?: boolean;
  id?: string;
  buttonText?: string;
  buttonClassName?: string;
  selectedRows?: any;
  actionType?: RowActionEnum;
  type?: PopupTypeEnum;
  onSuccess?: () => void;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  isOpen,
  handleClose,
  title,
  description,
  warning,
  size = "md",
  closeOnOutsideClick = true,
  width = "wl-width-480",
  centered = true,
  id,
  selectedRows,
  actionType,
  type,
  onSuccess,
}) => {
  const modalSize = size === "md" ? undefined : size;

  const deleteUserMutation = useUserMutation.useDeleteUser();
  const deletePartnerMutation = useProviderMutation.useDeleteProviders();

  const updateUserInactive = useUserMutation.useUpdateStatusUserInactive();
  const updateUserActive = useUserMutation.useUpdateStatusUserActive();

  const updateClientInactive =
    useProviderMutation.useUpdateStatusProviderInactive();
  const updateClientActive = useProviderMutation.useUpdateStatusProviderActive();

  const deleteApiPermissionMutation =
    useApiPermissionMutation.useDeleteApiPermission();
  const updateApiPermissionStatusMutation =
    useApiPermissionMutation.useUpdateApiPermissionStatus();

  const deleteAuthConfigMutation = useAuthConfigMutation.useDeleteAuthConfig();
  const updateAuthConfigStatusMutation = useAuthConfigMutation.useUpdateAuthConfigStatus();

  // API Management mutations
  const deleteApiManagementMutation = useApiManagementMutation.useDeleteApiManagement();
  const updateApiManagementStatusMutation = useApiManagementMutation.useUpdateApiManagementStatus();

  //TODO: handle users actions

  const ids = selectedRows?.map((row: any) => row.id) || [];
  const configIds = selectedRows?.map((row: any) => row.config_id) || [];

  // Track loading states
  const isLoading =
    deleteUserMutation.isPending ||
    deletePartnerMutation.isPending ||
    updateUserInactive.isPending ||
    updateUserActive.isPending ||
    updateClientInactive.isPending ||
    updateClientActive.isPending ||
    deleteApiPermissionMutation.isPending ||
    updateApiPermissionStatusMutation.isPending ||
    deleteAuthConfigMutation.isPending ||
    updateAuthConfigStatusMutation.isPending ||
    deleteApiManagementMutation.isPending ||
    updateApiManagementStatusMutation.isPending;

  const handleSubmit = () => {
    const options = {
      onSuccess: () => {
        if (onSuccess) {
          onSuccess();
        }
        handleClose();
      },
    };

    switch (type) {
      case PopupTypeEnum.INACTIVATE_USER:
        updateUserInactive.mutation(ids, options);
        break;
      case PopupTypeEnum.REACTIVATE_USER:
        updateUserActive.mutation(ids, options);
        break;
      case PopupTypeEnum.INACTIVATE_PARTNER:
        updateClientInactive.mutation(ids, options);
        break;
      case PopupTypeEnum.REACTIVATE_PARTNER:
        updateClientActive.mutation(ids, options);
        break;
      case PopupTypeEnum.DELETE_USER:
        deleteUserMutation.mutation(ids, options);
        break;
      case PopupTypeEnum.DELETE_PARTNER:
        deletePartnerMutation.mutation(ids, options);
        break;
      case PopupTypeEnum.API_PERMISSION_DELETE:
        if (actionType === RowActionEnum.API_MANAGEMENT) {
          // Delete API Management(s)
          deleteApiManagementMutation.mutation(configIds, options);
        } else {
          // Delete API Permission(s)
          deleteApiPermissionMutation.mutation(ids, options);
        }
        break;
      case PopupTypeEnum.API_PERMISSION_ENABLED:
        if (actionType === RowActionEnum.API_MANAGEMENT) {
          updateApiManagementStatusMutation.mutation({ config_ids: configIds, is_enable: true }, options);
        } else {
          updateApiPermissionStatusMutation.mutation({ api_permission_ids: ids, status: "1" as any }, options);
        }
        break;
      case PopupTypeEnum.API_PERMISSION_DISABLE:
        if (actionType === RowActionEnum.API_MANAGEMENT) {
          updateApiManagementStatusMutation.mutation({ config_ids: configIds, is_enable: false }, options);
        } else {
          updateApiPermissionStatusMutation.mutation({ api_permission_ids: ids, status: "2" as any }, options);
        }
        break;
      case PopupTypeEnum.AUTH_CONFIG_DELETE:
        deleteAuthConfigMutation.mutation(configIds, options);
        break;
      case PopupTypeEnum.AUTH_CONFIG_ENABLED:
        updateAuthConfigStatusMutation.mutation({ config_ids: configIds, is_enable: true }, options);
        break;
      case PopupTypeEnum.AUTH_CONFIG_DISABLE:
        updateAuthConfigStatusMutation.mutation({ config_ids: configIds, is_enable: false }, options);
        break;
      case PopupTypeEnum.LOG_OUT:
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Modal
        show={isOpen}
        onHide={closeOnOutsideClick && !isLoading ? handleClose : undefined}
        centered={centered}
        size={modalSize as any}
        dialogClassName={width}
        contentClassName={`wl-modal-content d-flex flex-column wl-width-360`}
        backdrop={closeOnOutsideClick && !isLoading ? true : "static"}
        keyboard={!isLoading}
        id={id}
      >
        {/* Content */}
        <Modal.Body>
          <div className="wl-modal-header p-2 mb-3">
            <span className="wl-title-md">{title}</span>
          </div>
          <div className="wl-modal-body px-2 mb-3">
            <span
              className="wl-body-sm"
              dangerouslySetInnerHTML={{ __html: description }}
            ></span>
            {warning && (
              <div className="alert alert-warning mt-3 mb-0" role="alert">
                <strong>Warning:</strong> {warning}
              </div>
            )}
          </div>
          <div className="d-flex justify-content-end align-items-center gap-2 p-2">
            <button
              data-bs-dismiss="modal"
              type="button"
              style={{color: '#003D7A'}}
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              style={{backgroundColor: '#003D7A', color: '#FFFFFF'}}
              data-bs-dismiss="modal"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {title}
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ConfirmationPopup;
