import HeadLabel from '@/components/ui/bar/PageLabel';
import {getServerSession} from 'next-auth';
import authOptions from '@/utils/authOptions';
import ProviderContainer from "@/components/ui/providers/ProviderContainer";


export default async function PartnerPage() {
    const session = await getServerSession(authOptions);

    return (
        <div className="h-100 d-flex flex-column px-4 mb-4 overflow-hidden">
            <HeadLabel />
            <ProviderContainer sessionData={session} />
        </div>
    );
}
