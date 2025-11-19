"use client";

import useApiPermissionMutation from "@/lib/hook/use-api-permission";
import { InfiniteScrollItem } from "@/lib/types/common";
import React, { useEffect } from "react";
import { Modal, Spinner } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import ApiDropdown from "./ApiDropdown";
import PartnerDropdown from "./PartnerDropdown";
import toast from "@/utils/toastService";
import { APIStatus } from "@/lib/enums/enums";

interface UpdateAPIPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRow: any;
}

interface FormData {
  partner: InfiniteScrollItem | null;
  api: InfiniteScrollItem | null;
  category: string | null;
  status: boolean;
}

const UpdateAPIPermissionModal: React.FC<UpdateAPIPermissionModalProps> = ({
  isOpen,
  onClose,
  selectedRow,
}) => {
  const initialPartner: InfiniteScrollItem | null = selectedRow
    ? {
        id: selectedRow.partner_id,
        title: selectedRow.partner_name,
        subtitle: selectedRow.partner_code,
        value: selectedRow.partner_id,
      }
    : null;
  const initialApi: InfiniteScrollItem | null = selectedRow
    ? {
        id: selectedRow.api_endpoint_id,
        title: selectedRow.api_endpoint_name,
        subtitle: selectedRow.api_endpoint_path,
        value: selectedRow.api_endpoint_id,
      }
    : null;
  const initialStatus: boolean = selectedRow
    ? selectedRow.status === "Enabled"
    : true;
  const initialCategoryName: string | null = selectedRow?.category_name ?? null;
  const initialCategoryId: number | null = selectedRow?.category_id ?? null;
  console.log("selectedRow", selectedRow);
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    setValue,
    reset,
    watch,
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      partner: initialPartner,
      api: initialApi,
      category: initialCategoryName,
      status: initialStatus,
    },
  });

  const { mutateAsync: updateApiPermission, isLoading } =
    useApiPermissionMutation.useUpdatedApiPermission();

  const [selectedCategoryId, setSelectedCategoryId] = React.useState<
    number | null
  >(initialCategoryId);

  useEffect(() => {
    reset({
      partner: initialPartner,
      api: initialApi,
      category: initialCategoryName,
      status: initialStatus,
    });
    setSelectedCategoryId(initialCategoryId);
  }, [isOpen, selectedRow]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (!selectedRow?.id && !selectedRow?.permission_id) {
        toast.error("Permission ID is required");
        return;
      }

      if (!data.api?.id) {
        toast.error("API is required");
        return;
      }

      if (!data.partner?.id) {
        toast.error("Partner is required");
        return;
      }
      if (!data.category || !selectedCategoryId) {
        toast.error("Category is required");
        return;
      }

      const requestBody = {
        api_permission_id: selectedRow.permission_id || selectedRow.id,
        partner_id: data.partner?.id,
        api_id: data.api.id,
        is_enabled: data.status,
      };

      await updateApiPermission(requestBody);
      handleClose();
    } catch (error) {
      console.log("Error updating API permission:", error as string);
    }
  };

  const handlePartnerSelect = (partner: InfiniteScrollItem) => {
    setValue("partner", partner, { shouldValidate: true });
    // Reset API to trigger refetch with new partner and current category
    setValue("api", null, { shouldValidate: true });
  };

  const handlePartnerClear = () => {
    setValue("partner", null, { shouldValidate: true });
  };

  const handleCategorySelect = (category: string) => {
    setValue("category", category, { shouldValidate: true });
    // Reset API when category changes
    setValue("api", null, { shouldValidate: true });
  };

  const handleCategorySelectObject = (category: {
    id: number;
    category_name: string;
  }) => {
    setSelectedCategoryId(category.id);
    // Reset API when category changes
    setValue("api", null, { shouldValidate: true });
  };

  const handleCategoryClear = () => {
    setValue("category", null, { shouldValidate: true });
    setSelectedCategoryId(null);
    // Reset API when category is cleared
    setValue("api", null, { shouldValidate: true });
  };

  // Helper to convert boolean to APIStatus
  function getStatusValue(checked: boolean) {
    return checked ? APIStatus.ENABLED : APIStatus.DISABLED;
  }

  return (
    <Modal
      show={isOpen}
      onHide={handleClose}
      centered
      size="xl"
      dialogClassName="wl-width-480"
      contentClassName="wl-modal-content d-flex flex-column wl-width-480"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Body>
        {/* Header */}
        <div
          className="wl-page-header wl-border-bottom-none "
          style={{ alignItems: "start", padding: 0 }}
        >
          <div className="wl-header-content">
            <div className="wl-header-title-container">
              <span className="wl-title-sm">Update APIs Permission</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="d-flex flex-column gap-4 ">
            <div className="d-flex flex-column gap-3">
              {/* Partner Dropdown */}
              <Controller
                name="partner"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <PartnerDropdown
                    selectedPartner={field.value}
                    onPartnerSelect={handlePartnerSelect}
                    onPartnerClear={handlePartnerClear}
                  />
                )}
              />
              {/* Category Dropdown */}
              {/* <Controller
                                name="category"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <CategoryDropdown
                                        selectedCategory={field.value}
                                        onCategorySelect={handleCategorySelect}
                                        onCategoryClear={handleCategoryClear}
                                        onCategorySelectObject={handleCategorySelectObject}
                                        showAddButton={false}
                                    />
                                )}
                            /> */}
              {/* API Dropdown */}
              <Controller
                name="api"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <ApiDropdown
                    selectedApi={field.value}
                    onApiSelect={(api) => field.onChange(api)}
                    onApiClear={() => field.onChange(null)}
                    disabled={!watch("partner") || !watch("category")}
                    partnerId={watch("partner")?.id}
                    categoryId={selectedCategoryId}
                  />
                )}
              />
              {/* Status Switch */}
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="enabledAPIsUpdate"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="enabledAPIsUpdate"
                    >
                      Enabled APIs
                    </label>
                  </div>
                )}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className="d-flex justify-content-end align-items-center gap-2 "
            style={{ paddingTop: "20px" }}
          >
            <button
              type="button"
              className="wl-btn-primary-text"
              onClick={handleClose}
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="wl-btn-primary"
              disabled={!isValid || isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  Saving
                  <Spinner
                    animation="border"
                    style={{ width: 20, height: 20 }}
                    role="status"
                  ></Spinner>
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateAPIPermissionModal;
