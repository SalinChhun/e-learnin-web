import { http } from '@/utils/http';

const ServiceId = {
    QUIZZES: '/api/wba/v1/quizzes',
}

interface GetQuizzesParams {
    sort_columns?: string;
    page_number?: number;
    page_size?: number;
}

export interface CreateQuizRequest {
    title: string;
    description: string;
    type: string;
    course_id: number;
    duration_minutes: number;
    passing_score: number;
}

export interface CreateQuestionRequest {
    question_text: string;
    question_type: string;
    points: number;
    answer_explanation?: string;
    order_sequence: number;
    image_url?: string;
    video_url?: string;
    file_url?: string;
    voice_url?: string;
    options?: Array<{
        option_text: string;
        is_correct: boolean;
        order_sequence: number;
    }>;
}

export interface UpdateQuizRequest {
    title: string;
    description: string;
    type: string;
    course_id: number;
    duration_minutes: number;
    passing_score: number;
    questions: Array<{
        id?: number;
        question_text: string;
        question_type: string;
        points: number;
        answer_explanation?: string;
        order_sequence: number;
        image_url?: string;
        video_url?: string;
        file_url?: string;
        voice_url?: string;
        options?: Array<{
            option_text: string;
            is_correct: boolean;
            order_sequence: number;
        }>;
    }>;
}

const createQuiz = async (data: CreateQuizRequest) => {
    const result = await http.post(ServiceId.QUIZZES, data);
    return result.data;
}

const addQuestionToQuiz = async (quizId: number, data: CreateQuestionRequest) => {
    const result = await http.post(`${ServiceId.QUIZZES}/${quizId}/questions`, data);
    return result.data;
}

const getQuizzes = async (params?: GetQuizzesParams) => {
    const result = await http.get(ServiceId.QUIZZES, {
        params: { ...params }
    });
    return result.data?.data;
}

const getQuizById = async (quizId: string | number) => {
    const result = await http.get(`${ServiceId.QUIZZES}/${quizId}`);
    return result.data?.data;
}

const updateQuiz = async (quizId: string | number, data: UpdateQuizRequest) => {
    const result = await http.put(`${ServiceId.QUIZZES}/${quizId}`, data);
    return result.data;
}

const quizService = {
    createQuiz,
    addQuestionToQuiz,
    getQuizzes,
    getQuizById,
    updateQuiz,
}

export type { GetQuizzesParams };

export default quizService;

