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
import { Action, Resource } from "@/lib/enums/permissionEnums";
import useApiPermissionMutation from "@/lib/hook/use-api-permission";
import { useColumnVisibility } from "@/lib/hook/use-column-visibility";
import usePermissions from "@/lib/hook/usePermissions";
import { usePopupStore } from "@/lib/store";
import { CustomColumnDef } from "@/lib/types/table";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";

const SearchComponent = dynamic(
  () => import("@/components/shared/SearchComponent")
);
const ColumnVisibility = dynamic(
  () => import("@/components/common/ColumnVisibility")
);

interface APIPermissionContainerProps {
  sessionData: any;
}

const columns: CustomColumnDef<any>[] = [
  {
    accessor: "partner_code",
    accessorKey: "partner_code",
    header: "PARTNER CODE",
    enableSorting: true,
    enableHiding: true,
    className: "wl-col-code",
  },
  {
    accessor: "partner_name",
    accessorKey: "partner_name",
    header: "PARTNER NAME",
    enableSorting: true,
    enableHiding: true,
    className: "wl-col-name",
  },
  {
    accessor: "category_name",
    accessorKey: "category_name",
    header: "API CATEGORY",
    enableSorting: true,
    enableHiding: true,
    className: "wl-col-name",
  },
  {
    accessor: "api_endpoint_name",
    accessorKey: "api_endpoint_name",
    header: "API NAME",
    enableSorting: true,
    enableHiding: true,
    className: "wl-col-name",
  },
  {
    accessor: "api_endpoint_path",
    accessorKey: "api_endpoint_path",
    header: "API URL",
    enableSorting: true,
    enableHiding: true,
    className: "wl-col-api",
  },
  {
    accessor: "update_at",
    accessorKey: "update_at",
    header: "LATEST MODIFY",
    enableSorting: true,
    enableHiding: true,
    className: "wl-col-timestamp",
    cell: ({ row }) =>
      row?.original?.update_at &&
      dayjs(row?.original?.update_at).format(DateFormatEnum.CUSTOM_DATE),
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
const APIPermissionContainer = ({
  sessionData,
}: APIPermissionContainerProps) => {
  const { openPopup, openNestedPopup } = usePopupStore();
  const { apiPermissionQuery } =
    useApiPermissionMutation.useFetchApiPermission();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [apiPermissionData, setApiPermissionData] = useState<any>([]);
  const { hasResourcePermission } = usePermissions();

  const { isLoading, columnVisibility, setColumnVisibility } =
    useColumnVisibility(columns, localStroageEnum.VEIWCOLUMN);

  useEffect(() => {
    if (apiPermissionQuery?.data) {
      setApiPermissionData(apiPermissionQuery?.data);
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [apiPermissionQuery.data, isInitialLoad]);

  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const handleRowSelect = (selected: any[]) => {
    setSelectedRows(selected as any[]);
  };

  const visibleColumnsList = columns.filter(
    (column) => columnVisibility[column.accessorKey]
  );

  if (isInitialLoad && apiPermissionQuery.isLoading) {
    return <UserPageSkelation />;
  }

  const filterOptions = [
    {
      id: "",
      label: "All",
      count: apiPermissionData?.api_permission_count_by_status?.total || 0,
    },
    {
      id: "1",
      label: "Enabled",
      count: apiPermissionData?.api_permission_count_by_status?.enabled || 0,
    },
    {
      id: "2",
      label: "Disabled",
      count: apiPermissionData?.api_permission_count_by_status?.disabled || 0,
    },
  ];
  return (
    <>
      <div className="w-100 h-100 d-flex flex-column gap-4 overflow-hidden">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-4 p-1">
          {/*TODO: Handle selectedRows action*/}
          <SelectRowAction
            selectedRows={selectedRows}
            actionType={RowActionEnum.API_PERMISSION}
            onSelectedRowsChange={setSelectedRows}
          />
          {selectedRows.length === 0 && (
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
            <SearchComponent placeholder="Search partner name, Code" />
            {hasResourcePermission(Resource.PARTNER, Action.CREATE) && (
              <button
                type="button"
                onClick={() =>
                  openPopup(PopupTypeEnum.API_PERMISSION_ASSIGN, {
                    onSuccess: () => setSelectedRows([]),
                  })
                }
                className="wl-btn-primary wl-btn-action wl-icon-plus"
                aria-label="Assign button"
              >
                {" "}
                Assign
              </button>
            )}
          </div>
        </div>
        <div className="w-100 px-1">
          <div className="row">
            <div className="col-3">
              <SummaryCard
                title={"Total APIs Permission"}
                value={
                  apiPermissionData?.api_permission_count
                    ?.total_api_permissions || 0
                }
              />
            </div>
            <div className="col-3">
              <SummaryCard
                title={"Enabled APIs"}
                value={
                  apiPermissionData?.api_permission_count?.enabled_apis || 0
                }
              />
            </div>
            <div className="col-3">
              <SummaryCard
                title={"Disabled APIs"}
                value={
                  apiPermissionData?.api_permission_count?.disabled_apis || 0
                }
              />
            </div>
            <div className="col-3">
              <SummaryCard
                title={"New APIs (Last 30 Days)"}
                value={
                  apiPermissionData?.api_permission_count
                    ?.new_apis_last30days || 0
                }
              />
            </div>
          </div>
        </div>
        <div className="d-flex flex-column mt-auto h-100 overflow-hidden">
          <FilterStatus filters={filterOptions} defaultFilter="" />
          {apiPermissionQuery?.data?.api_permissions?.length > 0 ? (
            <DataTable
              data={apiPermissionData?.api_permissions || []}
              columns={visibleColumnsList}
              isLoading={
                (!isInitialLoad && apiPermissionQuery.isLoading) || isLoading
              }
              enableSelection={
                hasResourcePermission(Resource.PARTNER, Action.UPDATE) && true
              }
              // actionItems={hasResourcePermission(Resource.USER, Action.UPDATE) ? actionItems : []}
              onRowSelect={handleRowSelect}
              onSelectAll={(allSelected: boolean) => {
                if (allSelected) {
                  const allPermissions =
                    apiPermissionData?.api_permissions || [];
                  handleRowSelect(allPermissions);
                } else {
                  handleRowSelect([]);
                }
              }}
              onRowClick={(row: any) => {
                openPopup(PopupTypeEnum.API_PERMISSION_INFO, {
                  selectedRowData: row,
                });
              }}
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
                    No API Permission created.
                  </span>
                  <label className="wl-caption opacity-50 text-center">
                    Please click 'Assign' at the top right to add one.
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Pagination Component - self-contained with URL parameter handling */}
          <PaginationComponent
            pagination={apiPermissionData?.pagination || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </>
  );
};

export default APIPermissionContainer;
