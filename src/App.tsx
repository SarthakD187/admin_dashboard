import { Routes, Route } from 'react-router-dom';
import { AuthUser } from 'aws-amplify/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TeamPage } from '@/pages/TeamPage';

interface AppProps {
  signOut?: () => void;
  user?: AuthUser;
}

export default function App({ signOut }: AppProps) {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<div className="text-2xl font-semibold">Dashboard</div>} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/customers" element={<div className="text-2xl font-semibold">Customers</div>} />
      </Route>
    </Routes>
  );
}