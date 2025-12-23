import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { Info, Sparkles } from "lucide-react";

interface VillagerCardProps {
  villager: {
    id: string;
    name: string;
    age: number;
    county: string;
    constituency: string;
    ward: string;
    story: string;
    dream?: string;
    profileImageUrl?: string;
    currentAmount: string;
    targetAmount: string;
    status: string;
    licenseType?: string;
    programType?: string;
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
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-500 border-kenya-red/10" data-testid={`card-villager-${villager.id}`}>
        <div className="relative overflow-hidden aspect-[4/3]">
          <motion.img
            src={villager.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"}
            alt={`${villager.name}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            data-testid={`img-villager-${villager.id}`}
          />

          {/* Glass Overlay for Dream */}
          <AnimatePresence>
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="text-white"
              >
                <Sparkles className="w-6 h-6 text-kenya-gold mx-auto mb-3" />
                <p className="text-sm font-medium italic mb-2 tracking-wide leading-relaxed">
                  "{villager.dream || 'My dream is to support my family and build a future in Nairobi.'}"
                </p>
                <div className="w-12 h-0.5 bg-kenya-gold mx-auto" />
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 items-end">
            <Badge className={`${statusBadge.color} border-0 shadow-lg`} data-testid={`badge-status-${villager.id}`}>
              {statusBadge.text}
            </Badge>
            {villager.licenseType && villager.licenseType !== 'none' && (
              <Badge className="bg-gray-900 text-white border-0 shadow-lg flex items-center gap-1">
                <span className="text-[10px] uppercase opacity-70">Class</span>
                {villager.licenseType}
              </Badge>
            )}
            {villager.programType === 'bike_deposit' && (
              <Badge className="bg-trust-blue text-white border-0 shadow-lg">
                Bike Deposit
              </Badge>
            )}
            {villager.programType === 'nairobi_driver' && (
              <Badge className="bg-kenya-black text-white border-0 shadow-lg">
                Driver Track
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-kenya-red transition-colors" data-testid={`text-villager-name-${villager.id}`}>
              {villager.name}
            </h3>
          </div>

          <p className="text-gray-500 text-sm font-medium mb-4" data-testid={`text-villager-info-${villager.id}`}>
            {villager.age} years old • {villager.ward}, {villager.constituency}
          </p>

          {/* Progress Bar Container */}
          <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-tight">
              <span>Goal Progress</span>
              <span className="text-kenya-red" data-testid={`text-progress-${villager.id}`}>{progress}%</span>
            </div>
            <Progress
              value={progress}
              className="h-2 mb-3 bg-gray-200"
              data-testid={`progress-bar-${villager.id}`}
            />
            <div className="text-xs font-medium text-gray-400" data-testid={`text-funding-amount-${villager.id}`}>
              <span className="text-gray-900 font-bold">KSh {parseFloat(villager.currentAmount).toLocaleString()}</span> raised of KSh {parseFloat(villager.targetAmount).toLocaleString()}
            </div>
          </div>

          <div className="flex gap-2">
            {isFullyFunded ? (
              <Button
                variant="secondary"
                className="flex-1 rounded-lg font-bold"
                disabled
                data-testid={`button-fully-sponsored-${villager.id}`}
              >
                Fully Sponsored
              </Button>
            ) : (
              <Button
                className="flex-1 bg-kenya-red hover:bg-black text-white rounded-lg font-bold shadow-lg shadow-kenya-red/10 transition-all"
                onClick={() => {
                  const type = villager.programType === 'bike_deposit' ? 'deposit' : 'full';
                  navigate(`/checkout?villager=${villager.id}&type=${type}`);
                }}
                data-testid={`button-sponsor-${villager.id}`}
              >
                Sponsor {villager.name.split(' ')[0]}
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className="rounded-lg hover:border-kenya-red hover:text-kenya-red transition-colors"
              onClick={() => navigate(`/villager/${villager.id}`)}
              data-testid={`button-info-${villager.id}`}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div >
  );
}
