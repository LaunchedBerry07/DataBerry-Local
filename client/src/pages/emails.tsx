import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import EmailsTable from "@/components/emails-table";
import AdvancedFilters from "../components/advanced-filters";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Download, FolderOpen } from "lucide-react";
import EmailFormDialog from "../components/email-form-dialog";

export default function EmailsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [dateRange, setDateRange] = useState("Last 30 days");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-primary-800">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        
        <main className="flex-1 overflow-auto p-6 bg-primary-900/50">
          {/* Page Header */}
          <div className="gradient-card rounded-2xl p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Financial Emails</h1>
                <p className="text-purple-300">Manage and organize your financial documents</p>
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

                <Button 
                  variant="outline"
                  className="border-primary-500/50 text-purple-300 hover:text-white"
                  onClick={() => {
                    const params = new URLSearchParams({
                      ...(searchQuery && { search: searchQuery }),
                      ...(selectedCategory !== "All Categories" && { category: selectedCategory }),
                      ...(dateRange !== "Last 30 days" && { dateRange })
                    });
                    window.open(`/api/emails/export?${params.toString()}`, '_blank');
                  }}
                  data-testid="button-export-csv"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export to CSV
                </Button>
                
                <Button 
                  variant="outline"
                  className="border-primary-500/50 text-purple-300 hover:text-white"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Save to Drive
                </Button>

                <Button 
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  variant="outline"
                  className="border-primary-500/50 text-purple-300 hover:text-white action-btn"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced Filters
                </Button>

                <EmailFormDialog />
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="mb-6">
              <AdvancedFilters />
            </div>
          )}

          {/* Email Table */}
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