import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Check, X } from "lucide-react";

export default function SponsorshipOptions() {
  const [, navigate] = useLocation();

  const handleSponsorshipSelect = (type: string) => {
    // Navigate to villager selection with sponsorship type
    navigate(`/#villagers`);
  };

  return (
    <Card className="mt-8">
      <CardContent className="p-8">
        <h3 className="text-2xl font-bold font-serif text-center mb-8" data-testid="title-sponsorship-options">
          Sponsorship Options
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Full Sponsorship */}
          <div className="border-2 border-kenya-red rounded-xl p-6 relative" data-testid="card-full-sponsorship">
            <Badge className="absolute -top-3 left-4 bg-kenya-red text-white border-0" data-testid="badge-most-popular">
              Most Popular
            </Badge>

            <div className="text-center">
              <h4 className="text-xl font-bold text-gray-900 mb-2" data-testid="title-full-sponsorship">
                Full Sponsorship
              </h4>
              <div className="text-3xl font-bold text-kenya-red mb-4" data-testid="price-full-sponsorship">
                KSh 65,000
              </div>
              <p className="text-gray-600 mb-6" data-testid="description-full-sponsorship">
                Complete support for one villager's entire journey
              </p>

              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center" data-testid="feature-full-training">
                  <Check className="h-4 w-4 text-kenya-green mr-2 flex-shrink-0" />
                  <span className="text-sm">NTSA Training & Licensing</span>
                </li>
                <li className="flex items-center" data-testid="feature-full-transport">
                  <Check className="h-4 w-4 text-kenya-green mr-2 flex-shrink-0" />
                  <span className="text-sm">Transport to Nairobi</span>
                </li>
                <li className="flex items-center" data-testid="feature-full-housing">
                  <Check className="h-4 w-4 text-kenya-green mr-2 flex-shrink-0" />
                  <span className="text-sm">2-Month Housing (KSh 15,000)</span>
                </li>
                <li className="flex items-center" data-testid="feature-full-pocket">
                  <Check className="h-4 w-4 text-kenya-green mr-2 flex-shrink-0" />
                  <span className="text-sm">Pocket Money (KSh 10,000)</span>
                </li>
                <li className="flex items-center" data-testid="feature-full-bike">
                  <Check className="h-4 w-4 text-kenya-green mr-2 flex-shrink-0" />
                  <span className="text-sm">Electric Bike Deposit</span>
                </li>
                <li className="flex items-center" data-testid="feature-full-messaging">
                  <Check className="h-4 w-4 text-kenya-green mr-2 flex-shrink-0" />
                  <span className="text-sm">Direct Messaging</span>
                </li>
                <li className="flex items-center" data-testid="feature-full-updates">
                  <Check className="h-4 w-4 text-kenya-green mr-2 flex-shrink-0" />
                  <span className="text-sm">Progress Updates</span>
                </li>
              </ul>

              <Button
                className="w-full bg-kenya-red text-white hover:bg-red-700"
                onClick={() => handleSponsorshipSelect('full')}
                data-testid="button-sponsor-fully"
              >
                Sponsor Fully
              </Button>
            </div>
          </div>

          {/* Partial Sponsorship */}
          <div className="border-2 border-gray-200 rounded-xl p-6" data-testid="card-partial-sponsorship">
            <div className="text-center">
              <h4 className="text-xl font-bold text-gray-900 mb-2" data-testid="title-partial-sponsorship">
                Partial Sponsorship
              </h4>
              <div className="text-3xl font-bold text-trust-blue mb-4" data-testid="price-partial-sponsorship">
                From KSh 2,000
              </div>
              <p className="text-gray-600 mb-6" data-testid="description-partial-sponsorship">
                Support specific aspects of their journey
              </p>

              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center" data-testid="feature-partial-training">
                  <Check className="h-4 w-4 text-trust-blue mr-2 flex-shrink-0" />
                  <span className="text-sm">Choose Training (KSh 8,000)</span>
                </li>
                <li className="flex items-center" data-testid="feature-partial-housing">
                  <Check className="h-4 w-4 text-trust-blue mr-2 flex-shrink-0" />
                  <span className="text-sm">Choose Housing (KSh 15,000)</span>
                </li>
                <li className="flex items-center" data-testid="feature-partial-pocket">
                  <Check className="h-4 w-4 text-trust-blue mr-2 flex-shrink-0" />
                  <span className="text-sm">Choose Pocket Money (KSh 10,000)</span>
                </li>
                <li className="flex items-center" data-testid="feature-partial-transport">
                  <Check className="h-4 w-4 text-trust-blue mr-2 flex-shrink-0" />
                  <span className="text-sm">Choose Transport (KSh 2,000)</span>
                </li>
                <li className="flex items-center" data-testid="feature-partial-bike">
                  <Check className="h-4 w-4 text-trust-blue mr-2 flex-shrink-0" />
                  <span className="text-sm">Choose Bike Support</span>
                </li>
                <li className="flex items-center" data-testid="feature-partial-updates">
                  <Check className="h-4 w-4 text-trust-blue mr-2 flex-shrink-0" />
                  <span className="text-sm">Progress Updates</span>
                </li>
                <li className="flex items-center text-gray-400" data-testid="feature-partial-no-messaging">
                  <X className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">Direct Messaging</span>
                </li>
              </ul>

              <Button
                className="w-full bg-trust-blue text-white hover:bg-blue-700"
                onClick={() => handleSponsorshipSelect('partial')}
                data-testid="button-choose-amount"
              >
                Choose Amount
              </Button>
            </div>
          </div>

          {/* Group Sponsorship */}
          <div className="border-2 border-gray-200 rounded-xl p-6" data-testid="card-group-sponsorship">
            <div className="text-center">
              <h4 className="text-xl font-bold text-gray-900 mb-2" data-testid="title-group-sponsorship">
                Group Sponsorship
              </h4>
              <div className="text-3xl font-bold text-kenya-green mb-4" data-testid="price-group-sponsorship">
                Any Amount
              </div>
              <p className="text-gray-600 mb-6" data-testid="description-group-sponsorship">
                Join others to collectively sponsor a villager
              </p>

              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center" data-testid="feature-group-flexible">
                  <Check className="h-4 w-4 text-kenya-green mr-2 flex-shrink-0" />
                  <span className="text-sm">Flexible Contributions</span>
                </li>
                <li className="flex items-center" data-testid="feature-group-installments">
                  <Check className="h-4 w-4 text-kenya-green mr-2 flex-shrink-0" />
                  <span className="text-sm">Monthly Installments</span>
                </li>
                <li className="flex items-center" data-testid="feature-group-updates">
                  <Check className="h-4 w-4 text-kenya-green mr-2 flex-shrink-0" />
                  <span className="text-sm">Group Updates</span>
                </li>
                <li className="flex items-center" data-testid="feature-group-shared">
                  <Check className="h-4 w-4 text-kenya-green mr-2 flex-shrink-0" />
                  <span className="text-sm">Shared Progress</span>
                </li>
                <li className="flex items-center" data-testid="feature-group-impact">
                  <Check className="h-4 w-4 text-kenya-green mr-2 flex-shrink-0" />
                  <span className="text-sm">Community Impact</span>
                </li>
                <li className="flex items-center" data-testid="feature-group-recognition">
                  <Check className="h-4 w-4 text-kenya-green mr-2 flex-shrink-0" />
                  <span className="text-sm">Recognition Board</span>
                </li>
              </ul>

              <Button
                className="w-full bg-kenya-green text-white hover:bg-green-700"
                onClick={() => handleSponsorshipSelect('group')}
                data-testid="button-join-group"
              >
                Join Group
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
