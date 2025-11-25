import HeadLabel from '@/components/ui/bar/PageLabel';
import UsersContainer from '@/components/ui/users/UsersContainer';
import authOptions from '@/utils/authOptions';
import { getServerSession } from 'next-auth';


export default async function UsersPage() {
    const session = await getServerSession(authOptions);

    return (
        <div style={{padding: '24px'}} className="h-100 d-flex flex-column overflow-hidden">
            <UsersContainer sessionData={session} />
        </div>
    );
}
