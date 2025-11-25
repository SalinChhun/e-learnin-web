"use client";

import { PopupTypeEnum } from "@/lib/enums/enums";
import { usePopupStore } from "@/lib/store";
import React, { lazy, Suspense } from "react";

// Import other popups as needed
const CreateUser = lazy(() => import("@/components/ui/users/CreateUser"));
const UpdateUser = lazy(() => import("@/components/ui/users/UpdateUser"));
const UserDetails = lazy(() => import("@/components/ui/users/UserDetails"));
const ConfirmationPopup = lazy(
  () => import("@/components/shared/ConfirmationPopup")
);
const LogOutComponent = lazy(
  () => import("@/components/shared/LogOutComponent")
);
const ResetPasswordModal = lazy(
  () => import("@/components/shared/ResetPasswordModal")
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
    case PopupTypeEnum.SUSPEND_USER:
      return <ConfirmationPopup {...props} />;
    case PopupTypeEnum.REACTIVATE_USER:
      return <ConfirmationPopup {...props} />;
    case PopupTypeEnum.UPDATE_USER:
      return <UpdateUser {...props} />;
    case PopupTypeEnum.RESET_PASSOWRD:
      return <ResetPasswordModal {...props} />;
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
    case PopupTypeEnum.LOG_OUT:
      return <LogOutComponent {...props} />;
    case PopupTypeEnum.API_PERMISSION_DELETE:
      return <ConfirmationPopup {...props} />;
    case PopupTypeEnum.API_PERMISSION_ENABLED:
      return <ConfirmationPopup {...props} />;
    case PopupTypeEnum.API_PERMISSION_DISABLE:
      return <ConfirmationPopup {...props} />;
    case PopupTypeEnum.AUTH_CONFIG_DELETE:
    case PopupTypeEnum.AUTH_CONFIG_STATUS:
    case PopupTypeEnum.AUTH_CONFIG_ENABLED:
    case PopupTypeEnum.AUTH_CONFIG_DISABLE:
      return <ConfirmationPopup {...props} />;
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
