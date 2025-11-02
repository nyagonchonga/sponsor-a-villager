import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, MapPin, Camera, Check } from "lucide-react";
import { format } from "date-fns";

interface ProgressUpdate {
  id: string;
  phase: string;
  description: string;
  progress: number;
  imageUrl?: string;
  createdAt: string;
}

interface ProgressTrackerProps {
  updates: ProgressUpdate[];
}

export default function ProgressTracker({ updates }: ProgressTrackerProps) {
  const phases = [
    { key: 'training', title: 'Training & Licensing', icon: '🎓', color: 'bg-kenya-red' },
    { key: 'housing', title: 'Housing Setup', icon: '🏠', color: 'bg-trust-blue' },
    { key: 'bike_deployment', title: 'Bike Deployment', icon: '🚲', color: 'bg-kenya-green' },
    { key: 'active', title: 'Active Operations', icon: '💼', color: 'bg-kenya-gold' },
  ];

  const getPhaseInfo = (phase: string) => {
    return phases.find(p => p.key === phase) || phases[0];
  };

  const getBadgeVariant = (phase: string) => {
    const variants = {
      training: 'default' as const,
      housing: 'secondary' as const,
      bike_deployment: 'outline' as const,
      active: 'default' as const,
    };
    return variants[phase as keyof typeof variants] || 'secondary' as const;
  };

  if (updates.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Camera className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Updates Yet</h3>
          <p className="text-gray-600">Progress updates will appear here as the villager advances through the program.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="progress-tracker">
      {/* Phase Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Check className="mr-2 h-5 w-5 text-kenya-green" />
            Program Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {phases.map((phase, index) => {
              const phaseUpdates = updates.filter(u => u.phase === phase.key);
              const latestUpdate = phaseUpdates[0];
              const isActive = phaseUpdates.length > 0;
              const progress = latestUpdate?.progress || 0;
              
              return (
                <div 
                  key={phase.key} 
                  className={`p-4 rounded-lg border-2 ${isActive ? 'border-kenya-red bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                  data-testid={`phase-${phase.key}`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{phase.icon}</div>
                    <h4 className="font-semibold text-sm mb-2">{phase.title}</h4>
                    <Progress value={progress} className="h-2 mb-2" data-testid={`progress-${phase.key}`} />
                    <div className="text-xs text-gray-600" data-testid={`progress-text-${phase.key}`}>
                      {progress}% Complete
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {updates.map((update, index) => {
              const phaseInfo = getPhaseInfo(update.phase);
              
              return (
                <div key={update.id} className="flex gap-4" data-testid={`update-${update.id}`}>
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full ${phaseInfo.color} flex items-center justify-center text-white font-semibold`}>
                      {update.progress}%
                    </div>
                    {index < updates.length - 1 && (
                      <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getBadgeVariant(update.phase)} data-testid={`badge-phase-${update.id}`}>
                        {phaseInfo.title}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span data-testid={`date-${update.id}`}>
                          {format(new Date(update.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3" data-testid={`description-${update.id}`}>
                      {update.description}
                    </p>
                    
                    {update.imageUrl && (
                      <div className="mb-3">
                        <img 
                          src={update.imageUrl} 
                          alt="Progress update" 
                          className="rounded-lg max-w-sm h-48 object-cover"
                          data-testid={`image-${update.id}`}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Progress value={update.progress} className="w-24 h-2 mr-2" />
                        <span data-testid={`progress-value-${update.id}`}>{update.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
