import PublicCoursesContainer from "@/components/ui/courses/PublicCoursesContainer";

export default async function CoursesPage() {

    return (
        <div className="h-100 w-100" style={{ overflowX: 'auto' }}>
            <PublicCoursesContainer />
        </div>
    );
}
