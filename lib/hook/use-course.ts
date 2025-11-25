import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import courseService, { Category, CreateCourseRequest, EnrollCourseRequest, EnrollmentStatus, CourseLearnersResponse, GetCourseLearnersParams, AddLearnersRequest, MyCoursesResponse } from '@/service/course.service';
import certificateTemplateService, { CreateCertificateTemplateRequest } from '@/service/certificate-template.service';
import toast from '@/utils/toastService';
import {AxiosError} from "axios";

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
const useFetchAllCoursesInfinite = (pageSize: number = 10, searchValue?: string) => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
        refetch,
    } = useInfiniteQuery({
        queryKey: ['all-courses-infinite', pageSize, searchValue],
        queryFn: ({ pageParam = 0 }) => {
            return courseService.getCourses({
                page_number: pageParam as number,
                page_size: pageSize,
                sort_columns: 'created_at:desc', // Get most recent first
                search_value: searchValue || undefined,
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

/**
 * Hook to fetch certificate templates
 */
const useFetchCertificateTemplates = (status?: string | number) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['certificate-templates', status],
        queryFn: () => certificateTemplateService.getCertificateTemplates({
            status: status, // 1=DRAFT, 2=ACTIVE, 9=DELETE, undefined=all
            sort_columns: 'id:desc',
            page_number: 0,
            page_size: 100, // Get all templates
        }),
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    return {
        templates: data?.templates || [],
        summary: data?.summary || null,
        isLoading,
        error: error as Error | null,
    };
};

/**
 * Hook to fetch certificate templates with infinite scroll
 */
const useFetchCertificateTemplatesInfinite = (status?: string | number, pageSize: number = 10, searchValue?: string) => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
        refetch,
    } = useInfiniteQuery({
        queryKey: ['certificate-templates-infinite', status, pageSize, searchValue],
        queryFn: ({ pageParam = 0 }) => {
            return certificateTemplateService.getCertificateTemplates({
                status: status, // 1=DRAFT, 2=ACTIVE, 9=DELETE, undefined=all
                sort_columns: 'id:desc',
                page_number: pageParam as number,
                page_size: pageSize,
                search_value: searchValue,
            });
        },
        getNextPageParam: (lastPage: any) => {
            if (!lastPage || !lastPage.hasNext) {
                return undefined;
            }
            return (lastPage.currentPage ?? 0) + 1;
        },
        initialPageParam: 0,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    const templates = useMemo(() => {
        if (!data?.pages) return [];
        return data.pages.flatMap((page: any) => page?.templates || []);
    }, [data?.pages]);

    const summary = data?.pages?.[0]?.summary || null;
    const totalElements = data?.pages?.[0]?.totalElements || 0;

    return {
        templates,
        summary,
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
 * Hook to create a new certificate template
 */
const useCreateCertificateTemplate = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: CreateCertificateTemplateRequest) => 
            certificateTemplateService.createCertificateTemplate(data),
    });

    return {
        ...mutation,
        mutation: (
            variables: CreateCertificateTemplateRequest,
            options?: { 
                onSuccess?: (data: any) => void;
                onError?: (error: any) => void;
            }
        ) => {
            mutation.mutate(variables, {
                onSuccess: (data) => {
                    toast.success("Certificate template created successfully");
                    queryClient.invalidateQueries({ queryKey: ["certificate-templates"] });
                    queryClient.invalidateQueries({ queryKey: ["certificate-templates-infinite"] });
                    options?.onSuccess?.(data);
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || error?.message || "Failed to create certificate template");
                    options?.onError?.(error);
                },
            });
        },
    };
};

/**
 * Hook to update a certificate template
 */
const useUpdateCertificateTemplate = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ templateId, data }: { templateId: string | number; data: CreateCertificateTemplateRequest }) => 
            certificateTemplateService.updateCertificateTemplate(templateId, data),
    });

    return {
        ...mutation,
        mutation: (
            templateId: string | number,
            variables: CreateCertificateTemplateRequest,
            options?: { 
                onSuccess?: (data: any) => void;
                onError?: (error: any) => void;
            }
        ) => {
            mutation.mutate({ templateId, data: variables }, {
                onSuccess: (data) => {
                    toast.success("Certificate template updated successfully");
                    queryClient.invalidateQueries({ queryKey: ["certificate-templates"] });
                    queryClient.invalidateQueries({ queryKey: ["certificate-templates-infinite"] });
                    queryClient.invalidateQueries({ queryKey: ["certificate-template-details", templateId] });
                    options?.onSuccess?.(data);
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || error?.message || "Failed to update certificate template");
                    options?.onError?.(error);
                },
            });
        },
    };
};

/**
 * Hook to delete a certificate template
 */
