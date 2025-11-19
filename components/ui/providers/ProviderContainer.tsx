"use client";

import dynamic from "next/dynamic";
import SummaryCard from "@/components/shared/SummaryCard";
import {DateFormatEnum, localStroageEnum, PopupTypeEnum, RowActionEnum, StatusEnum,} from "@/lib/enums/enums";
import {usePopupStore} from "@/lib/store";
import FilterStatus from "@/components/shared/FilterStatus";
import Image from "next/image";
import React, {useEffect, useState} from "react";
import {User} from "@/lib/types/user";
import DataTable, {ActionMenuItem} from "@/components/common/DataTable";
import {CustomColumnDef} from "@/lib/types/table";
import {useColumnVisibility} from "@/lib/hook/use-column-visibility";
import PaginationComponent from "@/components/common/PaginationComponent";
import SelectRowAction from "@/components/shared/SelectRowAction";
import DatePickerWrapper from "@/components/common/DatePickerWrapperProps";
import {Provider} from "@/lib/types/provider";
import useProviderMutation from "@/lib/hook/use-provider-mutation";
import UserPageSkelation from "@/components/loading/UserPageSkelation";
import LabelStatus from "@/components/shared/LabelStatus";
import {formatPhoneNumber} from "@/utils/utils";
import {Action, RES_PERM_ACTION, Resource} from "@/lib/enums/permissionEnums";
import usePermissions from "@/lib/hook/usePermissions";
import dayjs from "dayjs";

const SearchComponent = dynamic(
  () => import("@/components/shared/SearchComponent")
);
const ColumnVisibility = dynamic(
  () => import("@/components/common/ColumnVisibility")
);

// Sample column definitions using your ColumnDef interface
const columns: CustomColumnDef<Provider>[] = [
  {
    accessor: "name",
    accessorKey: "name",
    header: "Provider Name",
    enableSorting: true,
    enableHiding: true,
    className: "wl-col-business-type",
  },
  {
    accessor: "email",
    accessorKey: "email",
    header: "Email",
    enableSorting: true,
    enableHiding: true,
    className: "wl-col-mobile-no",
  },
  {
    accessor: "phone",
    accessorKey: "phone",
    header: "Mobile Number",
    enableSorting: true,
    enableHiding: true,
    className: "wl-col-mobile-no",
    cell: ({ row }) => (
      <span>{formatPhoneNumber(row?.original?.phone, "855")}</span>
    ),
  },
  {
    accessor: "description",
    accessorKey: "description",
    header: "Description",
    enableSorting: true,
    enableHiding: true,
    className: "wl-col-mobile-no",
  },
  {
    accessor: "created_at",
    accessorKey: "created_at",
    header: "Create Date",
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
    header: "Update Date",
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
    header: "Status",
    enableSorting: true,
    enableHiding: true,
    className: "wl-col-status",
    cell: ({ row }) => <LabelStatus status={row?.original?.status} />,
  },
];
interface UsersContainerClientProps {
  sessionData: any; // Type this properly based on your session structure
}

