import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Demo component for easy role switching during development
const RoleSwitcher = () => {
  const [, setLocation] = useLocation();
  const { user, login } = useAuth();
  const { toast } = useToast();
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    // Check if we should show demo mode - only in development
    if (process.env.NODE_ENV === 'development') {
      setDemoMode(true);
    }
  }, []);

  if (!demoMode) return null;

  const switchToRole = async (role: string) => {
    let username, password;

    switch (role) {
      case "viewer":
        username = "viewer";
        password = "viewer123";
        break;
      case "creator":
        username = "creator";
        password = "creator123";
        break;
      case "admin":
        username = "admin";
        password = "admin123";
        break;
      default:
        return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      login(data.token, data.user);

      toast({
        title: `Switched to ${role}`,
        description: `You're now using CodeCast as a ${role}.`,
      });

      // Redirect to appropriate page based on role
      if (role === 'admin') {
        setLocation('/admin/dashboard');
      } else if (role === 'creator') {
        setLocation('/creator/dashboard');
      } else {
        setLocation('/');
      }
    } catch (error) {
      toast({
        title: "Demo login failed",
        description: "Could not switch roles. Try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mb-6 bg-[#1f2937] p-4 rounded-lg border border-gray-700">
      <h2 className="text-lg font-semibold mb-2">Demo Role Switcher</h2>
      <div className="flex space-x-2">
        <Button 
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
          onClick={() => switchToRole("viewer")}
        >
          Viewer
        </Button>
        <Button 
          className="px-4 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] transition"
          onClick={() => switchToRole("creator")}
        >
          Creator
        </Button>
        <Button 
          className="px-4 py-2 bg-[#EC4899] text-white rounded-md hover:opacity-90 transition"
          onClick={() => switchToRole("admin")}
        >
          Admin
        </Button>
      </div>
      {user && (
        <p className="mt-2 text-sm text-gray-400">
          Currently logged in as: <span className="font-medium">{user.username}</span> ({user.role})
        </p>
      )}
    </div>
  );
};

export default RoleSwitcher;
