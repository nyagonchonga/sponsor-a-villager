import { motion } from "framer-motion";
import { Users, Heart, Banknote, Globe, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function ImpactBar() {
    const { data: statsData } = useQuery<{
        totalSponsors: number;
        totalVillagers: number;
        activeRiders: number;
        totalRaised: string;
        familiesImpacted: number;
    }>({
        queryKey: ["/api/stats"],
    });

    const displayStats = [
        {
            icon: <Banknote className="h-4 w-4" />,
            label: "Raised",
            value: statsData ? `KSh ${Number(statsData.totalRaised).toLocaleString()}` : "KSh 0"
        },
        {
            icon: <Users className="h-4 w-4" />,
            label: "Empowered",
            value: `${statsData?.totalVillagers || 0} Villagers`
        },
        {
            icon: <Target className="h-4 w-4" />,
            label: "Yearly Goal",
            value: "2,000 Sponsored"
        },
        {
            icon: <Heart className="h-4 w-4" />,
            label: "Live Impact",
            value: `${statsData?.familiesImpacted || 0} Families`
        },
        {
            icon: <Globe className="h-4 w-4" />,
            label: "Reach",
            value: statsData?.totalVillagers ? "Expanding" : "Ready to Start"
        },
    ];

    return (
        <div className="bg-gray-900 overflow-hidden py-1 border-y border-white/10 select-none">
            <motion.div
                className="flex whitespace-nowrap gap-12"
                animate={{ x: [0, -1000] }}
                transition={{
                    duration: 40,
                    repeat: Infinity,
                    ease: "linear",
                }}
            >
                {[1, 2, 3, 4, 5].map((set) => (
                    <div key={set} className="flex gap-12 items-center">
                        {displayStats.map((stat, i) => (
                            <div key={i} className="flex items-center gap-2 text-white/70">
                                <span className="text-kenya-gold p-1 bg-white/5 rounded-full ring-1 ring-white/10">
                                    {stat.icon}
                                </span>
                                <span className="text-xs font-medium uppercase tracking-widest">{stat.label}:</span>
                                <span className="text-sm font-bold text-white tracking-tighter">{stat.value}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
