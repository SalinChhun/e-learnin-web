import CertificatePage from '@/components/ui/courses/CertificatePage'

export default async function CertificateRoute({
    params,
}: {
    params: { id: string };
}) {
    return <CertificatePage courseId={params.id} />
}

