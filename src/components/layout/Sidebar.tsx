import { NavLink } from 'react-router-dom';
import { Users, LayoutDashboard, UserCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/customers', icon: UserCircle, label: 'Customers' },
];

export function Sidebar() {
  return (
    <aside className="w-64 h-screen border-r bg-white flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-semibold tracking-tight">Admin</h1>
      </div>
      <Separator />
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}