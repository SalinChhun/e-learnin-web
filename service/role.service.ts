import {http} from '@/utils/http';

const ServiceId = {
    USER: '/api/wba/v1/roles',
}


const getRoles =  async () => {

    const result = await http.get(ServiceId.USER);

    return result.data?.data;
}


const roleService = {
    getRoles,
}
export default roleService;