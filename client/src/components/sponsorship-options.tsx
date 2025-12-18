import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Check, Users, Building2, Heart, Sparkles, Globe } from "lucide-react";

export default function SponsorshipOptions() {
  const [, navigate] = useLocation();

  const handleSponsorshipSelect = (type: string) => {
    navigate(`/#villagers`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="space-y-16">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-4xl font-black font-serif text-gray-900 mb-4" data-testid="title-sponsorship-options">
            Choose Your Impact Level
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Whether you're an individual, a group of friends, or a forward-thinking corporation,
            there's a tailored way for you to change a life today.
          </p>
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {/* Full Sponsorship */}
        <motion.div variants={cardVariants}>
          <Card className="h-full border-2 border-kenya-red relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-opacity-20 hover:border-opacity-100">
            <Badge className="absolute -top-1 -right-1 bg-kenya-red text-white border-0 rounded-none rounded-bl-xl px-5 py-2 font-bold z-10 animate-pulse">
              Most Direct
            </Badge>
            <CardContent className="p-8 flex flex-col h-full">
              <div className="mb-8">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100 group-hover:bg-kenya-red group-hover:text-white transition-all duration-500 transform group-hover:rotate-12">
                  <Heart className="h-7 w-7" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Full Sponsorship</h4>
                <div className="text-4xl font-black text-kenya-red mb-2 tracking-tighter">KSh 65,000</div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Single Journey</p>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {[
                  "NTSA Training & Licensing",
                  "2-Month Housing (KSh 15,000)",
                  "Pocket Money (KSh 10,000)",
                  "Electric Bike Deposit",
                  "Direct Messaging Access",
                  "Personal Progress Updates"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600 group/item">
                    <Check className="h-5 w-5 text-kenya-green mt-0.5 flex-shrink-0 group-hover/item:scale-125 transition-transform" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full bg-kenya-red hover:bg-black text-white h-14 rounded-xl font-black text-lg transition-all"
                onClick={() => handleSponsorshipSelect('full')}
              >
                Sponsor Fully
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Friends & Family */}
        <motion.div variants={cardVariants}>
          <Card className="h-full border-2 border-trust-blue relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-opacity-20 hover:border-opacity-100">
            <Badge className="absolute -top-1 -right-1 bg-trust-blue text-white border-0 rounded-none rounded-bl-xl px-5 py-2 font-bold z-10">
              Popular Choice
            </Badge>
            <CardContent className="p-8 flex flex-col h-full">
              <div className="mb-8">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100 group-hover:bg-trust-blue group-hover:text-white transition-all duration-500 transform group-hover:rotate-12">
                  <Users className="h-7 w-7" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Friends & Family</h4>
                <div className="text-4xl font-black text-trust-blue mb-2 tracking-tighter">Any Amount</div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Shared Impact</p>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {[
                  "Collaborative Goal Tracking",
                  "Shared Messaging Channel",
                  "Group Contributor Leaderboard",
                  "Collective Impact Certificate",
                  "Flexible Monthly Pooling",
                  "Combined Progress Photo"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600 group/item">
                    <Check className="h-5 w-5 text-trust-blue mt-0.5 flex-shrink-0 group-hover/item:scale-125 transition-transform" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full bg-trust-blue hover:bg-black text-white h-14 rounded-xl font-black text-lg transition-all"
                onClick={() => handleSponsorshipSelect('friends')}
              >
                Form a Group
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Corporate Impact */}
        <motion.div variants={cardVariants}>
          <Card className="h-full border-2 border-kenya-gold relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-opacity-20 hover:border-opacity-100">
            <Badge className="absolute -top-1 -right-1 bg-kenya-gold text-gray-900 border-0 rounded-none rounded-bl-xl px-5 py-2 font-bold z-10">
              Corporate
            </Badge>
            <CardContent className="p-8 flex flex-col h-full">
              <div className="mb-8">
                <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center mb-6 border border-yellow-100 group-hover:bg-kenya-gold group-hover:text-gray-900 transition-all duration-500 transform group-hover:rotate-12">
                  <Building2 className="h-7 w-7" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Corporate Impact</h4>
                <div className="text-4xl font-black text-amber-700 mb-2 tracking-tighter">Scalable</div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">CSR Partnership</p>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {[
                  "Brand Plaque on Electric Bikes",
                  "CSR Annual Impact Report",
                  "Social Media Recognition",
                  "Villager Meet-and-Greet",
                  "Priority Logo on Leaderboard",
                  "Employee Engagement Portal"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600 group/item">
                    <Check className="h-5 w-5 text-amber-700 mt-0.5 flex-shrink-0 group-hover/item:scale-125 transition-transform" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full bg-kenya-gold hover:bg-black text-gray-900 hover:text-white h-14 rounded-xl font-black text-lg transition-all"
                onClick={() => window.location.href = "mailto:corporate@villagersponsor.ke"}
              >
                Partner With Us
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Community Circle */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Card className="bg-gray-900 text-white overflow-hidden shadow-3xl border-0 ring-1 ring-white/10 group">
          <CardContent className="p-0">
            <div className="grid lg:grid-cols-3">
              <div className="lg:col-span-2 p-12 lg:p-16">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-kenya-green rounded-2xl shadow-xl shadow-kenya-green/20 group-hover:rotate-6 transition-transform duration-500">
                    <Globe className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h4 className="text-4xl font-black tracking-tight">Community Circle</h4>
                    <p className="text-kenya-green font-extrabold uppercase tracking-widest text-sm">Village-Scale Power</p>
                  </div>
                </div>

                <p className="text-2xl text-gray-300 mb-10 max-w-2xl font-serif">
                  Empower an entire region. We cluster your contributions to fund multiple villagers
                  from the same community, creating a localized transformation ripple effect.
                </p>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  {[
                    "Region-scale impact tracking",
                    "Customized community plaques",
                    "Monthly digital townhalls",
                    "Shared festive celebrations"
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-4 group/item">
                      <div className="w-2 h-2 rounded-full bg-kenya-gold group-hover/item:scale-150 transition-transform" />
                      <span className="text-gray-400 font-medium">{text}</span>
                    </div>
                  ))}
                </div>

                <Button className="bg-white text-gray-900 hover:bg-kenya-gold transition-colors font-black px-12 h-16 rounded-2xl text-xl">
                  Start a Community Fund
                </Button>
              </div>

              <div className="bg-gradient-to-br from-kenya-green to-green-900 p-12 flex flex-col justify-center items-center text-center relative overflow-hidden">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 10, repeat: Infinity }}
                  className="absolute inset-0 bg-white rounded-full blur-[100px]"
                />
                <div className="relative z-10">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-green-200 mb-4">Milestone Goal</p>
                  <p className="text-6xl font-black mb-6 tracking-tighter">KSh 1M</p>
                  <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <Sparkles className="h-8 w-8 text-kenya-gold mx-auto mb-2" />
                    <p className="text-sm font-bold italic leading-relaxed">
                      "Collective effort creates <br /> lasting change."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
