"use client";

import DataTable from "@/components/common/DataTable";
import DatePickerWrapper from "@/components/common/DatePickerWrapperProps";
import PaginationComponent from "@/components/common/PaginationComponent";
import UserPageSkelation from "@/components/loading/UserPageSkelation";
import FilterStatus from "@/components/shared/FilterStatus";
import LabelStatus from "@/components/shared/LabelStatus";
import SelectRowAction from "@/components/shared/SelectRowAction";
import SummaryCard from "@/components/shared/SummaryCard";
import {
  DateFormatEnum,
  localStroageEnum,
  PopupTypeEnum,
  RowActionEnum,
  APIStatus,
} from "@/lib/enums/enums";
import { Action, RES_PERM_ACTION, Resource } from "@/lib/enums/permissionEnums";
import useApiManagementMutation from "@/lib/hook/use-api-management";
import { useColumnVisibility } from "@/lib/hook/use-column-visibility";
import usePermissions from "@/lib/hook/usePermissions";
import { usePopupStore } from "@/lib/store";
import { CustomColumnDef } from "@/lib/types/table";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import ModalPopup from "@/components/shared/ModalPopUp";
import CreateApiManagement from "@/components/ui/api-management/CreateApiManagement";
import UpdateApiManagement from "@/components/ui/api-management/UpdateApiManagement";
import ApiManagementDetails from "@/components/ui/api-management/ApiManagementDetails";

const SearchComponent = dynamic(
  () => import("@/components/shared/SearchComponent")
);
const ColumnVisibility = dynamic(
  () => import("@/components/common/ColumnVisibility")
);

interface ApiManagementContainerProps {
  sessionData: any;
}

const columns: CustomColumnDef<any>[] = [
  {
    accessor: "provider_name",
    accessorKey: "providerName",
    header: "PROVIDER NAME",
    enableSorting: true,
    enableHiding: true,
    className: "w-150",
    cell: ({ row }) => {
      const providerName = row?.original?.provider_name || "";
      return (
        <span className="text-truncate d-inline-block" style={{ maxWidth: "120px" }} title={providerName}>
          {providerName}
        </span>
      );
    },
  },
  {
    accessor: "method",
    accessorKey: "method",
    header: "METHOD",
    enableSorting: true,
    enableHiding: true,
    className: "w-150",
    cell: ({ row }) => {
      const method = row?.original?.method || "";
      return method || "-";
    },
  },
  {
    accessor: "url_endpoint",
    accessorKey: "urlEndpoint",
    header: "URL ENDPOINT",
    enableSorting: true,
    enableHiding: true,
    className: "w-240",
    cell: ({ row }) => {
      const url = row?.original?.url_endpoint || "";
      return (
        <span className="text-truncate d-inline-block" style={{ maxWidth: "200px" }} title={url}>
          {url}
        </span>
      );
    },
  },
  {
    accessor: "auth_config_name",
    accessorKey: "authConfigName",
    header: "AUTHENTICATION NAME",
    enableSorting: true,
    enableHiding: true,
    className: "w-220",
    cell: ({ row }) => {
      const authConfigName = row?.original?.auth_config_name || "";
      return (
        <span className="text-truncate d-inline-block" style={{ maxWidth: "150px" }} title={authConfigName}>
          {authConfigName}
        </span>
      );
    },
  },
  {
    accessor: "description",
    accessorKey: "description",
    header: "DESCRIPTION",
    enableSorting: true,
    enableHiding: true,
    className: "w-220",
    cell: ({ row }) => {
      const description = row?.original?.description || "";
      return (
        <span className="text-truncate d-inline-block" style={{ maxWidth: "150px" }} title={description}>
          {description}
        </span>
      );
    },
  },
  {
    accessor: "service_id",
    accessorKey: "serviceId",
    header: "SERVICE ID",
    enableSorting: true,
    enableHiding: true,
    className: "w-200",
    cell: ({ row }) => row?.original?.service_id || "-",
  },
  {
    accessor: "last_modify",
    accessorKey: "lastModify",
    header: "LATEST MODIFY",
    enableSorting: true,
    enableHiding: true,
    className: "w-200",
    cell: ({ row }) =>
      row?.original?.last_modify &&
      dayjs(row?.original?.last_modify).format(DateFormatEnum.CUSTOM_DATE),
  },
  {
    accessor: "modify_by",
    accessorKey: "modifyBy",
    header: "MODIFY BY",
    enableSorting: true,
    enableHiding: true,
    className: "w-200",
    cell: ({ row }) => row?.original?.modify_by || "-",
  },
  {
    accessor: "status",
    accessorKey: "status",
    header: "STATUS",
    enableSorting: true,
    enableHiding: true,
    className: "w-150",
    cell: ({ row }) => <LabelStatus status={row?.original?.status} />,
  },
];


/**
 * API Management Container Component
 * Main container for managing API configurations
 */
