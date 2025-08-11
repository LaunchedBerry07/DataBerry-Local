import { Search, Download, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Header({ searchQuery, setSearchQuery }: HeaderProps) {
  const { toast } = useToast();

  const handleExportCSV = async () => {
    try {
      const response = await fetch("/api/export/csv");
      if (!response.ok) {
        throw new Error("Export failed");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `emails-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "CSV file has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export CSV file. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-primary-700/50 backdrop-blur-sm border-b border-primary-600/30 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Finance Dashboard</h1>
          <p className="text-purple-300 mt-1">Monitor and manage your financial documents</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search emails..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 pl-10 pr-4 py-2 bg-primary-600/30 backdrop-blur-sm border border-primary-500/50 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-purple-300" />
          </div>

          {/* Export Button */}
          <Button 
            onClick={handleExportCSV}
            className="gradient-cyan-blue text-white action-btn"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative text-purple-300 hover:text-white">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-accent-magenta rounded-full"></span>
          </Button>
        </div>
      </div>
    </header>
  );
}
