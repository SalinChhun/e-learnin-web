'use client'

import DataTable, { ActionMenuItem } from '@/components/common/DataTable';
import DatePickerWrapper from '@/components/common/DatePickerWrapperProps';
import PaginationComponent from '@/components/common/PaginationComponent';
import UserPageSkelation from '@/components/loading/UserPageSkelation';
import FilterStatus from '@/components/shared/FilterStatus';
import LabelStatus from '@/components/shared/LabelStatus';
import SelectRowAction from "@/components/shared/SelectRowAction";
import SummaryCard from '@/components/shared/SummaryCard';
import { DateFormatEnum, localStroageEnum, PopupTypeEnum, RowActionEnum, StatusEnum } from '@/lib/enums/enums';
import { Action, RES_PERM_ACTION, Resource } from '@/lib/enums/permissionEnums';
import { useColumnVisibility } from '@/lib/hook/use-column-visibility';
import useUserMutation from "@/lib/hook/use-user-mutation";
import usePermissions from '@/lib/hook/usePermissions';
import { usePopupStore } from '@/lib/store';
import { CustomColumnDef } from '@/lib/types/table';
import { User } from '@/lib/types/user';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useState } from 'react';


const SearchComponent = dynamic(() => import('@/components/shared/SearchComponent'))
const ColumnVisibility = dynamic(() => import('@/components/common/ColumnVisibility'))

interface UsersContainerClientProps {
    sessionData: any; 
}

const columns: CustomColumnDef<User>[] = [
    {
        accessor: 'full_name',
        accessorKey: 'full_name',
        header: 'Full Name',
        enableSorting: true,
        enableHiding: true,
        className: 'wl-col-name',
    },
    {
        accessor: 'username',
        accessorKey: 'username',
        header: 'Username',
        enableSorting: true,
        enableHiding: true,
        className: 'wl-col-username',
    },
    {
        accessor: 'department',
        accessorKey: 'department',
        header: 'Department',
        enableSorting: true,
        enableHiding: true,
        className: 'wl-col-username',
    },
    {
        accessor: 'email',
        accessorKey: 'email',
        header: 'Email Address',
        enableSorting: true,
        enableHiding: true,
        className: 'wl-col-email',
    },
    {
        accessor: 'role',
        accessorKey: 'role',
        header: 'Role',
        enableSorting: true,
        enableHiding: true,
        className: 'wl-col-role',
    },
    {
        accessor: 'created_at',
        accessorKey: 'created_at',
        header: 'Created Date',
        enableSorting: true,
        enableHiding: true,
        className: 'wl-col-login',
        cell: ({row}) => row?.original?.created_at && dayjs(row?.original?.created_at).format(DateFormatEnum.CUSTOM_DATE)
    },
    {
        accessor: 'last_login',
        accessorKey: 'last_login',
        header: 'Latest Logins',
        enableSorting: true,
        enableHiding: true,
        className: 'wl-col-login',
        cell: ({row}) => row?.original?.last_login && dayjs(row?.original?.last_login).format(DateFormatEnum.CUSTOM_DATE)
    },
    // {
    //     accessor: 'last_log',
    //     accessorKey: 'last_log',
    //     header: 'Logs',
    //     enableSorting: false,
    //     enableHiding: true,
    //     className: 'wl-col-logs',
    // },
    {
        accessor: 'status',
        accessorKey: 'status',
        header: 'Status',
        enableSorting: true,
        enableHiding: true,
        className: 'wl-col-status',
        cell: ({row}) => <LabelStatus status={row?.original?.status}/>
    },
];

