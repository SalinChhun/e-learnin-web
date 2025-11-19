"use client";

import { PopupTypeEnum } from "@/lib/enums/enums";
import { usePopupStore } from "@/lib/store";
import React, { lazy, Suspense } from "react";

// Import other popups as needed
const CreateUser = lazy(() => import("@/components/ui/users/CreateUser"));
const UpdateUser = lazy(() => import("@/components/ui/users/UpdateUser"));
const UpdateClient = lazy(() => import("@/components/ui/providers/UpdateProvider"));
const UserDetails = lazy(() => import("@/components/ui/users/UserDetails"));
const ClientDetails = lazy(
  () => import("@/components/ui/providers/ProviderDetails")
);
const CreateProvider = lazy(() => import("@/components/ui/providers/CreateProvider"));
const ConfirmationPopup = lazy(
  () => import("@/components/shared/ConfirmationPopup")
);
const LogOutComponent = lazy(
  () => import("@/components/shared/LogOutComponent")
);
const ResetPasswordModal = lazy(
  () => import("@/components/shared/ResetPasswordModal")
);
const APIPermissionInfo = lazy(
  () => import("@/components/ui/api-permission/APIPermissionInfo")
);
const AssignAPIPermission = lazy(
  () => import("@/components/ui/api-permission/AssignAPIPermission")
);
const UpdateAPIPermission = lazy(
  () => import("@/components/ui/api-permission/UpdateAPIPermission")
);
// Auth Config popups
const CreateAuthConfig = lazy(
  () => import("@/components/ui/auth-config/CreateAuthConfig")
);
const UpdateAuthConfig = lazy(
  () => import("@/components/ui/auth-config/UpdateAuthConfig")
);
const AuthConfigDetails = lazy(
  () => import("@/components/ui/auth-config/AuthConfigDetails")
);
const CourseDetails = lazy(
  () => import("@/components/ui/courses/CourseDetails")
);

// Loading fallback for when a popup is being loaded
const PopupLoadingFallback = () => (
  <div className="modal fade show" style={{ display: "block" }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-body text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Component to render the correct popup
const PopupRenderer = ({
  type,
  props,
}: {
  type: PopupTypeEnum;
  props: any;
}) => {
  switch (type) {
    case PopupTypeEnum.CREATE_USER:
      return <CreateUser {...props} />;
    case PopupTypeEnum.CREATE_PARTNER:
      return <CreateProvider {...props} />;
    case PopupTypeEnum.SUSPEND_USER:
      return <ConfirmationPopup {...props} />;
    case PopupTypeEnum.REACTIVATE_USER:
      return <ConfirmationPopup {...props} />;
    case PopupTypeEnum.UPDATE_USER:
      return <UpdateUser {...props} />;
    case PopupTypeEnum.RESET_PASSOWRD:
      return <ResetPasswordModal {...props} />;
    case PopupTypeEnum.UPDATE_PARTNER:
      return <UpdateClient {...props} />;
    case PopupTypeEnum.DELETE_USER:
      return <ConfirmationPopup {...props} />;
    case PopupTypeEnum.DELETE_PARTNER:
      return <ConfirmationPopup {...props} />;
    case PopupTypeEnum.INACTIVATE_USER:
      return <ConfirmationPopup {...props} />;
    case PopupTypeEnum.INACTIVATE_PARTNER:
      return <ConfirmationPopup {...props} />;
    case PopupTypeEnum.REACTIVATE_PARTNER:
      return <ConfirmationPopup {...props} />;
    case PopupTypeEnum.USER_DETAILS:
      return <UserDetails {...props} />;
    case PopupTypeEnum.PARTNER_DETAILS:
      return <ClientDetails {...props} />;
    case PopupTypeEnum.LOG_OUT:
      return <LogOutComponent {...props} />;
    case PopupTypeEnum.API_PERMISSION_INFO:
      return <APIPermissionInfo {...props} />;
    case PopupTypeEnum.API_PERMISSION_ASSIGN:
      return <AssignAPIPermission {...props} />;
    case PopupTypeEnum.API_PERMISSION_EDIT:
      return <UpdateAPIPermission {...props} />;
    case PopupTypeEnum.API_PERMISSION_DELETE:
      return <ConfirmationPopup {...props} />;
    case PopupTypeEnum.API_PERMISSION_ENABLED:
      return <ConfirmationPopup {...props} />;
    case PopupTypeEnum.API_PERMISSION_DISABLE:
      return <ConfirmationPopup {...props} />;
    // AUTH CONFIG
    case PopupTypeEnum.AUTH_CONFIG_CREATE:
      return <CreateAuthConfig {...props} />;
    case PopupTypeEnum.AUTH_CONFIG_EDIT:
      return <UpdateAuthConfig {...props} />;
    case PopupTypeEnum.AUTH_CONFIG_INFO:
      return <AuthConfigDetails {...props} />;
    case PopupTypeEnum.AUTH_CONFIG_DELETE:
    case PopupTypeEnum.AUTH_CONFIG_STATUS:
    case PopupTypeEnum.AUTH_CONFIG_ENABLED:
    case PopupTypeEnum.AUTH_CONFIG_DISABLE:
      return <ConfirmationPopup {...props} />;
    // COURSE
    case PopupTypeEnum.COURSE_DETAILS:
      return <CourseDetails {...props} />;
    case PopupTypeEnum.NONE:
    default:
      return null;
  }
};

// Main popup manager component
const PopupManager: React.FC = () => {
  const { popupStack, closePopup, closeAllPopups } = usePopupStore();

  if (popupStack.length === 0) {
    return null;
  }

  return (
    <>
      {popupStack.map((popup, index) => {
        const isTopPopup = index === popupStack.length - 1;

        const commonProps = {
          isOpen: true,
          onClose: isTopPopup ? closePopup : () => {},
          handleClose: isTopPopup ? closePopup : () => {},
          type: popup.type,
          openNestedPopup: usePopupStore.getState().openNestedPopup,
          ...popup.props,
        };
        const zIndexBase = 1050;
        const zIndexOffset = index * 10;

        const key = `popup-${index}-${popup.type}`;

        return (
          <Suspense key={key} fallback={<PopupLoadingFallback />}>
            <div className="modal-backdrop fade show" />
            <div
              style={{
                position: "relative",
                zIndex: zIndexBase + zIndexOffset + 1,
              }}
            >
              <Suspense fallback={<PopupLoadingFallback />}>
                <PopupRenderer type={popup.type} props={commonProps} />
              </Suspense>
            </div>
          </Suspense>
        );
      })}
    </>
  );
};

export default PopupManager;
