import CourseLearningPage from "@/components/ui/courses/CourseLearningPage";

export default async function CourseLearningRoute({
    params,
}: {
    params: { id: string };
}) {
    return (
        <div className="h-100 w-100" style={{ overflowX: 'auto' }}>
            <CourseLearningPage courseId={params.id} />
        </div>
    );
}