// This is a Provider Component that receives session data as props
const UsersContainerClient = ({sessionData}: UsersContainerClientProps) => {
    const {openPopup,openNestedPopup } = usePopupStore();
    const { userQuery } = useUserMutation.useFetchUsers();
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [userData, setUserData] = useState<any>([]);
    const { hasAnyPermission } = usePermissions();

    const {
        isLoading,
        columnVisibility,
        setColumnVisibility
    } = useColumnVisibility(columns, localStroageEnum.VEIWCOLUMN);
    
    useEffect(() => {
        if (userQuery?.data) {
            setUserData(userQuery?.data);
            if (isInitialLoad) {
                setIsInitialLoad(false);
            }
        }
    }, [userQuery.data, isInitialLoad]);

    const [selectedRows, setSelectedRows] = useState<User[]>([]);

    const handleRowSelect = (selected: any[]) => {
        setSelectedRows(selected as User[]);
    };


    const visibleColumnsList = columns.filter(
        (column) => columnVisibility[column.accessorKey]
    );

    const handleChangePassword = (row:any) => {
        openNestedPopup(PopupTypeEnum.RESET_PASSOWRD, { selectedRow: row });
    }

    const actionItems: ActionMenuItem[] = [
        {
            label: 'Edit',
            icon: 'wl-icon-pen',
            action: (row) => openPopup(PopupTypeEnum.UPDATE_USER, { selectedRow: row, handleChangePassword:handleChangePassword }),
        },
        {
            label: 'Reset Password',
            icon: 'wl-icon-reset-password',
            action: (row) => openPopup(PopupTypeEnum.RESET_PASSOWRD, { selectedRow: row }),
        },
        {
            label: 'Reactivate User',
            icon: 'wl-icon-reactive',
            action: (row) => openPopup(PopupTypeEnum.REACTIVATE_USER, {
                title: 'Reactivate User',
                description: `Are you sure want to reactivate <strong>${row?.full_name}</strong>? They will no longer be able to log in until reactivated.`,
                selectedRows: [row],
                actionType: RowActionEnum.USER
            }),
            modalTarget: 'ReactivateUserModalId',
            hideWhen: (row) => row.status === StatusEnum.ACTIVE,
        },
        {
            label: 'Deactivate',
            icon: 'wl-icon-trash',
            action: (row) => openPopup(PopupTypeEnum.INACTIVATE_USER, {
                title: 'Deactivate User',
                description: `Are you sure want to deactivate <strong>${row?.full_name}</strong>?`,
                selectedRows: [row],
                actionType: RowActionEnum.USER
            }),
            hideWhen: (row) => row.status === StatusEnum.INACTIVE,
        },
    ];

      if (isInitialLoad && userQuery.isLoading) {
        return <UserPageSkelation/>;
    }
    
    const filterOptions = [
        {id: '', label: 'All', count: userData?.user_count_by_date?.total_users || 0},
        {id: '1', label: 'Active', count: userData?.user_count_by_date?.total_active_users || 0},
        {id: '2', label: 'Inactive', count: userData?.user_count_by_date?.total_inactive_users || 0},
    ];    
    return (
        <>
            <div className="w-100 h-100 d-flex flex-column gap-4 overflow-hidden">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-4 p-1">

                    {/*TODO: Handle selectedRows action*/}
                    {hasAnyPermission([RES_PERM_ACTION.USER_DELETE,RES_PERM_ACTION.USER_UPDATE]) && <SelectRowAction
                        selectedRows={selectedRows}
                        actionType={RowActionEnum.USER}
                        onSelectedRowsChange={setSelectedRows}
                        onEdit={(row: any) =>
                            openPopup(PopupTypeEnum.UPDATE_USER, {
                                selectedRow: row,
                                handleChangePassword: handleChangePassword,
                                onSuccess: () => setSelectedRows([]),
                            })
                        }
                    />}
                    {
                        (selectedRows.length === 0 || selectedRows.length > 0 && !hasAnyPermission([RES_PERM_ACTION.USER_DELETE,RES_PERM_ACTION.USER_UPDATE])) && (
                            <div className="d-inline-flex align-items-center gap-2">
                                <DatePickerWrapper storageKey={`${localStroageEnum.DATEPICK}-${sessionData?.user?.name}`}/>
                            </div>
                        )
                    }
                    <div className="d-inline-flex align-items-center gap-2">
                        <ColumnVisibility columns={columns} columnVisibility={columnVisibility}
                                          setColumnVisibility={setColumnVisibility}
                                          localStorageKey={localStroageEnum.VEIWCOLUMN}/>
                        <SearchComponent placeholder="Search username"/>
                        {hasAnyPermission([RES_PERM_ACTION.USER_CREATE]) && (
                        <button
                            type="button" onClick={() => openPopup(PopupTypeEnum.CREATE_USER)}
                            className="wl-btn-primary wl-btn-action wl-icon-plus"
                            aria-label="Create button"> Create
                            </button>)}
                    </div>
                </div>
                <div className="w-100 px-1">
                    <div className="row">
                        <div className="col-3">
                            <SummaryCard title={'Total Users'} value={userData?.user_count?.total_users || '0'}/>
                        </div>
                        <div className="col-3">
                            <SummaryCard title={'Active Users'} value={userData?.user_count?.total_active_users || '0'}/>
                        </div>
                        <div className="col-3">
                            <SummaryCard title={'Inactive Users'} value={userData?.user_count?.total_inactive_users || '0'}/>
                        </div>
                        <div className="col-3">
                            <SummaryCard title={'New Users (Last 30 Days)'} value={userData?.user_count?.total_new_users || '0'}/>
                        </div>
                    </div>
                </div>
                <div className="d-flex flex-column mt-auto h-100 overflow-hidden">
                    <FilterStatus filters={filterOptions} defaultFilter=''/>
                    {  userData?.users?.length > 0   ?  (
                
                            <DataTable
                                data={userData?.users}
                                columns={visibleColumnsList}
                                isLoading={!isInitialLoad && userQuery.isLoading || isLoading}
                                enableSelection={true} 
                                actionItems={hasAnyPermission([RES_PERM_ACTION.USER_DELETE,RES_PERM_ACTION.USER_UPDATE]) ? actionItems : []}
                                onRowSelect={handleRowSelect}
                                onSelectAll={(allSelected: boolean) => {
                                    if (allSelected) {
                                        const allUsers = userData?.users || [];
                                        handleRowSelect(allUsers);
                                    } else {
                                        handleRowSelect([]);
                                    }
                                }}
                                onRowClick={(row: any) => {
                                    openPopup(PopupTypeEnum.USER_DETAILS, { selectedRowData: row });
                                }}
                            />
               
                          
                        ) : (
                            <div className="h-100 d-flex justify-content-center align-items-center">
                                <div className="d-flex flex-column justify-content-center align-items-center gap-3">
                                    <figure>
                                        <Image width={88} height={64} src="/icon/common/user-empty-state.svg"
                                               alt="Icon image"/>
                                    </figure>
                                    <div className="d-flex flex-column wl-gap-2">
                                        <span className="wl-body-sm text-center">No user created.</span>
                                        <label className="wl-caption opacity-50 text-center">Please click ‘Create' at the top right
                                            to add one.</label>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {/* Pagination Component - self-contained with URL parameter handling */}
                    <PaginationComponent
                        pagination={userQuery?.data?.pagination || []}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </>

    );
};

export default UsersContainerClient;
