"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Spinner } from "react-bootstrap";
import { createAuthConfigSchema, CreateAuthConfigOutput } from "@/validators/auth-config.schema";
import useAuthConfigMutation from "@/lib/hook/use-auth-config";
import InfiniteScrollDropdown from "@/components/shared/InfiniteScrollDropdown";
import { InfiniteScrollItem } from "@/lib/types/common";
import commonCodeService from "@/service/common-code.service";
import authConfigService from "@/service/auth-config.service";
import ToggleSwitch from "@/components/shared/ToggleSwitch";
import useCopyToClipboard from "@/lib/hook/use-copy-to-clipboard";
import { useQuery } from "@tanstack/react-query";
// duplicate import removed
import toast from "@/utils/toastService";
import usePermissions from "@/lib/hook/usePermissions";
import { RES_PERM_ACTION } from "@/lib/enums/permissionEnums";

interface UpdateAuthConfigProps {
  isOpen: boolean;
  handleClose: () => void;
  configId: number;
}

const UpdateAuthConfig = ({ isOpen, handleClose, configId }: UpdateAuthConfigProps) => {
  const { useUpdateAuthConfig, useProviders } = useAuthConfigMutation;
  const { mutateAsync, isLoading } = useUpdateAuthConfig();
  const { mutation: updateStatus, isPending: isUpdatingStatus } = useAuthConfigMutation.useUpdateAuthConfigStatus();

  const { hasAnyPermission } = usePermissions();

  const [selectedProvider, setSelectedProvider] = useState<InfiniteScrollItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [authType, setAuthType] = useState<string>("");
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [authTypeOptions, setAuthTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const [envOptions, setEnvOptions] = useState<{ value: string; label: string }[]>([]);
  const [envLoaded, setEnvLoaded] = useState(false);
  const [authTypesLoaded, setAuthTypesLoaded] = useState(false);

  const dedupeOptions = (options: { value: string; label: string }[]) => {
    const map = new Map<string, { value: string; label: string }>();
    for (const opt of options) {
      if (!map.has(opt.value)) map.set(opt.value, opt);
    }
    return Array.from(map.values());
  };
  const [_, copy] = useCopyToClipboard();
  const envRef = useRef<HTMLDivElement>(null);
  const authRef = useRef<HTMLDivElement>(null);
  const [isEnvOpen, setIsEnvOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const providersQuery = useProviders(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateAuthConfigOutput>({
    resolver: zodResolver(createAuthConfigSchema),
    mode: "onChange",
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
    if (selected === "jwt" || selected === "oauth2" || selected === "basic") setAuthType(selected);
    else setAuthType("");
  }, [watchedAuthType]);

  // Lazy fetch env/auth types when dropdowns are opened
  const loadEnvIfNeeded = async () => {
    if (envLoaded) return;
    try {
      const envRes = await commonCodeService.getCommonCode("ENVT_TYPE");
      const fetched = (envRes?.codes || []).map((c: any) => ({ value: c.code, label: c.name }));
      setEnvOptions((prev) => dedupeOptions([...(prev || []), ...fetched]));
    } finally {
      setEnvLoaded(true);
    }
  };

  const loadAuthTypesIfNeeded = async () => {
    if (authTypesLoaded) return;
    try {
      const authTypes = await authConfigService.getAuthTypes();
      const fetched = (authTypes || [])
        .filter((t: any) => t?.isActive !== false)
        .map((t: any) => ({ value: t.authTypeId, label: t.authTypeName }));
      setAuthTypeOptions((prev) => dedupeOptions([...(prev || []), ...fetched]));
    } finally {
      setAuthTypesLoaded(true);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (envRef.current && !envRef.current.contains(t)) setIsEnvOpen(false);
      if (authRef.current && !authRef.current.contains(t)) setIsAuthOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Load current config via React Query
  const configQuery = useQuery({
    queryKey: ["auth-config", configId],
    queryFn: () => authConfigService.getAuthConfigById(configId),
    enabled: !!configId && isOpen,
  });

  useEffect(() => {
    const d: any = configQuery.data || {};
    if (!d || isEditing) return; // Don't reset form when user is editing
    
    setValue("config_name", d.config_name || "");
    if (d.provider_id != null) setValue("provider_id", Number(d.provider_id) as any);
    setValue("auth_config_id", d.auth_config_id || "");
    if (d.env_code) setValue("env", d.env_code);
    else if (d.env) setValue("env", d.env);
    if (typeof d.is_enabled === "boolean") setValue("is_enable", d.is_enabled);
    else if (typeof d.is_enable === "boolean") setValue("is_enable", d.is_enable);
    setValue("base_url", d.config_json?.baseUrl || "");
    if (d.auth_type_id || d.auth_type) setValue("auth_type", d.auth_type_id || d.auth_type);
    setValue("client_id", d.config_json?.client_id || "");
    setValue("client_secret", d.config_json?.client_secret || "");
    setValue("token_url", d.config_json?.token_url || "");
    setValue("username", d.config_json?.username || "");
    setValue("password", d.config_json?.password || "");

    // Ensure current env/auth type show in UI before options are fetched lazily
    const envCode = d.env_code || d.env;
    const envName = d.env_name;
    if (envCode && !envOptions.some((o) => o.value === String(envCode))) {
      setEnvOptions((prev) => dedupeOptions([{ value: String(envCode), label: envName || String(envCode) }, ...(prev || [])]));
    }

    const typeId = d.auth_type_id || d.auth_type;
    const typeName = d.auth_type_name;
    if (typeId && !authTypeOptions.some((o) => o.value === String(typeId))) {
      setAuthTypeOptions((prev) => dedupeOptions([{ value: String(typeId), label: typeName || String(typeId) }, ...(prev || [])]));
    }

    // Preselect provider immediately so input shows name without waiting for list
    if (d.provider_id != null) {
      const providerId = Number(d.provider_id);
      const providerName = d.provider_name || d.client_name || String(providerId);
      setSelectedProvider({
        id: String(providerId),
        title: providerName,
        value: { provider_id: providerId, _uniqueKey: `provider-${providerId}` },
      } as any);
    }
  }, [configQuery.data, isEditing]);

  // Preselect provider in dropdown once config and providers are loaded
  useEffect(() => {
    const d: any = configQuery.data || {};
    if (!d || d.provider_id == null || isEditing) return; // Don't reset when user is editing
    const providerId = Number(d.provider_id);
    const match = (providersQuery.items || []).find((item: any) => {
      const itemId = Number(item?.value?.provider_id ?? item?.value?.id ?? item?.id);
      return itemId === providerId;
    });
    if (match) setSelectedProvider(match);
  }, [configQuery.data, providersQuery.items, isEditing]);

  const onSubmit = async (data: CreateAuthConfigOutput) => {
    await mutateAsync({ configId, ...data });
    reset();
    setAuthType("");
    handleClose();
  };

  const onClose = () => {
    reset();
    setAuthType("");
    handleClose();
  };

  const isValidRequiredField = !!(watch("config_name") && watch("provider_id") && watch("auth_config_id") && watch("base_url"));
  const hasNoErrors = Object.keys(errors || {}).length === 0;
  const baseRequiredOk = isValidRequiredField;
  const basicOk = authType === "basic" ? !!(watch("username") && watch("password")) : true;
  const tokenOk = authType === "jwt" || authType === "oauth2" ? !!(watch("client_id") && watch("client_secret")) : true;
  const isReadyToSubmit = baseRequiredOk && basicOk && tokenOk && hasNoErrors;

  return (
    <Modal
      contentClassName="wl-width-720 modal-content wl-modal-content d-flex flex-column"
      show={isOpen}
      centered={true}
      onHide={onClose}
      backdrop="static"
    >
      <form onSubmit={isEditing ? handleSubmit((data) => onSubmit(data)) : (e) => { e.preventDefault(); }}>
        <div className="wl-page-header wl-border-bottom-none p-3">
          <div className="wl-header-content">
            <div className="wl-header-title-container">
              <span className="wl-title-sm">Update Configuration</span>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column gap-4 p-3">
          <div className="d-flex flex-column gap-3" style={{ position: "relative" }}>
            {configQuery.isLoading && (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.6)", zIndex: 2 }}
              >
                <Spinner animation="border" role="status" />
              </div>
            )}
            <>
            <div className="row">
              <div className="col-12">
                <div className="wl-input-container">
                  <span className="wl-input-title wl-text-primary">
                    Configuration Name <span className="wl-input-required">*</span>
                  </span>
                  <div className="wl-position-relative">
                    <input disabled={!isEditing} type="text" className="w-100" placeholder="Production OAuth" {...register("config_name")} />
                    {isEditing && <span onClick={() => setValue("config_name", "")} className="wl-clear-btn"></span>}
                  </div>
                </div>
                {errors?.config_name && <span className="text-danger">{errors?.config_name?.message}</span>}
              </div>
            </div>

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
                    placeholder="Select provider"
                    title="Provider Name"
                    hasNextPage={providersQuery.hasNextPage}
                    fetchNextPage={providersQuery.fetchNextPage}
                  />
                </div>
                {errors?.provider_id && <span className="text-danger">{(errors as any)?.provider_id?.message}</span>}
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="wl-input-container">
                  <span className="wl-input-title wl-text-primary">
                    Auth Config ID <span className="wl-input-required">*</span>
                  </span>
                  <div className="wl-position-relative">
                    <input disabled={!isEditing} type="text" className="w-100" placeholder="Enter auth config ID" {...register("auth_config_id")} />
                    {isEditing && <span onClick={() => setValue("auth_config_id", "")} className="wl-clear-btn"></span>}
                  </div>
                </div>
                {errors?.auth_config_id && <span className="text-danger">{(errors as any)?.auth_config_id?.message}</span>}
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="wl-input-container" ref={envRef}>
                  <span className="wl-input-title wl-text-primary">
                    Environment <span className="wl-input-required">*</span>
                  </span>
                  <div className="dropdown">
                    <div className="w-100 wl-dropdown-toggle wl-toggle-outline" onClick={async () => { if (!isEditing) return; const willOpen = !isEnvOpen; setIsEnvOpen(willOpen); if (willOpen) await loadEnvIfNeeded(); }} style={{ opacity: isEditing ? 1 : 0.6, cursor: isEditing ? "pointer" : "default" }}>
                      {envOptions.find((opt) => opt.value === watch("env"))?.label || "Select environment"}
                    </div>
                    <div className={`w-100 dropdown-menu wl-dropdown-menu p-0 ${isEnvOpen ? "show" : ""}`}>
                      <div className="w-100 d-flex flex-column">
                        <div className="border-bottom wl-px-12 wl-py-10">Environment</div>
                        <div className="w-100 d-flex flex-column wl-max-height-220 overflow-x-hidden overflow-y-auto p-1">
                          {envOptions.map((option) => (
                            <div
                              key={option.value}
                              className={`wl-dropdown-item ${watch("env") === option.value ? "wl-active" : ""}`}
                              onClick={() => {
                                if (!isEditing) return;
                                setValue("env", option.value, { shouldValidate: true });
                                setIsEnvOpen(false);
                              }}
                            >
                              {option.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {errors?.env && <span className="text-danger">{(errors as any)?.env?.message}</span>}
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="wl-input-container">
                  <span className="wl-input-title wl-text-primary">
                    Base URL <span className="wl-input-required">*</span>
                  </span>
                  <div className="wl-position-relative">
                    <input disabled={!isEditing} type="text" className="w-100" placeholder="https://api.mycompany.com" {...register("base_url")} />
                    {isEditing && <span onClick={() => setValue("base_url", "")} className="wl-clear-btn"></span>}
                  </div>
                </div>
                {errors?.base_url && <span className="text-danger">{(errors as any)?.base_url?.message}</span>}
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="wl-input-container" ref={authRef}>
                  <span className="wl-input-title wl-text-primary">Auth Type</span>
                  <div className="dropdown">
                    <div className="w-100 wl-dropdown-toggle wl-toggle-outline" onClick={async () => { if (!isEditing) return; const willOpen = !isAuthOpen; setIsAuthOpen(willOpen); if (willOpen) await loadAuthTypesIfNeeded(); }} style={{ opacity: isEditing ? 1 : 0.6, cursor: isEditing ? "pointer" : "default" }}>
                      {authTypeOptions.find((opt) => opt.value === watch("auth_type"))?.label || "None"}
                    </div>
                    <div className={`w-100 dropdown-menu wl-dropdown-menu p-0 ${isAuthOpen ? "show" : ""}`}>
                      <div className="w-100 d-flex flex-column">
                        <div className="border-bottom wl-px-12 wl-py-10">Auth Type</div>
                        <div className="w-100 d-flex flex-column wl-max-height-220 overflow-x-hidden overflow-y-auto p-1">
                          <div
                            className={`wl-dropdown-item ${!watch("auth_type") ? "wl-active" : ""}`}
                            onClick={() => {
                              if (!isEditing) return;
                              setValue("auth_type", undefined as any, { shouldValidate: true });
                              setIsAuthOpen(false);
                            }}
                          >
                            None
                          </div>
                          {authTypeOptions.map((option) => (
                            <div
                              key={option.value}
                              className={`wl-dropdown-item ${watch("auth_type") === option.value ? "wl-active" : ""}`}
                              onClick={() => {
                                if (!isEditing) return;
                                setValue("auth_type", option.value, { shouldValidate: false });
                                setIsAuthOpen(false);
                              }}
                            >
                              {option.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {errors?.auth_type && <span className="text-danger">{(errors as any)?.auth_type?.message}</span>}
              </div>
            </div>

            {(authType === "jwt" || authType === "oauth2") && (
              <>
                <div className="row">
                  <div className="col-12">
                    <div className="wl-input-container">
                      <span className="wl-input-title wl-text-primary">
                        Client ID <span className="wl-input-required">*</span>
                      </span>
                      <div className="wl-position-relative my-grid-1-auto my-grid">
                <input disabled={!isEditing} type="text" className="w-100" placeholder="Enter client ID" {...register("client_id")} />
                <button
                          onClick={() => {
                            copy(watch("client_id") || "");
                            toast.success("Client ID copied");
                          }}
                          disabled={!watch("client_id")}
                          type="button"
                          className="wl-btn-primary-outline "
                          style={{ width: "fit-content" ,paddingLeft: "8px", paddingRight: "8px"}}
                          id="copyable"
                        >
                          <span className="wl-icon wl-icon-copy-gray "></span>
                        </button>
                        <span onClick={() => setValue("client_id", "")} className="wl-clear-btn"></span>
                      </div>
                    </div>
                    {errors?.client_id && <span className="text-danger">{(errors as any)?.client_id?.message}</span>}
                  </div>
                </div>

                <div className="row">
                  <div className="col-12">
                    <div className="wl-input-container">
                      <span className="wl-input-title wl-text-primary">
                        Client Secret <span className="wl-input-required">*</span>
                      </span>
                      <div className="wl-position-relative my-grid-1-auto my-grid">
                <input disabled={!isEditing} type="password" className="w-100" placeholder="Enter client secret" {...register("client_secret")} />
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
                    {errors?.client_secret && <span className="text-danger">{(errors as any)?.client_secret?.message}</span>}
                  </div>
                </div>

                {(authType === "oauth2" || authType === "jwt") && (
                  <div className="row">
                    <div className="col-12">
                      <div className="wl-input-container">
                        <span className="wl-input-title wl-text-primary">Token URI</span>
                        <div className="wl-position-relative">
                          <input disabled={!isEditing} type="text" className="w-100" placeholder="/api/v1/example" {...register("token_url")} />
                          {isEditing && <span onClick={() => setValue("token_url", "")} className="wl-clear-btn"></span>}
                        </div>
                      </div>
                      {errors?.token_url && <span className="text-danger">{(errors as any)?.token_url?.message}</span>}
                    </div>
                  </div>
                )}
              </>
            )}

            {authType === "basic" && (
              <>
                <div className="row">
                  <div className="col-12">
                    <div className="wl-input-container">
                      <span className="wl-input-title wl-text-primary">
                        Username <span className="wl-input-required">*</span>
                      </span>
                      <div className="wl-position-relative">
                        <input
                          type="text"
                          className="w-100"
                          placeholder="Admin"
                          disabled={!isEditing}
                          {...register("username")}
                        />
                        {isEditing && watch("username") && (
                          <span
                            onClick={() => {
                              copy(watch("username") || "");
                              toast.success("Username copied");
                            }}
                            className="wl-icon wl-icon-copy-gray position-absolute"
                            style={{ right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}
                          />
                        )}
                      </div>
                    </div>
                    {errors?.username && (
                      <span className="text-danger">{(errors as any)?.username?.message}</span>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-12">
                    <div className="wl-input-container">
                      <span className="wl-input-title wl-text-primary">
                        Password <span className="wl-input-required">*</span>
                      </span>
                      <div className="wl-position-relative">
                        <input
                          type="password"
                          className="w-100"
                          placeholder="••••••••••••"
                          disabled={!isEditing}
                          {...register("password")}
                        />
                        {isEditing && watch("password") && (
                          <span
                            onClick={() => {
                              copy(watch("password") || "");
                              toast.success("Password copied");
                            }}
                            className="wl-icon wl-icon-copy-gray position-absolute"
                            style={{ right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}
                          />
                        )}
                      </div>
                    </div>
                    {errors?.password && (
                      <span className="text-danger">{(errors as any)?.password?.message}</span>
                    )}
                  </div>
                </div>
              </>
            )}

            <ToggleSwitch
              id="auth-config-enabled-update"
              checked={watch("is_enable")}
              onChange={(checked) => {
                if (checked === false) {
                  // ask for confirmation when disabling (both in edit and non-edit mode)
                  setShowDisableConfirm(true);
                } else {
                  // enable immediately
                  if (!isEditing) {
                    updateStatus(
                      { config_ids: [configId], is_enable: true },
                      { onSuccess: () => setValue("is_enable", true) }
                    );
                  } else {
                    setValue("is_enable", true);
                  }
                }
              }}
              label="Enabled Configuration"
              disabled={!hasAnyPermission([RES_PERM_ACTION.AUTH_CONFIG_UPDATE])}
            />
              </>
          </div>
        </div>

        <div className="d-flex justify-content-end align-items-center gap-2 p-3">
          <button type="button" className="wl-btn-primary-text" onClick={(e) => { 
            e.preventDefault(); 
            if (isEditing) { 
              setIsEditing(false);
              const d: any = configQuery.data || {};
              reset({
                config_name: d.config_name || "",
                provider_id: d.provider_id != null ? Number(d.provider_id) as any : (0 as unknown as number),
                auth_config_id: d.auth_config_id || "",
                env: d.env_code || d.env || "",
                is_enable: typeof d.is_enabled === "boolean" ? d.is_enabled : (typeof d.is_enable === "boolean" ? d.is_enable : true),
                base_url: d.config_json?.baseUrl || "",
                auth_type: d.auth_type_id || d.auth_type || undefined,
                client_id: d.config_json?.client_id || "",
                client_secret: d.config_json?.client_secret || "",
                token_url: d.config_json?.token_url || "",
                username: d.config_json?.username || "",
                password: d.config_json?.password || "",
              });
              if (d.provider_id != null) {
                const providerId = Number(d.provider_id);
                const providerName = d.provider_name || d.client_name || String(providerId);
                setSelectedProvider({
                  id: String(providerId),
                  title: providerName,
                  value: { provider_id: providerId, _uniqueKey: `provider-${providerId}` },
                } as any);
              } else {
                setSelectedProvider(null);
              }
            } else {
              onClose();
            }
          }} disabled={isLoading || configQuery.isLoading || isUpdatingStatus}>
            Cancel
          </button>
          {hasAnyPermission([RES_PERM_ACTION.AUTH_CONFIG_UPDATE]) && (!isEditing ? (
            <button type="button" className="wl-btn-primary-outline wl-btn-action wl-icon-pen" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }} disabled={isLoading || configQuery.isLoading || isUpdatingStatus}>
              Edit
            </button>
          ) : (
            <button type="submit" className="wl-btn-primary wl-width-160" disabled={isLoading || configQuery.isLoading || !isReadyToSubmit}>
              Update Configuration
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
            contentClassName='wl-modal-content d-flex flex-column my-cus-w' dialogClassName='my-cus-w' keyboard={false} backdropClassName="my-backdrop" style={{ zIndex: 99999 }}
          >
            <div className="wl-page-header wl-border-bottom-none p-3">
              <div className="wl-header-content">
                <div className="wl-header-title-container">
                  <span className="wl-title-sm">Disable Configuration</span>
                </div>
              </div>
            </div>
            <div className="d-flex flex-column gap-3 p-3">
              <span className="wl-body-sm">
                Are you sure you want to disable this configuration?
              </span>
              <div className="alert alert-warning mb-0" role="alert">
                <strong>Warning:</strong> This action will also disable the related api management
              </div>
            </div>
            <div className="d-flex justify-content-end align-items-center gap-2 p-3">
              <button type="button" className="wl-btn-primary-text" onClick={() => setShowDisableConfirm(false)} disabled={isUpdatingStatus}>
                Cancel
              </button>
              <button
                type="button"
                className="wl-btn-primary"
                disabled={isUpdatingStatus}
                onClick={() => {
                  if (!isEditing) {
                    // Non-editing mode: update status via API
                    updateStatus(
                      { config_ids: [configId], is_enable: false },
                      {
                        onSuccess: () => {
                          setValue("is_enable", false);
                          setShowDisableConfirm(false);
                        },
                      }
                    );
                  } else {
                    // Editing mode: just update the form value
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

export default UpdateAuthConfig;
