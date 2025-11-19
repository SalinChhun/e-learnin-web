"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Spinner } from "react-bootstrap";
import { createAuthConfigSchema, CreateAuthConfigOutput } from "@/validators/auth-config.schema";
import { CreateAuthConfigFormData } from "@/lib/types/auth-config";
import useAuthConfigMutation from "@/lib/hook/use-auth-config";
import InfiniteScrollDropdown from "@/components/shared/InfiniteScrollDropdown";
import { InfiniteScrollItem } from "@/lib/types/common";
import commonCodeService from "@/service/common-code.service";
import authConfigService from "@/service/auth-config.service";
import ToggleSwitch from "@/components/shared/ToggleSwitch";
import useCopyToClipboard from "@/lib/hook/use-copy-to-clipboard";
import toast from "@/utils/toastService";

interface CreateAuthConfigProps {
  isOpen: boolean;
  handleClose: () => void;
}

const CreateAuthConfig = ({ isOpen, handleClose }: CreateAuthConfigProps) => {
  const { useCreateAuthConfig, useProviders } = useAuthConfigMutation;
  const { mutation: createMutation, isPending: isLoading } = useCreateAuthConfig();
  // Lazy fetch providers on open
  const [providersEnabled, setProvidersEnabled] = useState(false);
  const providersQuery = useProviders(providersEnabled);
  const [selectedProvider, setSelectedProvider] = useState<InfiniteScrollItem | null>(null);

  const [authType, setAuthType] = useState<string>("");
  const [authTypeOptions, setAuthTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const [envOptions, setEnvOptions] = useState<{ value: string; label: string }[]>([]);
  const [envLoaded, setEnvLoaded] = useState(false);
  const [authTypesLoaded, setAuthTypesLoaded] = useState(false);
  const [_, copy] = useCopyToClipboard();
  const envRef = useRef<HTMLDivElement>(null);
  const authRef = useRef<HTMLDivElement>(null);
  const [isEnvOpen, setIsEnvOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    control,
  } = useForm<CreateAuthConfigOutput>({
    resolver: zodResolver(createAuthConfigSchema),
    mode: 'onChange',
    defaultValues: {
      config_name: "",
      provider_id: 0 as unknown as number,
      auth_config_id: "",
      env: "",
      is_enable: true,
      base_url: "",
      auth_type: "",
      client_id: "",
      client_secret: "",
      token_url: "",
      username: "",
      password: "",
    },
  });

  const watchedAuthType = watch("auth_type");

  useEffect(() => {
    const selected = (watchedAuthType || "").toString();
    // After switching to API-driven auth types, the value is the authTypeId directly
    if (selected === 'jwt' || selected === 'oauth2' || selected === 'basic') setAuthType(selected);
    else setAuthType("");
  }, [watchedAuthType]);

  // Lazy fetch env/auth types when their dropdowns are opened
  const loadEnvIfNeeded = async () => {
    if (envLoaded) return;
    try {
      const envRes = await commonCodeService.getCommonCode("ENVT_TYPE");
      const envOpts = (envRes?.codes || []).map((c: any) => ({ value: c.code, label: c.name }));
      setEnvOptions(envOpts);
      if (!watch("env") && envOpts[0]?.value) setValue("env", envOpts[0].value, { shouldValidate: true });
    } finally {
      setEnvLoaded(true);
    }
  };

  const loadAuthTypesIfNeeded = async () => {
    if (authTypesLoaded) return;
    try {
      const authTypes = await authConfigService.getAuthTypes();
      setAuthTypeOptions((authTypes || []).filter((t: any) => t?.isActive !== false).map((t: any) => ({ value: t.authTypeId, label: t.authTypeName })));
    } finally {
      setAuthTypesLoaded(true);
    }
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (envRef.current && !envRef.current.contains(target)) setIsEnvOpen(false);
      if (authRef.current && !authRef.current.contains(target)) setIsAuthOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const onSubmit = (data: CreateAuthConfigOutput) => {

    console.log(data);
    // return;
    createMutation(data, {
      onSuccess: () => {
        reset();
        setAuthType("");
        handleClose();
      },
    });
  };

  const onClose = () => {
    reset();
    setAuthType("");
    handleClose();
  };

  const isValidRequiredField = !!(watch('config_name') && watch('provider_id') && watch('auth_config_id') && watch('base_url'));
  const hasNoErrors = Object.keys(errors || {}).length === 0;
  const baseRequiredOk = isValidRequiredField;
  const basicOk = authType === 'basic' ? !!(watch('username') && watch('password')) : true;
  const tokenOk = (authType === 'jwt' || authType === 'oauth2') ? !!(watch('client_id') && watch('client_secret')) : true;
  const isReadyToSubmit = baseRequiredOk && basicOk && tokenOk && hasNoErrors;

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
              <span className="wl-title-sm">Create Configuration</span>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column gap-4 p-3">
          <div className="d-flex flex-column gap-3">
            {/* Configuration Name */}
            <div className="row">
              <div className="col-12">
                <div className="wl-input-container">
                  <span className="wl-input-title wl-text-primary">
                    Configuration Name <span className="wl-input-required">*</span>
                  </span>
                  <div className="wl-position-relative">
                    <input
                      type="text"
                      className="w-100"
                      placeholder="Production OAuth"
                      {...register("config_name")}
                    />
                    <span onClick={() => setValue('config_name', '')} className="wl-clear-btn"></span>
                  </div>
                </div>
                {errors?.config_name && (
                  <span className="text-danger">{errors?.config_name?.message}</span>
                )}
              </div>
            </div>

            {/* Provider Name */}
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
                  placeholder="Select provider"
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

            {/* Auth Config ID */}
            <div className="row">
              <div className="col-12">
                <div className="wl-input-container">
                  <span className="wl-input-title wl-text-primary">
                    Auth Config ID <span className="wl-input-required">*</span>
                  </span>
                  <div className="wl-position-relative">
                    <input
                      type="text"
                      className="w-100"
                      placeholder="Enter auth config ID"
                      {...register("auth_config_id")}
                    />
                    <span onClick={() => setValue('auth_config_id', '')} className="wl-clear-btn"></span>
                  </div>
                </div>
                {errors?.auth_config_id && (
                  <span className="text-danger">{errors?.auth_config_id?.message}</span>
                )}
              </div>
            </div>

            {/* Environment */}
            <div className="row">
              <div className="col-12">
                <div className="wl-input-container" ref={envRef}>
                  <span className="wl-input-title wl-text-primary">
                    Environment <span className="wl-input-required">*</span>
                  </span>
                  <div className="dropdown">
                    <div
                      className="w-100 wl-dropdown-toggle wl-toggle-outline"
                      onClick={async () => { const willOpen = !isEnvOpen; setIsEnvOpen(willOpen); if (willOpen) await loadEnvIfNeeded(); }}
                    >
                      {envOptions.find(opt => opt.value === watch("env"))?.label || "Select environment"}
                    </div>
                    <div className={`w-100 dropdown-menu wl-dropdown-menu p-0 ${isEnvOpen ? "show" : ""}`}>
                      <div className="w-100 d-flex flex-column">
                        <div className="border-bottom wl-px-12 wl-py-10">Environment</div>
                        <div className="w-100 d-flex flex-column wl-max-height-220 overflow-x-hidden overflow-y-auto p-1">
                          {envOptions.map((option) => (
                            <div
                              key={option.value}
                              className={`wl-dropdown-item ${watch("env") === option.value ? "wl-active" : ""}`}
                              onClick={() => { setValue("env", option.value, { shouldValidate: true }); setIsEnvOpen(false); }}
                            >
                              {option.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {errors?.env && (
                  <span className="text-danger">{errors?.env?.message}</span>
                )}
              </div>
            </div>

            {/* Base URL */}
            <div className="row">
              <div className="col-12">
                <div className="wl-input-container">
                  <span className="wl-input-title wl-text-primary">
                    Base URL <span className="wl-input-required">*</span>
                  </span>
                  <div className="wl-position-relative">
                    <input
                      type="text"
                      className="w-100"
                      placeholder="https://api.mycompany.com"
                      {...register("base_url")}
                    />
                    <span onClick={() => setValue('base_url', '')} className="wl-clear-btn"></span>
                  </div>
                </div>
                {errors?.base_url && (
                  <span className="text-danger">{errors?.base_url?.message}</span>
                )}
              </div>
            </div>

            {/* Auth Type */}
            <div className="row">
              <div className="col-12">
                <div className="wl-input-container" ref={authRef}>
                  <span className="wl-input-title wl-text-primary">
                    Auth Type <span className="wl-input-required">*</span>
                  </span>
                  <div className="dropdown">
                    <div
                      className="w-100 wl-dropdown-toggle wl-toggle-outline"
                      onClick={async () => { const willOpen = !isAuthOpen; setIsAuthOpen(willOpen); if (willOpen) await loadAuthTypesIfNeeded(); }}
                    >
                      {authTypeOptions.find(opt => opt.value === watch("auth_type"))?.label || "None"}
                    </div>
                    <div className={`w-100 dropdown-menu wl-dropdown-menu p-0 ${isAuthOpen ? "show" : ""}`}>
                      <div className="w-100 d-flex flex-column">
                        <div className="border-bottom wl-px-12 wl-py-10">Auth Type</div>
                        <div className="w-100 d-flex flex-column wl-max-height-220 overflow-x-hidden overflow-y-auto p-1">
                          <div
                            className={`wl-dropdown-item ${!watch("auth_type") ? "wl-active" : ""}`}
                            onClick={() => { setValue("auth_type", undefined as any, { shouldValidate: false }); setIsAuthOpen(false); }}
                          >
                            None
                          </div>
                          {authTypeOptions.map((option) => (
                            <div
                              key={option.value}
                              className={`wl-dropdown-item ${watch("auth_type") === option.value ? "wl-active" : ""}`}
                              onClick={() => { setValue("auth_type", option.value, { shouldValidate: false }); setIsAuthOpen(false); }}
                            >
                              {option.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {errors?.auth_type && (
                  <span className="text-danger">{errors?.auth_type?.message}</span>
                )}
              </div>
            </div>

            {/* Conditional fields for JWT/OAuth2 */}
            {(authType === "jwt" || authType === "oauth2") && (
              <>
                <div className="row">
                  <div className="col-12">
                    <div className="wl-input-container">
                      <span className="wl-input-title wl-text-primary">
                        Client ID <span className="wl-input-required">*</span>
                      </span>
                      <div className="wl-position-relative my-grid-1-auto my-grid">
                        <input
                          type="text"
                          className="w-100"
                          placeholder="Enter client ID"
                          {...register("client_id")}
                        />
                        <button
                          onClick={() => {
                            copy(watch("client_id") || "");
                            toast.success("Client ID copied");
                          }}
                          disabled={!watch("client_id")}
                          type="button"
                          className="wl-btn-primary-outline wl-btn-action"
                          style={{ cursor: "pointer", width: "fit-content" ,paddingLeft: "8px", paddingRight: "8px"}}
                        >
                          <span className="wl-icon wl-icon-copy-gray "></span>
                        </button>
                        <span onClick={() => setValue('client_id', '')} className="wl-clear-btn"></span>
                      </div>
                    </div>
                    {errors?.client_id && (
                      <span className="text-danger">{errors?.client_id?.message}</span>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-12">
                    <div className="wl-input-container">
                      <span className="wl-input-title wl-text-primary">
                        Client Secret <span className="wl-input-required">*</span>
                      </span>
                      <div className="wl-position-relative my-grid-1-auto my-grid">
                        <input
                          type="password"
                          className="w-100"
                          placeholder="Enter client secret"
                          {...register("client_secret")}
                        />
                        <button
                          onClick={() => {
                            copy(watch("client_secret") || "");
                            toast.success("Client secret copied");
                          }}
                          disabled={!watch("client_secret")}
                          type="button"
                          className="wl-btn-primary-outline wl-btn-action"
                          style={{ cursor: "pointer", width: "fit-content" ,paddingLeft: "8px", paddingRight: "8px"}}
                        >
                          <span className="wl-icon wl-icon-copy-gray "></span>
                        </button>
                      </div>
                    </div>
                    {errors?.client_secret && (
                      <span className="text-danger">{errors?.client_secret?.message}</span>
                    )}
                  </div>
                </div>

                {(authType === "oauth2" || authType === "jwt") && (
                  <div className="row">
                    <div className="col-12">
                      <div className="wl-input-container">
                        <span className="wl-input-title wl-text-primary">Token URI</span>
                        <div className="wl-position-relative">
                          <input
                            type="text"
                            className="w-100"
                            placeholder="/api/v1/example"
                            {...register("token_url")}
                          />
                          <span onClick={() => setValue('token_url', '')} className="wl-clear-btn"></span>
                        </div>
                      </div>
                      {errors?.token_url && (
                        <span className="text-danger">{errors?.token_url?.message}</span>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Conditional fields for Basic Auth */}
            {authType === "basic" && (
              <>
                <div className="row">
                  <div className="col-12">
                    <div className="wl-input-container">
                      <span className="wl-input-title wl-text-primary">
                        Username <span className="wl-input-required">*</span>
                      </span>
                      <div className="wl-position-relative my-grid-1-auto my-grid">
                        <input
                          type="text"
                          className="w-100"
                          placeholder="Admin"
                          {...register("username")}
                        />
                        <button
                          onClick={() => {
                            copy(watch("username") || "");
                            toast.success("Username copied");
                          }}
                          disabled={!watch("username")}
                          type="button"
                          className="wl-btn-primary-outline wl-btn-action"
                          style={{ cursor: "pointer", width: "fit-content" ,paddingLeft: "8px", paddingRight: "8px"}}
                        >
                          <span className="wl-icon wl-icon-copy-gray "></span>
                        </button>
                        
                        
                      </div>
                    </div>
                    {errors?.username && (
                      <span className="text-danger">{errors?.username?.message}</span>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-12">
                    <div className="wl-input-container">
                      <span className="wl-input-title wl-text-primary">
                        Password <span className="wl-input-required">*</span>
                      </span>
                      <div className="wl-position-relative my-grid-1-auto my-grid">
                        <input
                          type="password"
                          className="w-100"
                          placeholder="••••••••••••"
                          {...register("password")}
                        />  
                        <button
                          onClick={() => {
                            copy(watch("password") || "");
                            toast.success("Password copied");
                          }}
                          disabled={!watch("password")}
                          type="button"
                          className="wl-btn-primary-outline wl-btn-action"
                          style={{ cursor: "pointer", width: "fit-content" ,paddingLeft: "8px", paddingRight: "8px"}}
                        >
                          <span className="wl-icon wl-icon-copy-gray "></span>
                        </button>
                      </div>
                    </div>
                    {errors?.password && (
                      <span className="text-danger">{errors?.password?.message}</span>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Enabled Toggle */}
            <ToggleSwitch
              id="auth-config-enabled"
              checked={watch("is_enable")}
              onChange={(checked) => setValue("is_enable", checked)}
              label="Enabled Configuration"
            />
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
            className="wl-btn-primary wl-width-160"
          >
            {isLoading ? (
              <Spinner animation="border" style={{ width: 18, height: 18 }} role="status" />
            ) : (
              'Create Configuration'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateAuthConfig;
