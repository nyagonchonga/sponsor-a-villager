import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/navigation";
import { Heart, Users, MessageCircle, TrendingUp } from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isSponsor = user.role === "sponsor";
  const isVillager = user.role === "villager";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.firstName || user.email}!
          </h1>
          <p className="text-gray-600">
            {isSponsor && "Manage your sponsorships and connect with villagers"}
            {isVillager && "Update your progress and communicate with sponsors"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isSponsor && (
            <>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => navigate('/sponsor-portal')} 
                data-testid="card-sponsor-portal">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-trust-blue rounded-lg flex items-center justify-center mr-4">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Sponsor Portal</h3>
                      <p className="text-sm text-gray-600">Manage your sponsorships</p>
                    </div>
                  </div>
                  <Button className="w-full" data-testid="button-enter-portal">Enter Portal</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow" data-testid="card-sponsored-villagers">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-kenya-green rounded-lg flex items-center justify-center mr-4">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Sponsored Villagers</h3>
                      <p className="text-sm text-gray-600">Track progress</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-kenya-green">0</div>
                  <p className="text-sm text-gray-500">Active sponsorships</p>
                </CardContent>
              </Card>
            </>
          )}

          {isVillager && (
            <>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => navigate('/villager-portal')} 
                data-testid="card-villager-portal">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-kenya-green rounded-lg flex items-center justify-center mr-4">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Villager Portal</h3>
                      <p className="text-sm text-gray-600">Manage your profile</p>
                    </div>
                  </div>
                  <Button className="w-full" data-testid="button-enter-portal">Enter Portal</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow" data-testid="card-funding-progress">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-trust-blue rounded-lg flex items-center justify-center mr-4">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Funding Progress</h3>
                      <p className="text-sm text-gray-600">Your sponsorship status</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-trust-blue">0%</div>
                  <p className="text-sm text-gray-500">Funding completed</p>
                </CardContent>
              </Card>
            </>
          )}

          <Card className="hover:shadow-lg transition-shadow" data-testid="card-messages">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-kenya-red rounded-lg flex items-center justify-center mr-4">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Messages</h3>
                  <p className="text-sm text-gray-600">Direct communication</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-kenya-red">0</div>
              <p className="text-sm text-gray-500">Unread messages</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              {isSponsor && (
                <>
                  <Button 
                    onClick={() => navigate('/#villagers')}
                    data-testid="button-browse-villagers"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Browse Villagers
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/sponsor-portal')}
                    data-testid="button-view-sponsorships"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    View My Sponsorships
                  </Button>
                </>
              )}
              
              {isVillager && (
                <>
                  <Button 
                    onClick={() => navigate('/villager-portal')}
                    data-testid="button-update-profile"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Update Profile
                  </Button>
                  <Button 
                    variant="outline"
                    data-testid="button-view-sponsors"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Message Sponsors
                  </Button>
                </>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
