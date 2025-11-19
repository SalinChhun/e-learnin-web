import CourseDetailsPage from "@/components/ui/courses/CourseDetailsPage";
import authOptions from "@/utils/authOptions";
import { getServerSession } from "next-auth";

export default async function CourseDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const session = await getServerSession(authOptions);

    return (
        <div className="h-100 w-100" style={{ overflowX: 'auto' }}>
            <CourseDetailsPage courseId={params.id} />
        </div>
    );
}




