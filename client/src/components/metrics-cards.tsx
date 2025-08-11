import { useQuery } from "@tanstack/react-query";
import { Mail, AlertTriangle, FileText, DollarSign } from "lucide-react";
import type { DashboardMetrics } from "@shared/schema";

export default function MetricsCards() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const metricCards = [
    {
      title: "Total Emails Processed",
      value: metrics?.totalEmails || 0,
      subtitle: "+12% from last month",
      icon: Mail,
      gradient: "gradient-cyan-blue",
      subtitleColor: "text-green-400",
    },
    {
      title: "Uncategorized Emails",
      value: metrics?.uncategorizedEmails || 0,
      subtitle: "Requires attention",
      icon: AlertTriangle,
      gradient: "from-amber-500 to-orange-500",
      subtitleColor: "text-amber-400",
    },
    {
      title: "Financial Documents",
      value: metrics?.totalDocuments || 0,
      subtitle: "+8% from last month",
      icon: FileText,
      gradient: "gradient-pink-magenta",
      subtitleColor: "text-green-400",
    },
    {
      title: "Monthly Expenses",
      value: formatCurrency(metrics?.monthlyExpenses || 0),
      subtitle: "+5% from last month",
      icon: DollarSign,
      gradient: "from-green-500 to-emerald-500",
      subtitleColor: "text-red-400",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="metric-card rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-primary-600/50 rounded mb-4"></div>
            <div className="h-8 bg-primary-600/50 rounded mb-2"></div>
            <div className="h-3 bg-primary-600/50 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="metric-card rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">{card.title}</p>
                <p className="text-3xl font-bold text-white mt-2">{card.value}</p>
                <p className={`text-sm mt-1 ${card.subtitleColor}`}>{card.subtitle}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-r ${card.gradient} rounded-xl flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
