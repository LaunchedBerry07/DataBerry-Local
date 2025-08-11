import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("admin@databerry.com");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Store a token to signify the user is logged in for the AuthGuard
        localStorage.setItem('auth-token', 'logged-in'); 
        toast({ title: "Login Successful", description: "Welcome back!" });
        setLocation("/dashboard");
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // This will redirect the user to the Google OAuth consent screen.
    // The actual flow would be handled by a backend callback endpoint.
    // This is the frontend part of initiating that flow.
    const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: `${window.location.origin}/api/auth/google/callback`,
      client_id: process.env.GOOGLE_CLIENT_ID, // This needs to be set in your environment
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
    };
    
    const qs = new URLSearchParams(options);
    // @ts-ignore
    window.location = `${googleAuthUrl}?${qs.toString()}`;
  };

  return (
    <div className="min-h-screen bg-primary-800 flex items-center justify-center p-4">
      {/* Background Gradient Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 gradient-pink-magenta rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 gradient-cyan-blue rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 gradient-pink-magenta rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">B</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to DataBerry</h1>
          <p className="text-purple-300">Sign in to your Gmail Finance Manager</p>
        </div>

        {/* Login Card */}
        <div className="gradient-card rounded-2xl p-8">
          {/* Google Sign-In */}
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 mb-6"
          >
            <FcGoogle className="w-5 h-5 mr-3" />
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </Button>

          <div className="relative mb-6">
            <Separator className="bg-primary-600/50" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-700 px-3 text-purple-300 text-sm">
              or continue with email
            </span>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-purple-300 text-sm font-medium">
                Email Address
              </Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="pl-10 bg-primary-600/50 border-primary-500/50 text-white"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-purple-300 text-sm font-medium">
                Password
              </Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 bg-primary-600/50 border-primary-500/50 text-white"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 gradient-cyan-blue text-white action-btn mt-6"
            >
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="text-center mt-6 space-y-2">
            <Button variant="link" className="text-purple-300 hover:text-accent-pink p-0 h-auto">
              Forgot your password?
            </Button>
            <div className="text-sm text-purple-400">
              Don't have an account?{" "}
              <Button variant="link" className="text-accent-pink hover:text-accent-pink/80 p-0 h-auto">
                Contact your administrator
              </Button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-center mt-6 text-xs text-purple-400">
          By signing in, you agree to our Terms of Service and Privacy Policy.
          <br />
          Your Gmail data is processed securely and never stored permanently.
        </div>
      </div>
    </div>
  );
}