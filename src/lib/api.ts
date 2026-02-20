import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = 'https://4y5hhy0qog.execute-api.us-east-1.amazonaws.com/prod';

async function getAuthHeader(): Promise<Record<string, string>> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) throw new Error('Not authenticated');
  return { Authorization: token };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data.data;
}

export const apiClient = {
  team: {
    listMembers: () => request<Member[]>('/team/members'),
    updateRole: (id: string, role: string) =>
      request(`/team/members/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    updateStatus: (id: string, status: string) =>
      request(`/team/members/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    inviteMember: (email: string, role: string) =>
      request('/team/invite', {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      }),
  },
};

export interface Member {
  id: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  lastActiveAt: string | null;
}