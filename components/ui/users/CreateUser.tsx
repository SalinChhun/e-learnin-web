"use client";
import SelectComponent from "@/components/shared/SelectComponent";
import UploadImage from "@/components/shared/UploadImage";
import UsernameInput from "@/components/shared/UsernameInput";
import PasswordInput from "@/components/ui/users/PasswordInput";
import useRoleMutation from "@/lib/hook/use-role-mutation";
import useUserMutation from "@/lib/hook/use-user-mutation";
import fileService from "@/service/file-upload.service";
import "@/styles/custom.css";
import toast from "@/utils/toastService";
import { createUserSchema } from "@/validators/create-user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Spinner } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { RoleEnum, UserStatusEnum } from "@/lib/enums/enums";
import { useEffect } from "react";

interface Props {
  isOpen: boolean;
  handleClose: () => void;
}

export default function CreateUser({ isOpen, handleClose }: Props) {
  const userMutation = useUserMutation.useCreateUser();
  const { roleQuery } = useRoleMutation.useFetchRoles();
  const role = roleQuery?.data?.find(
    (role: any) => role.name?.toLowerCase() === RoleEnum.USER.toLowerCase()
  )?.id;

  // TODO: use form handler
  type CreateUserFormData = z.infer<typeof createUserSchema>;
  const {
    register,
    watch,
    resetField,
    reset,
    handleSubmit,
    trigger,
    setValue,
    control,
    formState: { errors, isSubmitSuccessful, isSubmitted },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver<any>(createUserSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      full_name: "",
      department: "",
      email: "",
      username: "",
      password: "",
      confirm_password: "",
      role: "",
      status: UserStatusEnum.ACTIVE,
      is_generated_password: false,
      image: "",
    },
  });

  //TODO: Set default role value
  useEffect(() => {
    const userRoleId = roleQuery?.data?.find(
      (role: any) => role.name?.toLowerCase() === RoleEnum.USER.toLowerCase()
    )?.id;

    if (userRoleId) {
      setValue("role", userRoleId);
    }
  }, [roleQuery.data, setValue]);

  const onSubmit = async (data: any) => {
    //TODO: Upload image
    let image = "";
    if (data.image && data.image.length > 0) {
      try {
        const fileResponse = await fileService.uploadImage(data.image[0]);
        image = fileResponse.data.data.image_url;
      } catch (error) {
        toast.error("Upload image failed");
        return;
      }
    }

    const requestBody = {
      full_name: data.full_name,
      email: data.email,
      role_id: data.role,
      username: data.username,
      password: data.password,
      department: data.department,
      status: data.status,
      image: image,
      system_generate: data.is_generated_password,
    };
    userMutation.mutation(requestBody);
    reset();
  };

  const isEnglishOnly = (text: string): boolean => {
    return /^[a-zA-Z0-9_ ]+$/.test(text);
  };

  const generateUsername = (fullName: string) => {
    if (!fullName) return "";
    return fullName.replace(/\s+/g, "_").toLowerCase();
  };

  const handleFullNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const fullName = e.target.value;
    if (fullName && isEnglishOnly(fullName)) {
      const username = generateUsername(fullName);
      setValue("username", username);
    }
  };

  return (
    <Modal
      contentClassName="wl-width-480 modal-content wl-modal-content d-flex flex-column"
      show={isOpen}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="wl-page-header wl-border-bottom-none p-3">
          <div className="wl-header-content">
            <div className="wl-header-title-container">
              <span className="wl-title-sm">Create User</span>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column gap-4 p-3">
          {/*TODO: Upload Image*/}
          <UploadImage
            register={register}
            errors={errors}
            name="image"
            setValue={setValue}
          />

          <div className="d-flex flex-column gap-3">
            <div className="row">
              <div className="col-12">
                <div className="wl-input-container">
                  <span className="wl-input-title wl-text-primary">
                    Full Name <span className="wl-input-required">*</span>
                  </span>
                  <div className="wl-position-relative">
                    <input
                      type="text"
                      className="w-100"
                      placeholder="Enter Full Name"
                      {...register("full_name")}
                      onBlur={handleFullNameBlur}
                    />
                    <span
                      onClick={() => setValue("full_name", "")}
                      className="wl-clear-btn"
                    ></span>
                  </div>
                </div>
              </div>
              {errors?.full_name && (
                <span className="text-danger">
                  {errors?.full_name?.message}
                </span>
              )}
            </div>

            <div className="row">
              <div className="col-12">
                <div className="wl-input-container">
                  <span className="wl-input-title wl-text-primary">
                    Department
                  </span>
                  <div className="wl-position-relative">
                    <input
                      type="text"
                      className="w-100"
                      placeholder="Sales, Operation, etc."
                      {...register("department")}
                    />
                    <span
                      onClick={() => setValue("department", "")}
                      className="wl-clear-btn"
                    ></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="wl-input-container">
                  <span className="wl-input-title wl-text-primary">
                    Email Address
                    <span className="wl-input-required">*</span>
                  </span>
                  <div className="wl-position-relative">
                    <input
                      type="email"
                      className="w-100"
                      placeholder="example@mail.com"
                      {...register("email")}
                    />
                    <span
                      onClick={() => setValue("email", "")}
                      className="wl-clear-btn"
                    ></span>
                  </div>
                </div>
              </div>
              {errors?.email && (
                <span className="text-danger">{errors?.email?.message}</span>
              )}
            </div>

            {/*TODO: Username Input*/}
            <UsernameInput
              register={register}
              errors={errors}
              trigger={trigger}
              name="username"
              setValue={setValue}
              watch={watch}
            />

            {/*TODO: Password input*/}
            <PasswordInput
              register={register}
              errors={errors}
              name="password"
              setValue={setValue}
              watch={watch}
            />

            {/*TODO: Role selection*/}
            <div className="row">
              <div className="col-12">
                <div className="wl-input-container">
                  <span className="wl-input-title wl-text-primary">
                    Role <span className="wl-input-required">*</span>
                  </span>
                  <SelectComponent
                    control={control}
                    register={register}
                    errors={errors}
                    name="role"
                    options={
                      roleQuery?.data?.map((item: any) => ({
                        value: item?.id,
                        label: item?.name,
                      })) || []
                    }
                    defaultValue={role || ""}
                  />
                </div>
              </div>
            </div>

            {/*TODO: Status selection*/}
            <div className="row">
              <div className="col-12">
                <div className="wl-input-container">
                  <span className="wl-input-title wl-text-primary">
                    Status <span className="wl-input-required">*</span>
                  </span>
                  <SelectComponent
                    control={control}
                    register={register}
                    errors={errors}
                    name="status"
                    options={[
                      { value: UserStatusEnum.ACTIVE, label: "Active" },
                      { value: UserStatusEnum.INACTIVE, label: "Inactive" },
                    ]}
                    defaultValue={UserStatusEnum.ACTIVE}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end align-items-center gap-2 p-3">
          <button
            data-bs-dismiss="modal"
            type="button"
            className="wl-btn-primary-text"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            disabled={userMutation.isLoading}
            type="submit"
            className="wl-btn-primary wl-width-100"
          >
            {userMutation.isLoading ? (
              <Spinner
                animation="border"
                style={{ width: 18, height: 18 }}
                role="status"
              ></Spinner>
            ) : (
              "Create User"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
