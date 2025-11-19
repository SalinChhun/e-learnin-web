"use client";

import { ApiManagementDetail } from "@/lib/types/api-management";

interface ApiManagementDetailsProps {
  selectedRowData: ApiManagementDetail;
}

/**
 * API Management Details Component
 * Displays detailed information about an API management configuration
 */
const ApiManagementDetails = ({ selectedRowData }: ApiManagementDetailsProps) => {
  if (!selectedRowData) {
    return (
      <div className="d-flex justify-content-center align-items-center p-4">
        <span className="text-muted">No data available</span>
      </div>
    );
  }

  const {
    provider_id,
    provider_name,
    config_id,
    config_name,
    api_name,
    service_id,
    description,
    method,
    is_enable,
    api_endpoint_url,
  } = selectedRowData;

  /**
   * Get badge class for HTTP method
   */
  const getMethodBadgeClass = (method: string) => {
    switch (method?.toUpperCase()) {
      case "GET":
        return "bg-success";
      case "POST":
        return "bg-primary";
      case "PUT":
        return "bg-warning";
      case "DELETE":
        return "bg-danger";
      case "PATCH":
        return "bg-info";
      case "HEAD":
      case "OPTIONS":
        return "bg-secondary";
      default:
        return "bg-light text-dark";
    }
  };

  /**
   * Get status badge class
   */
  const getStatusBadgeClass = (isEnabled: boolean) => {
    return isEnabled ? "bg-success" : "bg-danger";
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header Section */}
      <div className="d-flex flex-column gap-2">
        <div className="d-flex align-items-center gap-2">
          <h5 className="mb-0">{api_name || "Unnamed API"}</h5>
          <span className={`badge ${getMethodBadgeClass(method)}`}>
            {method || "N/A"}
          </span>
          <span className={`badge ${getStatusBadgeClass(is_enable)}`}>
            {is_enable ? "Enabled" : "Disabled"}
          </span>
        </div>
        <p className="text-muted mb-0">{description || "No description provided"}</p>
      </div>

      {/* Details Grid */}
      <div className="row g-3">
        {/* Provider Information */}
        <div className="col-md-6">
          <div className="wl-detail-item">
            <label className="wl-detail-label">Provider</label>
            <div className="wl-detail-value">
              <span className="fw-medium">{provider_name || "N/A"}</span>
              {provider_id && (
                <small className="text-muted d-block">ID: {provider_id}</small>
              )}
            </div>
          </div>
        </div>

        {/* Auth Configuration */}
        <div className="col-md-6">
          <div className="wl-detail-item">
            <label className="wl-detail-label">Auth Configuration</label>
            <div className="wl-detail-value">
              <span className="fw-medium">{config_name || "N/A"}</span>
              {config_id && (
                <small className="text-muted d-block">ID: {config_id}</small>
              )}
            </div>
          </div>
        </div>

        {/* Service ID */}
        <div className="col-md-6">
          <div className="wl-detail-item">
            <label className="wl-detail-label">Service ID</label>
            <div className="wl-detail-value">
              <code className="bg-light px-2 py-1 rounded">{service_id || "N/A"}</code>
            </div>
          </div>
        </div>

        {/* HTTP Method */}
        <div className="col-md-6">
          <div className="wl-detail-item">
            <label className="wl-detail-label">HTTP Method</label>
            <div className="wl-detail-value">
              <span className={`badge ${getMethodBadgeClass(method)}`}>
                {method || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* API Endpoint URL */}
        <div className="col-12">
          <div className="wl-detail-item">
            <label className="wl-detail-label">API Endpoint URL</label>
            <div className="wl-detail-value">
              <div className="d-flex align-items-center gap-2">
                <code className="bg-light px-2 py-1 rounded flex-grow-1 text-break">
                  {api_endpoint_url || "N/A"}
                </code>
                {api_endpoint_url && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(api_endpoint_url);
                      // You might want to add a toast notification here
                    }}
                    title="Copy URL"
                  >
                    <i className="bi bi-clipboard"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="col-md-6">
          <div className="wl-detail-item">
            <label className="wl-detail-label">Status</label>
            <div className="wl-detail-value">
              <span className={`badge ${getStatusBadgeClass(is_enable)}`}>
                {is_enable ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </div>

        {/* API Name */}
        <div className="col-md-6">
          <div className="wl-detail-item">
            <label className="wl-detail-label">API Name</label>
            <div className="wl-detail-value">
              <span className="fw-medium">{api_name || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      {description && (
        <div className="wl-detail-item">
          <label className="wl-detail-label">Description</label>
          <div className="wl-detail-value">
            <p className="mb-0">{description}</p>
          </div>
        </div>
      )}

      {/* Additional Information */}
      <div className="border-top pt-3">
        <h6 className="text-muted mb-3">Configuration Summary</h6>
        <div className="row g-2">
          <div className="col-12">
            <div className="alert alert-info mb-0">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-info-circle"></i>
                <div>
                  <strong>API Management Configuration</strong>
                  <div className="small">
                    This API management configuration connects the <strong>{provider_name}</strong> provider 
                    with the <strong>{config_name}</strong> authentication configuration to handle 
                    <strong> {method}</strong> requests to <code>{api_endpoint_url}</code>.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiManagementDetails;
