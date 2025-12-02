import { Wallet, Shield, Users, Leaf, Clock, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const reasons = [
  {
    icon: Wallet,
    title: 'Save Money',
    description: 'Split travel costs with fellow students and save up to 70% on your commute expenses.'
  },
  {
    icon: Shield,
    title: 'Safe & Verified',
    description: 'All members are verified Thapar students. Your safety is our top priority.'
  },
  {
    icon: Users,
    title: 'Build Community',
    description: 'Connect with peers, make new friends, and strengthen the Thapar community.'
  },
  {
    icon: Leaf,
    title: 'Eco-Friendly',
    description: 'Reduce carbon emissions by sharing rides. One car, multiple passengers, better planet.'
  },
  {
    icon: Clock,
    title: 'Flexible Timing',
    description: 'Find rides that match your schedule. Multiple options available throughout the day.'
  },
  {
    icon: Award,
    title: 'Easy to Use',
    description: 'Simple interface to find, join, or create pools in seconds. No hassle, just rides.'
  }
];

const WhyThapargoSection = () => {
  return (
    <section id="why-thapargo" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Thapargo?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the smarter way to travel with benefits designed for the Thapar community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <Card 
                key={index} 
                className="hover-lift border-border bg-gradient-to-br from-card to-accent/5"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{reason.title}</h3>
                  <p className="text-muted-foreground">{reason.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyThapargoSection;
