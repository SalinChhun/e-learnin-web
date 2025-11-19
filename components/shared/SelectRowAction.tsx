import {
  IconEnum,
  PopupTypeEnum,
  RowActionEnum,
  StatusEnum,
} from "@/lib/enums/enums";
import { usePopupStore } from "@/lib/store";
import useApiManagementMutation from "@/lib/hook/use-api-management";
import { IconComponent } from "./IconComponent";

interface SelectRowActionProps {
  selectedRows: any;
  actionType?: RowActionEnum;
  onSelectedRowsChange?: (rows: any[]) => void;
  onEdit?: (row: any) => void;
}

export default function SelectRowAction({
  selectedRows,
  actionType,
  onSelectedRowsChange,
  onEdit,
}: SelectRowActionProps) {
  const { openPopup, openNestedPopup, popupStack } = usePopupStore();
  const updateApiManagementStatus =
    useApiManagementMutation.useUpdateApiManagementStatus();

  const displayText =
    selectedRows && selectedRows.length > 0
      ? selectedRows?.map((row: any) => row?.full_name).join(", ")
      : "";
  const clientDisplayText =
    selectedRows && selectedRows.length > 0
      ? selectedRows?.map((row: any) => row?.name).join(", ")
      : "";
  const selectedRowData =
    selectedRows && selectedRows.length > 0 ? selectedRows[0] : null;
  const selectedRowsData =
    selectedRows && selectedRows.length > 0 ? selectedRows : null;
  const isInactiveActiveStatus = selectedRowsData
    ? selectedRowsData.every((row: any) => row.status === StatusEnum.INACTIVE)
    : false;
  const isActiveActiveStatus = selectedRowsData
    ? selectedRowsData.every((row: any) => row.status === StatusEnum.ACTIVE)
    : false;
  const isEnabledStatus = selectedRowsData
    ? selectedRowsData.every((row: any) => 
        row.status === StatusEnum.ENABLED || row.status === "1"
      )
    : false;
  const isDisabledStatus = selectedRowsData
    ? selectedRowsData.every((row: any) => 
        row.status === StatusEnum.DISABLED || row.status === "2"
      )
    : false;
  const apiPermissionDisplayText = selectedRowsData
    ? selectedRowsData
        .map((row: any) => `• ${row.partner_name} - ${row.api_endpoint_path}`)
        .join("\n")
    : "";

  const createSuccessCallback = () => {
    return () => {
      if (onSelectedRowsChange) {
        onSelectedRowsChange([]);
      }
    };
  };

  const handleUpdateAction = () => {
    if (!selectedRowData) return;

    // Custom edit handler override when provided
    if (onEdit) {
      onEdit(selectedRowData);
      return;
    }

    switch (actionType) {
      case RowActionEnum.USER:
        handleUpdateUser();
        break;
      case RowActionEnum.PARTNER:
        handleUpdatePartner();
        break;
      case RowActionEnum.API_PERMISSION:
        handleUpdateApiPermission();
        break;
      case RowActionEnum.API_MANAGEMENT:
        handleUpdateApiPermission();
        break;
      case RowActionEnum.AUTH_CONFIG:
        handleUpdateAuthConfig();
        break;
      default:
        break;
    }
  };

  const handleActiveStatusAction = () => {
    if (!selectedRowsData) return;
    switch (actionType) {
      case RowActionEnum.USER:
        handleActiveUser();
        break;
      case RowActionEnum.PARTNER:
        handleActivePartner();
        break;
      case RowActionEnum.API_MANAGEMENT:
        handleEnabledApiPermission();
        break;
      case RowActionEnum.AUTH_CONFIG:
        handleActiveAuthConfig();
        break;
      default:
        break;
    }
  };

  const handleInactiveUserAction = () => {
    if (!selectedRowsData) return;

    switch (actionType) {
      case RowActionEnum.USER:
        handleInactiveUser();
        break;
      case RowActionEnum.PARTNER:
        handleInactivePartner();
        break;
      case RowActionEnum.API_MANAGEMENT:
        handleDisableApiPermission();
        break;
      case RowActionEnum.AUTH_CONFIG:
        handleInactiveAuthConfig();
        break;
      default:
        break;
    }
  };

  const handleDeleteAction = () => {
    if (!selectedRowData) return;

    switch (actionType) {
      case RowActionEnum.USER:
        handleDeleteUser();
        break;
      case RowActionEnum.PARTNER:
        handleDeletePartner();
        break;
      case RowActionEnum.API_PERMISSION:
        handleDeleteApiPermission();
        break;
      case RowActionEnum.API_MANAGEMENT:
        handleDeleteApiPermission();
        break;
      case RowActionEnum.AUTH_CONFIG:
        handleDeleteAuthConfig();
        break;
      default:
        break;
    }
  };

  const handleChangePassword = (row: any) => {
    openNestedPopup(PopupTypeEnum.RESET_PASSOWRD, { selectedRow: row });
  };

  //TODO: Handle users actions
  const handleUpdateUser = () => {
    openPopup(PopupTypeEnum.UPDATE_USER, {
      selectedRow: selectedRowData,
      handleChangePassword: handleChangePassword,
    });
  };

  const handleInactiveUser = () => {
    openPopup(PopupTypeEnum.INACTIVATE_USER, {
      title: "Deactivate User",
      description: `Are you sure want to deactivate <b>${displayText}</b>? `,
      selectedRows: selectedRowsData,
      actionType: RowActionEnum.USER,
      onSuccess: createSuccessCallback(),
    });
  };

  const handleActiveUser = () => {
    openPopup(PopupTypeEnum.REACTIVATE_USER, {
      title: "Reactivate User",
      description: `Are you sure want to Reactivate <b>${displayText}</b>? They will no longer be able to log in until reactivated. `,
      selectedRows: selectedRowsData,
      actionType: RowActionEnum.USER,
      onSuccess: createSuccessCallback(),
    });
  };

  const handleDeleteUser = () => {
    openPopup(PopupTypeEnum.DELETE_USER, {
      title: "Delete User",
      description: `Are you sure want to delete <b>${displayText}</b>? `,
      selectedRows: selectedRowsData,
      actionType: RowActionEnum.USER,
      onSuccess: createSuccessCallback(),
    });
  };

  //TODO: Handle providers actions
  const handleUpdatePartner = () => {
    openPopup(PopupTypeEnum.UPDATE_PARTNER, { selectedRow: selectedRowData });
  };

  const handleInactivePartner = () => {
    openPopup(PopupTypeEnum.INACTIVATE_PARTNER, {
      title: "Deactivate Provider",
      description: `Are you sure want to deactivate <b>${clientDisplayText}</b>?`,
      selectedRows: selectedRowsData,
      actionType: RowActionEnum.PARTNER,
      onSuccess: createSuccessCallback(),
    });
  };

  const handleActivePartner = () => {
    openPopup(PopupTypeEnum.REACTIVATE_PARTNER, {
      title: "Reactivate Provider",
      description: `Are you sure want to Reactivate <b>${clientDisplayText}</b>?`,
      selectedRows: selectedRowsData,
      actionType: RowActionEnum.PARTNER,
      onSuccess: createSuccessCallback(),
    });
  };

  const handleDeletePartner = () => {
    openPopup(PopupTypeEnum.DELETE_PARTNER, {
      title: "Delete Provider",
      description: `Are you sure want to Delete <b>${clientDisplayText}</b>?`,
      selectedRows: selectedRowsData,
      actionType: RowActionEnum.PARTNER,
      onSuccess: createSuccessCallback(),
    });
  };

  //TODO: Handle API permission actions
  const handleUpdateApiPermission = () => {
    openPopup(PopupTypeEnum.API_PERMISSION_EDIT, {
      selectedRow: selectedRowData,
    });
  };

  const handleDeleteApiPermission = () => {
    if (actionType === RowActionEnum.API_MANAGEMENT) {
      // For API Management, show confirmation and call delete API management
      const apiDisplayText = selectedRowsData
        ? selectedRowsData
            .map((row: any) => {
              const method = row?.method ? `${row.method} ` : "";
              const name = row?.api_name || row?.service_id || row?.auth_config_name || row?.provider_name || "-";
              const endpoint = row?.api_endpoint || row?.url_endpoint || row?.api_endpoint_path || "-";
              return `• ${method}${name} - ${endpoint}`;
            })
            .join("\n")
        : "";
      openPopup(PopupTypeEnum.API_PERMISSION_DELETE, {
        title: "Delete API",
        description: `Are you sure you want to delete <b>${apiDisplayText}</b>?`,
        selectedRows: selectedRowsData,
        actionType: RowActionEnum.API_MANAGEMENT,
        onSuccess: createSuccessCallback(),
      });
      return;
    }
    // For API Permission, use the existing logic
    openPopup(PopupTypeEnum.API_PERMISSION_DELETE, {
      title: "Delete API Permission",
      description: `Are you sure want to Delete <b>${apiPermissionDisplayText}</b>?`,
      selectedRows: selectedRowsData,
      actionType: RowActionEnum.API_PERMISSION,
      onSuccess: createSuccessCallback(),
    });
  };

  //TODO: Handle Auth Config actions
  const authConfigDisplayText = selectedRowsData
    ? selectedRowsData
        .map((row: any) => row.config_name)
        .join(", ")
    : "";

  const handleUpdateAuthConfig = () => {
    openPopup(PopupTypeEnum.AUTH_CONFIG_EDIT, { 
      configId: selectedRowData?.config_id 
    });
  };

  const handleInactiveAuthConfig = () => {
    openPopup(PopupTypeEnum.AUTH_CONFIG_DISABLE, {
      title: "Disable Auth Configuration",
      description: `Are you sure want to disable <b>${authConfigDisplayText}</b>?`,
      warning: "This action will also disable the related api management",
      selectedRows: selectedRowsData,
      actionType: RowActionEnum.AUTH_CONFIG,
      onSuccess: createSuccessCallback(),
    });
  };

  const handleActiveAuthConfig = () => {
    openPopup(PopupTypeEnum.AUTH_CONFIG_ENABLED, {
      title: "Enable Auth Configuration",
      description: `Are you sure want to enable <b>${authConfigDisplayText}</b>?`,
      selectedRows: selectedRowsData,
      actionType: RowActionEnum.AUTH_CONFIG,
      onSuccess: createSuccessCallback(),
    });
  };

  const handleDeleteAuthConfig = () => {
    openPopup(PopupTypeEnum.AUTH_CONFIG_DELETE, {
      title: "Delete Auth Configuration",
      description: `Are you sure want to delete <b>${authConfigDisplayText}</b>?`,
      warning: "This action will also delete the related api management",
      selectedRows: selectedRowsData,
      actionType: RowActionEnum.AUTH_CONFIG,
      onSuccess: createSuccessCallback(),
    });
  };

  const handleEnabledApiPermission = () => {
    if (actionType === RowActionEnum.AUTH_CONFIG) {
      handleActiveAuthConfig();
      return;
    }
    if (actionType === RowActionEnum.API_PERMISSION) {
      // For API Permission, use popup system to call correct API permission endpoint
      openPopup(PopupTypeEnum.API_PERMISSION_ENABLED, {
        title: "Enabled API Permission",
        description: `Are you sure want to Enabled <b>${apiPermissionDisplayText}</b>?`,
        selectedRows: selectedRowsData,
        actionType: RowActionEnum.API_PERMISSION,
        onSuccess: createSuccessCallback(),
      });
      return;
    }
    if (actionType === RowActionEnum.API_MANAGEMENT) {
      // For API Management, show confirmation and then enable
      const apiDisplayText = selectedRowsData
        ? selectedRowsData
            .map((row: any) => {
              const method = row?.method ? `${row.method} ` : "";
              const name =
                row?.api_name ||
                row?.service_id ||
                row?.auth_config_name ||
                row?.provider_name ||
                "-";
              const endpoint =
                row?.api_endpoint || row?.url_endpoint || row?.api_endpoint_path || "-";
              return `• ${method}${name} - ${endpoint}`;
            })
            .join("\n")
        : "";
      openPopup(PopupTypeEnum.API_PERMISSION_ENABLED, {
        title: "Enable API",
        description: `Are you sure you want to enable <b>${apiDisplayText}</b>?`,
        selectedRows: selectedRowsData,
        actionType: RowActionEnum.API_MANAGEMENT,
        onSuccess: createSuccessCallback(),
      });
      return;
    }
    // Fallback for other cases
    openPopup(PopupTypeEnum.API_PERMISSION_ENABLED, {
      title: "Enabled API Permission",
      description: `Are you sure want to Enabled <b>${apiPermissionDisplayText}</b>?`,
      selectedRows: selectedRowsData,
      actionType: RowActionEnum.API_PERMISSION,
      onSuccess: createSuccessCallback(),
    });
  };

  const handleDisableApiPermission = () => {
    if (actionType === RowActionEnum.AUTH_CONFIG) {
      handleInactiveAuthConfig();
      return;
    }
    if (actionType === RowActionEnum.API_PERMISSION) {
      // For API Permission, use popup system to call correct API permission endpoint
      openPopup(PopupTypeEnum.API_PERMISSION_DISABLE, {
        title: "Disable API Permission",
        description: `Are you sure want to Disable <b>${apiPermissionDisplayText}</b>?`,
        selectedRows: selectedRowsData,
        actionType: RowActionEnum.API_PERMISSION,
        onSuccess: createSuccessCallback(),
      });
      return;
    }
    if (actionType === RowActionEnum.API_MANAGEMENT) {
      // For API Management, show confirmation with warning about API permissions
      const apiDisplayText = selectedRowsData
        ? selectedRowsData
            .map((row: any) => {
              const method = row?.method ? `${row.method} ` : "";
              const name = row?.api_name || row?.service_id || row?.auth_config_name || row?.provider_name || "-";
              const endpoint = row?.api_endpoint || row?.url_endpoint || row?.api_endpoint_path || "-";
              return `• ${method}${name} - ${endpoint}`;
            })
            .join("\n")
        : "";
      openPopup(PopupTypeEnum.API_PERMISSION_DISABLE, {
        title: "Disable API",
        description: `Are you sure you want to disable <b>${apiDisplayText}</b>?`,
        selectedRows: selectedRowsData,
        actionType: RowActionEnum.API_MANAGEMENT,
        onSuccess: createSuccessCallback(),
      });
      return;
    }
    // Fallback for other cases
    openPopup(PopupTypeEnum.API_PERMISSION_DISABLE, {
      title: "Disable API Permission",
      description: `Are you sure want to Disable <b>${apiPermissionDisplayText}</b>?`,
      selectedRows: selectedRowsData,
      actionType: RowActionEnum.API_PERMISSION,
      onSuccess: createSuccessCallback(),
    });
  };

  return (
    selectedRows?.length > 0 && (
      <div className="ks_d_flex ks_alg_itm_ctr" style={{ gap: 10 }}>
        {selectedRows.length === 1 && (
          <button
            id="ks_btn_edit_id"
            type="button"
            className="ks_btn ks_d_flex ks_alg_itm_ctr ks_mr10"
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "6px 12px",
              backgroundColor: "#fff",
              color: "#333",
              cursor: "pointer",
              marginRight: "8px",
            }}
            onClick={handleUpdateAction}
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
              className="ks_mr5"
              style={{ marginRight: "5px" }}
            >
              <path fill="none" d="M0 0h24v24H0z"></path>
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
            </svg>
            Edit
          </button>
        )}
        {/* <button
                    type="button"
                    className="ks_btn ks_d_flex ks_alg_itm_ctr ks_mr10"
                    style={{
                        border: '1px solid #ccc',
                        borderRadius: '10px',
                        padding: '6px 12px',
                        backgroundColor: '#fff',
                        color: '#333',
                        cursor: 'pointer',
                        marginRight: '8px'
                    }}
                >
                    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M0.296875 8.31631C0.296875 5.07383 2.6582 2.37071 5.76855 1.81253V1.12891C5.76855 0.627174 6.2002 0.50174 6.56201 0.771424L8.66309 2.32054C8.93604 2.52124 8.93604 2.85364 8.66309 3.04806L6.56201 4.59718C6.2002 4.86059 5.76855 4.73515 5.76855 4.24596V3.5059C3.58496 4.03899 1.96631 5.98323 1.96631 8.31631C1.96631 9.55184 2.44238 10.6807 3.22314 11.5149C3.57861 11.9978 3.45801 12.4306 3.16602 12.6877C2.84229 12.9699 2.29639 13.0076 1.94092 12.5623C0.925293 11.4459 0.296875 9.95323 0.296875 8.31631ZM13.7031 8.31631C13.7031 11.5588 11.3418 14.2556 8.23145 14.8201V15.5037C8.23145 16.0054 7.7998 16.1309 7.43799 15.8612L5.33691 14.3121C5.06396 14.1114 5.06396 13.779 5.33691 13.5846L7.44434 12.0354C7.7998 11.772 8.23145 11.8912 8.23145 12.3867V13.1267C10.415 12.5936 12.0337 10.6431 12.0337 8.31631C12.0337 7.08078 11.5576 5.95187 10.7769 5.11146C10.4214 4.63481 10.5483 4.20206 10.834 3.94492C11.1577 3.66269 11.71 3.62506 12.0591 4.07035C13.0811 5.18672 13.7031 6.67939 13.7031 8.31631Z"
                            fill="#171717"
                            style={{marginRight: '5px'}}
                        />
                    </svg>

                    Change Role
                </button> */}

        {isInactiveActiveStatus && (
          <button
            type="button"
            className="ks_btn ks_d_flex ks_alg_itm_ctr ks_mr10"
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "6px 12px",
              backgroundColor: "#fff",
              color: "#333",
              cursor: "pointer",
              marginRight: "8px",
            }}
            onClick={handleActiveStatusAction}
          >
            <span className="wl-icon wl-icon-reactive"></span>
            Reactive
          </button>
        )}
        {isActiveActiveStatus && (
          <button
            type="button"
            className="ks_btn ks_d_flex ks_alg_itm_ctr"
            style={{
              border: "1px solid red",
              borderRadius: "10px",
              padding: "6px 12px",
              backgroundColor: "#fff",
              color: "#e53935",
              cursor: "pointer",
              marginRight: "8px",
            }}
            onClick={handleInactiveUserAction}
          >
            <IconComponent icon={IconEnum.DEACTIVE} />
            Deactivate
          </button>
        )}

        <button
          type="button"
          className="ks_btn ks_d_flex ks_alg_itm_ctr ks_mr10"
          style={{
            border: "1px solid red",
            borderRadius: "10px",
            padding: "6px 12px",
            backgroundColor: "#fff",
            color: "#e53935",
            marginRight: "8px",
            cursor: popupStack.length > 0 ? "not-allowed" : "pointer",
          }}
          disabled={popupStack.length > 0}
          onClick={handleDeleteAction}
        >
          <IconComponent icon={IconEnum.DEACTIVE} />
          Delete
        </button>

        {isDisabledStatus && (
          <button
            type="button"
            className="ks_btn ks_d_flex ks_alg_itm_ctr ks_mr10"
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "6px 12px",
              backgroundColor: "#fff",
              color: "#333",
              cursor: "pointer",
              marginRight: "8px",
            }}
            onClick={handleEnabledApiPermission}
          >
            <IconComponent icon={IconEnum.ENABLED} />
            Enabled
          </button>
        )}

        {isEnabledStatus && (
          <button
            type="button"
            className="ks_btn ks_d_flex ks_alg_itm_ctr ks_mr10"
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "6px 12px",
              backgroundColor: "#fff",
              color: "#333",
              cursor: "pointer",
              marginRight: "8px",
            }}
            onClick={handleDisableApiPermission}
          >
            <IconComponent icon={IconEnum.DISABLED} />
            Disable
          </button>
        )}
      </div>
    )
  );
}
