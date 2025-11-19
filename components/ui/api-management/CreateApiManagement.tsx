"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Spinner } from "react-bootstrap";
import { createApiManagementSchema, CreateApiManagementOutput } from "@/validators/api-management.schema";
import useApiManagementMutation from "@/lib/hook/use-api-management";
import InfiniteScrollDropdown from "@/components/shared/InfiniteScrollDropdown";
import { InfiniteScrollItem } from "@/lib/types/common";
import ToggleSwitch from "@/components/shared/ToggleSwitch";
import { HTTP_METHODS } from "@/lib/types/api-management";

interface CreateApiManagementProps {
  isOpen: boolean;
  handleClose: () => void;
}

/**
 * Create API Management Component
 * Form for creating new API management configurations
 */
const CreateApiManagement = ({ isOpen, handleClose }: CreateApiManagementProps) => {
  const { useCreateApiManagement, useProviders, useAvailableAuthConfigs } = useApiManagementMutation;
  const { mutation: createMutation, isPending: isLoading } = useCreateApiManagement();
  
  // Lazy fetch providers on open
  const [providersEnabled, setProvidersEnabled] = useState(false);
  const providersQuery = useProviders(providersEnabled);
  const [selectedProvider, setSelectedProvider] = useState<InfiniteScrollItem | null>(null);

  // Lazy fetch auth configs on open
  const [authConfigsEnabled, setAuthConfigsEnabled] = useState(false);
  const authConfigsQuery = useAvailableAuthConfigs(authConfigsEnabled);
  const [selectedAuthConfig, setSelectedAuthConfig] = useState<InfiniteScrollItem | null>(null);

  // Method dropdown state
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [isMethodOpen, setIsMethodOpen] = useState(false);
  const methodRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateApiManagementOutput>({
    resolver: zodResolver(createApiManagementSchema),
    mode: 'onChange',
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

  const onSubmit = (data: CreateApiManagementOutput) => {
    createMutation(data, {
      onSuccess: () => {
        reset();
        setSelectedProvider(null);
        setSelectedAuthConfig(null);
        setSelectedMethod("");
        handleClose();
      },
    });
  };

  const onClose = () => {
    reset();
    setSelectedProvider(null);
    setSelectedAuthConfig(null);
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="wl-page-header wl-border-bottom-none p-3">
          <div className="wl-header-content">
            <div className="wl-header-title-container">
              <span className="wl-title-sm">Register API</span>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column gap-4 p-3">
          <div className="d-flex flex-column gap-3">
            {/* Provider Selection */}
            <div className="row">
              <div className="col-12">
                <InfiniteScrollDropdown
                  items={providersQuery.items}
                  selectedItems={selectedProvider ? [selectedProvider] : []}
                  searchValue={providersQuery.searchValue}
                  onSearchChange={providersQuery.setSearchValue}
                  onSelect={(provider: InfiniteScrollItem) => {
                    setSelectedProvider(provider);
                    providersQuery.setSearchValue("");
                    setValue(
                      "provider_id",
                      (provider.value.provider_id ?? provider.value.id) as number,
                      { shouldValidate: true }
                    );
                  }}
                  onRemove={() => {
                    setSelectedProvider(null);
                    setValue("provider_id", 0 as unknown as number, { shouldValidate: true });
                  }}
                  placeholder="Select"
                  title="Provider Name"
                  hasNextPage={providersQuery.hasNextPage}
                  fetchNextPage={providersQuery.fetchNextPage}
                  onOpen={() => setProvidersEnabled(true)}
                />
                {errors?.provider_id && (
                  <span className="text-danger">{errors?.provider_id?.message}</span>
                )}
              </div>
            </div>

            {/* Auth Config Selection */}
            <div className="row">
              <div className="col-12">
                <InfiniteScrollDropdown
                  items={authConfigsQuery.items}
                  selectedItems={selectedAuthConfig ? [selectedAuthConfig] : []}
                  searchValue={authConfigsQuery.searchValue}
                  onSearchChange={authConfigsQuery.setSearchValue}
                  onSelect={(authConfig: InfiniteScrollItem) => {
                    setSelectedAuthConfig(authConfig);
                    authConfigsQuery.setSearchValue("");
                    setValue(
                      "config_id",
                      authConfig.value.config_id as number,
                      { shouldValidate: true }
                    );
                  }}
                  onRemove={() => {
                    setSelectedAuthConfig(null);
                    setValue("config_id", 0 as unknown as number, { shouldValidate: true });
                  }}
                  placeholder="Select"
                  title="Configuration Name"
                  hasNextPage={authConfigsQuery.hasNextPage}
                  fetchNextPage={authConfigsQuery.fetchNextPage}
                  onOpen={() => setAuthConfigsEnabled(true)}
                />
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
                      type="text"
                      className="w-100"
                      placeholder="Enter API name"
                      {...register("api_name")}
                    />
                    <span onClick={() => setValue('api_name', '')} className="wl-clear-btn"></span>
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
                      type="text"
                      className="w-100"
                      placeholder="Enter Service ID"
                      {...register("service_id")}
                    />
                    <span onClick={() => setValue('service_id', '')} className="wl-clear-btn"></span>
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
                      className="w-100"
                      rows={3}
                      placeholder="Describe what this api do"
                      {...register("description")}
                    />
                    <span onClick={() => setValue('description', '')} className="wl-clear-btn"></span>
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
                      onClick={() => setIsMethodOpen(!isMethodOpen)}
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
              id="api-management-enabled"
              checked={watch("is_enable")}
              onChange={(checked) => setValue("is_enable", checked)}
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
                      type="text"
                      className="w-100"
                      placeholder="https://api.example.com/endpoint"
                      {...register("api_endpoint_url")}
                    />
                    <span onClick={() => setValue('api_endpoint_url', '')} className="wl-clear-btn"></span>
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
            onClick={onClose}
            type="button"
            className="wl-btn-primary-text"
          >
            Cancel
          </button>
          <button
            disabled={isLoading || !isReadyToSubmit}
            type="submit"
            className="wl-btn-primary "
          >
            {isLoading ? (
              <Spinner animation="border" style={{ width: 18, height: 18 }} role="status" />
            ) : (
              'Register API'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateApiManagement;