const useDeleteCertificateTemplate = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (templateId: string | number) => 
            certificateTemplateService.deleteCertificateTemplate(templateId),
    });

    return {
        ...mutation,
        mutation: (
            templateId: string | number,
            options?: { 
                onSuccess?: (data: any) => void;
                onError?: (error: any) => void;
            }
        ) => {
            mutation.mutate(templateId, {
                onSuccess: (data) => {
                    toast.success("Certificate template deleted successfully");
                    queryClient.invalidateQueries({ queryKey: ["certificate-templates"] });
                    queryClient.invalidateQueries({ queryKey: ["certificate-templates-infinite"] });
                    options?.onSuccess?.(data);
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || error?.message || "Failed to delete certificate template");
                    options?.onError?.(error);
                },
            });
        },
    };
};

/**
 * Hook to fetch a single certificate template by ID
 */
const useCertificateTemplateDetails = (templateId: string | number | null | undefined) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['certificate-template-details', templateId],
        queryFn: () => certificateTemplateService.getCertificateTemplateById(templateId!),
        enabled: !!templateId,
        staleTime: 0, // Always consider stale to ensure fresh data when modal opens
    });

    return {
        template: data || null,
        isLoading,
        error: error as Error | null,
        refetch,
    };
};

/**
 * Hook to fetch certificate template by course ID
 */
const useCertificateTemplateByCourse = (courseId: string | number | null | undefined) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['certificate-template-by-course', courseId],
        queryFn: () => certificateTemplateService.getCertificateTemplateByCourseId(courseId!),
        enabled: !!courseId,
        staleTime: 0,
    });

    // Check if template exists - API returns hasTemplate: false when no template, or template object when exists
    const hasTemplate = data && (data.hasTemplate !== false) && data.id

    return {
        templateData: data || null,
        hasTemplate: !!hasTemplate,
        isLoading,
        error: error as Error | null,
        refetch,
    };
};

/**
 * Hook to enroll in a course
 */
const useEnrollCourse = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: EnrollCourseRequest) => courseService.enrollCourse(data),
    });

    return {
        ...mutation,
        mutation: (
            variables: EnrollCourseRequest,
            options?: { 
                onSuccess?: (data: any) => void;
                onError?: (error: any) => void;
            }
        ) => {
            mutation.mutate(variables, {
                onSuccess: (data) => {
                    toast.success("Successfully enrolled in course");
                    queryClient.invalidateQueries({ queryKey: ['my-course'] });
                    queryClient.invalidateQueries({ queryKey: ['public-courses'] });
                    queryClient.invalidateQueries({ queryKey: ['enrollment-status'] });
                    queryClient.invalidateQueries({ queryKey: ['all-enrollments'] });
                    options?.onSuccess?.(data);
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || error?.message || "Failed to enroll in course");
                    options?.onError?.(error);
                },
            });
        },
    };
};

/**
 * Hook to check enrollment status for a course
 */
const useCheckEnrollment = (courseId: string | number | null | undefined) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['enrollment-status', courseId],
        queryFn: () => courseService.checkEnrollment(courseId!),
        enabled: !!courseId,
        staleTime: 30 * 1000, // Cache for 30 seconds
    });

    return {
        enrollmentStatus: data || null,
        isLoading,
        error: error as Error | null,
        refetch,
    };
};

/**
 * Hook to fetch learners for a course
 */
const useCourseLearners = (courseId: string | number | null | undefined, params?: GetCourseLearnersParams) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['course-learners', courseId, params],
        queryFn: () => courseService.getCourseLearners(courseId!, params),
        enabled: !!courseId,
        staleTime: 30 * 1000, // Cache for 30 seconds
    });

    return {
        learnersData: data || null,
        isLoading,
        error: error as Error | null,
        refetch,
    };
};

/**
 * Hook to approve an enrollment
 */
const useApproveEnrollment = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (enrollmentId: string | number) => courseService.approveEnrollment(enrollmentId),
    });

    return {
        ...mutation,
        mutation: (
            enrollmentId: string | number,
            options?: { 
                onSuccess?: (data: any) => void;
                onError?: (error: any) => void;
            }
        ) => {
            mutation.mutate(enrollmentId, {
                onSuccess: (data) => {
                    toast.success("Enrollment approved successfully");
                    queryClient.invalidateQueries({ queryKey: ['course-learners'] });
                    queryClient.invalidateQueries({ queryKey: ['my-courses'] });
                    queryClient.invalidateQueries({ queryKey: ['all-enrollments'] });
                    options?.onSuccess?.(data);
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || error?.message || "Failed to approve enrollment");
                    options?.onError?.(error);
                },
            });
        },
    };
};

/**
 * Hook to reject an enrollment
 */
