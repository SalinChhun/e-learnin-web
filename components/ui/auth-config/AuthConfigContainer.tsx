"use client";

import DataTable from "@/components/common/DataTable";
import DatePickerWrapper from "@/components/common/DatePickerWrapperProps";
import PaginationComponent from "@/components/common/PaginationComponent";
import UserPageSkelation from "@/components/loading/UserPageSkelation";
import FilterStatus from "@/components/shared/FilterStatus";
import LabelStatus from "@/components/shared/LabelStatus";
import SelectRowAction from "@/components/shared/SelectRowAction";
import SummaryCard from "@/components/shared/SummaryCard";
import CopyText from "@/components/common/CopyText";
import {
  DateFormatEnum,
  localStroageEnum,
  PopupTypeEnum,
  RowActionEnum,
  APIStatus,
} from "@/lib/enums/enums";
import { Action, RES_PERM_ACTION, Resource } from "@/lib/enums/permissionEnums";
import useAuthConfigMutation from "@/lib/hook/use-auth-config";
import { useColumnVisibility } from "@/lib/hook/use-column-visibility";
import usePermissions from "@/lib/hook/usePermissions";
import { usePopupStore } from "@/lib/store";
import { CustomColumnDef } from "@/lib/types/table";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import ModalPopup from "@/components/shared/ModalPopUp";
import CreateAuthConfig from "@/components/ui/auth-config/CreateAuthConfig";
import UpdateAuthConfig from "@/components/ui/auth-config/UpdateAuthConfig";
import AuthConfigDetails from "@/components/ui/auth-config/AuthConfigDetails";

const SearchComponent = dynamic(
  () => import("@/components/shared/SearchComponent")
);
const ColumnVisibility = dynamic(
  () => import("@/components/common/ColumnVisibility")
);

interface AuthConfigContainerProps {
  sessionData: any;
}

const columns: CustomColumnDef<any>[] = [
  {
    accessor: "auth_config_id",
    accessorKey: "auth_config_id",
    header: "AUTH CONFIG ID",
    enableSorting: true,
    enableHiding: false,
    className: "w-180",
    cell: ({ row }) => {
      const configId = row?.original?.auth_config_id?.toString() || "-";
      return <CopyText data={configId} message="Auth Config ID" />;
    },
  },
  {
    accessor: "config_name",
    accessorKey: "config_name",
    header: "CONFIGURATION NAME",
    enableSorting: true,
    enableHiding: true,
    className: "w-220",
  },
  {
    accessor: "provider_name",
    accessorKey: "client_name",
    header: "PROVIDER NAME",
    enableSorting: true,
    enableHiding: true,
    className: "w-180",
    cell: ({ row }) => row?.original?.provider_name || row?.original?.client_name || "-",
  },
  {
    accessor: "base_url",
    accessorKey: "base_url",
    header: "BASE URL",
    enableSorting: true,
    enableHiding: true,
    className: "w-220",
  },
  {
    accessor: "auth_type",
    accessorKey: "auth_type_name",
    header: "AUTHENTICATION TYPE",
    enableSorting: true,
    enableHiding: true,
    className: "w-220",
    cell: ({ row }) => {
      const v = (row?.original?.auth_type || "").toString().toLowerCase();
      if (v === "jwt" || v === "jwt token") return "JWT Token";
      if (v === "oauth2" || v === "oauth") return "OAuth2";
      if (v === "basic" || v === "basic auth") return "Basic Auth";
      return row?.original?.auth_type || "-";
    },
  },
  {
    accessor: "env",
    accessorKey: "env",
    header: "ENVIRONMENT",
    enableSorting: true,
    enableHiding: true,
    className: "w-180",
    cell: ({ row }) => {
      const e = (row?.original?.env || "").toString().toUpperCase();
      if (e === "PROD") return "Production";
      if (e === "DEV") return "Development";
      if (e === "STAGING") return "Staging";
      return row?.original?.env || "-";
    },
  },
  {
    accessor: "created_at",
    accessorKey: "created_at",
    header: "CREATED DATE",
    enableSorting: true,
    enableHiding: true,
    className: "wl-col-timestamp",
    cell: ({ row }) =>
      row?.original?.created_at &&
      dayjs(row?.original?.created_at).format(DateFormatEnum.CUSTOM_DATE),
  },
  {
    accessor: "updated_at",
    accessorKey: "updated_at",
    header: "UPDATED DATE",
    enableSorting: true,
    enableHiding: true,
    className: "wl-col-timestamp",
    cell: ({ row }) =>
      row?.original?.updated_at &&
      dayjs(row?.original?.updated_at).format(DateFormatEnum.CUSTOM_DATE),
  },
  {
    accessor: "status",
    accessorKey: "status",
    header: "STATUS",
    enableSorting: true,
    enableHiding: true,
    className: "wl-col-status",
    cell: ({ row }) => <LabelStatus status={row?.original?.status} />,
  },
];

