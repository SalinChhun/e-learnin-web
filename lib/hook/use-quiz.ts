import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import quizService, { CreateQuizRequest, CreateQuestionRequest, GetQuizzesParams } from '@/service/quiz.service';
import toast from '@/utils/toastService';

interface QuizResponse {
    quizzes: any[];
    totalPages: number;
    pageSize: number;
    hasPrevious: boolean;
    hasNext: boolean;
    currentPage: number;
    totalElements: number;
}

/**
 * Hook to create a quiz with questions
 */
const useCreateQuiz = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async ({ quizData, questions }: { quizData: CreateQuizRequest; questions: CreateQuestionRequest[] }) => {
            // First create the quiz
            const quizResponse = await quizService.createQuiz(quizData);
            const quizId = quizResponse?.data?.id;

            if (!quizId) {
                throw new Error('Failed to create quiz');
            }

            // Then add all questions to the quiz
            const questionPromises = questions.map((question, index) => {
                return quizService.addQuestionToQuiz(quizId, {
                    ...question,
                    order_sequence: index + 1
                });
            });

            await Promise.all(questionPromises);

            return quizResponse;
        },
    });

    return {
        ...mutation,
        mutation: (
            quizData: CreateQuizRequest,
            questions: CreateQuestionRequest[],
            options?: { 
                onSuccess?: (data: any) => void;
                onError?: (error: any) => void;
            }
        ) => {
            mutation.mutate({ quizData, questions }, {
                onSuccess: (data) => {
                    toast.success("Quiz created successfully");
                    queryClient.invalidateQueries({ queryKey: ["quizzes"] });
                    options?.onSuccess?.(data);
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || error?.message || "Failed to create quiz");
                    options?.onError?.(error);
                },
            });
        },
    };
};

/**
 * Hook to fetch quizzes
 */
const useFetchQuizzes = (limit: number = 10) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['quizzes', limit],
        queryFn: () => {
            return quizService.getQuizzes({
                page_number: 0,
                page_size: limit,
                sort_columns: 'id:desc', // Get most recent first
            });
        },
        staleTime: 30 * 1000, // Cache for 30 seconds
    });

    const quizzes = useMemo(() => {
        return data?.quizzes || [];
    }, [data?.quizzes]);

    return {
        quizzes,
        isLoading,
        error: error as Error | null,
        refetch,
    };
};

/**
 * Hook to fetch all quizzes with infinite scroll (for admin)
 */
const useFetchAllQuizzesInfinite = (pageSize: number = 10) => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
        refetch,
    } = useInfiniteQuery({
        queryKey: ['all-quizzes-infinite', pageSize],
        queryFn: ({ pageParam = 0 }) => {
            return quizService.getQuizzes({
                page_number: pageParam as number,
                page_size: pageSize,
                sort_columns: 'id:desc', // Get most recent first
            });
        },
        getNextPageParam: (lastPage: QuizResponse) => {
            if (!lastPage || !lastPage.hasNext) {
                return undefined;
            }
            return (lastPage.currentPage ?? 0) + 1;
        },
        initialPageParam: 0,
        staleTime: 30 * 1000, // Cache for 30 seconds
    });

    const quizzes = useMemo(() => {
        if (!data?.pages) return [];
        return data.pages.flatMap((page: QuizResponse) => page?.quizzes || []);
    }, [data?.pages]);

    const totalElements = data?.pages?.[0]?.totalElements || 0;

    return {
        quizzes,
        fetchNextPage,
        hasNextPage: hasNextPage || false,
        isFetchingNextPage,
        isLoading,
        error: error as Error | null,
        totalElements,
        refetch,
    };
};

/**
 * Hook to fetch quiz details by ID
 */
const useQuizDetails = (quizId: string | undefined) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['quiz-details', quizId],
        queryFn: () => {
            if (!quizId) {
                throw new Error('Quiz ID is required');
            }
            return quizService.getQuizById(quizId);
        },
        enabled: !!quizId,
        staleTime: 30 * 1000, // Cache for 30 seconds
    });

    return {
        quiz: data,
        isLoading,
        error: error as Error | null,
        refetch,
    };
};

/**
 * Hook to update a quiz
 */
const useUpdateQuiz = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async ({ quizId, data }: { quizId: string | number; data: any }) => {
            return quizService.updateQuiz(quizId, data);
        },
    });

    return {
        ...mutation,
        mutation: (
            quizId: string | number,
            data: any,
            options?: {
                onSuccess?: (data: any) => void;
                onError?: (error: any) => void;
            }
        ) => {
            mutation.mutate({ quizId, data }, {
                onSuccess: (data) => {
                    toast.success("Quiz updated successfully");
                    queryClient.invalidateQueries({ queryKey: ["quizzes"] });
                    queryClient.invalidateQueries({ queryKey: ["all-quizzes-infinite"] });
                    queryClient.invalidateQueries({ queryKey: ["quiz-details"] });
                    options?.onSuccess?.(data);
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || error?.message || "Failed to update quiz");
                    options?.onError?.(error);
                },
            });
        },
    };
};

export { useCreateQuiz, useFetchQuizzes, useFetchAllQuizzesInfinite, useQuizDetails, useUpdateQuiz };