const useRejectEnrollment = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (enrollmentId: string | number) => courseService.rejectEnrollment(enrollmentId),
    });

    return {
        ...mutation,
        mutation: (
            enrollmentId: string | number,
            options?: { 
                onSuccess?: (data: any) => void;
                onError?: (error: any) => void;
            }
        ) => {
            mutation.mutate(enrollmentId, {
                onSuccess: (data) => {
                    toast.success("Enrollment rejected successfully");
                    queryClient.invalidateQueries({ queryKey: ['course-learners'] });
                    queryClient.invalidateQueries({ queryKey: ['my-courses'] });
                    queryClient.invalidateQueries({ queryKey: ['all-enrollments'] });
                    options?.onSuccess?.(data);
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || error?.message || "Failed to reject enrollment");
                    options?.onError?.(error);
                },
            });
        },
    };
};

/**
 * Hook to remove an enrollment
 */
const useRemoveEnrollment = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (enrollmentId: string | number) => courseService.removeEnrollment(enrollmentId),
    });

    return {
        ...mutation,
        mutation: (
            enrollmentId: string | number,
            options?: { 
                onSuccess?: (data: any) => void;
                onError?: (error: any) => void;
            }
        ) => {
            mutation.mutate(enrollmentId, {
                onSuccess: (data) => {
                    toast.success("Enrollment removed successfully");
                    queryClient.invalidateQueries({ queryKey: ['course-learners'] });
                    queryClient.invalidateQueries({ queryKey: ['my-courses'] });
                    queryClient.invalidateQueries({ queryKey: ['all-enrollments'] });
                    options?.onSuccess?.(data);
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || error?.message || "Failed to remove enrollment");
                    options?.onError?.(error);
                },
            });
        },
    };
};

/**
 * Hook to fetch all enrollments with infinite scroll
 */
const useFetchAllEnrollmentsInfinite = (pageSize: number = 10) => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
        refetch,
    } = useInfiniteQuery({
        queryKey: ['all-enrollments', pageSize],
        queryFn: ({ pageParam = 0 }) => {
            return courseService.getAllEnrollments({
                page_number: pageParam as number,
                page_size: pageSize,
                sort_columns: 'id:desc',
            });
        },
        getNextPageParam: (lastPage) => {
            if (!lastPage || !lastPage.hasNext) {
                return undefined;
            }
            return (lastPage.currentPage ?? 0) + 1;
        },
        initialPageParam: 0,
        staleTime: 30 * 1000, // Cache for 30 seconds
    });

    const enrollments = useMemo(() => {
        if (!data?.pages) return [];
        return data.pages.flatMap((page) => page?.enrollments || []);
    }, [data?.pages]);

    const totalElements = data?.pages?.[0]?.totalElements || 0;

    return {
        enrollments,
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
 * Hook to add learners to a course
 */
const useAddLearners = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ courseId, data }: { courseId: string | number; data: AddLearnersRequest }) => 
            courseService.addLearners(courseId, data),
    });

    return {
        ...mutation,
        mutation: (
            courseId: string | number,
            data: AddLearnersRequest,
            options?: { 
                onSuccess?: (data: any) => void;
                onError?: (error: any) => void;
            }
        ) => {
            mutation.mutate({ courseId, data }, {
                onSuccess: (data) => {
                    toast.success("Learners added successfully");
                    queryClient.invalidateQueries({ queryKey: ['course-learners'] });
                    options?.onSuccess?.(data);
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || error?.message || "Failed to add learners");
                    options?.onError?.(error);
                },
            });
        },
    };
};

/**
 * Hook to fetch my enrolled courses
 */
const useMyCourses = () => {
    const { data, isLoading, error, refetch } = useQuery<MyCoursesResponse, AxiosError>({
        queryKey: ['my-courses'],
        queryFn: () => courseService.getMyCourses(),
        staleTime: 30 * 1000, // Cache for 30 seconds
    });

    return {
        myCoursesData: data || null,
        isLoading,
        error: error as Error | null,
        refetch,
    };
};

/**
 * Hook to fetch a single course from my courses by ID
 */
const useMyCourseById = (courseId: string | number | null | undefined) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['my-course', courseId],
        queryFn: () => courseService.getMyCourseById(courseId!),
        enabled: !!courseId,
        staleTime: 0, // Always fetch fresh data
    });

    return {
        course: data || null,
        isLoading,
        error: error as Error | null,
        refetch,
    };
};

export default useFetchPublicCourses;
export { useFetchCategories, useCreateCourse, useUpdateCourse, useCourseDetails, useFetchAllCourses, useFetchAllCoursesInfinite, useFetchCertificateTemplates, useFetchCertificateTemplatesInfinite, useCreateCertificateTemplate, useUpdateCertificateTemplate, useDeleteCertificateTemplate, useCertificateTemplateDetails, useCertificateTemplateByCourse, useEnrollCourse, useCheckEnrollment, useCourseLearners, useApproveEnrollment, useRejectEnrollment, useRemoveEnrollment, useAddLearners, useMyCourses, useMyCourseById, useFetchAllEnrollmentsInfinite };

