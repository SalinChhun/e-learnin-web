import { http } from '@/utils/http';
import {changeUserPassword, UpdateUserRequest, UserRequest} from "@/lib/types/user";

const ServiceId = {
    USER: '/api/wba/v1/users',
}

const createUser = (data: UserRequest) => {
    return http.post(ServiceId.USER, data);
}

const getUsers =  async (param?: any) =>{

    const result = await http.get(ServiceId.USER, {
        params: { ...param }
    });

    return result.data?.data;
}

const usernameCheck = async (username?: any) => {
    const result = await http.post( ServiceId.USER + `/username-check`, { username: username } );
    return result.data;
}

const updateUser = (data: UpdateUserRequest) => {
    return http.put(ServiceId.USER + `/${data?.user_id}`, data);
}

//  ? MARK AS DELETE
const deleteUser = (userIds: any) => {
    return http.delete(
        ServiceId.USER,
        {
            data: userIds
        }
    );
}

const updateUserStatusInactive = (userIds: number[]) => {
    return http.patch(
        ServiceId.USER+"/inactive",userIds
    );
}

const updateUserStatusActive = (userIds: number[]) => {
    return http.patch(
        ServiceId.USER+"/active",userIds
    );
}

const resetUserPassword = (userId: number,reqBody:changeUserPassword ) => {
    return http.put(
        ServiceId.USER+`/${userId}/reset-password`, reqBody
    );
}

/**
 * Get users for dropdown selection with infinite scroll support
 */
const getUsersForDropdown = async (params: {
    pageParam: number;
    search?: string;
    page_size?: number;
}): Promise<any> => {
    const result = await http.get(ServiceId.USER, {
        params: {
            page_number: params.pageParam,
            page_size: params.page_size || 10,
            search_value: params.search || "",
            sort_columns: "id:desc",
        },
    });
    return result.data;
};

const userService = {
    createUser,
    getUsers,
    usernameCheck,
    updateUser,
    deleteUser,
    updateUserStatusInactive,
    updateUserStatusActive,
    resetUserPassword,
    getUsersForDropdown
}
export default userService;