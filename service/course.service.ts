import { http } from '@/utils/http';

const ServiceId = {
    COURSES: '/api/wba/v1/courses',
    COURSES_PUBLIC: '/api/wba/v1/courses/public',
    CATEGORIES: '/api/wba/v1/categories',
}

interface GetPublicCoursesParams {
    search_value?: string;
    category_id?: string | number;
    sort_columns?: string;
    page_number?: number;
    page_size?: number;
}

interface Category {
    id: number;
    name: string;
    description: string;
}

const getPublicCourses = async (params?: GetPublicCoursesParams) => {
    const result = await http.get(ServiceId.COURSES_PUBLIC, {
        params: { ...params }
    });

    return result.data?.data;
}

const getCategories = async () => {
    const result = await http.get(ServiceId.CATEGORIES);
    return result.data?.data?.categories || [];
}

interface CreateCourseRequest {
    title: string;
    description: string;
    category_id: number;
    duration_hours: number;
    estimated_days: number;
    due_date: string;
    is_public: boolean;
    image_url?: string;
    course_content: string;
    assignment_type: string;
    status: string;
    user_ids: number[];
}

const createCourse = async (data: CreateCourseRequest) => {
    const result = await http.post(ServiceId.COURSES, data);
    return result.data;
}

const getCourseById = async (courseId: string | number) => {
    const result = await http.get(`${ServiceId.COURSES}/${courseId}`);
    return result.data?.data;
}

const courseService = {
    getPublicCourses,
    getCategories,
    createCourse,
    getCourseById,
}

export default courseService;
export type { Category, CreateCourseRequest };

