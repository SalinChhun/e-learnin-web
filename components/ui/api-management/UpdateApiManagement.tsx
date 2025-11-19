"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Spinner } from "react-bootstrap";
import { updateApiManagementSchema, UpdateApiManagementOutput } from "@/validators/api-management.schema";
import useApiManagementMutation from "@/lib/hook/use-api-management";
import InfiniteScrollDropdown from "@/components/shared/InfiniteScrollDropdown";
import { InfiniteScrollItem } from "@/lib/types/common";
import ToggleSwitch from "@/components/shared/ToggleSwitch";
import { HTTP_METHODS } from "@/lib/types/api-management";
import { useQuery } from "@tanstack/react-query";
import apiManagementService from "@/service/api-management.service";
import usePermissions from "@/lib/hook/usePermissions";
import { RES_PERM_ACTION } from "@/lib/enums/permissionEnums";

interface UpdateApiManagementProps {
  isOpen: boolean;
  handleClose: () => void;
  apiId: number;
}

/**
 * Update API Management Component
 * Form for updating existing API management configurations
 */
const UpdateApiManagement = ({ isOpen, handleClose, apiId }: UpdateApiManagementProps) => {
  const { useUpdateApiManagement, useProviders, useAvailableAuthConfigs, useUpdateApiManagementStatus } = useApiManagementMutation;
  const { mutateAsync, isLoading } = useUpdateApiManagement();
  const { mutation: updateStatus, isPending: isUpdatingStatus } = useUpdateApiManagementStatus();

  const [selectedProvider, setSelectedProvider] = useState<InfiniteScrollItem | null>(null);
  const [selectedAuthConfig, setSelectedAuthConfig] = useState<InfiniteScrollItem | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  // Method dropdown state
  const [isMethodOpen, setIsMethodOpen] = useState(false);
  const methodRef = useRef<HTMLDivElement>(null);

  const providersQuery = useProviders(true);
  const authConfigsQuery = useAvailableAuthConfigs(true);

  const { hasAnyPermission } = usePermissions();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<UpdateApiManagementOutput>({
    resolver: zodResolver(updateApiManagementSchema),
    mode: "onChange",
    defaultValues: {
      provider_id: 0 as unknown as number,
      config_id: 0 as unknown as number,
      api_name: "",
      service_id: "",
      description: "",
      method: "GET" as const,
      is_enable: true,
      api_endpoint_url: "",
    },
  });

  // Close dropdowns on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (methodRef.current && !methodRef.current.contains(target)) {
        setIsMethodOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Load current API management via React Query
  const apiManagementQuery = useQuery({
    queryKey: ["api-management", apiId],
    queryFn: () => apiManagementService.getApiManagementById(apiId),
    enabled: !!apiId && isOpen,
  });

  useEffect(() => {
    const data: any = apiManagementQuery.data || {};
    if (!data || isEditing) return; // Don't reset form when user is editing

    setValue("provider_id", Number(data.provider_id) as any);
    setValue("config_id", Number(data.config_id) as any);
    setValue("api_name", data.api_name || "");
    setValue("service_id", data.service_id || "");
    setValue("description", data.description || "");
    setValue("method", data.method || "");
    setValue("is_enable", data.is_enable || false);
    setValue("api_endpoint_url", data.api_endpoint_url || "");

    // Set selected method for UI
    setSelectedMethod(data.method || "");

    // Preselect provider immediately
    if (data.provider_id != null) {
      const providerId = Number(data.provider_id);
      const providerName = data.provider_name || String(providerId);
      setSelectedProvider({
        id: String(providerId),
        title: providerName,
        value: { provider_id: providerId, _uniqueKey: `provider-${providerId}` },
      } as any);
    }

    // Preselect auth config immediately
    if (data.config_id != null) {
      const configId = Number(data.config_id);
      const configName = data.config_name || String(configId);
      setSelectedAuthConfig({
        id: String(configId),
        title: configName,
        value: { config_id: configId, _uniqueKey: `config-${configId}` },
      } as any);
    }
  }, [apiManagementQuery.data, isEditing]);

  // Preselect provider in dropdown once data and providers are loaded
  useEffect(() => {
    const data: any = apiManagementQuery.data || {};
    if (!data || data.provider_id == null || isEditing) return; // Don't reset when user is editing
    const providerId = Number(data.provider_id);
    const match = (providersQuery.items || []).find((item: any) => {
      const itemId = Number(item?.value?.provider_id ?? item?.value?.id ?? item?.id);
      return itemId === providerId;
    });
    if (match) setSelectedProvider(match);
  }, [apiManagementQuery.data, providersQuery.items, isEditing]);

  // Preselect auth config in dropdown once data and auth configs are loaded
  useEffect(() => {
    const data: any = apiManagementQuery.data || {};
    if (!data || data.config_id == null || isEditing) return; // Don't reset when user is editing
    const configId = Number(data.config_id);
    const match = (authConfigsQuery.items || []).find((item: any) => {
      const itemId = Number(item?.value?.config_id ?? item?.value?.id ?? item?.id);
      return itemId === configId;
    });
    if (match) setSelectedAuthConfig(match);
  }, [apiManagementQuery.data, authConfigsQuery.items, isEditing]);

  const onSubmit = async (data: UpdateApiManagementOutput) => {
    await mutateAsync({ apiId, ...data });
    reset();
    setSelectedMethod("");
    handleClose();
  };

  const onClose = () => {
    reset();
    setSelectedMethod("");
    handleClose();
  };

  // Form validation
  const isValidRequiredField = !!(
    watch('provider_id') && 
    watch('config_id') && 
    watch('api_name') && 
    watch('service_id') && 
    watch('method') && 
    watch('api_endpoint_url')
  );
  const hasNoErrors = Object.keys(errors || {}).length === 0;
  const isReadyToSubmit = isValidRequiredField && hasNoErrors;

  return (
    <Modal
      contentClassName="wl-width-720 modal-content wl-modal-content d-flex flex-column"
      show={isOpen}
      centered={true}
      onHide={onClose}
      backdrop="static"
    >
      <form onSubmit={isEditing ? handleSubmit((data) => onSubmit(data)) : (e) => { e.preventDefault(); }}>
        <div className="wl-page-header wl-border-bottom-none p-3 ">
          <div className="wl-header-content">
            <div className="wl-header-title-container">
              <span className="wl-title-sm">Update API</span>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column gap-4 p-3 my-cus-body">
          <div className="d-flex flex-column gap-3" style={{ position: "relative" }}>
            {apiManagementQuery.isLoading && (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.6)", zIndex: 2 }}
              >
                <Spinner animation="border" role="status" />
              </div>
            )}

            {/* Provider Selection */}
            <div className="row">
              <div className="col-12">
                <div style={{ pointerEvents: isEditing ? "auto" : "none", opacity: isEditing ? 1 : 0.6 }}>
                  <InfiniteScrollDropdown
                    items={providersQuery.items}
                    selectedItems={selectedProvider ? [selectedProvider] : []}
                    searchValue={providersQuery.searchValue}
                    onSearchChange={providersQuery.setSearchValue}
                    onSelect={(provider: InfiniteScrollItem) => {
                      setSelectedProvider(provider);
                      providersQuery.setSearchValue("");
                      setValue("provider_id", (provider.value.provider_id ?? provider.value.id) as number, { shouldValidate: true });
                    }}
                    onRemove={() => {
                      setSelectedProvider(null);
                      setValue("provider_id", 0 as unknown as number, { shouldValidate: true });
                    }}
                    placeholder="Select"
                    title="Provider Name"
                    hasNextPage={providersQuery.hasNextPage}
                    fetchNextPage={providersQuery.fetchNextPage}
                  />
                </div>
                {errors?.provider_id && (
                  <span className="text-danger">{errors?.provider_id?.message}</span>
                )}
              </div>
            </div>

            {/* Auth Config Selection */}
            <div className="row">
              <div className="col-12">
                <div style={{ pointerEvents: isEditing ? "auto" : "none", opacity: isEditing ? 1 : 0.6 }}>
                  <InfiniteScrollDropdown
                    items={authConfigsQuery.items}
                    selectedItems={selectedAuthConfig ? [selectedAuthConfig] : []}
                    searchValue={authConfigsQuery.searchValue}
                    onSearchChange={authConfigsQuery.setSearchValue}
                    onSelect={(authConfig: InfiniteScrollItem) => {
                      setSelectedAuthConfig(authConfig);
                      authConfigsQuery.setSearchValue("");
                      setValue("config_id", authConfig.value.config_id as number, { shouldValidate: true });
                    }}
                    onRemove={() => {
                      setSelectedAuthConfig(null);
                      setValue("config_id", 0 as unknown as number, { shouldValidate: true });
                    }}
                    placeholder="Select"
                    title="Configuration Name"
                    hasNextPage={authConfigsQuery.hasNextPage}
                    fetchNextPage={authConfigsQuery.fetchNextPage}
                  />
                </div>
                {errors?.config_id && (
                  <span className="text-danger">{errors?.config_id?.message}</span>
                )}
              </div>
            </div>

            {/* API Name */}
            <div className="row">
              <div className="col-12">
                <div className="wl-input-container">
                  <span className="wl-input-title wl-text-primary">
                    API Name <span className="wl-input-required">*</span>
                  </span>
                  <div className="wl-position-relative">
                    <input
                      disabled={!isEditing}
                      type="text"
                      className="w-100"
                      placeholder="Enter API name"
                      {...register("api_name")}
                    />
                    {isEditing && <span onClick={() => setValue("api_name", "")} className="wl-clear-btn"></span>}
                  </div>
                </div>
                {errors?.api_name && (
                  <span className="text-danger">{errors?.api_name?.message}</span>
                )}
              </div>
            </div>

            {/* Service ID */}
            <div className="row">
              <div className="col-12">
                <div className="wl-input-container">
                  <span className="wl-input-title wl-text-primary">
                    Service ID <span className="wl-input-required">*</span>
                  </span>
                  <div className="wl-position-relative">
                    <input
                      disabled={!isEditing}
                      type="text"
                      className="w-100"
                      placeholder="Enter Service ID"
                      {...register("service_id")}
                    />
                    {isEditing && <span onClick={() => setValue("service_id", "")} className="wl-clear-btn"></span>}
                  </div>
                </div>
                {errors?.service_id && (
                  <span className="text-danger">{errors?.service_id?.message}</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="row">
              <div className="col-12">
                <div className="wl-input-container">
                  <span className="wl-input-title wl-text-primary">
                    Description
                  </span>
                  <div className="wl-position-relative">
                    <textarea
                      disabled={!isEditing}
                      className="w-100"
                      rows={3}
                      placeholder="Describe what this api do"
                      {...register("description")}
                    />
                    {isEditing && <span onClick={() => setValue("description", "")} className="wl-clear-btn"></span>}
                  </div>
                </div>
                {errors?.description && (
                  <span className="text-danger">{errors?.description?.message}</span>
                )}
              </div>
            </div>

            {/* HTTP Method */}
            <div className="row">
              <div className="col-12">
                <div className="wl-input-container" ref={methodRef}>
                  <span className="wl-input-title wl-text-primary">
                    Method <span className="wl-input-required">*</span>
                  </span>
                  <div className="dropdown">
                    <div
                      className="w-100 wl-dropdown-toggle wl-toggle-outline"
                      onClick={() => {
                        if (!isEditing) return;
                        setIsMethodOpen(!isMethodOpen);
                      }}
                      style={{ opacity: isEditing ? 1 : 0.6, cursor: isEditing ? "pointer" : "default" }}
                    >
                      {selectedMethod || "Select method"}
                    </div>
                    <div className={`w-100 dropdown-menu wl-dropdown-menu p-0 ${isMethodOpen ? "show" : ""}`}>
                      <div className="w-100 d-flex flex-column">
                        <div className="border-bottom wl-px-12 wl-py-10">HTTP Method</div>
                        <div className="w-100 d-flex flex-column overflow-x-hidden overflow-y-auto p-1" style={{ maxHeight: "180px" }}>
                          {HTTP_METHODS.map((method) => (
                            <div
                              key={method.value}
                              className={`wl-dropdown-item ${selectedMethod === method.value ? "wl-active" : ""}`}
                              onClick={() => {
                                if (!isEditing) return;
                                setSelectedMethod(method.value);
                                setValue("method", method.value as any, { shouldValidate: true });
                                setIsMethodOpen(false);
                              }}
                            >
                              {method.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {errors?.method && (
                  <span className="text-danger">{errors?.method?.message}</span>
                )}
              </div>
            </div>

            {/* Enabled Toggle */}
            <ToggleSwitch
              id="api-management-enabled-update"
              checked={watch("is_enable")}
              disabled={!hasAnyPermission([RES_PERM_ACTION.API_MANAGEMENT_UPDATE])}
              onChange={(checked) => {
                if (checked === false) {
                  setShowDisableConfirm(true);
                } else {
                  if (!isEditing) {
                    updateStatus(
                      { config_ids: [apiId], is_enable: true },
                      { onSuccess: () => setValue("is_enable", true) }
                    );
                  } else {
                    setValue("is_enable", true);
                  }
                }
              }}
              label="Enabled APIs"
            />

            {/* API Endpoint URL */}
            <div className="row">
              <div className="col-12">
                <div className="wl-input-container">
                  <span className="wl-input-title wl-text-primary">
                    API Endpoint URL <span className="wl-input-required">*</span>
                  </span>
                  <div className="wl-position-relative">
                    <input
                      disabled={!isEditing}
                      type="text"
                      className="w-100"
                      placeholder="https://api.example.com/endpoint"
                      {...register("api_endpoint_url")}
                    />
                    {isEditing && <span onClick={() => setValue("api_endpoint_url", "")} className="wl-clear-btn"></span>}
                  </div>
                </div>
                {errors?.api_endpoint_url && (
                  <span className="text-danger">{errors?.api_endpoint_url?.message}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex justify-content-end align-items-center gap-2 p-3">
          <button
            type="button"
            className="wl-btn-primary-text"
            onClick={(e) => {
              e.preventDefault();
              if (isEditing) {
                setIsEditing(false);
                const data: any = apiManagementQuery.data || {};
                reset({
                  provider_id: data.provider_id != null ? Number(data.provider_id) as any : (0 as unknown as number),
                  config_id: data.config_id != null ? Number(data.config_id) as any : (0 as unknown as number),
                  api_name: data.api_name || "",
                  service_id: data.service_id || "",
                  description: data.description || "",
                  method: data.method || "",
                  is_enable: data.is_enable || false,
                  api_endpoint_url: data.api_endpoint_url || "",
                });
                setSelectedMethod(data.method || "");
                if (data.provider_id != null) {
                  const providerId = Number(data.provider_id);
                  const providerName = data.provider_name || String(providerId);
                  setSelectedProvider({
                    id: String(providerId),
                    title: providerName,
                    value: { provider_id: providerId, _uniqueKey: `provider-${providerId}` },
                  } as any);
                } else {
                  setSelectedProvider(null);
                }
                if (data.config_id != null) {
                  const configId = Number(data.config_id);
                  const configName = data.config_name || String(configId);
                  setSelectedAuthConfig({
                    id: String(configId),
                    title: configName,
                    value: { config_id: configId, _uniqueKey: `config-${configId}` },
                  } as any);
                } else {
                  setSelectedAuthConfig(null);
                }
              } else {
                onClose();
              }
            }}
            disabled={isLoading || apiManagementQuery.isLoading || isUpdatingStatus}
          >
            Cancel
          </button>
          {hasAnyPermission([RES_PERM_ACTION.API_MANAGEMENT_UPDATE]) && (!isEditing ? (
            <button
              type="button"
              className="wl-btn-primary-outline wl-btn-action wl-icon-pen"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsEditing(true);
              }}
              disabled={isLoading || apiManagementQuery.isLoading || isUpdatingStatus}
            >
              Edit
            </button>
          ) : (
            <button
              type="submit"
              className="wl-btn-primary"
              disabled={isLoading || apiManagementQuery.isLoading || !isReadyToSubmit}
            >
              Save
            </button>
          ))}
        </div>

        {/* Disable confirmation modal */}
        {showDisableConfirm && (
          <Modal
            show={showDisableConfirm}
            centered={true}
            onHide={() => setShowDisableConfirm(false)}
            backdrop="static"
            contentClassName='wl-modal-content d-flex flex-column my-cus-w'
            dialogClassName='my-cus-w'
            keyboard={false}
            backdropClassName="my-backdrop"
            style={{ zIndex: 99999 }}
          >
            <div className="wl-page-header wl-border-bottom-none p-3">
              <div className="wl-header-content">
                <div className="wl-header-title-container">
                  <span className="wl-title-sm">Disable API</span>
                </div>
              </div>
            </div>
            <div className="d-flex flex-column gap-3 p-3">
              <span className="wl-body-sm">
                Are you sure you want to disable this API?
              </span>
            </div>
            <div className="d-flex justify-content-end align-items-center gap-2 p-3">
              <button
                type="button"
                className="wl-btn-primary-text"
                onClick={() => setShowDisableConfirm(false)}
                disabled={isUpdatingStatus}
              >
                Cancel
              </button>
              <button
                type="button"
                className="wl-btn-primary"
                disabled={isUpdatingStatus}
                onClick={() => {
                  if (!isEditing) {
                    updateStatus(
                      { config_ids: [apiId], is_enable: false },
                      {
                        onSuccess: () => {
                          setValue("is_enable", false);
                          setShowDisableConfirm(false);
                        },
                      }
                    );
                  } else {
                    setValue("is_enable", false);
                    setShowDisableConfirm(false);
                  }
                }}
              >
                Disable
              </button>
            </div>
          </Modal>
        )}
      </form>
    </Modal>
  );
};

export default UpdateApiManagement;
