import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award, Trophy, Medal, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Ranking {
    name: string;
    totalAmount: string;
    rank: number;
}

export default function SponsorLeaderboard() {
    const { data: rankings = [], isLoading } = useQuery<Ranking[]>({
        queryKey: ["/api/sponsors/rankings"],
    });

    const getBadgeIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Trophy className="h-6 w-6 text-yellow-500" />;
            case 2: return <Medal className="h-6 w-6 text-slate-400" />;
            case 3: return <Medal className="h-6 w-6 text-amber-700" />;
            default: return <Award className="h-6 w-6 text-trust-blue" />;
        }
    };

    const getSponsorTier = (amount: number) => {
        if (amount >= 100000) return { label: "Platinum", color: "bg-slate-200 text-slate-800" };
        if (amount >= 50000) return { label: "Gold", color: "bg-yellow-100 text-yellow-800" };
        if (amount >= 20000) return { label: "Silver", color: "bg-gray-100 text-gray-800" };
        return { label: "Sponsor", color: "bg-trust-blue/10 text-trust-blue" };
    };

    if (isLoading) {
        return (
            <div className="grid gap-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
                ))}
            </div>
        );
    }

    if (rankings.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="py-10 text-center text-muted-foreground">
                    <Star className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>Be the first to appear on our leaderboard!</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {rankings.map((sponsor) => {
                const amount = parseFloat(sponsor.totalAmount);
                const tier = getSponsorTier(amount);

                return (
                    <Card key={sponsor.rank} className={`overflow-hidden border-l-4 ${sponsor.rank <= 3 ? 'border-l-kenya-gold' : 'border-l-trust-blue'}`}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 border font-bold text-lg">
                                    {getBadgeIcon(sponsor.rank)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900">{sponsor.name}</h4>
                                    <Badge variant="secondary" className={`${tier.color} text-[10px] uppercase tracking-wider`}>
                                        {tier.label}
                                    </Badge>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 font-medium uppercase tracking-tighter">Total Impact</p>
                                <p className="text-xl font-black text-kenya-red">
                                    KSh {amount.toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
