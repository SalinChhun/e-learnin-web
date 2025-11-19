// components/modals/AssignApiPermissionModal.tsx

"use client";

import { InfiniteScrollItem } from "@/lib/types/common";
import React from "react";
import { Modal, Spinner } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import ApiDropdown from "./ApiDropdown";
import PartnerDropdown from "./PartnerDropdown";
import useApiPermissionMutation from "@/lib/hook/use-api-permission";
import toast from "@/utils/toastService";

interface FormData {
  partner: InfiniteScrollItem | null;
  api: InfiniteScrollItem | null;
  category: string | null;
  status: boolean;
}

interface AssignApiPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AssignApiPermissionModal: React.FC<AssignApiPermissionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      partner: null,
      api: null,
      category: null,
      status: true,
    },
  });

  // Call the hook at component level
  const { mutation: createApiPermission, isPending } =
    useApiPermissionMutation.useCreateApiPermission();

  // Track selected category id for submission
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<
    number | null
  >(null);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handlePartnerSelect = (partner: InfiniteScrollItem) => {
    setValue("partner", partner, { shouldValidate: true });
    // Reset API to trigger refetch with new partner and current category
    setValue("api", null, { shouldValidate: true });
  };

  const handlePartnerClear = () => {
    setValue("partner", null, { shouldValidate: true });
    setValue("api", null, { shouldValidate: true });
  };

  const handleApiSelect = (api: InfiniteScrollItem) => {
    setValue("api", api, { shouldValidate: true });
  };

  const handleApiClear = () => {
    setValue("api", null, { shouldValidate: true });
  };

  const handleCategorySelect = (category: string) => {
    setValue("category", category, { shouldValidate: true });
    // Reset API selection when category changes
    setValue("api", null, { shouldValidate: true });
  };

  const handleCategorySelectObject = (category: {
    id: number;
    category_name: string;
  }) => {
    setSelectedCategoryId(category.id);
    // Reset API selection when category changes
    setValue("api", null, { shouldValidate: true });
  };

  const handleCategoryClear = () => {
    setValue("category", null, { shouldValidate: true });
    setSelectedCategoryId(null);
    // Reset API selection when category is cleared
    setValue("api", null, { shouldValidate: true });
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (!data.partner?.id || !data.api?.id || !data.category) {
        toast.error("Partner, API, and Category are required");
        return;
      }
      const requestBody = {
        partner_id: data.partner.id,
        api_id: data.api.id,
        is_enabled: data.status,
      };

      // Use the mutation with onSuccess callback
      createApiPermission(requestBody, {
        onSuccess: (responseData) => {
          // Custom success handling
          console.log("API permission created successfully:", responseData);

          // Reset form after successful creation
          reset();

          // Call the onSuccess callback passed from parent
          onSuccess?.();
        },
      });
    } catch (error) {
      console.log("Error submitting form:", error);
    }
  };

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
              <span className="wl-title-sm">Register APIs Permission</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="d-flex flex-column gap-4 ">
            <div className="d-flex flex-column gap-3">
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

              <Controller
                name="api"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <ApiDropdown
                    selectedApi={field.value}
                    onApiSelect={handleApiSelect}
                    onApiClear={handleApiClear}
                    disabled={!watch("partner") || !watch("category")}
                    partnerId={watch("partner")?.id}
                    categoryId={selectedCategoryId}
                  />
                )}
              />

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="enabledAPIs"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="enabledAPIs">
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
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="wl-btn-primary"
              disabled={!isValid || isPending}
            >
              {isPending ? (
                <>
                  Assigning{" "}
                  <Spinner
                    animation="border"
                    style={{ width: 20, height: 20 }}
                    role="status"
                  ></Spinner>{" "}
                </>
              ) : (
                "Assign Permission"
              )}
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default AssignApiPermissionModal;
