import { getAuthSession } from '@/app/auth/actions';
import { canAccessAdminSection } from '@/lib/rbac';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import AdminPortalWrapper from '../AdminPortalWrapper';
import StripeTestingDashboard from '@/components/admin/StripeTestingDashboard';

export const dynamic = 'force-dynamic';

export default async function StripeTestingPage() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  const { isAuth, role } = await getAuthSession();
  const isAuthorized =
    !!adminSession || (isAuth && canAccessAdminSection(role, 'stripe-testing'));
  if (!isAuthorized) redirect('/admin/login');

  return (
    <AdminPortalWrapper role={role}>
      <div className="adm-page-header">
        <h1>Test Stripe Testing</h1>
        <p>
          Environment health, test card reference, webhook simulator, and Stripe CLI setup — all in one
          place for QA and developers.
        </p>
      </div>
      <div className="adm-page-body">
        <StripeTestingDashboard />
      </div>
    </AdminPortalWrapper>
  );
}
