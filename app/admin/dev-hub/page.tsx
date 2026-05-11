import { getAuthSession } from '@/app/auth/actions';
import { canAccessAdminSection } from '@/lib/rbac';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import AdminPortalWrapper from '../AdminPortalWrapper';
import DevHubDashboard from '@/components/admin/DevHubDashboard';

export const dynamic = 'force-dynamic';

export default async function DevHubPage() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  const { isAuth, role } = await getAuthSession();
  const isAuthorized =
    !!adminSession || (isAuth && canAccessAdminSection(role, 'dev-hub'));
  if (!isAuthorized) redirect('/admin/login');

  return (
    <AdminPortalWrapper role={role}>
      <div className="adm-page-header">
        <h1>Dev & QA Hub</h1>
        <p>
          TDD workflow, test file map, core logic invariants, release checklist, and environment
          rules — the single source of truth for developers and QA testers.
        </p>
      </div>
      <div className="adm-page-body">
        <DevHubDashboard />
      </div>
    </AdminPortalWrapper>
  );
}
