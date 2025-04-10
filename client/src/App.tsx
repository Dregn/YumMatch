import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ChefProfile from "@/pages/ChefProfile";
import MenuDetails from "@/pages/MenuDetails";
import AuthPage from "@/pages/auth-page";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute, RoleProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Switch>
        <Route path="/auth">
          <AuthPage />
        </Route>
        
        <Route>
          {/* All routes except /auth have the navbar and footer */}
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/chef/:id" component={ChefProfile} />
                <Route path="/menu/:id" component={MenuDetails} />
                
                {/* Protected client routes */}
                <RoleProtectedRoute 
                  path="/client/dashboard" 
                  role="client" 
                  component={() => <div>Client Dashboard (Coming Soon)</div>} 
                />
                <RoleProtectedRoute 
                  path="/client/bookings" 
                  role="client" 
                  component={() => <div>Client Bookings (Coming Soon)</div>} 
                />
                
                {/* Protected provider routes */}
                <RoleProtectedRoute 
                  path="/provider/dashboard" 
                  role="provider" 
                  component={() => <div>Provider Dashboard (Coming Soon)</div>} 
                />
                <RoleProtectedRoute 
                  path="/provider/services" 
                  role="provider" 
                  component={() => <div>Provider Services (Coming Soon)</div>} 
                />
                
                <Route component={NotFound} />
              </Switch>
            </main>
            <Footer />
          </div>
        </Route>
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
