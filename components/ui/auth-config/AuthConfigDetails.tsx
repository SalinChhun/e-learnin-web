"use client";

import { AuthConfigDetail } from "@/lib/types/auth-config";
import { usePopupStore } from "@/lib/store";
import { PopupTypeEnum } from "@/lib/enums/enums";
import { Action, Resource } from "@/lib/enums/permissionEnums";
import usePermissions from "@/lib/hook/usePermissions";

interface AuthConfigDetailsProps {
  selectedRowData: AuthConfigDetail;
}

const AuthConfigDetails = ({ selectedRowData }: AuthConfigDetailsProps) => {
  const { openPopup } = usePopupStore();
  const { hasResourcePermission } = usePermissions();

  const handleEdit = () => {
    openPopup(PopupTypeEnum.AUTH_CONFIG_EDIT, {
      selectedRowData,
    });
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex justify-content-between align-items-center">
        <h5 className="wl-heading-sm mb-0">Auth Config Details</h5>
        {hasResourcePermission(Resource.PARTNER, Action.UPDATE) && (
          <button
            type="button"
            onClick={handleEdit}
            className="wl-btn-secondary wl-btn-sm"
          >
            Edit
          </button>
        )}
      </div>

      <div className="row">
        <div className="col-6">
          <div className="d-flex flex-column gap-2">
            <label className="wl-label-sm text-muted">Config Name</label>
            <span className="wl-body-sm">{selectedRowData?.config_name}</span>
          </div>
        </div>
        <div className="col-6">
          <div className="d-flex flex-column gap-2">
            <label className="wl-label-sm text-muted">Provider Name</label>
            <span className="wl-body-sm">{selectedRowData?.provider_name}</span>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-6">
          <div className="d-flex flex-column gap-2">
            <label className="wl-label-sm text-muted">Provider ID</label>
            <span className="wl-body-sm">{selectedRowData?.provider_id}</span>
          </div>
        </div>
        <div className="col-6">
          <div className="d-flex flex-column gap-2">
            <label className="wl-label-sm text-muted">Base URL</label>
            <span className="wl-body-sm">{selectedRowData?.config_json?.baseUrl}</span>
          </div>
        </div>
      </div>

      {selectedRowData?.config_json?.client_id && (
        <div className="row">
          <div className="col-6">
            <div className="d-flex flex-column gap-2">
              <label className="wl-label-sm text-muted">Client ID</label>
              <span className="wl-body-sm">{selectedRowData?.config_json?.client_id}</span>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex flex-column gap-2">
              <label className="wl-label-sm text-muted">Client Secret</label>
              <span className="wl-body-sm">
                {selectedRowData?.config_json?.client_secret ? "••••••••" : "Not set"}
              </span>
            </div>
          </div>
        </div>
      )}

      {selectedRowData?.config_json?.token_url && (
        <div className="row">
          <div className="col-12">
            <div className="d-flex flex-column gap-2">
              <label className="wl-label-sm text-muted">Token URL</label>
              <span className="wl-body-sm">{selectedRowData?.config_json?.token_url}</span>
            </div>
          </div>
        </div>
      )}

      {selectedRowData?.config_json?.username && (
        <div className="row">
          <div className="col-6">
            <div className="d-flex flex-column gap-2">
              <label className="wl-label-sm text-muted">Username</label>
              <span className="wl-body-sm">{selectedRowData?.config_json?.username}</span>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex flex-column gap-2">
              <label className="wl-label-sm text-muted">Password</label>
              <span className="wl-body-sm">
                {selectedRowData?.config_json?.password ? "••••••••" : "Not set"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthConfigDetails;