export default function ProviderContainer({
  sessionData,
}: UsersContainerClientProps) {
  const { openPopup } = usePopupStore();
  const { providerQuery } = useProviderMutation.useFetchProviders();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [providerData, setProviderData] = useState<any>([]);

  const { hasAnyPermission } = usePermissions();

  const { isLoading, columnVisibility, setColumnVisibility } =
    useColumnVisibility(columns, localStroageEnum.VEIWCOLUMN);

  useEffect(() => {
    if (providerQuery?.data) {
      setProviderData(providerQuery?.data);
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [providerQuery.data, isInitialLoad]);

  // Example filter data
  const filterOptions = [
    {
      id: "",
      label: "All",
      count: providerData?.provider_count_by_date?.total_providers || "0",
    },
    {
      id: "1",
      label: "Active",
      count: providerData?.provider_count_by_date?.total_active_providers || "0",
    },
    {
      id: "2",
      label: "Inactive",
      count: providerData?.provider_count_by_date?.total_inactive_providers || "0",
    },
  ];

  // Selected rows state
  const [selectedRows, setSelectedRows] = useState<User[]>([]);

  // Handlers for row selection
  const handleRowSelect = (selected: any[]) => {
    setSelectedRows(selected as User[]);
  };

  // Filter visible columns
  const visibleColumnsList = columns.filter(
    (column) => columnVisibility[column.accessorKey]
  );

  const actionItems: ActionMenuItem[] = [
    {
      label: "Edit",
      icon: "wl-icon-pen",
      action: (row) =>
        openPopup(PopupTypeEnum.UPDATE_PARTNER, { selectedRow: row }),
    },
    {
      label: "Reactivate Provider",
      icon: "wl-icon-reactive",
      action: (row) =>
        openPopup(PopupTypeEnum.REACTIVATE_PARTNER, {
          title: "Reactivate Provider",
          description: `Are you sure want to reactivate <strong>${row?.name}</strong>?`,
          selectedRows: [row],
          actionType: RowActionEnum.PARTNER,
        }),
      modalTarget: "ReactivateUserModalId",
      hideWhen: (row) => row.status === StatusEnum.ACTIVE,
    },
    {
      label: "Deactivate Provider",
      icon: "wl-icon-trash",
      action: (row) =>
        openPopup(PopupTypeEnum.INACTIVATE_PARTNER, {
          title: "Deactivate Provider",
          description: `Are you sure want to deactivate <strong>${row?.name}</strong>?`,
          selectedRows: [row],
          actionType: RowActionEnum.PARTNER,
        }),
      hideWhen: (row) => row.status === StatusEnum.INACTIVE,
    },
  ];

  if (isInitialLoad && providerQuery.isLoading) {
    return <UserPageSkelation />;
  }

  return (
    <div className="w-100 h-100 d-flex flex-column gap-4 overflow-hidden">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-4 p-1">
        {/*TODO: Handle selectedRows action*/}
        {hasAnyPermission([RES_PERM_ACTION.PROVIDER_DELETE,RES_PERM_ACTION.PROVIDER_UPDATE]) && <SelectRowAction
          selectedRows={selectedRows}
          actionType={RowActionEnum.PARTNER}
          onSelectedRowsChange={setSelectedRows}
          onEdit={(row: any) =>
            openPopup(PopupTypeEnum.UPDATE_PARTNER, {
              selectedRow: row,
              onSuccess: () => setSelectedRows([]),
            })
          }
        />}
        {(selectedRows.length === 0 || selectedRows.length > 0 && !hasAnyPermission([RES_PERM_ACTION.PROVIDER_DELETE,RES_PERM_ACTION.PROVIDER_UPDATE])) && (
          <div className="d-inline-flex align-items-center gap-2">
            {/*TODO: Implement DatePickerWrapper component*/}
            <DatePickerWrapper
              storageKey={`${localStroageEnum.DATEPICK}-${sessionData?.user.id}`}
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
          <SearchComponent placeholder="Search provider name" />
          {/* TODO: Modal: CreateUserModalId, CreateUserWithSystemPasswordModalId, CreateUserWithInputErrorModalId */}
          {hasAnyPermission([RES_PERM_ACTION.PROVIDER_CREATE]) && (
            <button
              type="button"
              onClick={() => openPopup(PopupTypeEnum.CREATE_PARTNER)}
              className="wl-btn-primary wl-btn-action wl-icon-plus"
              aria-label="Create button"
            >
              Create
            </button>
          )}
        </div>
      </div>
      <div className="w-100 px-1">
        <div className="row">
          <div className="col-4">
            <SummaryCard
              title={"Total Providers"}
              value={providerData?.provider_count?.total_providers || "0"}
            />
          </div>
          <div className="col-4">
            <SummaryCard
              title={"Active Providers"}
              value={providerData?.provider_count?.total_active_providers || "0"}
            />
          </div>
          <div className="col-4">
            <SummaryCard
              title={"Inactive Providers"}
              value={providerData?.provider_count?.total_inactive_providers || "0"}
            />
          </div>
        </div>
      </div>
      <div className="d-flex flex-column mt-auto h-100 overflow-hidden">
        <FilterStatus filters={filterOptions} defaultFilter="" />

        {providerData?.providers?.length > 0 ? (
          <DataTable
            data={providerData?.providers}
            columns={visibleColumnsList}
            isLoading={(!isInitialLoad && providerQuery.isLoading) || isLoading}
            enableSelection={
              true
            } // or true if you need selection
            actionItems={
              hasAnyPermission([RES_PERM_ACTION.PROVIDER_DELETE,RES_PERM_ACTION.PROVIDER_UPDATE]) ? actionItems : [] as ActionMenuItem[]
            }
            onRowSelect={handleRowSelect}
            onSelectAll={(allSelected: boolean) => {
              if (allSelected) {
                const allClients = providerData?.providers || [];
                handleRowSelect(allClients);
              } else {
                handleRowSelect([]);
              }
            }}
            onRowClick={(row: any) => {
              openPopup(PopupTypeEnum.PARTNER_DETAILS, {
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
                <span className="wl-body-sm text-center">No user created.</span>
                <label className="wl-caption opacity-50 text-center">
                  Please click ‘Create' at the top right to add one.
                </label>
              </div>
            </div>
          </div>
        )}
        {/* Pagination Component - self-contained with URL parameter handling */}
        <PaginationComponent
          pagination={providerQuery?.data?.pagination || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
