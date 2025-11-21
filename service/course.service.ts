import { http } from '@/utils/http';

const ServiceId = {
    COURSES: '/api/wba/v1/courses',
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

const getCourses = async (params?: GetPublicCoursesParams) => {
    const result = await http.get(ServiceId.COURSES, {
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
    learners: number[];
    enable_certificate?: boolean;
    certificate_template_id?: number;
}

const createCourse = async (data: CreateCourseRequest) => {
    const result = await http.post(ServiceId.COURSES, data);
    return result.data;
}

const getCourseById = async (courseId: string | number) => {
    const result = await http.get(`${ServiceId.COURSES}/${courseId}`);
    return result.data?.data;
}

const updateCourse = async (courseId: string | number, data: CreateCourseRequest) => {
    const result = await http.put(`${ServiceId.COURSES}/${courseId}`, data);
    return result.data;
}

interface EnrollCourseRequest {
    course_id: number;
}

const enrollCourse = async (data: EnrollCourseRequest) => {
    const result = await http.post(`${ServiceId.COURSES}/enroll`, data);
    return result.data;
}

interface EnrollmentStatus {
    is_enrolled: boolean;
    enrollment_id: number | null;
    status: string;
    progress_percentage: number;
    time_spent_seconds: number;
    enrolled_date: string | null;
    completed_date: string | null;
}

const checkEnrollment = async (courseId: string | number) => {
    const result = await http.get(`${ServiceId.COURSES}/${courseId}/enrollment/check`);
    return result.data?.data as EnrollmentStatus;
}

interface GetCourseLearnersParams {
    sort_columns?: string;
    page_number?: number;
    page_size?: number;
}

interface CourseLearner {
    enrollment_id: number;
    user_id: number;
    name: string;
    email: string;
    department: string;
    status: string;
    progress_percentage: number;
    enrolled_date: string;
    completed_date: string | null;
}

interface CourseLearnersResponse {
    learners: CourseLearner[];
    totalPages: number;
    pageSize: number;
    hasPrevious: boolean;
    hasNext: boolean;
    completedCount: number;
    currentPage: number;
    totalLearners: number;
    totalElements: number;
    inProgressCount: number;
    pendingCount: number;
}

const getCourseLearners = async (courseId: string | number, params?: GetCourseLearnersParams) => {
    const result = await http.get(`${ServiceId.COURSES}/${courseId}/learners`, {
        params: { ...params }
    });
    return result.data?.data as CourseLearnersResponse;
}

const approveEnrollment = async (enrollmentId: string | number) => {
    const result = await http.patch(`/api/wba/v1/courses/enrollments/${enrollmentId}/approve`);
    return result.data;
}

const rejectEnrollment = async (enrollmentId: string | number) => {
    const result = await http.patch(`/api/wba/v1/courses/enrollments/${enrollmentId}/reject`);
    return result.data;
}

const removeEnrollment = async (enrollmentId: string | number) => {
    const result = await http.delete(`/api/wba/v1/courses/enrollments/${enrollmentId}`);
    return result.data;
}

interface AddLearnersRequest {
    course_id: number;
    user_ids: number[];
}

const addLearners = async (courseId: string | number, data: AddLearnersRequest) => {
    const result = await http.post(`/api/wba/v1/courses/${courseId}/enrollments`, data);
    return result.data;
}

interface MyCourse {
    enrollment_id: number;
    course_id: number;
    title: string;
    description: string;
    category: string;
    duration_hours: number;
    estimated_days: number;
    due_date: string;
    status: string;
    progress_percentage: number;
    time_spent_seconds: number;
    enrolled_date: string;
    completed_date: string | null;
    image_url: string;
    total_score?: number | null;
    percentage_score?: number | null;
    course_content?: string;
    exam_attempt_status?: string | null;
}

interface MyCoursesResponse {
    courses: MyCourse[];
    total: number;
    inProgress: number;
    certificates: number;
    totalCourses: number;
    completed: number;
}

const getMyCourses = async () => {
    const result = await http.get(`${ServiceId.COURSES}/my-courses`);
    return result.data?.data as MyCoursesResponse;
}

const getMyCourseById = async (courseId: string | number) => {
    const result = await http.get(`${ServiceId.COURSES}/my-courses/${courseId}`);
    return result.data?.data as MyCourse;
}

const courseService = {
    getCourses,
    getCategories,
    createCourse,
    getCourseById,
    updateCourse,
    enrollCourse,
    checkEnrollment,
    getCourseLearners,
    approveEnrollment,
    rejectEnrollment,
    removeEnrollment,
    addLearners,
    getMyCourses,
    getMyCourseById,
}

export default courseService;
export type { Category, CreateCourseRequest, EnrollCourseRequest, EnrollmentStatus, CourseLearner, CourseLearnersResponse, GetCourseLearnersParams, AddLearnersRequest, MyCourse, MyCoursesResponse };
