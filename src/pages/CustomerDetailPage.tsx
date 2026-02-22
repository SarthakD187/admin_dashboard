import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient, type CustomerDetail } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { CustomerForm } from '@/components/customers/CustomerForm';

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
          <Button variant="outline" size="sm" onClick={handleDelete}
            className="text-red-600 hover:text-red-700">
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
        <h3 className="text-lg font-semibold mb-3">Activity History</h3>
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