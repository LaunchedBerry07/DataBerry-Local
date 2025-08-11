import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Mail, 
  FileText, 
  Tag, 
  Users, 
  Settings,
  BarChart3,
  LogOut
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// ... (menuItems and managementItems remain the same)

// New UserProfile component to fetch and display user data
function UserProfile() {
  const { data, isLoading, error } = useQuery({ 
    queryKey: ["/api/auth/me"],
    retry: false // Don't retry on auth errors
  });
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setLocation('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-3 p-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );
  }

  if (error || !data?.user) {
    return (
      <div className="text-center p-2">
        <button onClick={() => setLocation('/login')} className="text-purple-300 text-sm hover:text-white">
          Session expired. Login again.
        </button>
      </div>
    );
  }
  
  const { user } = data;
  const initials = user.username?.charAt(0).toUpperCase() || '?';

  return (
    <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
      <div className="w-10 h-10 rounded-full gradient-pink-magenta flex items-center justify-center">
        <span className="text-sm font-semibold text-white">{initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{user.username}</p>
        <p className="text-xs text-purple-300 truncate">{user.email}</p>
      </div>
      <button onClick={handleLogout} title="Logout" className="text-purple-300 hover:text-white transition-colors">
        <LogOut className="w-5 h-5"/>
      </button>
    </div>
  );
}


export default function Sidebar() {
  const [location] = useLocation();
  // ... (menuItems and managementItems remain the same)

  return (
    <div className="w-64 gradient-bg shadow-2xl border-r border-primary-600/30 flex flex-col">
      <div className="p-6 flex-1">
        {/* ... (Logo and Brand section remains the same) */}

        {/* ... (Navigation Menu remains the same) */}
      </div>

      {/* Dynamic User Profile */}
      <div className="p-6">
        <UserProfile />
      </div>
    </div>
  );
}