export interface User {
    id: string;
    full_name: string;
    username: string;
    image?: string;
    email: string;
    department?: string;
    role: string;
    last_log?: string;
    created_at?: string;
    status: string;
    last_login?: string;
}

export interface UserRequest {
    full_name: string;
    email: number;
    role_id: number;
    username: string;
    password: string;
    department: string;
    status: string;
}

export interface UpdateUserRequest extends UserRequest {
    user_id: string;
}


export interface changeUserPassword {
    new_password : string;
    is_generated_password : boolean;
}