const ApiManagementContainer = ({
  sessionData,
}: ApiManagementContainerProps) => {
  const { openPopup, openNestedPopup } = usePopupStore();
  const { apiManagementQuery } =
    useApiManagementMutation.useFetchApiManagement();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [apiManagementData, setApiManagementData] = useState<any>([]);
  const { hasAnyPermission } = usePermissions();

  const { isLoading, columnVisibility, setColumnVisibility } =
    useColumnVisibility(columns, localStroageEnum.VEIWCOLUMN);

  useEffect(() => {
    if (apiManagementQuery?.data) {
      setApiManagementData(apiManagementQuery?.data);
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [apiManagementQuery.data, isInitialLoad]);

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

  if (isInitialLoad && apiManagementQuery.isLoading) {
    return <UserPageSkelation />;
  }

  const filterOptions = [
    {
      id: "",
      label: "All",
      count: apiManagementData?.api_management_count_by_date?.total_api_managements || 0,
    },
    {
      id: "1",
      label: "Enabled",
      count: apiManagementData?.api_management_count_by_date?.total_active_api_managements || 0,
    },
    {
      id: "2",
      label: "Disabled",
      count: apiManagementData?.api_management_count_by_date?.total_inactive_api_managements || 0,
    },
  ];

  // Transform data to add id field for DataTable compatibility
  const tableData = (apiManagementData?.api_managements || []).map((config: any) => ({
    ...config,
    id: config.config_id?.toString() || config.id,
  }));

  return (
    <>
      <div className="w-100 h-100 d-flex flex-column gap-4 overflow-hidden">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-4 p-1">
          {/* Row Actions */}
          {hasAnyPermission([RES_PERM_ACTION.API_MANAGEMENT_DELETE,RES_PERM_ACTION.API_MANAGEMENT_UPDATE]) && <SelectRowAction
            selectedRows={selectedRows}
            actionType={RowActionEnum.API_MANAGEMENT}
            onSelectedRowsChange={setSelectedRows}
            onEdit={(row: any) => setShowUpdate({ open: true, id: row?.config_id })}
          />}
          {(selectedRows.length === 0 || selectedRows.length > 0 && !hasAnyPermission([RES_PERM_ACTION.API_MANAGEMENT_DELETE,RES_PERM_ACTION.API_MANAGEMENT_UPDATE])) && (
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
            <SearchComponent placeholder="Search provider name, au..." />
            {hasAnyPermission([RES_PERM_ACTION.API_MANAGEMENT_CREATE]) && (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="wl-btn-primary wl-btn-action wl-icon-plus"
                aria-label="Create button"
              >
                Register API
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="w-100 px-1">
          <div className="row">
            <div className="col-3">
              <SummaryCard
                title={"Total APIs"}
                value={
                  apiManagementData?.api_management_count?.total_api_managements || 0
                }
              />
            </div>
            <div className="col-3">
              <SummaryCard
                title={"Enabled APIs"}
                value={
                  apiManagementData?.api_management_count?.total_active_api_managements || 0
                }
              />
            </div>
            <div className="col-3">
              <SummaryCard
                title={"Disabled APIs"}
                value={
                  apiManagementData?.api_management_count?.total_inactive_api_managements || 0
                }
              />
            </div>
            <div className="col-3">
              <SummaryCard
                title={"New APIs (Last 30 Days)"}
                value={
                  apiManagementData?.api_management_count?.total_new_api_managements || 0
                }
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="d-flex flex-column mt-auto h-100 overflow-hidden">
          <FilterStatus filters={filterOptions} defaultFilter="" />
          {tableData?.length > 0 ? (
            <DataTable
              data={tableData}
              columns={visibleColumnsList}
              isLoading={
                (!isInitialLoad && apiManagementQuery.isLoading) || isLoading
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
                    No API Management created.
                  </span>
                  <label className="wl-caption opacity-50 text-center">
                    Please click 'Register API' at the top right to add one.
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Pagination Component */}
          <PaginationComponent
            pagination={apiManagementData?.pagination || []}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Local modals without global popup manager */}
      {showCreate && (
        <CreateApiManagement isOpen={showCreate} handleClose={() => setShowCreate(false)} />
      )}

      <ModalPopup
        isOpen={showInfo.open}
        onClose={() => setShowInfo({ open: false })}
        title="APIs Management Details"
        width="wl-width-720"
      >
        {showInfo.row && (
          <div className="d-flex flex-column gap-3">
            <ApiManagementDetails selectedRowData={showInfo.row} />
            {hasAnyPermission([RES_PERM_ACTION.API_MANAGEMENT_UPDATE]) && (
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
        <UpdateApiManagement 
          isOpen={showUpdate.open} 
          handleClose={() => setShowUpdate({ open: false })} 
          apiId={showUpdate.id} 
        />
      )}
    </>
  );
};

export default ApiManagementContainer;
