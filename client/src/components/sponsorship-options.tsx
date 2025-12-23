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
        {/* Bike Loan Deposit */}
        <motion.div variants={cardVariants}>
          <Card className="h-full border-2 border-trust-blue relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-opacity-20 hover:border-opacity-100">
            <Badge className="absolute -top-1 -right-1 bg-trust-blue text-white border-0 rounded-none rounded-bl-xl px-5 py-2 font-bold z-10">
              New Track
            </Badge>
            <CardContent className="p-8 flex flex-col h-full">
              <div className="mb-8">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100 group-hover:bg-trust-blue group-hover:text-white transition-all duration-500 transform group-hover:rotate-12">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Loan Deposit</h4>
                <div className="text-4xl font-black text-trust-blue mb-2 tracking-tighter">KSh 20,000</div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Jumpstart Access</p>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {[
                  "Covers Bike Loan Downpayment",
                  "Immediate Asset Access",
                  "1-Month Mentorship",
                  "Villager Keeps 100% Profits",
                  "Sustainable Repayment Model",
                  "Direct Impact Tracking"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600 group/item">
                    <Check className="h-5 w-5 text-trust-blue mt-0.5 flex-shrink-0 group-hover/item:scale-125 transition-transform" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full bg-trust-blue hover:bg-black text-white h-14 rounded-xl font-black text-lg transition-all"
                onClick={() => handleSponsorshipSelect('loan_deposit')}
              >
                Sponsor Deposit
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Full Sponsorship */}
        <motion.div variants={cardVariants}>
          <Card className="h-full border-2 border-kenya-red relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-opacity-20 hover:border-opacity-100 transform scale-105 shadow-xl bg-white z-10">
            <Badge className="absolute -top-1 -right-1 bg-kenya-red text-white border-0 rounded-none rounded-bl-xl px-5 py-2 font-bold z-10 animate-pulse">
              Complete Journey
            </Badge>
            <CardContent className="p-8 flex flex-col h-full">
              <div className="mb-8">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100 group-hover:bg-kenya-red group-hover:text-white transition-all duration-500 transform group-hover:rotate-12">
                  <Heart className="h-7 w-7" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Full Sponsorship</h4>
                <div className="text-4xl font-black text-kenya-red mb-2 tracking-tighter">KSh 65,000</div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Life Changing</p>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {[
                  "Full NTSA Training & Licensing",
                  "2-Month Housing Support",
                  "Stipend for Living Expenses",
                  "Electric Bike Deposit Included",
                  "Complete Safety Gear Kit",
                  "Personalized Progress Updates"
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

        {/* Nairobi Driver */}
        <motion.div variants={cardVariants}>
          <Card className="h-full border-2 border-kenya-black relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-opacity-20 hover:border-opacity-100">
            <Badge className="absolute -top-1 -right-1 bg-gray-900 text-white border-0 rounded-none rounded-bl-xl px-5 py-2 font-bold z-10">
              Urban Mobility
            </Badge>
            <CardContent className="p-8 flex flex-col h-full">
              <div className="mb-8">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100 group-hover:bg-gray-900 group-hover:text-white transition-all duration-500 transform group-hover:rotate-12">
                  <Globe className="h-7 w-7" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Hire a Driver</h4>
                <div className="text-4xl font-black text-gray-900 mb-2 tracking-tighter">Partner</div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Nairobi Track</p>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {[
                  "For Licensed Villagers (Class A/B/C)",
                  "Relocation to Nairobi Support",
                  "Connect with Uber/Taxi Owners",
                  "Vetted & Verified Drivers",
                  "Soft Skills Training Included",
                  "Direct Employment Impact"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600 group/item">
                    <Check className="h-5 w-5 text-gray-900 mt-0.5 flex-shrink-0 group-hover/item:scale-125 transition-transform" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full bg-gray-900 hover:bg-kenya-gold text-white hover:text-gray-900 h-14 rounded-xl font-black text-lg transition-all"
                onClick={() => window.location.href = "mailto:drivers@villagersponsor.ke"}
              >
                Find a Driver
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
