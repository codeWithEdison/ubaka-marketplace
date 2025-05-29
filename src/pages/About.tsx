import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Users, Target, Award, Clock, TrendingUp, Lightbulb } from 'lucide-react';

const About = () => {
  const teamMembers = [
    {
      name: "IRADUKUNDA Bonheur",
      position: "CEO",
      image: "/bobox.jpg",
      description: "Leading the company with vision and strategic direction."
    },
    {
      name: "UWIHANGANYE EDISON",
      position: "Intelligence System Engineer",
      image: "https://media.licdn.com/dms/image/v2/D4D03AQH_4THyS9-igg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1715287233733?e=1753920000&v=beta&t=1tu6A3xMDVJxxIJTkiDepZ_Do0lvhQ59NCHB9ZhnxZE",
      description: "Focusing on developing smart solutions and systems."
    },
    {
      name: "Mugisha Edson",
      position: "Construction Engineer",
      image: "https://avatars.githubusercontent.com/u/109290022?v=4",
      description: "Bringing expertise in construction and engineering practices."
    }
  ];

  const values = [
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Quality First",
      description: "We never compromise on the quality of our products, sourcing only from trusted manufacturers and conducting rigorous quality control."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Customer-Centric",
      description: "Every decision we make is guided by our commitment to creating exceptional experiences for our customers."
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: "Integrity",
      description: "We operate with transparency and honesty in all our dealings with customers, suppliers, and employees."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Innovation",
      description: "We continually seek new ways to improve our services, products, and the overall construction materials industry."
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Reliability",
      description: "When we make a promise, we keep it. Our customers can depend on us for consistent service quality and on-time delivery."
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-primary" />,
      title: "Sustainability",
      description: "We are committed to environmentally responsible practices throughout our operations and product offerings."
    }
  ];

  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">About Ubaka</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're transforming how the world sources construction materials through technology and exceptional service.
            </p>
          </div>

          {/* Our Story */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Story</h2>
              <p className="text-lg mb-4">
                Founded in 2020, Ubaka was born from a simple observation: the construction materials industry was overdue for innovation.
              </p>
              <p className="text-lg mb-4">
                Our founder, Emma Richardson, spent decades in the construction industry witnessing firsthand the inefficiencies in how materials were sourced, purchased, and delivered. She envisioned a better way - a platform that would bring the entire process online with transparency, speed, and reliability.
              </p>
              <p className="text-lg">
                Today, Ubaka serves thousands of contractors, businesses, and DIY enthusiasts across the country, providing access to premium construction materials with just a few clicks. What started as a small team with a big vision has grown into a company that's setting new standards in the industry.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1541976590-713941681591?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Ubaka headquarters"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Our Values */}
          <div className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="h-full">
                  <CardContent className="pt-6">
                    <div className="mb-4">{value.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Our Team */}
          <div className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Leadership Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="w-48 h-48 rounded-full overflow-hidden mx-auto mb-4">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-primary mb-2">{member.position}</p>
                  <p className="text-muted-foreground">{member.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Our Journey</h2>
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4 font-bold text-xl mb-2 md:mb-0">2020</div>
                <div className="md:w-3/4">
                  <h3 className="text-lg font-semibold">Ubaka Founded</h3>
                  <p className="text-muted-foreground">Launched with a small catalog of essential building materials.</p>
                </div>
              </div>
              <Separator />
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4 font-bold text-xl mb-2 md:mb-0">2021</div>
                <div className="md:w-3/4">
                  <h3 className="text-lg font-semibold">Expanded Nationwide</h3>
                  <p className="text-muted-foreground">Established distribution centers across all major cities.</p>
                </div>
              </div>
              <Separator />
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4 font-bold text-xl mb-2 md:mb-0">2022</div>
                <div className="md:w-3/4">
                  <h3 className="text-lg font-semibold">Professional Services Launch</h3>
                  <p className="text-muted-foreground">Introduced installation, consultation, and custom cutting services.</p>
                </div>
              </div>
              <Separator />
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4 font-bold text-xl mb-2 md:mb-0">2023</div>
                <div className="md:w-3/4">
                  <h3 className="text-lg font-semibold">Sustainability Initiative</h3>
                  <p className="text-muted-foreground">Committed to carbon-neutral operations and introduced eco-friendly product lines.</p>
                </div>
              </div>
              <Separator />
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4 font-bold text-xl mb-2 md:mb-0">2024</div>
                <div className="md:w-3/4">
                  <h3 className="text-lg font-semibold">Digital Transformation</h3>
                  <p className="text-muted-foreground">Launched new platform with enhanced features for contractors and DIY customers.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-secondary rounded-lg p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Join Our Journey</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              We're always looking for talented individuals who share our passion for innovation and excellence in the construction industry.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg">View Careers</Button>
              <Button variant="outline" size="lg">Contact Us</Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default About;
