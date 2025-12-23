import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/navigation";
import { format } from "date-fns";
import { Villager, Sponsorship, ProgressUpdate } from "@shared/schema";
import ProgressTracker from "@/components/progress-tracker";
import Messaging from "@/components/messaging";
import { ArrowLeft, Heart, MessageCircle, Users, TrendingUp, Target } from "lucide-react";

export default function VillagerDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();

  const { data: villager, isLoading } = useQuery<Villager>({
    queryKey: ["/api/villagers", id],
  });

  const { data: sponsorships = [] } = useQuery<Sponsorship[]>({
    queryKey: ["/api/sponsorships", id],
    enabled: !!id,
  });

  const { data: progressUpdates = [] } = useQuery<ProgressUpdate[]>({
    queryKey: ["/api/progress", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!villager) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Villager Not Found</h1>
              <p className="text-gray-600 mb-4">The villager you're looking for doesn't exist.</p>
              <Button onClick={() => navigate("/")} data-testid="button-go-back">
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const calculateProgress = (current: string, target: string) => {
    return Math.round((parseFloat(current) / parseFloat(target)) * 100);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      available: { variant: "secondary" as const, text: "Available" },
      partially_funded: { variant: "default" as const, text: "25% Funded" },
      fully_funded: { variant: "outline" as const, text: "Fully Funded" },
      in_training: { variant: "default" as const, text: "In Training" },
      active: { variant: "default" as const, text: "Active" },
    };

    return statusMap[status as keyof typeof statusMap] || { variant: "secondary" as const, text: status };
  };

  const fundingProgress = calculateProgress(villager.currentAmount, villager.targetAmount);
  const statusBadge = getStatusBadge(villager.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Villagers
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={villager.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"}
                      alt={`${villager.name} profile`}
                      className="w-48 h-48 object-cover rounded-xl shadow-lg"
                      data-testid="img-profile"
                    />
                  </div>

                  {/* Profile Info */}
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h1 className="text-3xl font-bold text-gray-900" data-testid="text-villager-name">
                            {villager.name}
                          </h1>
                          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">
                            Slot #{villager.id}/2000
                          </Badge>
                        </div>
                        <p className="text-lg text-gray-600 mb-4" data-testid="text-villager-info">
                          {villager.age} years old • {villager.ward}, {villager.constituency}
                        </p>
                      </div>
                      <Badge variant={statusBadge.variant} className="text-sm" data-testid="badge-status">
                        {statusBadge.text}
                      </Badge>
                    </div>

                    <p className="text-gray-700 mb-6 leading-relaxed" data-testid="text-villager-story">
                      {villager.story}
                    </p>

                    {/* Funding Progress */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Funding Progress</span>
                        <span data-testid="text-funding-progress">{fundingProgress}%</span>
                      </div>
                      <Progress value={fundingProgress} className="h-3 mb-2" data-testid="progress-funding" />
                      <div className="text-sm text-gray-500" data-testid="text-funding-details">
                        KSh {parseFloat(villager.currentAmount).toLocaleString()} of KSh {parseFloat(villager.targetAmount).toLocaleString()} raised
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        className="bg-kenya-red hover:bg-red-700"
                        onClick={() => navigate(`/checkout?villager=${villager.id}&type=full`)}
                        disabled={villager.status === 'fully_funded'}
                        data-testid="button-sponsor"
                      >
                        <Heart className="mr-2 h-4 w-4" />
                        {villager.status === 'fully_funded' ? 'Fully Sponsored' : 'Sponsor Now'}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => navigate(`/checkout?villager=${villager.id}&type=partial`)}
                        disabled={villager.status === 'fully_funded'}
                        data-testid="button-partial-sponsor"
                      >
                        Partial Support
                      </Button>

                      <Button
                        variant="outline"
                        data-testid="button-message"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Send Message
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Updates */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressTracker updates={progressUpdates as any} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-trust-blue rounded-lg flex items-center justify-center mr-3">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-600">Funding Progress</span>
                  </div>
                  <span className="font-semibold" data-testid="stat-funding">{fundingProgress}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-kenya-green rounded-lg flex items-center justify-center mr-3">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-600">Total Sponsors</span>
                  </div>
                  <span className="font-semibold" data-testid="stat-sponsors">{sponsorships.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-kenya-red rounded-lg flex items-center justify-center mr-3">
                      <Heart className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-600">Amount Raised</span>
                  </div>
                  <span className="font-semibold" data-testid="stat-raised">
                    KSh {parseFloat(villager.currentAmount).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-kenya-gold rounded-lg flex items-center justify-center mr-3">
                      <TrendingUp className="h-4 w-4 text-gray-900" />
                    </div>
                    <span className="text-sm text-gray-600">Training Progress</span>
                  </div>
                  <span className="font-semibold" data-testid="stat-training">{villager.trainingProgress}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Sponsorship Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Training & Licensing</span>
                    <span className="font-medium">KSh 8,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transport to Nairobi</span>
                    <span className="font-medium">KSh 2,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Housing (2 months)</span>
                    <span className="font-medium">KSh 8,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bike Deposit</span>
                    <span className="font-medium">KSh 30,000</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-kenya-red">KSh 48,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Sponsors */}
            {sponsorships.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sponsors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sponsorships.slice(0, 3).map((sponsorship: any, index: number) => (
                      <div key={sponsorship.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid={`sponsor-${index}`}>
                        <div>
                          <div className="font-medium text-sm">Anonymous Sponsor</div>
                          <div className="text-xs text-gray-500 capitalize">
                            {sponsorship.sponsorshipType}
                            {sponsorship.componentType && sponsorship.componentType !== 'full' &&
                              ` (${sponsorship.componentType})`}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-kenya-green">
                          KSh {parseFloat(sponsorship.amount).toLocaleString()}
                        </div>
                      </div>
                    ))}

                    {sponsorships.length > 3 && (
                      <div className="text-center text-sm text-gray-500 pt-2">
                        +{sponsorships.length - 3} more sponsors
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Messaging Section */}
        <div className="mt-8">
          <Messaging villagerId={villager.id} />
        </div>
      </div>
    </div>
  );
}
