import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import Dashboard from "@/pages/dashboard";
import EmailsPage from "@/pages/emails";
import LabelsPage from "@/pages/labels";
import ContactsPage from "@/pages/contacts";
import SettingsPage from "@/pages/settings";
import LoginPage from "@/pages/login";
import NotFound from "@/pages/not-found";
import AuthGuard from "@/components/auth-guard";

function RootRedirect() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Check authentication status and redirect accordingly
    const token = localStorage.getItem('auth-token');
    if (token) {
      setLocation("/dashboard");
    } else {
      setLocation("/login");
    }
  }, [setLocation]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRedirect} />
      <Route path="/login" component={LoginPage} />
      
      {/* Protected routes */}
      <Route path="/dashboard">
        <AuthGuard>
          <Dashboard />
        </AuthGuard>
      </Route>
      
      <Route path="/emails">
        <AuthGuard>
          <EmailsPage />
        </AuthGuard>
      </Route>
      
      <Route path="/labels">
        <AuthGuard>
          <LabelsPage />
        </AuthGuard>
      </Route>
      
      <Route path="/contacts">
        <AuthGuard>
          <ContactsPage />
        </AuthGuard>
      </Route>
      
      <Route path="/settings">
        <AuthGuard>
          <SettingsPage />
        </AuthGuard>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
