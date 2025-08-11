import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

// ... (CustomTooltip component remains the same)

interface ChartData {
  expensesByCategory: { name: string; amount: number }[];
  transactionVolume: { name: string; emails: number }[];
}

export function ExpensesByCategoryChart() {
  const { data, isLoading } = useQuery<ChartData>({ queryKey: ["/api/dashboard/charts"] });

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  return (
    <div className="gradient-card rounded-2xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Expenses by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data?.expensesByCategory}>
          <CartesianGrid strokeDasharray="3 3" stroke="#6366f1" opacity={0.2} />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#c4b5fd', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#c4b5fd', fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="amount" 
            fill="url(#expenseGradient)" 
            radius={[8, 8, 0, 0]}
          />
          <defs>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF6B9D" />
              <stop offset="100%" stopColor="#A663CC" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TransactionVolumeChart() {
  const { data, isLoading } = useQuery<ChartData>({ queryKey: ["/api/dashboard/charts"] });
  
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  return (
    <div className="gradient-card rounded-2xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Transaction Volume (Last 6 Months)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data?.transactionVolume}>
          <CartesianGrid strokeDasharray="3 3" stroke="#6366f1" opacity={0.2} />
          <XAxis 
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#c4b5fd', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#c4b5fd', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="emails" 
            stroke="#54C6EB" 
            strokeWidth={3}
            dot={{ fill: '#54C6EB', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, stroke: '#54C6EB', strokeWidth: 2, fill: '#1e1b4b' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}