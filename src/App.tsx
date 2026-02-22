import { Routes, Route } from 'react-router-dom';
import { AuthUser } from 'aws-amplify/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TeamPage } from '@/pages/TeamPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { CustomerDetailPage } from '@/pages/CustomerDetailPage';
import { DashboardPage } from '@/pages/DashboardPage';

interface AppProps {
  signOut?: () => void;
  user?: AuthUser;
}

export default function App({ signOut }: AppProps) {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />
      </Route>
    </Routes>
  );
}