import { motion } from "framer-motion";
import { Users, Heart, Banknote, Globe } from "lucide-react";

export default function ImpactBar() {
    const stats = [
        { icon: <Banknote className="h-4 w-4" />, label: "Raised", value: "KSh 2.4M+" },
        { icon: <Users className="h-4 w-4" />, label: "Empowered", value: "120 Villagers" },
        { icon: <Heart className="h-4 w-4" />, label: "Live Impact", value: "480+ Families" },
        { icon: <Globe className="h-4 w-4" />, label: "Reach", value: "12 Counties" },
    ];

    return (
        <div className="bg-gray-900 overflow-hidden py-1 border-y border-white/10 select-none">
            <motion.div
                className="flex whitespace-nowrap gap-12"
                animate={{ x: [0, -1000] }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear",
                }}
            >
                {[1, 2, 3].map((set) => (
                    <div key={set} className="flex gap-12 items-center">
                        {stats.map((stat, i) => (
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
