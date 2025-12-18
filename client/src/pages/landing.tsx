import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/navigation";
import VillagerCard from "@/components/villager-card";
import SponsorshipOptions from "@/components/sponsorship-options";
import SponsorLeaderboard from "@/components/sponsor-leaderboard";
import { Heart, Play, GraduationCap, Home, Bike, ChartLine, Check, Quote, Download, Users, Trophy } from "lucide-react";
import type { Villager } from "@shared/schema";

export default function Landing() {
  const { data: villagers = [] } = useQuery<Villager[]>({
    queryKey: ["/api/villagers"],
  });

  // Generate empty slots for up to 10 villagers
  const totalSlots = 10;
  const emptySlots = Array(Math.max(0, totalSlots - villagers.length)).fill(null);

  return (
    <div className="font-sans text-gray-900 bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-kenya-red to-red-700 text-white py-20">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
          className="absolute inset-0 opacity-30"
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold font-serif mb-6">
              Empowering Rural Youth
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Break the cycle of poverty through clean mobility and digital platforms.
              Sponsor a villager's journey from rural Kenya to sustainable livelihood in Nairobi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-kenya-gold text-gray-900 hover:bg-yellow-400 transform hover:scale-105 transition-all"
                onClick={() => document.getElementById('villagers')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-sponsor-villager"
              >
                <Heart className="mr-2 h-5 w-5" />
                Sponsor a Villager
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900"
                onClick={() => window.location.href = "/villager-register"}
                data-testid="button-join-as-villager"
              >
                <Users className="mr-2 h-5 w-5" />
                Join as Villager
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900"
                data-testid="button-watch-story"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Our Story
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Program Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-serif text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive program provides rural youth with training, housing, and electric bikes
              to build sustainable livelihoods in Nairobi's growing digital economy.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-kenya-red rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Training & Licensing</h3>
              <p className="text-gray-600">NTSA motorcycle training and licensing (KSh 8,000)</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-kenya-green rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Home className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Housing Support</h3>
              <p className="text-gray-600">Shared housing in Nairobi for 2 months (KSh 15,000)</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-trust-blue rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bike className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Electric Bike</h3>
              <p className="text-gray-600">Raum Electric Bike deposit and orientation (KSh 30,000)</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-kenya-gold rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ChartLine className="h-8 w-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sustainable Support</h3>
              <p className="text-gray-600">Pocket money and SafeBoda partnership monitoring (KSh 10,000)</p>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="mt-16 bg-gray-50 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold font-serif text-gray-900 mb-2">Investment Breakdown</h3>
              <p className="text-lg text-gray-600">
                Total per villager: <span className="font-bold text-kenya-red">KSh 65,000</span>
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-kenya-red mb-2">KSh 8,000</div>
                  <div className="text-sm text-gray-600">Training & Licensing</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-kenya-green mb-2">KSh 2,000</div>
                  <div className="text-sm text-gray-600">Transport to Nairobi</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-trust-blue mb-2">KSh 15,000</div>
                  <div className="text-sm text-gray-600">Housing (2 months)</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">KSh 10,000</div>
                  <div className="text-sm text-gray-600">Pocket Money</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-kenya-gold mb-2">KSh 30,000</div>
                  <div className="text-sm text-gray-600 font-semibold">Bike Deposit</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Villagers Section */}
      <section id="villagers" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-serif text-gray-900 mb-4">Meet Our Villagers</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Each villager has a unique story and dream. Choose who you'd like to sponsor
              and follow their journey to independence.
            </p>
          </div>

          {/* Villager Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {villagers.map((villager: any) => (
              <VillagerCard key={villager.id} villager={villager} />
            ))}

            {/* Empty slots */}
            {emptySlots.map((_, index) => (
              <Card key={`empty-${index}`} className="border-2 border-dashed border-gray-300 hover:border-kenya-red transition-all">
                <CardContent className="p-6 text-center h-full flex flex-col justify-center min-h-[400px]">
                  <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="text-3xl text-gray-400">+</div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-500 mb-2">Available Slot</h3>
                  <p className="text-gray-400 mb-6">Waiting for a villager to join our program</p>
                  <Button variant="outline" className="text-gray-600" data-testid="button-notify-available">
                    Notify When Available
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <SponsorshipOptions />
        </div>
      </section>

      {/* Sponsor Appreciation Section */}
      <section className="py-16 bg-white overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-kenya-gold/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-trust-blue/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kenya-gold/20 text-yellow-800 text-sm font-bold mb-4">
                <Trophy className="h-4 w-4" />
                Community Impact
              </div>
              <h2 className="text-4xl font-bold font-serif text-gray-900 mb-6">Our Top Sponsors</h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                We are deeply grateful to the individuals and organizations who have made a significant
                difference in the lives of our villagers. This leaderboard recognizes our most impactful
                sponsors.
              </p>

              <div className="bg-gradient-to-br from-trust-blue to-blue-700 rounded-2xl p-8 text-white shadow-xl">
                <h3 className="text-2xl font-bold mb-4">Why Sponsor?</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="bg-white/20 p-1 rounded">
                      <Check className="h-4 w-4" />
                    </div>
                    <span>Directly empower a youth with a sustainable livelihood.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-white/20 p-1 rounded">
                      <Check className="h-4 w-4" />
                    </div>
                    <span>Receive regular progress updates and personal messages.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-white/20 p-1 rounded">
                      <Check className="h-4 w-4" />
                    </div>
                    <span>Be part of a transparent, impact-driven community.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-inner">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-between">
                Sponsor Leaderboard
                <Badge variant="outline" className="text-xs font-normal">Updated Live</Badge>
              </h3>
              <SponsorLeaderboard />
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-serif text-gray-900 mb-4">Our Impact</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See the real difference your sponsorship makes in the lives of rural youth
              and their communities across Kenya.
            </p>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-kenya-red mb-2" data-testid="stat-villagers-supported">24</div>
              <div className="text-gray-600">Villagers Supported</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-kenya-green mb-2" data-testid="stat-active-riders">18</div>
              <div className="text-gray-600">Active Riders</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-trust-blue mb-2" data-testid="stat-families-impacted">96</div>
              <div className="text-gray-600">Families Impacted</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-kenya-gold mb-2" data-testid="stat-monthly-earnings">KSh 45K</div>
              <div className="text-gray-600">Avg. Monthly Earnings</div>
            </div>
          </div>

          {/* Success Stories */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
                    alt="Peter Kimani success story"
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Peter Kimani</h4>
                    <p className="text-gray-600">Sponsored 8 months ago</p>
                  </div>
                </div>
                <p className="text-gray-700 italic mb-4">
                  "Thanks to my sponsor, I now earn KSh 60,000 monthly and have started my own delivery company.
                  I've hired 3 other riders and am supporting my family's farm back home."
                </p>
                <div className="flex items-center text-kenya-green">
                  <Quote className="mr-2 h-4 w-4" />
                  <span className="text-sm font-medium">Success Story</span>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <img
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
                    alt="Catherine Wanjuru success story"
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Catherine Wanjuru</h4>
                    <p className="text-gray-600">Sponsored 6 months ago</p>
                  </div>
                </div>
                <p className="text-gray-700 italic mb-4">
                  "Being one of the few female riders has been challenging but rewarding. I'm now training other women
                  and have paid for my sister's university fees. Dreams do come true!"
                </p>
                <div className="flex items-center text-kenya-green">
                  <Quote className="mr-2 h-4 w-4" />
                  <span className="text-sm font-medium">Success Story</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Program Information */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold font-serif text-gray-900 mb-6">Breaking the Cycle of Rural Poverty</h2>
              <p className="text-lg text-gray-700 mb-6">
                In many rural villages across Kenya, young people face limited access to education and employment.
                With nothing productive to do, many fall into drug abuse and idleness. Our program provides them
                with skills, housing, and electric bikes to break this cycle.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-kenya-red rounded-full flex items-center justify-center mr-4">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-700">Sustainable livelihood creation</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-kenya-green rounded-full flex items-center justify-center mr-4">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-700">Clean mobility promotion</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-trust-blue rounded-full flex items-center justify-center mr-4">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-700">Digital platform integration</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-kenya-gold rounded-full flex items-center justify-center mr-4">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-700">Community empowerment</span>
                </div>
              </div>

              <Button className="bg-kenya-red text-white hover:bg-red-700" size="lg" data-testid="button-download-program">
                <Download className="mr-2 h-5 w-5" />
                Download Program Details
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                alt="Electric motorcycle transportation in Kenya"
                className="rounded-xl shadow-lg w-full h-auto"
              />
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                alt="Training and education session"
                className="rounded-xl shadow-lg w-full h-auto"
              />
              <img
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                alt="Community development in Kenya"
                className="rounded-xl shadow-lg w-full h-auto"
              />
              <img
                src="https://images.unsplash.com/photo-1556761175-4b46a572b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                alt="People connecting through digital platforms"
                className="rounded-xl shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-kenya-red to-red-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold font-serif mb-6">Ready to Change a Life?</h2>
          <p className="text-xl mb-8 leading-relaxed">
            Your contribution of KSh 65,000 per villager (or KSh 260,000 for our pilot of 4)
            will directly change lives and empower communities. Join us in building a scalable
            model for rural-to-urban empowerment.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              className="bg-kenya-gold text-gray-900 hover:bg-yellow-400 transform hover:scale-105 transition-all"
              data-testid="button-sponsor-now"
            >
              <Heart className="mr-2 h-5 w-5" />
              Sponsor a Villager Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900"
              data-testid="button-join-group"
            >
              <Users className="mr-2 h-5 w-5" />
              Join Group Sponsorship
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">KSh 65,000</div>
              <div className="text-lg opacity-90">Changes one life completely</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">2 Months</div>
              <div className="text-lg opacity-90">To economic independence</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-lg opacity-90">Transparent impact tracking</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold font-serif text-kenya-gold mb-4">Sponsor a Villager</h3>
              <p className="text-gray-400 mb-4">
                Empowering rural youth through clean mobility and digital platforms across Kenya.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Program</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#villagers" className="text-gray-400 hover:text-white transition-colors">Villager Profiles</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Success Stories</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Impact Reports</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Sponsor Portal</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Villager Portal</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  info@sponsoravillager.ke
                </li>
                <li className="flex items-center">
                  +254 700 123 456
                </li>
                <li className="flex items-center">
                  Nairobi, Kenya
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Sponsor a Villager Program. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
