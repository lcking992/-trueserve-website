export type AppRole = 'ADMIN' | 'PM' | 'OPS' | 'SUPPORT' | 'FINANCE' | 'READONLY' | 'QA_TESTER' | 'MERCHANT' | 'DRIVER' | 'CUSTOMER';

export const ADMIN_ROLES: AppRole[] = ['ADMIN', 'PM', 'OPS', 'SUPPORT', 'FINANCE', 'READONLY', 'QA_TESTER'];

export type Permission =
    | 'view_dashboard'
    | 'view_analytics'
    | 'approve_restaurants'
    | 'manage_menu'
    | 'view_orders'
    | 'intervene_orders'
    | 'approve_drivers'
    | 'manage_payouts'
    | 'manage_pricing'
    | 'manage_feature_flags'
    | 'manage_system_settings'
    | 'manage_team'
    | 'manage_content'
    | 'view_users'
    | 'review_driver_documents'
    | 'view_audit_logs'
    | 'access_qa_toolbox';

export type AdminSection =
    | 'dashboard'
    | 'analytics'
    | 'team'
    | 'support'
    | 'live-chats'
    | 'content'
    | 'users'
    | 'cost-management'
    | 'pricing'
    | 'feature-switches'
    | 'settings'
    | 'stripe-testing'
    | 'dev-hub';

export type AdminNavItem = {
    href: string;
    label: string;
    icon: string;
    section: AdminSection;
};

export const PERMISSION_LABELS: Record<Permission, string> = {
    view_dashboard: 'View Dashboard',
    view_analytics: 'View Analytics',
    approve_restaurants: 'Approve Restaurants',
    manage_menu: 'Manage Menu',
    view_orders: 'View Orders',
    intervene_orders: 'Intervene Orders',
    approve_drivers: 'Approve Drivers',
    manage_payouts: 'Manage Payouts',
    manage_pricing: 'Manage Pricing',
    manage_feature_flags: 'Manage Feature Flags',
    manage_system_settings: 'Manage System Settings',
    manage_team: 'Manage Team',
    manage_content: 'Manage Content',
    view_users: 'View Users',
    review_driver_documents: 'Review Driver Documents',
    view_audit_logs: 'View Audit Logs',
    access_qa_toolbox: 'Access QA Toolbox',
};

export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
    view_dashboard: 'Open the main admin dashboard and summary tiles.',
    view_analytics: 'Review platform trends, counts, and revenue snapshots.',
    approve_restaurants: 'Review and approve merchant onboarding requests.',
    manage_menu: 'Moderate menu items and menu sync workflows.',
    view_orders: 'Inspect order activity and fulfillment history.',
    intervene_orders: 'Step into live conversations and active escalations.',
    approve_drivers: 'Approve, reject, or recheck driver applications.',
    manage_payouts: 'Control Stripe and payout-related operations.',
    manage_pricing: 'Edit delivery fees and pricing rules.',
    manage_feature_flags: 'Enable or disable feature flags for pilots and QA.',
    manage_system_settings: 'Change platform configuration and system settings.',
    manage_team: 'Invite, update, and manage internal staff accounts.',
    manage_content: 'Edit CMS content, policies, and in-app copy.',
    view_users: 'Browse the user directory and account status.',
    review_driver_documents: 'Open signed driver documents for application review.',
    view_audit_logs: 'Inspect change history and admin activity logs.',
    access_qa_toolbox: 'Use QA-only tooling and verification flows.',
};

export const ROLE_LABELS: Record<AppRole, string> = {
    ADMIN: 'Super Admin',
    PM: 'Project Manager',
    OPS: 'Operations',
    SUPPORT: 'Support',
    FINANCE: 'Finance',
    READONLY: 'Read Only',
    QA_TESTER: 'QA',
    MERCHANT: 'Merchant',
    DRIVER: 'Driver',
    CUSTOMER: 'Customer',
};

export const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
    ADMIN: 'Full platform access, including security, billing, and configuration.',
    PM: 'Coordinates rollout work, team activity, content, and operational oversight.',
    OPS: 'Handles day-to-day operations, menu checks, and partner workflow review.',
    SUPPORT: 'Works live support and customer escalation resolution.',
    FINANCE: 'Reviews revenue, payouts, and cost-management data.',
    READONLY: 'Can review operational data without making changes.',
    QA_TESTER: 'Validates release flows, flags, and QA-only tools.',
    MERCHANT: 'Merchant-facing portal role.',
    DRIVER: 'Driver-facing portal role.',
    CUSTOMER: 'Customer-facing role.',
};

const ALL_ADMIN_PERMISSIONS: Permission[] = [
    'view_dashboard',
    'view_analytics',
    'approve_restaurants',
    'manage_menu',
    'view_orders',
    'intervene_orders',
    'approve_drivers',
    'manage_payouts',
    'manage_pricing',
    'manage_feature_flags',
    'manage_system_settings',
    'manage_team',
    'manage_content',
    'view_users',
    'review_driver_documents',
    'view_audit_logs',
    'access_qa_toolbox',
];