// This is a Provider Component that receives session data as props
const AuthConfigContainer = ({
  sessionData,
}: AuthConfigContainerProps) => {
  const { openPopup, openNestedPopup } = usePopupStore();
  const { authConfigQuery } =
    useAuthConfigMutation.useFetchAuthConfig();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [authConfigData, setAuthConfigData] = useState<any>([]);
  const { hasAnyPermission } = usePermissions();

  const { isLoading, columnVisibility, setColumnVisibility } =
    useColumnVisibility(columns, localStroageEnum.VEIWCOLUMN);

  useEffect(() => {
    if (authConfigQuery?.data) {
      setAuthConfigData(authConfigQuery?.data);
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [authConfigQuery.data, isInitialLoad]);

  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showInfo, setShowInfo] = useState<{ open: boolean; row?: any }>({ open: false });
  const [showUpdate, setShowUpdate] = useState<{ open: boolean; id?: number }>({ open: false });

  const handleRowSelect = (selected: any[]) => {
    setSelectedRows(selected as any[]);
  };

  const visibleColumnsList = columns.filter(
    (column) => columnVisibility[column.accessorKey]
  );

  if (isInitialLoad && authConfigQuery.isLoading) {
    return <UserPageSkelation />;
  }

  const filterOptions = [
    {
      id: "",
      label: "All",
      count: authConfigData?.auth_config_count_by_date?.total_auth_configs || 0,
    },
    {
      id: "1",
      label: "Enabled",
      count: authConfigData?.auth_config_count_by_date?.total_active_auth_configs || 0,
    },
    {
      id: "2",
      label: "Disabled",
      count: authConfigData?.auth_config_count_by_date?.total_inactive_auth_configs || 0,
    },
  ];
  // Transform data to add id field for DataTable compatibility
  const tableData = (authConfigData?.auth_configs || []).map((config: any) => ({
    ...config,
    id: config.config_id?.toString() || config.id,
  }));

  return (
    <>
      <div className="w-100 h-100 d-flex flex-column gap-4 overflow-hidden">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-4 p-1">
          {/*TODO: Handle selectedRows action*/}
          {hasAnyPermission([RES_PERM_ACTION.AUTH_CONFIG_DELETE,RES_PERM_ACTION.AUTH_CONFIG_UPDATE]) && <SelectRowAction
            selectedRows={selectedRows}
            actionType={RowActionEnum.AUTH_CONFIG}
            onSelectedRowsChange={setSelectedRows}
            onEdit={(row: any) => setShowUpdate({ open: true, id: row?.config_id })}
          />}
          {(selectedRows.length === 0 || selectedRows.length > 0 && !hasAnyPermission([RES_PERM_ACTION.AUTH_CONFIG_DELETE,RES_PERM_ACTION.AUTH_CONFIG_UPDATE])) && (
            <div className="d-inline-flex align-items-center gap-2">
              <DatePickerWrapper
                storageKey={`${localStroageEnum.DATEPICK}-${sessionData?.user?.name}`}
              />
            </div>
          )}
          <div className="d-inline-flex align-items-center gap-2">
            <ColumnVisibility
              columns={columns}
              columnVisibility={columnVisibility}
              setColumnVisibility={setColumnVisibility}
              localStorageKey={localStroageEnum.VEIWCOLUMN}
            />
            <SearchComponent placeholder="Search config name, client name" />
            {hasAnyPermission([RES_PERM_ACTION.AUTH_CONFIG_CREATE]) && (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="wl-btn-primary wl-btn-action wl-icon-plus"
                aria-label="Create button"
              >
                {" "}
                Create
              </button>
            )}
          </div>
        </div>
        <div className="w-100 px-1">
          <div className="row">
            <div className="col-3">
              <SummaryCard
                title={"Total Configurations"}
                value={
                  authConfigData?.auth_config_count?.total_auth_configs || 0
                }
              />
            </div>
            <div className="col-3">
              <SummaryCard
                title={"Active Configurations"}
                value={
                  authConfigData?.auth_config_count?.total_active_auth_configs || 0
                }
              />
            </div>
            <div className="col-3">
              <SummaryCard
                title={"Inactive Configurations"}
                value={
                  authConfigData?.auth_config_count?.total_inactive_auth_configs || 0
                }
              />
            </div>
            <div className="col-3">
              <SummaryCard
                title={"New Configurations (Last 30 Days)"}
                value={
                  authConfigData?.auth_config_count?.total_new_auth_configs || 0
                }
              />
            </div>
          </div>
        </div>
        <div className="d-flex flex-column mt-auto h-100 overflow-hidden">
          <FilterStatus filters={filterOptions} defaultFilter="" />
          {tableData?.length > 0 ? (
            <DataTable
              data={tableData}
              columns={visibleColumnsList}
              isLoading={
                (!isInitialLoad && authConfigQuery.isLoading) || isLoading
              }
              enableSelection={true}
              selectedRowIds={selectedRows.map((row: any) => row.id?.toString())}
              onRowSelect={handleRowSelect}
              onSelectAll={(allSelected: boolean) => {
                if (allSelected) {
                  handleRowSelect(tableData);
                } else {
                  handleRowSelect([]);
                }
              }}
              onRowClick={(row: any) => setShowUpdate({ open: true, id: row?.config_id })}
            />
          ) : (
            <div className="h-100 d-flex justify-content-center align-items-center">
              <div className="d-flex flex-column justify-content-center align-items-center gap-3">
                <figure>
                  <Image
                    width={88}
                    height={64}
                    src="/icon/common/user-empty-state.svg"
                    alt="Icon image"
                  />
                </figure>
                <div className="d-flex flex-column wl-gap-2">
                  <span className="wl-body-sm text-center">
                    No Auth Config created.
                  </span>
                  <label className="wl-caption opacity-50 text-center">
                    Please click 'Create' at the top right to add one.
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Pagination Component - self-contained with URL parameter handling */}
          <PaginationComponent
            pagination={authConfigData?.pagination || []}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Local modals without global popup manager */}
      {showCreate && (
        <CreateAuthConfig isOpen={showCreate} handleClose={() => setShowCreate(false)} />
      )}

      <ModalPopup
        isOpen={showInfo.open}
        onClose={() => setShowInfo({ open: false })}
        title="Auth Config Details"
        width="wl-width-720"
      >
        {showInfo.row && (
          <div className="d-flex flex-column gap-3">
            <AuthConfigDetails selectedRowData={showInfo.row} />
            {hasAnyPermission([RES_PERM_ACTION.AUTH_CONFIG_UPDATE]) && (
              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="wl-btn-secondary"
                  onClick={() => {
                    setShowInfo({ open: false });
                    setShowUpdate({ open: true, id: showInfo.row?.config_id });
                  }}
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        )}
      </ModalPopup>

      {showUpdate.open && showUpdate.id != null && (
        <UpdateAuthConfig isOpen={showUpdate.open} handleClose={() => setShowUpdate({ open: false })} configId={showUpdate.id} />
      )}
    </>
  );
};

export default AuthConfigContainer;

