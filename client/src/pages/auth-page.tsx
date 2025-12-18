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
    idNumber: z.string().min(5, "ID Number is required"),
    phoneNumber: z.string().min(10, "Phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["sponsor", "villager"]),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const loginForm = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
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
        },
    });

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
            await apiRequest("POST", "/api/register", {
                ...data,
                username: data.email, // Use email as username
            });
            toast({
                title: "Registration successful",
                description: "Please login with your new account",
            });
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
                        <Tabs defaultValue="login">
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
                                <Form {...registerForm}>
                                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
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
