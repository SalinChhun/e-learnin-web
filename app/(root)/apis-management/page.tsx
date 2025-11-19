import HeadLabel from '@/components/ui/bar/PageLabel';
import { getServerSession } from 'next-auth';
import authOptions from '@/utils/authOptions';
import ApiManagementContainer from "@/components/ui/api-management/ApiManagementContainer";

export default async function ApiManagementPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="h-100 d-flex flex-column px-4 mb-4 overflow-hidden">
      <HeadLabel />
      <ApiManagementContainer sessionData={session} />
    </div>
  );
}
