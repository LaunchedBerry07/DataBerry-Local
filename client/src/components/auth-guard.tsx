import { useLocation } from "wouter";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface AuthGuardProps {
  children: React.ReactNode;
}

// This hook now performs a real authentication check against the server
const useAuth = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: 1, // Only retry once on failure
  });

  const isAuthenticated = !!data?.user && !isError;

  return { isAuthenticated, isLoading };
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Clear any stale auth tokens and redirect to login
      localStorage.removeItem('auth-token');
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 gradient-pink-magenta rounded-2xl flex items-center justify-center animate-pulse">
            <span className="text-2xl font-bold text-white">B</span>
          </div>
          <p className="text-purple-300">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // The useEffect hook will handle the redirect
  }

  return <>{children}</>;
}