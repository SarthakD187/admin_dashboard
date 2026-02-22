import { useEffect, useState } from 'react';
import { apiClient, type AnalyticsData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Users, DollarSign, Activity, UserCheck } from 'lucide-react';

function MetricCard({
  title, value, icon: Icon, format = 'number',
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  format?: 'number' | 'currency';
}) {
  const display = format === 'currency'
    ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : value.toLocaleString();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        <Icon className="w-4 h-4 text-slate-400" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{display}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.analytics
      .get(30)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-slate-500">Loading...</div>;
  if (error) return <div className="text-sm text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">Last 30 days</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Total Customers"
          value={data.metrics.customerCount}
          icon={Users}
        />
        <MetricCard
          title="Total Revenue"
          value={data.metrics.revenueTotal}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Activities This Month"
          value={data.metrics.activityCount}
          icon={Activity}
        />
        <MetricCard
          title="Active Team Members"
          value={data.metrics.teamCount}
          icon={UserCheck}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {data.revenueOverTime.length === 0 ? (
              <p className="text-sm text-slate-500">No revenue data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.revenueOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']}
                    labelFormatter={(l) => new Date(l).toLocaleDateString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0f172a"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {data.activityByType.length === 0 ? (
              <p className="text-sm text-slate-500">No activity data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.activityByType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [v, 'Activities']} />
                  <Bar dataKey="count" fill="#0f172a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}