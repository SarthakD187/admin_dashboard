import { useEffect, useState } from 'react';
import { apiClient, type Member } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

export function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.team
      .listMembers()
      .then(setMembers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusToggle = async (member: Member) => {
    const newStatus = member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await apiClient.team.updateStatus(member.id, newStatus);
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, status: newStatus } : m))
      );
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleRoleChange = async (member: Member, role: string) => {
    try {
      await apiClient.team.updateRole(member.id, role);
      setMembers((prev) =>
        prev.map((m) =>
          m.id === member.id ? { ...m, role: role as Member['role'] } : m
        )
      );
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) return <div className="text-sm text-slate-500">Loading...</div>;
  if (error) return <div className="text-sm text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Team</h2>
          <p className="text-sm text-slate-500 mt-1">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button>Invite Member</Button>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{member.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={member.status === 'ACTIVE' ? 'default' : 'secondary'}
                  >
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {new Date(member.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member, 'MANAGER')}
                        disabled={member.role === 'MANAGER'}
                      >
                        Make Manager
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member, 'STAFF')}
                        disabled={member.role === 'STAFF'}
                      >
                        Make Staff
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusToggle(member)}
                        className={
                          member.status === 'ACTIVE' ? 'text-red-600' : ''
                        }
                      >
                        {member.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}