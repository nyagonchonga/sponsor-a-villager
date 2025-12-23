import { motion } from "framer-motion";
import { Users, Heart, Banknote, Globe, TrendingUp, Award, Zap, ShieldCheck, MapPin, ArrowRight, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function ImpactPage() {
    const { data: statsData } = useQuery<{
        totalSponsors: number;
        totalVillagers: number;
        activeRiders: number;
        totalRaised: string;
        familiesImpacted: number;
    }>({
        queryKey: ["/api/stats"],
    });

    const stats = [
        {
            icon: <Banknote className="h-8 w-8" />,
            label: "Total Raised",
            value: statsData ? `KSh ${Number(statsData.totalRaised).toLocaleString()}+` : "KSh 0",
            description: "Crowdfunded by our global community of sponsors",
            color: "bg-green-50 text-kenya-green"
        },
        {
            icon: <Users className="h-8 w-8" />,
            label: "Villagers Empowered",
            value: `${statsData?.totalVillagers || 0} Lives`,
            description: "Directly transitioned from poverty to sustainable income",
            color: "bg-blue-50 text-trust-blue"
        },
        {
            icon: <Target className="h-8 w-8" />,
            label: "Yearly Target",
            value: "2,000+",
            description: "Annual slots available for villager sponsorship",
            color: "bg-purple-50 text-purple-600"
        },
        {
            icon: <Heart className="h-8 w-8" />,
            label: "Family Impact",
            value: `${statsData?.familiesImpacted || 0}+ People`,
            description: "Support extending to dependents and immediate families",
            color: "bg-red-50 text-kenya-red"
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <div className="min-h-screen bg-white">
            <Navigation />

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-kenya-red rounded-full blur-[120px] -mr-64 -mt-64" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-trust-blue rounded-full blur-[120px] -ml-64 -mb-64" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Badge className="mb-6 bg-kenya-gold/10 text-kenya-gold border-kenya-gold/20 px-4 py-1 font-black uppercase tracking-widest">
                            Impact Report {new Date().getFullYear()}
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight font-serif">
                            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-kenya-gold to-yellow-200">Collective</span> Footprint
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            Every shilling, every training hour, and every electric bike is a step
                            towards breaking the generational cycle of poverty in rural Kenya.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Stats Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {stats.map((stat, i) => (
                        <motion.div key={i} variants={itemVariants}>
                            <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden h-full">
                                <CardContent className="p-8">
                                    <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                        {stat.icon}
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">{stat.label}</h3>
                                        <p className="text-4xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
                                        <p className="text-sm text-gray-600 leading-snug">{stat.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Deep Dive Section */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl font-black text-gray-900 mb-6 font-serif">A Multi-Dimensional Transformation</h2>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            We don't just provide a job; we build a foundation for life-long autonomy. Our impact is measured
                            not just in shillings earned, but in agency restored.
                        </p>

                        <div className="space-y-6">
                            {[
                                { icon: <TrendingUp className="h-6 w-6" />, title: "Economic Growth", text: "Empowering villagers to increase their income significantly compared to subsistence farming." },
                                { icon: <Award className="h-6 w-6" />, title: "Certified Skills", text: "Every villager earns a professional NTSA driving certification." },
                                { icon: <Zap className="h-6 w-6" />, title: "Clean Mobility", text: "Each electric bike saves tons of carbon emissions annually." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-kenya-red border border-gray-100">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{item.title}</h4>
                                        <p className="text-gray-600 text-sm">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="aspect-video bg-gray-100 rounded-3xl overflow-hidden shadow-2xl relative">
                            <img
                                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                alt="Impact Visualization"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-kenya-red/10 mix-blend-overlay" />
                        </div>

                        {/* Float Card */}
                        <div className="absolute -bottom-8 -right-8 p-6 bg-white rounded-2xl shadow-3xl max-w-xs border border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                                <ShieldCheck className="h-6 w-6 text-green-500" />
                                <span className="font-bold text-gray-900">100% Transparency</span>
                            </div>
                            <p className="text-xs text-gray-500 italic leading-snug">
                                "Accountability is at the core of our platform. Every contribution is tracked directly to the assigned villager."
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Global Community */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl font-black text-gray-900 mb-12 font-serif">A Borderless Movement</h2>
                <div className="bg-gray-900 p-12 md:p-20 rounded-[3rem] text-white relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]" />

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <Globe className="h-16 w-16 text-kenya-gold mx-auto mb-8 animate-pulse" />
                        <h3 className="text-3xl font-bold mb-6">Growing Global Support</h3>
                        <p className="text-xl text-gray-400 mb-10 leading-relaxed font-serif italic">
                            "Connecting global altruism with local potential. Our platform bridges the gap,
                            allowing anyone, anywhere, to fund a dream in rural Kenya."
                        </p>
                        <Link href="/auth">
                            <Button size="lg" className="bg-white text-gray-900 hover:bg-kenya-gold font-black rounded-xl h-14 px-10">
                                Become a Sponsor Today <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="bg-kenya-red py-20 text-white text-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold mb-4">Ready to Create Your Own Impact?</h2>
                    <p className="text-xl opacity-90 mb-10">Select a villager and start their transformation journey today.</p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <Link href="/">
                            <Button size="lg" className="bg-white text-kenya-red hover:bg-gray-100 font-bold px-12 h-16 rounded-2xl text-xl shadow-2xl">
                                Meet the Villagers
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
