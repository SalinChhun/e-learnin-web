import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import courseService, { Category, CreateCourseRequest } from '@/service/course.service';
import toast from '@/utils/toastService';

interface Course {
    id: number;
    title: string;
    description: string;
    category: string;
    category_id: number;
    duration_hours: number;
    estimated_days: number;
    due_date: string;
    status: string;
    is_public: boolean;
    image_url: string;
    learner_count: number;
    created_at: string;
    updated_at: string;
}

interface CourseResponse {
    courses: Course[];
    totalPages: number;
    pageSize: number;
    hasPrevious: boolean;
    hasNext: boolean;
    currentPage: number;
    totalElements: number;
}

const useFetchPublicCourses = () => {
    const params = useSearchParams();
    const pageSize = params.get('page_size') || '10';
    const searchValue = params.get('search_value') || '';
    const categoryId = params.get('category_id') || '';
    const sortColumns = params.get('sort_columns') || 'id:desc';

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
        refetch,
    } = useInfiniteQuery({
        queryKey: ['public-courses', searchValue, categoryId, sortColumns],
        queryFn: ({ pageParam = 0 }) => {
            const requestParams = {
                page_number: pageParam as number,
                page_size: +pageSize > 100 ? 100 : +pageSize,
                search_value: searchValue || undefined,
                category_id: categoryId || undefined,
                sort_columns: sortColumns || undefined,
            };
            return courseService.getPublicCourses(requestParams);
        },
        getNextPageParam: (lastPage: CourseResponse) => {
            if (!lastPage || !lastPage.hasNext) {
                return undefined;
            }
            return (lastPage.currentPage ?? 0) + 1;
        },
        initialPageParam: 0,
        staleTime: 0,
        gcTime: 0,
    });

    const courses = useMemo(() => {
        if (!data?.pages) return [];
        return data.pages.flatMap((page: CourseResponse) => page?.courses || []);
    }, [data?.pages]);

    const totalElements = data?.pages?.[0]?.totalElements || 0;

    return {
        courses,
        fetchNextPage,
        hasNextPage: hasNextPage || false,
        isFetchingNextPage,
        isLoading,
        error: error as Error | null,
        totalElements,
        refetch,
    };
};

const useFetchCategories = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['categories'],
        queryFn: () => courseService.getCategories(),
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    return {
        categories: data || [],
        isLoading,
        error: error as Error | null,
    };
};

/**
 * Hook to create a new course
 */
const useCreateCourse = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: (data: CreateCourseRequest) => courseService.createCourse(data),
    });

    return {
        ...mutation,
        mutation: (
            variables: CreateCourseRequest,
            options?: { 
                onSuccess?: (data: any) => void;
                onError?: (error: any) => void;
                isDraft?: boolean;
            }
        ) => {
            mutation.mutate(variables, {
                onSuccess: (data) => {
                    const message = options?.isDraft 
                        ? "Course saved as draft successfully" 
                        : "Course published successfully";
                    toast.success(message);
                    queryClient.invalidateQueries({ queryKey: ["public-courses"] });
                    queryClient.invalidateQueries({ queryKey: ["courses"] });
                    options?.onSuccess?.(data);
                    // Optionally redirect to course list or course details
                    // router.push('/admin-management');
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || error?.message || "Failed to create course");
                    options?.onError?.(error);
                },
            });
        },
    };
};

/**
 * Hook to fetch course details by ID
 */
const useCourseDetails = (courseId: string | number | null | undefined) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['course-details', courseId],
        queryFn: () => courseService.getCourseById(courseId!),
        enabled: !!courseId,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    return {
        course: data || null,
        isLoading,
        error: error as Error | null,
        refetch,
    };
};

export default useFetchPublicCourses;
export { useFetchCategories, useCreateCourse, useCourseDetails };

