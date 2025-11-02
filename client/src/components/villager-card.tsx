import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { Info } from "lucide-react";

interface VillagerCardProps {
  villager: {
    id: string;
    name: string;
    age: number;
    location: string;
    story: string;
    profileImageUrl?: string;
    currentAmount: string;
    targetAmount: string;
    status: string;
  };
}

export default function VillagerCard({ villager }: VillagerCardProps) {
  const [, navigate] = useLocation();

  const calculateProgress = (current: string, target: string) => {
    return Math.round((parseFloat(current) / parseFloat(target)) * 100);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      available: { variant: "secondary" as const, text: "Available", color: "bg-green-100 text-green-800" },
      partially_funded: { variant: "default" as const, text: "25% Funded", color: "bg-yellow-100 text-yellow-800" },
      fully_funded: { variant: "secondary" as const, text: "Fully Funded", color: "bg-blue-100 text-blue-800" },
      in_training: { variant: "outline" as const, text: "In Training", color: "bg-blue-100 text-blue-800" },
      active: { variant: "default" as const, text: "Active", color: "bg-green-100 text-green-800" },
    };
    
    return statusMap[status as keyof typeof statusMap] || { variant: "secondary" as const, text: status, color: "bg-gray-100 text-gray-800" };
  };

  const progress = calculateProgress(villager.currentAmount, villager.targetAmount);
  const statusBadge = getStatusBadge(villager.status);
  const isFullyFunded = villager.status === 'fully_funded';

  return (
    <Card className="hover:shadow-xl transition-all transform hover:scale-105" data-testid={`card-villager-${villager.id}`}>
      <div className="relative">
        <img 
          src={villager.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
          alt={`${villager.name} - ${villager.age} years old from ${villager.location}`} 
          className="w-full h-48 object-cover"
          data-testid={`img-villager-${villager.id}`}
        />
        <div className="absolute top-3 right-3">
          <Badge className={`${statusBadge.color} border-0`} data-testid={`badge-status-${villager.id}`}>
            {statusBadge.text}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900" data-testid={`text-villager-name-${villager.id}`}>
            {villager.name}
          </h3>
        </div>
        
        <p className="text-gray-600 mb-3" data-testid={`text-villager-info-${villager.id}`}>
          {villager.age} years old • {villager.location}
        </p>
        
        <p className="text-gray-700 mb-4 text-sm line-clamp-3" data-testid={`text-villager-story-${villager.id}`}>
          {villager.story}
        </p>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Funding Progress</span>
            <span data-testid={`text-progress-${villager.id}`}>{progress}%</span>
          </div>
          <Progress 
            value={progress} 
            className="h-2 mb-2" 
            data-testid={`progress-bar-${villager.id}`}
          />
          <div className="text-sm text-gray-500" data-testid={`text-funding-amount-${villager.id}`}>
            KSh {parseFloat(villager.currentAmount).toLocaleString()} of KSh {parseFloat(villager.targetAmount).toLocaleString()} raised
          </div>
        </div>

        <div className="flex space-x-2">
          {isFullyFunded ? (
            <Button 
              variant="secondary" 
              className="flex-1 cursor-not-allowed" 
              disabled
              data-testid={`button-fully-sponsored-${villager.id}`}
            >
              Fully Sponsored
            </Button>
          ) : (
            <Button 
              className="flex-1 bg-kenya-red hover:bg-red-700 text-white"
              onClick={() => navigate(`/checkout?villager=${villager.id}&type=full`)}
              data-testid={`button-sponsor-${villager.id}`}
            >
              Sponsor {villager.name.split(' ')[0]}
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/villager/${villager.id}`)}
            data-testid={`button-info-${villager.id}`}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
