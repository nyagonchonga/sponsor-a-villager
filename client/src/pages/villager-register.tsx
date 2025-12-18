import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/navigation";
import { UserPlus, MapPin, Calendar, FileText, Camera, Loader2, CreditCard } from "lucide-react";
import { useState } from "react";

const villagerRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  age: z.coerce.number().min(18, "Must be at least 18 years old").max(35, "Must be under 35"),
  location: z.string().min(2, "Location is required").max(200, "Location is too long"),
  story: z.string().min(50, "Please share your story (at least 50 characters)").max(1000, "Story is too long"),
  idNumber: z.string().min(5, "ID Number is required"),
  profileImageUrl: z.string().optional().or(z.literal("")),
});

type VillagerRegistrationData = z.infer<typeof villagerRegistrationSchema>;

export default function VillagerRegister() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [uploading, setUploading] = useState(false);

  const form = useForm<VillagerRegistrationData>({
    resolver: zodResolver(villagerRegistrationSchema),
    defaultValues: {
      name: user ? `${user.firstName} ${user.lastName}` : "",
      age: 18,
      location: "",
      story: "",
      idNumber: user?.idNumber || "",
      profileImageUrl: "",
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { url } = await response.json();
      form.setValue("profileImageUrl", url);
      toast({
        title: "Success",
        description: "Profile photo uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a villager profile.",
        variant: "destructive",
      });
      setTimeout(() => {
        navigate("/auth");
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast, navigate]);

  const registerMutation = useMutation({
    mutationFn: async (data: VillagerRegistrationData) => {
      const response = await apiRequest("POST", "/api/villagers", {
        ...data,
        profileImageUrl: data.profileImageUrl || undefined,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your villager profile has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/villagers/profile"] });
      navigate("/villager-portal");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Session expired. Please log in again.",
          variant: "destructive",
        });
        setTimeout(() => {
          navigate("/auth");
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VillagerRegistrationData) => {
    registerMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <UserPlus className="h-8 w-8 text-kenya-red" />
              <CardTitle className="text-3xl">Join as a Villager</CardTitle>
            </div>
            <CardDescription>
              Create your profile to receive sponsorship opportunities and become part of the Boda Boda program.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-villager-registration">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          {...field}
                          data-testid="input-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Age
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Your age (18-35)"
                          {...field}
                          data-testid="input-age"
                        />
                      </FormControl>
                      <FormDescription>
                        Program participants must be between 18 and 35 years old
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your village or town, County"
                          {...field}
                          data-testid="input-location"
                        />
                      </FormControl>
                      <FormDescription>
                        e.g., Kisumu, Nyanza County
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="story"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Your Story
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about yourself, your background, and why you want to join the Boda Boda program..."
                          className="min-h-[150px]"
                          {...field}
                          data-testid="textarea-story"
                        />
                      </FormControl>
                      <FormDescription>
                        Share your journey and aspirations (minimum 50 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="idNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        ID Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="National ID Number"
                          {...field}
                          data-testid="input-id-number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profileImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Profile Photo
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            {field.value && (
                              <img
                                src={field.value}
                                alt="Preview"
                                className="w-20 h-20 rounded-full object-cover border-2 border-kenya-green"
                              />
                            )}
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="cursor-pointer"
                              disabled={uploading}
                            />
                          </div>
                          {uploading && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Uploading...
                            </div>
                          )}
                          <Input type="hidden" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload a clear photo of yourself for your profile
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-kenya-green/10 border border-kenya-green/20 rounded-lg p-4">
                  <h3 className="font-semibold text-sm mb-2">What happens next?</h3>
                  <ul className="text-sm space-y-1 text-gray-700">
                    <li>• Your profile will be reviewed and listed for potential sponsors</li>
                    <li>• Sponsors can view your story and choose to support you</li>
                    <li>• You'll receive updates on sponsorship opportunities</li>
                    <li>• Upon full sponsorship, you'll begin your Boda Boda journey</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-kenya-red hover:bg-red-700"
                  size="lg"
                  disabled={registerMutation.isPending}
                  data-testid="button-create-profile"
                >
                  {registerMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Creating Profile...
                    </div>
                  ) : (
                    "Create Villager Profile"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
