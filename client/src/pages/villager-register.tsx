import { useEffect, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/navigation";
import { UserPlus, MapPin, Calendar, FileText, Camera, Loader2, Heart } from "lucide-react";
import { KISII_COUNTY_DATA } from "@shared/kisii-data";

const villagerRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  age: z.coerce.number().min(18, "Must be at least 18 years old").max(35, "Must be under 35"),
  county: z.string().default("Kisii County"),
  constituency: z.string().min(1, "Constituency is required"),
  ward: z.string().min(1, "Ward is required"),
  story: z.string().min(50, "Please share your story (at least 50 characters)").max(1000, "Story is too long"),
  dream: z.string().min(20, "Please share your dream (at least 20 characters)").max(500, "Dream is too long"),
  profileImageUrl: z.string().optional().or(z.literal("")),
  // New Fields
  hasLicense: z.boolean().default(false),
  licenseType: z.enum(["none", "A", "B", "C", "D", "E", "F", "G"]).default("none"),
  licenseImageUrl: z.string().optional().or(z.literal("")),
  programType: z.enum(["standard", "bike_deposit", "nairobi_driver"]).default("standard"),
}).refine((data) => {
  if (data.hasLicense && data.licenseType === "none") {
    return false;
  }
  return true;
}, {
  message: "Please select a license type",
  path: ["licenseType"],
}).refine((data) => {
  if (data.hasLicense && !data.licenseImageUrl) {
    return false;
  }
  return true;
}, {
  message: "Please upload a photo of your license",
  path: ["licenseImageUrl"],
});

type VillagerRegistrationData = z.infer<typeof villagerRegistrationSchema>;

export default function VillagerRegister() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [uploading, setUploading] = useState(false);
  const [licenseUploading, setLicenseUploading] = useState(false);

  const form = useForm<VillagerRegistrationData>({
    resolver: zodResolver(villagerRegistrationSchema),
    defaultValues: {
      name: user ? `${user.firstName} ${user.lastName}` : "",
      age: 18,
      county: "Kisii County",
      constituency: "",
      ward: "",
      story: "",
      dream: "",
      profileImageUrl: "",
      hasLicense: false,
      licenseType: "none",
      licenseImageUrl: "",
      programType: "standard",
    },
  });

  const selectedConstituency = form.watch("constituency");
  const hasLicense = form.watch("hasLicense");
  const constituencyData = KISII_COUNTY_DATA.constituencies.find(c => c.name === selectedConstituency);

  // Reset ward when constituency changes
  useEffect(() => {
    if (selectedConstituency && constituencyData && !constituencyData.wards.includes(form.getValues("ward"))) {
      form.setValue("ward", "");
    }
  }, [selectedConstituency, constituencyData, form]);


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "profileImageUrl" | "licenseImageUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const setUploadState = fieldName === "profileImageUrl" ? setUploading : setLicenseUploading;

    setUploadState(true);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { url } = await response.json();
      form.setValue(fieldName, url);
      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadState(false);
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
      // Ensure licenseType is none if hasLicense is false
      const finalData = {
        ...data,
        licenseType: data.hasLicense ? data.licenseType : "none",
        licenseImageUrl: data.hasLicense ? data.licenseImageUrl : undefined,
      };

      const response = await apiRequest("POST", "/api/villagers", {
        ...finalData,
        profileImageUrl: finalData.profileImageUrl || undefined,
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

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Personal Information</h3>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} data-testid="input-name" />
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
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Your age (18-35)" {...field} data-testid="input-age" />
                        </FormControl>
                        <FormDescription>Must be 18-35 years old</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Location Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Location (Kisii County)</h3>
                  <FormField
                    control={form.control}
                    name="county"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>County</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="constituency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Constituency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Constituency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {KISII_COUNTY_DATA.constituencies.map((c) => (
                                <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ward"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ward</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedConstituency}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Ward" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {constituencyData?.wards.map((ward) => (
                                <SelectItem key={ward} value={ward}>{ward}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Driving License Section */}
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
                  <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-kenya-red" />
                    Driving License
                  </h3>

                  <FormField
                    control={form.control}
                    name="hasLicense"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-white">
                        <FormControl>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-kenya-red focus:ring-kenya-red"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>I have a valid driving license</FormLabel>
                          <FormDescription>Check this if you already have a license</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {hasLicense && (
                    <div className="space-y-4 pl-4 border-l-2 border-kenya-red/20">
                      <FormField
                        control={form.control}
                        name="licenseType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Class</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select License Class" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="A">Class A (Motorcycles)</SelectItem>
                                <SelectItem value="B">Class B (Light Vehicle)</SelectItem>
                                <SelectItem value="C">Class C (Trucks)</SelectItem>
                                <SelectItem value="D">Class D (PSV)</SelectItem>
                                <SelectItem value="E">Class E (Special)</SelectItem>
                                <SelectItem value="F">Class F (Industrial)</SelectItem>
                                <SelectItem value="G">Class G (Plant)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="licenseImageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Upload License Photo</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <div className="flex items-center gap-4">
                                  {field.value && (
                                    <img src={field.value} alt="License" className="w-24 h-16 object-cover rounded border" />
                                  )}
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, "licenseImageUrl")}
                                    disabled={licenseUploading}
                                  />
                                </div>
                                {licenseUploading && <div className="text-sm text-gray-500">Uploading license...</div>}
                                <Input type="hidden" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Program Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Program Goal</h3>
                  <FormField
                    control={form.control}
                    name="programType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Choose your target path</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Program" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="standard">Standard Boda Boda Training</SelectItem>
                            <SelectItem value="bike_deposit">Bike Loan Deposit (KSh 20,000 Target)</SelectItem>
                            <SelectItem value="nairobi_driver">Nairobi Uber Driver (Requires License)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {field.value === "standard" && "Full sponsorship for training, license, and basic gear."}
                          {field.value === "bike_deposit" && "Sponsorship to raise 20k deposit for a bike loan."}
                          {field.value === "nairobi_driver" && "Connect with sponsors looking for drivers in Nairobi."}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Story & Dream */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Your Profile Content</h3>
                  <FormField
                    control={form.control}
                    name="story"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Story</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell us about yourself..." className="min-h-[150px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dream"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Dream</FormLabel>
                        <FormControl>
                          <Input placeholder="What is your ultimate goal?" {...field} />
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
                        <FormLabel>Profile Photo</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <div className="flex items-center gap-4">
                              {field.value && <img src={field.value} alt="Profile" className="w-16 h-16 rounded-full object-cover" />}
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, "profileImageUrl")}
                                disabled={uploading}
                              />
                            </div>
                            <Input type="hidden" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full bg-kenya-red hover:bg-red-700" size="lg" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? "Creating Profile..." : "Create Villager Profile"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