export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
    ADMIN: [...ALL_ADMIN_PERMISSIONS],
    PM: [
        'view_dashboard',
        'view_analytics',
        'approve_restaurants',
        'manage_menu',
        'view_orders',
        'intervene_orders',
        'approve_drivers',
        'manage_team',
        'manage_content',
        'view_users',
        'review_driver_documents',
        'view_audit_logs',
    ],
    OPS: [
        'view_dashboard',
        'view_analytics',
        'approve_restaurants',
        'manage_menu',
        'view_orders',
        'intervene_orders',
        'approve_drivers',
        'manage_content',
        'view_users',
        'review_driver_documents',
    ],
    SUPPORT: [
        'view_dashboard',
        'view_analytics',
        'view_orders',
        'intervene_orders',
        'view_users',
    ],
    FINANCE: [
        'view_dashboard',
        'view_analytics',
        'view_orders',
        'manage_payouts',
        'view_audit_logs',
    ],
    READONLY: [
        'view_dashboard',
        'view_analytics',
        'view_orders',
        'view_users',
        'view_audit_logs',
    ],
    QA_TESTER: [
        'view_dashboard',
        'view_analytics',
        'view_orders',
        'intervene_orders',
        'manage_feature_flags',
        'access_qa_toolbox',
        'view_users',
    ],
    MERCHANT: [],
    DRIVER: [],
    CUSTOMER: [],
};

export const ADMIN_SECTION_PERMISSIONS: Record<AdminSection, Permission[]> = {
    dashboard: ['view_dashboard'],
    analytics: ['view_analytics'],
    team: ['manage_team'],
    support: ['intervene_orders'],
    'live-chats': ['intervene_orders'],
    content: ['manage_content'],
    users: ['review_driver_documents'],
    'cost-management': ['manage_payouts'],
    pricing: ['manage_pricing'],
    'feature-switches': ['manage_feature_flags'],
    settings: ['manage_system_settings'],
    'stripe-testing': ['manage_payouts', 'access_qa_toolbox'],
    'dev-hub': ['view_dashboard'],
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: 'Analytics', section: 'dashboard' },
    { href: '/admin/cost-management', label: 'Cost Management', icon: 'Cost', section: 'cost-management' },
    { href: '/admin/pricing', label: 'Pricing', icon: 'Payment', section: 'pricing' },
    { href: '/admin/feature-switches', label: 'Feature Switches', icon: 'Tools', section: 'feature-switches' },
    { href: '/admin/team', label: 'Team', icon: 'Team', section: 'team' },
    { href: '/admin/support', label: 'Support', icon: 'Support', section: 'support' },
    { href: '/admin/content', label: 'Content', icon: 'Note', section: 'content' },
    { href: '/admin/analytics', label: 'Analytics', icon: 'Trend', section: 'analytics' },
    { href: '/admin/users', label: 'Users', icon: 'User', section: 'users' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️', section: 'settings' },
    { href: '/admin/stripe-testing', label: 'Stripe Testing', icon: 'Test', section: 'stripe-testing' },
    { href: '/admin/dev-hub', label: 'Dev & QA Hub', icon: 'Checklist', section: 'dev-hub' },
];

export const ADMIN_ROLE_MATRIX = ADMIN_ROLES.map((role) => ({
    role,
    label: ROLE_LABELS[role],
    description: ROLE_DESCRIPTIONS[role],
    permissions: ROLE_PERMISSIONS[role],
}));

export function getRolePermissions(role: string | undefined): Permission[] {
    if (!role) return [];
    return ROLE_PERMISSIONS[role as AppRole] || [];
}

export function hasPermission(role: string | undefined, permission: Permission): boolean {
    if (!role) return false;
    return getRolePermissions(role).includes(permission);
}

export function hasAnyPermission(role: string | undefined, permissions: Permission[]): boolean {
    if (!role) return false;
    const rolePermissions = getRolePermissions(role);
    return permissions.some((permission) => rolePermissions.includes(permission));
}

export function canAccessAdminSection(role: string | undefined, section: AdminSection): boolean {
    const requiredPermissions = ADMIN_SECTION_PERMISSIONS[section] || [];
    return hasAnyPermission(role, requiredPermissions);
}

export function isAdminRole(role: string | undefined): role is AppRole {
    return !!role && ADMIN_ROLES.includes(role as AppRole);
}

export function isInternalStaff(role: string | undefined): boolean {
    return isAdminRole(role);
}

export function getRoleLabel(role?: string) {
    if (!role) return 'Guest';
    return ROLE_LABELS[role as AppRole] || role;
}

export function getRoleDescription(role?: string) {
    if (!role) return 'Not signed in';
    return ROLE_DESCRIPTIONS[role as AppRole] || 'User';
}

export function getPermissionLabel(permission: Permission) {
    return PERMISSION_LABELS[permission];
}

export function getPermissionDescription(permission: Permission) {
    return PERMISSION_DESCRIPTIONS[permission];
}
