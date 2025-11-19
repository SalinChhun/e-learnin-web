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
                status: '2', // Only fetch published courses
                page_number: pageParam as number,
                page_size: +pageSize > 100 ? 100 : +pageSize,
                search_value: searchValue || undefined,
                category_id: categoryId || undefined,
                sort_columns: sortColumns || undefined,
            };
            return courseService.getCourses(requestParams);
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
                    queryClient.invalidateQueries({ queryKey: ["all-courses"] });
                    queryClient.invalidateQueries({ queryKey: ["all-courses-infinite"] });
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
 * Hook to update an existing course
 */
const useUpdateCourse = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: ({ courseId, data }: { courseId: string | number; data: CreateCourseRequest }) => 
            courseService.updateCourse(courseId, data),
    });

    return {
        ...mutation,
        mutation: (
            courseId: string | number,
            variables: CreateCourseRequest,
            options?: { 
                onSuccess?: (data: any) => void;
                onError?: (error: any) => void;
                isDraft?: boolean;
            }
        ) => {
            mutation.mutate({ courseId, data: variables }, {
                onSuccess: (data) => {
                    const message = options?.isDraft 
                        ? "Course saved as draft successfully" 
                        : "Course published successfully";
                    toast.success(message);
                    queryClient.invalidateQueries({ queryKey: ["public-courses"] });
                    queryClient.invalidateQueries({ queryKey: ["courses"] });
                    queryClient.invalidateQueries({ queryKey: ["all-courses"] });
                    queryClient.invalidateQueries({ queryKey: ["all-courses-infinite"] });
                    queryClient.invalidateQueries({ queryKey: ["course-details", courseId] });
                    options?.onSuccess?.(data);
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || error?.message || "Failed to update course");
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

/**
 * Hook to fetch all courses (for admin - includes both published and drafts)
 */
const useFetchAllCourses = (limit: number = 10) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['all-courses', limit],
        queryFn: () => {
            return courseService.getCourses({
                page_number: 0,
                page_size: limit,
                sort_columns: 'created_at:desc', // Get most recent first
            });
        },
        staleTime: 30 * 1000, // Cache for 30 seconds
    });

    const courses = useMemo(() => {
        return data?.courses || [];
    }, [data?.courses]);

    return {
        courses,
        isLoading,
        error: error as Error | null,
        refetch,
    };
};

/**
 * Hook to fetch all courses with infinite scroll (for admin - includes both published and drafts)
 */
const useFetchAllCoursesInfinite = (pageSize: number = 10) => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
        refetch,
    } = useInfiniteQuery({
        queryKey: ['all-courses-infinite', pageSize],
        queryFn: ({ pageParam = 0 }) => {
            return courseService.getCourses({
                page_number: pageParam as number,
                page_size: pageSize,
                sort_columns: 'created_at:desc', // Get most recent first
            });
        },
        getNextPageParam: (lastPage: CourseResponse) => {
            if (!lastPage || !lastPage.hasNext) {
                return undefined;
            }
            return (lastPage.currentPage ?? 0) + 1;
        },
        initialPageParam: 0,
        staleTime: 30 * 1000, // Cache for 30 seconds
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

export default useFetchPublicCourses;
export { useFetchCategories, useCreateCourse, useUpdateCourse, useCourseDetails, useFetchAllCourses, useFetchAllCoursesInfinite };

