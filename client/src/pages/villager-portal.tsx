import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Villager, Sponsorship, ProgressUpdate } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/navigation";
import ProgressTracker from "@/components/progress-tracker";
import { TrendingUp, Heart, Users, MessageCircle, Camera, Upload, Target } from "lucide-react";
import { useLocation } from "wouter";
import { KISII_COUNTY_DATA } from "@shared/kisii-data";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.coerce.number().min(18, "Must be at least 18 years old").max(35, "Must be under 35"),
  county: z.string().default("Kisii County"),
  constituency: z.string().min(1, "Constituency is required"),
  ward: z.string().min(1, "Ward is required"),
  story: z.string().min(10, "Story must be at least 10 characters"),
  dream: z.string().min(10, "Dream must be at least 10 characters").optional().or(z.literal("")),
  profileImageUrl: z.string().url().optional().or(z.literal("")),
});

const progressUpdateSchema = z.object({
  phase: z.enum(["training", "housing", "bike_deployment", "active"]),
  description: z.string().min(5, "Description must be at least 5 characters"),
  progress: z.number().min(0).max(100),
  imageUrl: z.string().url().optional(),
});

export default function VillagerPortal() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("profile");

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

  const { data: villagerProfile, isLoading: isLoadingProfile, error: profileError } = useQuery<Villager>({
    queryKey: ["/api/villagers/profile"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Redirect to registration only if profile query returns 404 (no profile found)
  useEffect(() => {
    if (!isLoadingProfile && isAuthenticated && !villagerProfile && profileError) {
      const errorResponse = profileError as any;
      // Only redirect on 404, not on other errors
      if (errorResponse?.message === "No villager profile found" ||
        (errorResponse?.response?.status === 404)) {
        navigate("/villager-register");
      }
    }
  }, [isLoadingProfile, isAuthenticated, villagerProfile, profileError]);

  const { data: sponsorships = [] } = useQuery<Sponsorship[]>({
    queryKey: ["/api/sponsorships", villagerProfile?.id],
    enabled: !!villagerProfile?.id,
  });

  const { data: progressUpdates = [] } = useQuery<ProgressUpdate[]>({
    queryKey: ["/api/progress", villagerProfile?.id],
    enabled: !!villagerProfile?.id,
  });

  const profileForm = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: villagerProfile?.name || "",
      age: villagerProfile?.age || 18,
      county: villagerProfile?.county || "Kisii County",
      constituency: villagerProfile?.constituency || "",
      ward: villagerProfile?.ward || "",
      story: villagerProfile?.story || "",
      dream: villagerProfile?.dream || "",
      profileImageUrl: villagerProfile?.profileImageUrl || "",
    },
  });

  const selectedConstituency = profileForm.watch("constituency");
  const constituencyData = KISII_COUNTY_DATA.constituencies.find(c => c.name === selectedConstituency);

  // Reset ward when constituency changes
  useEffect(() => {
    if (selectedConstituency && constituencyData && !constituencyData.wards.includes(profileForm.getValues("ward"))) {
      profileForm.setValue("ward", "");
    }
  }, [selectedConstituency, constituencyData, profileForm]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof updateProfileSchema>) => {
      if (!villagerProfile?.id) throw new Error("No villager profile found");
      await apiRequest("PUT", `/api/villagers/${villagerProfile.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/villagers/profile"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addProgressMutation = useMutation({
    mutationFn: async (data: z.infer<typeof progressUpdateSchema>) => {
      if (!villagerProfile?.id) throw new Error("No villager profile found");
      await apiRequest("POST", "/api/progress", {
        ...data,
        villagerId: villagerProfile.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Progress update added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/progress", villagerProfile?.id] });
      // progressForm.reset(); // Keep form values or reset? Usually reset is better but user might want to add another similar one. Let's reset.
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to add progress update. Please try again.",
        variant: "destructive",
      });
    },
  });

  const progressForm = useForm({
    resolver: zodResolver(progressUpdateSchema),
    defaultValues: {
      phase: "training" as const,
      description: "",
      progress: 0,
      imageUrl: "",
    },
  });

  useEffect(() => {
    if (villagerProfile) {
      profileForm.reset({
        name: villagerProfile.name,
        age: villagerProfile.age,
        county: villagerProfile.county || "Kisii County",
        constituency: villagerProfile.constituency || "",
        ward: villagerProfile.ward || "",
        story: villagerProfile.story,
        dream: villagerProfile.dream || "",
        profileImageUrl: villagerProfile.profileImageUrl || "",
      });
    }
  }, [villagerProfile, profileForm]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || user.role !== "villager") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">This portal is only available to villagers.</p>
            <Button onClick={() => navigate("/")} data-testid="button-go-home">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const calculateProgress = (current: string, target: string) => {
    return Math.round((parseFloat(current) / parseFloat(target)) * 100);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      available: { variant: "secondary" as const, text: "Available" },
      partially_funded: { variant: "default" as const, text: "Partially Funded" },
      fully_funded: { variant: "outline" as const, text: "Fully Funded" },
      in_training: { variant: "default" as const, text: "In Training" },
      active: { variant: "default" as const, text: "Active" },
    };

    return statusMap[status as keyof typeof statusMap] || { variant: "secondary" as const, text: status };
  };

  const fundingProgress = villagerProfile ? calculateProgress(villagerProfile.currentAmount, villagerProfile.targetAmount) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Villager Portal</h1>
            <p className="text-gray-600">
              Manage your profile, track progress, and communicate with sponsors
            </p>
          </div>
          {villagerProfile && (
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 px-4 py-2 text-sm font-bold border-purple-200">
              <Target className="mr-2 h-4 w-4" />
              Priority Slot #{villagerProfile.id} of 2,000 (2024 Cycle)
            </Badge>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="card-funding-progress">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-trust-blue rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-trust-blue">{fundingProgress}%</div>
                  <p className="text-sm text-gray-600">Funding Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-total-raised">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-kenya-green rounded-lg flex items-center justify-center mr-3">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-kenya-green">
                    KSh {parseFloat(villagerProfile?.currentAmount || "0").toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">Total Raised</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-sponsors">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-kenya-red rounded-lg flex items-center justify-center mr-3">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-kenya-red">{sponsorships.length}</div>
                  <p className="text-sm text-gray-600">Sponsors</p>
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

        {/* Profile Status */}
        {villagerProfile && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Profile Status</h3>
                <Badge variant={getStatusBadge(villagerProfile.status).variant} data-testid="badge-profile-status">
                  {getStatusBadge(villagerProfile.status).text}
                </Badge>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Funding Progress</span>
                  <span data-testid="text-funding-percentage">{fundingProgress}%</span>
                </div>
                <Progress value={fundingProgress} className="h-3" data-testid="progress-funding" />
                <div className="text-sm text-gray-500 mt-1" data-testid="text-funding-details">
                  KSh {parseFloat(villagerProfile.currentAmount).toLocaleString()} of KSh {parseFloat(villagerProfile.targetAmount).toLocaleString()} raised
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Training Progress</span>
                  <span data-testid="text-training-percentage">{villagerProfile.trainingProgress}%</span>
                </div>
                <Progress value={villagerProfile.trainingProgress} className="h-3" data-testid="progress-training" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "profile"
                  ? "border-kenya-red text-kenya-red"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                data-testid="tab-profile"
              >
                Profile Management
              </button>
              <button
                onClick={() => setActiveTab("progress")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "progress"
                  ? "border-kenya-red text-kenya-red"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                data-testid="tab-progress"
              >
                Progress Updates
              </button>
              <button
                onClick={() => setActiveTab("sponsors")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "sponsors"
                  ? "border-kenya-red text-kenya-red"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                data-testid="tab-sponsors"
              >
                My Sponsors
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && (
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              data-testid="input-age"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="county"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location (County)</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="constituency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Constituency</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Constituency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {KISII_COUNTY_DATA.constituencies.map((c) => (
                                <SelectItem key={c.name} value={c.name}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="ward"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ward</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!selectedConstituency}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Ward" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {constituencyData?.wards.map((ward) => (
                                <SelectItem key={ward} value={ward}>
                                  {ward}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="story"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Story</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Tell sponsors about your dreams and goals..."
                            rows={4}
                            data-testid="textarea-story"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="dream"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Dream</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="What is your ultimate goal or dream?"
                            data-testid="input-dream"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="profileImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Image URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." data-testid="input-image-url" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-update-profile"
                  >
                    {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {activeTab === "progress" && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Add Progress Update</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...progressForm}>
                  <form onSubmit={progressForm.handleSubmit((data) => addProgressMutation.mutate(data))} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={progressForm.control}
                        name="phase"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phase</FormLabel>
                            <FormControl>
                              <select {...field} className="w-full px-3 py-2 border border-gray-300 rounded-lg" data-testid="select-phase">
                                <option value="training">Training</option>
                                <option value="housing">Housing</option>
                                <option value="bike_deployment">Bike Deployment</option>
                                <option value="active">Active</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={progressForm.control}
                        name="progress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Progress (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                data-testid="input-progress"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={progressForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Describe your progress update..."
                              rows={3}
                              data-testid="textarea-progress-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={progressForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Photo URL (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://..." data-testid="input-progress-image" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={addProgressMutation.isPending}
                      data-testid="button-add-progress"
                    >
                      {addProgressMutation.isPending ? "Adding..." : "Add Progress Update"}
                      <Camera className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <ProgressTracker updates={progressUpdates as any} />
          </div>
        )}

        {activeTab === "sponsors" && (
          <Card>
            <CardHeader>
              <CardTitle>My Sponsors</CardTitle>
            </CardHeader>
            <CardContent>
              {sponsorships.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sponsors Yet</h3>
                  <p className="text-gray-600">Your sponsors will appear here once you receive sponsorship.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sponsorships.map((sponsorship: any, index: number) => (
                    <Card key={sponsorship.id} className="p-4" data-testid={`card-sponsor-${index}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold" data-testid={`text-sponsor-name-${index}`}>
                            Anonymous Sponsor #{index + 1}
                          </h4>
                          <p className="text-sm text-gray-600" data-testid={`text-sponsor-type-${index}`}>
                            {sponsorship.sponsorshipType} sponsorship
                            {sponsorship.componentType && sponsorship.componentType !== 'full' &&
                              ` (${sponsorship.componentType})`}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-kenya-green" data-testid={`text-sponsor-amount-${index}`}>
                            KSh {parseFloat(sponsorship.amount).toLocaleString()}
                          </div>
                          <Badge variant={sponsorship.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                            {sponsorship.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
