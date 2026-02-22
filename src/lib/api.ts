import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = 'https://nrdxnvwjb5.execute-api.us-east-1.amazonaws.com/prod';

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

  customers: {
    list: (search?: string) =>
      request<Customer[]>(`/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    get: (id: string) =>
      request<CustomerDetail>(`/customers/${id}`),
    create: (data: Omit<Customer, 'id' | 'createdAt'>) =>
      request<Customer>('/customers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Omit<Customer, 'id' | 'createdAt'>) =>
      request<Customer>(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request(`/customers/${id}`, { method: 'DELETE' }),
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

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: string;
  description: string | null;
  amount: string | null;
  createdAt: string;
  userEmail: string;
}

export interface CustomerDetail extends Customer {
  activities: Activity[];
}