export interface AppMock {
  id: string;
  name: string;
  clientId: string;
  type: 'confidential' | 'public';
  organizationName: string;
  organizationId: string;
  createdAt: string; // ISO string
  status: 'ACTIVE' | 'INACTIVE';
  redirectUris: string[];
  allowedScopes: string[];
}

export const MOCK_APPLICATIONS: AppMock[] = [
  {
    id: '1', name: 'Main Portal', clientId: 'main-portal', type: 'confidential',
    organizationName: 'Acme Corp', organizationId: 'org-1',
    createdAt: '2025-01-01', status: 'ACTIVE',
    redirectUris: ['https://portal.acmecorp.com/callback'],
    allowedScopes: ['openid', 'profile', 'email', 'offline_access', 'groups', 'permissions']
  },
  {
    id: '2', name: 'Mobile App', clientId: 'mobile-app', type: 'public',
    organizationName: 'Acme Corp', organizationId: 'org-1',
    createdAt: '2025-02-01', status: 'ACTIVE',
    redirectUris: ['myapp://callback'],
    allowedScopes: ['openid', 'profile', 'email']
  },
  {
    id: '3', name: 'Dev Dashboard', clientId: 'dev-dashboard', type: 'confidential',
    organizationName: 'Beta LLC', organizationId: 'org-2',
    createdAt: '2025-03-05', status: 'ACTIVE',
    redirectUris: ['http://localhost:3000/callback'],
    allowedScopes: ['openid', 'profile', 'email', 'offline_access']
  },
  {
    id: '4', name: 'Analytics Tool', clientId: 'analytics-tool', type: 'confidential',
    organizationName: 'Gamma Inc', organizationId: 'org-3',
    createdAt: '2025-04-10', status: 'INACTIVE',
    redirectUris: ['https://analytics.gammainc.com/auth'],
    allowedScopes: ['openid', 'profile', 'groups', 'permissions']
  }
];
