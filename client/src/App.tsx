import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import SponsorPortal from "@/pages/sponsor-portal";
import VillagerPortal from "@/pages/villager-portal";
import VillagerRegister from "@/pages/villager-register";
import VillagerDetails from "@/pages/villager-details";
import Checkout from "@/pages/checkout";
import ImpactPage from "@/pages/impact-page";

import AuthPage from "@/pages/auth-page";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Landing} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/impact" component={ImpactPage} />
      <Route path="/villager/:id" component={VillagerDetails} />

      {/* Protected Routes */}
      <Route path="/dashboard">
        {!isAuthenticated ? <Redirect to="/auth" /> : <Home />}
      </Route>
      <Route path="/sponsor-portal">
        {!isAuthenticated ? <Redirect to="/auth" /> : <SponsorPortal />}
      </Route>
      <Route path="/villager-portal">
        {!isAuthenticated ? <Redirect to="/auth" /> : <VillagerPortal />}
      </Route>
      <Route path="/villager-register">
        {!isAuthenticated ? <Redirect to="/auth" /> : <VillagerRegister />}
      </Route>
      <Route path="/checkout">
        {!isAuthenticated ? <Redirect to="/auth" /> : <Checkout />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
