import HeadLabel from '@/components/ui/bar/PageLabel';
import {getServerSession} from 'next-auth';
import authOptions from '@/utils/authOptions';
import AuthConfigContainer from "@/components/ui/auth-config/AuthConfigContainer";


export default async function AuthConfigPage() {
    const session = await getServerSession(authOptions);

    return (
        <div className="h-100 d-flex flex-column px-4 mb-4 overflow-hidden">
            <HeadLabel />
            <AuthConfigContainer sessionData={session} />
        </div>
    );
}

