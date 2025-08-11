import { useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import MetricsCards from "@/components/metrics-cards";
import EmailsTable from "@/components/emails-table";
import { ExpensesByCategoryChart, TransactionVolumeChart } from "@/components/dashboard-charts";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [dateRange, setDateRange] = useState("Last 30 days");

  return (
    <div className="flex h-screen overflow-hidden bg-primary-800">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        
        <main className="flex-1 overflow-auto p-6 bg-primary-900/50">
          <MetricsCards />
          
          {/* Sync Emails Action Bar */}
          <div className="gradient-card rounded-2xl p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 gradient-cyan-blue rounded-xl flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Gmail Sync</h2>
                  <p className="text-purple-300">Trigger Google Apps Script data pipeline</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  className="gradient-pink-magenta text-white action-btn"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/sync', { method: 'POST' });
                      const result = await response.json();
                      if (result.success) {
                        alert('Email sync initiated successfully!');
                      }
                    } catch (error) {
                      console.error('Sync failed:', error);
                      alert('Sync failed. Please try again.');
                    }
                  }}
                  data-testid="button-sync-emails"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Emails
                </Button>
                <Button 
                  variant="outline" 
                  className="border-primary-500/50 text-purple-300 hover:text-white"
                  onClick={() => window.open('/api/emails/export', '_blank')}
                  data-testid="button-export-data"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <ExpensesByCategoryChart />
            <TransactionVolumeChart />
          </div>

          {/* Recent Emails Table */}
          <div className="gradient-card rounded-2xl p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 gradient-pink-magenta rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Recent Financial Emails</h2>
                  <p className="text-purple-300">Latest processed documents</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <select 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 bg-primary-600/50 border border-primary-500/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                >
                  <option>Last 30 days</option>
                  <option>Last 7 days</option>
                  <option>This month</option>
                  <option>This year</option>
                </select>

                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 bg-primary-600/50 border border-primary-500/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                >
                  <option>All Categories</option>
                  <option>Invoice</option>
                  <option>Receipt</option>
                  <option>Bill</option>
                  <option>Tax Document</option>
                </select>

                <button className="px-4 py-2 gradient-pink-magenta text-white rounded-xl font-medium action-btn">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    <span>Add Record</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <EmailsTable 
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            dateRange={dateRange}
          />
        </main>
      </div>
    </div>
  );
}
