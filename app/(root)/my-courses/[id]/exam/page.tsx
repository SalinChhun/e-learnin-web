import ExamPage from '@/components/ui/courses/ExamPage'

export default async function ExamRoute({
    params,
}: {
    params: { id: string };
}) {
    return <ExamPage courseId={params.id} />
}


