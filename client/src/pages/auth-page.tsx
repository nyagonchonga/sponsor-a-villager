import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const authSchema = z.object({
    username: z.string().optional(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    idNumber: z.string().optional(),
    phoneNumber: z.string().optional(),
}).refine((data) => {
    // If we are registering (implied by presence of extra fields), these are required
    // But since we use one schema for both forms, we can make them generic string checks or handle validation in the form setup
    // For simplicity here, we'll keep them optional in schema but check in UI or separate schemas
    return true;
});

// Better approach: separate schemas
const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    idNumber: z.string().optional(),
    phoneNumber: z.string().min(10, "Phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["sponsor", "villager"]),
    sponsorshipBundle: z.enum(["full", "training", "housing", "transport", "bike", "custom"]).optional(),
    sponsorshipAmount: z.coerce.number().positive().optional(),
    preferredPaymentMethod: z.enum(["bank_transfer", "mpesa", "stripe"]).optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [step, setStep] = useState<"login" | "verify" | "register">("login");
    const [identifier, setIdentifier] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    const loginForm = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const verifyForm = useForm({
        defaultValues: {
            code: "",
        }
    });

    const registerForm = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            firstName: "",
            lastName: "",
            idNumber: "",
            phoneNumber: "",
            password: "",
            role: "sponsor",
            sponsorshipBundle: undefined,
            sponsorshipAmount: undefined,
            preferredPaymentMethod: undefined,
        },
    });

    async function onSendOtp(email: string) {
        try {
            await apiRequest("POST", "/api/auth/send-otp", { identifier: email });
            setIdentifier(email);
            setOtpSent(true);
            toast({ title: "OTP Sent", description: "Please check your console/email for the 6-digit code." });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    }

    async function onVerifyOtp(data: { code: string }) {
        try {
            await apiRequest("POST", "/api/auth/verify-otp", { identifier: identifier, code: data.code });
            setStep("register");
            registerForm.setValue("email", identifier);
            toast({ title: "Verified", description: "Email verified successfully. Please complete your profile." });
        } catch (error: any) {
            toast({ title: "Invalid OTP", description: error.message, variant: "destructive" });
        }
    }

    async function onLogin(data: LoginFormData) {
        try {
            await apiRequest("POST", "/api/login", data);
            window.location.href = "/"; // Force reload to refresh auth state
        } catch (error: any) {
            toast({
                title: "Login failed",
                description: error.message,
                variant: "destructive",
            });
        }
    }

    async function onRegister(data: RegisterFormData) {
        try {
            const response = await apiRequest("POST", "/api/register", {
                ...data,
                username: data.email, // Use email as username
            });

            const result = await response.json();

            // Show different messages based on whether a bundle was selected
            if (data.role === "sponsor" && data.sponsorshipBundle && result.assignedVillager) {
                toast({
                    title: "Registration successful!",
                    description: `You've been assigned to support ${result.assignedVillager.name}. Check your email for payment instructions.`,
                    duration: 7000,
                });
            } else {
                toast({
                    title: "Registration successful",
                    description: "Please login with your new account",
                });
            }

            // Auto-login after registration if response includes user data
            if (result.user) {
                setTimeout(() => {
                    window.location.href = "/";
                }, 2000);
            }
        } catch (error: any) {
            toast({
                title: "Registration failed",
                description: error.message,
                variant: "destructive",
            });
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="flex items-center justify-center p-8 bg-background">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                        <CardDescription>
                            Login to access your dashboard and sponsorships
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={step === "verify" || step === "register" ? "register" : "login"} onValueChange={(v) => setStep(v as any)}>
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="register">Register</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login">
                                <Form {...loginForm}>
                                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                                        <FormField
                                            control={loginForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter email" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={loginForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="Enter password" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>
                                            Login
                                        </Button>
                                    </form>
                                </Form>
                            </TabsContent>

                            <TabsContent value="register">
                                {step === "login" && setStep("verify")}
                                {step === "verify" && (
                                    <div className="space-y-4">
                                        {!otpSent ? (
                                            <div className="space-y-4">
                                                <FormItem>
                                                    <FormLabel>Email Address</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="john@example.com"
                                                            value={identifier}
                                                            onChange={(e) => setIdentifier(e.target.value)}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                                <Button
                                                    className="w-full"
                                                    onClick={() => onSendOtp(identifier)}
                                                    disabled={!identifier || !identifier.includes("@")}
                                                >
                                                    Send OTP
                                                </Button>
                                            </div>
                                        ) : (
                                            <Form {...verifyForm}>
                                                <form onSubmit={verifyForm.handleSubmit(onVerifyOtp)} className="space-y-4">
                                                    <FormField
                                                        control={verifyForm.control}
                                                        name="code"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Enter 6-digit OTP</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="123456" {...field} maxLength={6} />
                                                                </FormControl>
                                                                <FormDescription>
                                                                    Check your console for the code (Mock implementation)
                                                                </FormDescription>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <Button type="submit" className="w-full">
                                                        Verify OTP
                                                    </Button>
                                                    <Button
                                                        variant="link"
                                                        className="w-full"
                                                        onClick={() => onSendOtp(identifier)}
                                                    >
                                                        Resend OTP
                                                    </Button>
                                                </form>
                                            </Form>
                                        )}
                                    </div>
                                )}

                                {step === "register" && (
                                    <Form {...registerForm}>
                                        <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                                            <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
                                                <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                                                    Email verified: {identifier}
                                                </p>
                                            </div>
                                            {/* ... rest of the form ... */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={registerForm.control}
                                                    name="firstName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>First Name</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="John" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={registerForm.control}
                                                    name="lastName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Last Name</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Doe" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={registerForm.control}
                                                name="role"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Account Type</FormLabel>
                                                        <FormControl>
                                                            <div className="flex gap-4">
                                                                <label className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        value="sponsor"
                                                                        checked={field.value === "sponsor"}
                                                                        onChange={() => field.onChange("sponsor")}
                                                                        className="w-4 h-4 text-primary"
                                                                    />
                                                                    <span className="text-sm">Sponsor</span>
                                                                </label>
                                                                <label className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        value="villager"
                                                                        checked={field.value === "villager"}
                                                                        onChange={() => field.onChange("villager")}
                                                                        className="w-4 h-4 text-primary"
                                                                    />
                                                                    <span className="text-sm">Villager</span>
                                                                </label>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {registerForm.watch("role") === "villager" && (
                                                <FormField
                                                    control={registerForm.control}
                                                    name="idNumber"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>ID Number</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="National ID" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}

                                            {/* Sponsor Bundle Selection */}
                                            {registerForm.watch("role") === "sponsor" && (
                                                <>
                                                    <FormField
                                                        control={registerForm.control}
                                                        name="sponsorshipBundle"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Sponsorship Bundle (Optional)</FormLabel>
                                                                <FormControl>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        {[
                                                                            { value: "full", label: "Full Package", amount: "65,000" },
                                                                            { value: "training", label: "Training Only", amount: "25,000" },
                                                                            { value: "housing", label: "Housing Only", amount: "20,000" },
                                                                            { value: "transport", label: "Transport Only", amount: "10,000" },
                                                                            { value: "bike", label: "Bike Only", amount: "10,000" },
                                                                            { value: "custom", label: "Custom Amount", amount: "" },
                                                                        ].map((bundle) => (
                                                                            <label
                                                                                key={bundle.value}
                                                                                className={`flex flex-col p-3 border rounded-lg cursor-pointer transition-colors ${field.value === bundle.value
                                                                                    ? "border-kenya-red bg-red-50"
                                                                                    : "border-gray-300 hover:border-gray-400"
                                                                                    }`}
                                                                            >
                                                                                <input
                                                                                    type="radio"
                                                                                    value={bundle.value}
                                                                                    checked={field.value === bundle.value}
                                                                                    onChange={() => {
                                                                                        field.onChange(bundle.value);
                                                                                        if (bundle.value !== "custom") {
                                                                                            registerForm.setValue("sponsorshipAmount", parseFloat(bundle.amount.replace(",", "")));
                                                                                        }
                                                                                    }}
                                                                                    className="sr-only"
                                                                                />
                                                                                <span className="font-medium text-sm">{bundle.label}</span>
                                                                                {bundle.amount && (
                                                                                    <span className="text-xs text-gray-600 mt-1">
                                                                                        KSh {bundle.amount}
                                                                                    </span>
                                                                                )}
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    {registerForm.watch("sponsorshipBundle") === "custom" && (
                                                        <FormField
                                                            control={registerForm.control}
                                                            name="sponsorshipAmount"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Custom Amount (KSh)</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            type="number"
                                                                            placeholder="Enter amount"
                                                                            {...field}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )}

                                                    {registerForm.watch("sponsorshipBundle") && (
                                                        <FormField
                                                            control={registerForm.control}
                                                            name="preferredPaymentMethod"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Preferred Payment Method</FormLabel>
                                                                    <FormControl>
                                                                        <div className="flex gap-4">
                                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                                <input
                                                                                    type="radio"
                                                                                    value="mpesa"
                                                                                    checked={field.value === "mpesa"}
                                                                                    onChange={() => field.onChange("mpesa")}
                                                                                    className="w-4 h-4 text-primary"
                                                                                />
                                                                                <span className="text-sm">M-Pesa</span>
                                                                            </label>
                                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                                <input
                                                                                    type="radio"
                                                                                    value="bank_transfer"
                                                                                    checked={field.value === "bank_transfer"}
                                                                                    onChange={() => field.onChange("bank_transfer")}
                                                                                    className="w-4 h-4 text-primary"
                                                                                />
                                                                                <span className="text-sm">Bank Transfer</span>
                                                                            </label>
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )}
                                                </>
                                            )}

                                            <FormField
                                                control={registerForm.control}
                                                name="phoneNumber"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Phone Number</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="+254..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={registerForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Email</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="john@example.com" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={registerForm.control}
                                                name="password"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Password</FormLabel>
                                                        <FormControl>
                                                            <Input type="password" placeholder="Choose a password" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="submit" className="w-full" disabled={registerForm.formState.isSubmitting}>
                                                Register
                                            </Button>
                                        </form>
                                    </Form>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
            <div className="hidden lg:flex bg-muted items-center justify-center p-12">
                <div className="max-w-lg text-center">
                    <h1 className="text-4xl font-bold mb-4 text-primary">Villager Sponsor</h1>
                    <p className="text-lg text-muted-foreground">
                        Empower rural communities through direct sponsorship.
                        Track progress, communicate, and make a real impact.
                    </p>
                </div>
            </div>
        </div>
    );
}
