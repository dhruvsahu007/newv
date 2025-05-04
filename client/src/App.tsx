import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Layout components
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

// Pages
import Home from "@/pages/home";
import VideoPage from "@/pages/video";
import Login from "@/pages/login";
import Register from "@/pages/register";
import WatchLater from "@/pages/watch-later";
import WatchHistory from "@/pages/watch-history";
import CreatorDashboard from "@/pages/creator/dashboard";
import CreatorUpload from "@/pages/creator/upload";
import AdminDashboard from "@/pages/admin/dashboard";
import NotFound from "@/pages/not-found";

// Auth context provider
import { AuthProvider, useAuth } from "@/hooks/use-auth";

function ProtectedRoute({ 
  component: Component, 
  requiredRoles = [],
}: { 
  component: React.ComponentType;
  requiredRoles?: string[];
}) {
  const [location, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login if not authenticated
      setLocation("/login");
    } else if (!isLoading && user && requiredRoles.length > 0) {
      // Check role-based access
      if (!requiredRoles.includes(user.role)) {
        setLocation("/");
      }
    }
  }, [user, isLoading, setLocation]);
  
  if (isLoading) return <div>Loading...</div>;
  
  if (!user) return null;
  
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return null;
  }
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/video/:id" component={VideoPage} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/watch-later" component={WatchLater} />
      <Route path="/watch-history" component={WatchHistory} />
      
      {/* Creator Routes */}
      <Route path="/creator/dashboard">
        <ProtectedRoute component={CreatorDashboard} requiredRoles={["creator", "admin"]} />
      </Route>
      <Route path="/creator/upload">
        <ProtectedRoute component={CreatorUpload} requiredRoles={["creator", "admin"]} />
      </Route>
      <Route path="/creator/edit/:id">
        <ProtectedRoute component={CreatorUpload} requiredRoles={["creator", "admin"]} />
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard">
        <ProtectedRoute component={AdminDashboard} requiredRoles={["admin"]} />
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="flex flex-col min-h-screen bg-[#111827] text-[#F9FAFB]">
            <Header />
            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Router />
            </main>
            <Footer />
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
