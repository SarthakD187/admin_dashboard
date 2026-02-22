import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient, type CustomerDetail, type Activity } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Pencil, Trash2, Plus } from 'lucide-react';
import { CustomerForm } from '@/components/customers/CustomerForm';

const ACTIVITY_TYPES = ['sale', 'call', 'meeting', 'email', 'note', 'other'];

function LogActivityForm({
  customerId,
  onSuccess,
}: {
  customerId: string;
  onSuccess: (activity: Activity) => void;
}) {
  const [form, setForm] = useState({ type: 'call', description: '', amount: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.activity.log(customerId, {
        type: form.type,
        description: form.description || undefined,
        amount: form.amount || undefined,
      });
      onSuccess(result);
      setForm({ type: 'call', description: '', amount: '' });
      setOpen(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-1" /> Log Activity
      </Button>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-4 space-y-4">
      <h4 className="font-medium text-sm">Log Activity</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Type</Label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            {ACTIVITY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Amount (optional)</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Description (optional)</Label>
        <Input
          placeholder="What happened?"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={loading} size="sm">
          {loading ? 'Saving...' : 'Save'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiClient.customers
      .get(id)
      .then(setCustomer)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm('Delete this customer? This cannot be undone.')) return;
    try {
      await apiClient.customers.delete(id);
      navigate('/customers');
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) return <div className="text-sm text-slate-500">Loading...</div>;
  if (error) return <div className="text-sm text-red-500">{error}</div>;
  if (!customer) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/customers')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
            <Pencil className="w-4 h-4 mr-1" /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{customer.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Email</p>
              <p className="font-medium">{customer.email ?? '—'}</p>
            </div>
            <div>
              <p className="text-slate-500">Phone</p>
              <p className="font-medium">{customer.phone ?? '—'}</p>
            </div>
            <div>
              <p className="text-slate-500">Added</p>
              <p className="font-medium">
                {new Date(customer.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          {customer.notes && (
            <div className="text-sm pt-2 border-t">
              <p className="text-slate-500 mb-1">Notes</p>
              <p>{customer.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Activity History</h3>
          <LogActivityForm
            customerId={customer.id}
            onSuccess={(activity) =>
              setCustomer((prev) =>
                prev ? { ...prev, activities: [activity, ...prev.activities] } : prev
              )
            }
          />
        </div>
        {customer.activities.length === 0 ? (
          <p className="text-sm text-slate-500">No activity recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {customer.activities.map((a) => (
              <div key={a.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline">{a.type}</Badge>
                  <span className="text-xs text-slate-400">
                    {new Date(a.createdAt).toLocaleDateString()} · {a.userEmail}
                  </span>
                </div>
                {a.description && (
                  <p className="text-sm text-slate-700 mt-1">{a.description}</p>
                )}
                {a.amount && (
                  <p className="text-sm font-medium text-green-600 mt-1">
                    ${parseFloat(a.amount).toFixed(2)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showEdit && (
        <CustomerForm
          customer={customer}
          onClose={() => setShowEdit(false)}
          onSuccess={(updated) => {
            setCustomer({ ...customer, ...updated });
            setShowEdit(false);
          }}
        />
      )}
    </div>
  );
}