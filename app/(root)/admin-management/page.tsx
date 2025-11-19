import HeadLabel from '@/components/ui/bar/PageLabel';
import AdminManagementContainer from '@/components/ui/admin/AdminManagementContainer';
import authOptions from '@/utils/authOptions';
import { getServerSession } from 'next-auth';

export default async function AdminManagementPage() {
    const session = await getServerSession(authOptions);

    return (
        <div className="h-100 w-100" style={{ overflowX: 'auto' }}>
            <AdminManagementContainer sessionData={session} />
        </div>
    );
}

