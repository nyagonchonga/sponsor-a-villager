import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/navigation";
import { isUnauthorizedError } from "@/lib/authUtils";
import { MessageCircle, TrendingUp, Heart, Users, Eye } from "lucide-react";

export default function SponsorPortal() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: sponsorships = [], isLoading: isLoadingSponshorships } = useQuery({
    queryKey: ["/api/my-sponsorships"],
    enabled: isAuthenticated && user?.role === "sponsor",
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || user.role !== "sponsor") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">This portal is only available to sponsors.</p>
            <Button onClick={() => window.location.href = "/"} data-testid="button-go-home">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      available: { variant: "secondary" as const, text: "Available" },
      partially_funded: { variant: "default" as const, text: "25% Funded" },
      fully_funded: { variant: "secondary" as const, text: "Fully Funded" },
      in_training: { variant: "outline" as const, text: "In Training" },
      active: { variant: "default" as const, text: "Active" },
    };
    
    return statusMap[status as keyof typeof statusMap] || { variant: "secondary" as const, text: status };
  };

  const calculateProgress = (current: string, target: string) => {
    return Math.round((parseFloat(current) / parseFloat(target)) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sponsor Portal</h1>
          <p className="text-gray-600">
            Track your sponsored villagers and their journey to independence
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="card-total-sponsorships">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-kenya-red rounded-lg flex items-center justify-center mr-3">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-kenya-red">{sponsorships.length}</div>
                  <p className="text-sm text-gray-600">Total Sponsorships</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-active-villagers">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-kenya-green rounded-lg flex items-center justify-center mr-3">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-kenya-green">
                    {sponsorships.filter((s: any) => s.villager.status === 'active').length}
                  </div>
                  <p className="text-sm text-gray-600">Active Villagers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-total-investment">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-trust-blue rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-trust-blue">
                    KSh {sponsorships.reduce((total: number, s: any) => total + parseFloat(s.amount), 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">Total Investment</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-messages">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-kenya-gold rounded-lg flex items-center justify-center mr-3">
                  <MessageCircle className="h-5 w-5 text-gray-900" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-kenya-gold">0</div>
                  <p className="text-sm text-gray-600">New Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sponsored Villagers */}
        <Card>
          <CardHeader>
            <CardTitle>My Sponsored Villagers</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSponshorships ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-gray-600 mt-4">Loading sponsorships...</p>
              </div>
            ) : sponsorships.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sponsorships Yet</h3>
                <p className="text-gray-600 mb-4">Start sponsoring a villager to see them here.</p>
                <Button onClick={() => window.location.href = "/#villagers"} data-testid="button-browse-villagers">
                  Browse Villagers
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sponsorships.map((sponsorship: any) => {
                  const { villager } = sponsorship;
                  const statusBadge = getStatusBadge(villager.status);
                  const progress = calculateProgress(villager.currentAmount, villager.targetAmount);
                  
                  return (
                    <Card key={sponsorship.id} className="hover:shadow-lg transition-shadow" data-testid={`card-villager-${villager.id}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1" data-testid={`text-villager-name-${villager.id}`}>
                              {villager.name}
                            </h3>
                            <p className="text-sm text-gray-600" data-testid={`text-villager-location-${villager.id}`}>
                              {villager.age} years old • {villager.location}
                            </p>
                          </div>
                          <Badge variant={statusBadge.variant} data-testid={`badge-status-${villager.id}`}>
                            {statusBadge.text}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-700 mb-4" data-testid={`text-villager-story-${villager.id}`}>
                          {villager.story}
                        </p>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Funding Progress</span>
                            <span data-testid={`text-progress-${villager.id}`}>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" data-testid={`progress-${villager.id}`} />
                          <div className="text-sm text-gray-500 mt-1" data-testid={`text-funding-amount-${villager.id}`}>
                            KSh {parseFloat(villager.currentAmount).toLocaleString()} of KSh {parseFloat(villager.targetAmount).toLocaleString()} raised
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Your Contribution: </span>
                            <span className="text-kenya-green font-semibold" data-testid={`text-contribution-${villager.id}`}>
                              KSh {parseFloat(sponsorship.amount).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Type: </span>
                            <span className="capitalize" data-testid={`text-sponsorship-type-${villager.id}`}>
                              {sponsorship.sponsorshipType}
                              {sponsorship.componentType && sponsorship.componentType !== 'full' && 
                                ` (${sponsorship.componentType})`}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-2 mt-4">
                          <Button size="sm" className="flex-1" data-testid={`button-view-details-${villager.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                          <Button size="sm" variant="outline" data-testid={`button-message-${villager.id}`}>
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
