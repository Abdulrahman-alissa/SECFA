import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Users, Calendar, BarChart3, Bell, DollarSign, Badge, Phone, MapPin, Mail } from "lucide-react";
import { useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";


export default function Landing() {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [sponsorshipType, setSponsorshipType] = useState("bronze");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSponsorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await apiClient.createSponsorship({
        company_name: companyName,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        sponsorship_type: sponsorshipType,
        message
      });

      toast.success("Thank you! We'll contact you soon.");
      setCompanyName("");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setMessage("");
      setSponsorshipType("bronze");
    } catch (error) {
      toast.error("Failed to submit sponsorship request");
    } finally {
      setSubmitting(false);
    }
  };

  const features = [
    {
      icon: Users,
      title: "Training Management",
      description: "Organize and track training sessions with attendance monitoring"
    },
    {
      icon: Trophy,
      title: "Match Scheduling",
      description: "Schedule matches, manage rosters, and track results"
    },
    {
      icon: Calendar,
      title: "Unified Calendar",
      description: "View all trainings, matches, and events in one place"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Track student progress with detailed performance insights"
    },
    {
      icon: Bell,
      title: "Announcements",
      description: "Keep everyone informed with academy-wide announcements"
    },
    {
      icon: DollarSign,
      title: "Fundraising",
      description: "Manage sponsorships and fundraising campaigns"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-300">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo + Name */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
          <img
            src="/assets/logo.png"
            alt="SECFA Logo"
            className="h-12 w-12 object-contain"
          />
          <div className="flex flex-col">
            <span className="text-3xl font-display font-bold tracking-wide text-primary">
              SECFA
            </span>
            <p className="text-xs text-muted-foreground">
              Learning, Teamwork, Fun
            </p>
          </div>
        </Link>

          {/* Navigation Buttons */}
          <nav className="flex items-center space-x-6">

            <button
              onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
              className="text-gray-700 hover:text-primary font-medium transition-colors"
            >
              About
            </button>

            <button
              onClick={() => document.getElementById("coaches")?.scrollIntoView({ behavior: "smooth" })}
              className="text-gray-700 hover:text-primary font-medium transition-colors"
            >
              Coaches
            </button>

            <Button
              asChild
              className="bg-accent text-white font-bold px-6 py-2 rounded-lg border-2 border-accent hover:bg-accent/90 hover:border-accent/80 transition-all shadow-md"
            >
              <Link to="/login">Login</Link>
            </Button>
          </nav>

        </div>
      </header>



       {/* Hero Section */}
       <section className="relative pt-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('public/assets/hero-field.jpg')",
            filter: "brightness(0.4)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />

        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
              Learning • Teamwork • Fun
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Welcome to the
              <span className="gradient-text block mt-2">SE Class Football Academy</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
              Where software engineering students develop both their minds and athletic skills. Join our community
              to experience professional football training, match scheduling, and performance tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup">
              <Button size="lg" variant="default">
                  Join the Academy
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================
        ABOUT THE ACADEMY SECTION
        ============================ */}
      <section id="about" className="bg-white py-20">
        <div className="container mx-auto px-6">

          {/* Title */}
          <h2 className="text-4xl font-bold text-center mb-10">
            About <span className="text-green-500">SE Class Football Academy</span>
          </h2>

          {/* Main About Text */}
          <div className="max-w-4xl mx-auto text-center text-gray-700 leading-relaxed space-y-6">
            <p>
              SE Class Football Academy is a professional training environment built
              for young athletes who want to grow, compete, and dominate in football.
              Our mission is to develop players both physically and mentally, while
              teaching discipline, teamwork, and high-performance football skills.
            </p>

            <p>
              We focus on creating a strong foundation for every player — from
              essential fundamentals to advanced tactical awareness. Our coaching team
              is certified, experienced, and dedicated to shaping the next generation
              of champions.
            </p>

            <p>
              At SE Class, football is more than a sport — it’s a lifestyle, a mindset,
              and a path to personal growth.
            </p>
          </div>

          {/* Values / Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="p-8 bg-gray-50 rounded-2xl shadow text-center">
              <h3 className="text-xl font-semibold text-green-500 mb-3">Professional Training</h3>
              <p className="text-gray-600">
                Every session is designed by licensed coaches using the latest
                football methodology and performance science.
              </p>
            </div>

            <div className="p-8 bg-gray-50 rounded-2xl shadow text-center">
              <h3 className="text-xl font-semibold text-green-500 mb-3">Discipline & Growth</h3>
              <p className="text-gray-600">
                We teach our players focus, respect, teamwork, and leadership on and
                off the field.
              </p>
            </div>

            <div className="p-8 bg-gray-50 rounded-2xl shadow text-center">
              <h3 className="text-xl font-semibold text-green-500 mb-3">Proven Results</h3>
              <p className="text-gray-600">
                Our academy has consistently produced top-level talent, tournament
                winners, and high-performance athletes.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ============================
        MEET THE COACHES SECTION
        ============================ */}
      <section id="coaches" className="bg-gray-100 py-20">
        <div className="container mx-auto px-6">

          {/* Title */}
          <h2 className="text-4xl font-bold text-center mb-10">
            Meet Our <span className="text-green-500">Coaching Team</span>
          </h2>

          {/* Coaches Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

            {/* Coach 1 */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img src="/assets/coach1.jpg" alt="Coach 1" className="h-90 w-full object-cover" />
              <div className="p-6 text-center space-y-2">
                <h3 className="text-2xl font-semibold">Coach karim</h3>
                <p className="text-green-500 font-medium">Head Coach – UEFA Licensed</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  With over 12 years of professional coaching experience, Coach Ahmed
                  specializes in tactical development, player discipline, and
                  high-intensity performance sessions.
                </p>
              </div>
            </div>

            {/* Coach 2 */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img src="/assets/coach2.jpg" alt="Coach 2" className="h-90 w-full object-cover" />
              <div className="p-6 text-center space-y-2">
                <h3 className="text-2xl font-semibold">Coach hadi</h3>
                <p className="text-green-500 font-medium">Fitness & Conditioning Coach</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  A certified performance trainer who focuses on strength, speed,
                  agility, and preventing injuries through modern conditioning programs.
                </p>
              </div>
            </div>

            {/* Coach 3 */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img src="/assets/coach3.jpg" alt="Coach 3" className="h-90 w-full object-cover" />
              <div className="p-6 text-center space-y-2">
                <h3 className="text-2xl font-semibold">Coach ziad</h3>
                <p className="text-green-500 font-medium">Goalkeeper Specialist</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Expert in goalkeeper techniques, reflex development, positioning,
                  and game-reading skills, helping keepers reach peak performance.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Sponsorship Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl md:text-5xl font-bold">Become a Sponsor</h2>
              <p className="text-xl text-muted-foreground">
                Support our academy and help shape the future of football
              </p>
            </div>

            <Card className="border-border/40">
              <CardHeader>
                <CardTitle>Quick Sponsorship Inquiry</CardTitle>
                <CardDescription>Fill out the form below and we'll get back to you</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSponsorSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Name</Label>
                      <Input
                        id="contactName"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Phone</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sponsorshipType">Sponsorship Type</Label>
                    <Select value={sponsorshipType} onValueChange={setSponsorshipType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bronze">Bronze Package</SelectItem>
                        <SelectItem value="silver">Silver Package</SelectItem>
                        <SelectItem value="gold">Gold Package</SelectItem>
                        <SelectItem value="platinum">Platinum Package</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      placeholder="Tell us about your sponsorship goals..."
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary" 
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Inquiry"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-field field-decorations">
        <div className="absolute inset-0 stadium-glow"></div>
        <div className="absolute inset-0 field-lines"></div>
        
        {/* Field boundary */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/20"></div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 p-12">
            <h2 className="text-5xl md:text-7xl font-display font-bold text-white uppercase drop-shadow-2xl">
              Ready to Win?
            </h2>
            <p className="text-2xl md:text-3xl text-white font-semibold drop-shadow-lg">
              Join the elite. Start your journey to greatness today.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="bg-accent text-pitch-dark hover:bg-accent/90 hover:scale-105 h-16 px-12 text-xl font-bold shadow-[0_8px_30px_rgb(253,224,71,0.4)] border-2 border-accent/50"
            >
              <Link to="/signup">Join The Academy</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* Footer */}
      <footer className="bg-white border-t border-gray-300 mt-auto">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src="/assets/logo.png" alt="SE Class Academy" className="h-14 w-14 object-cover" />
                <div>
                  <h3 className="font-bold text-lg text-gray-900">SE Class Academy</h3>
                  <p className="text-sm text-gray-600">Learning, Teamwork, Fun</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Building better athletes and learners through the beautiful game.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <Link to="/matches" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Matches
                  </Link>
                </li>
                <li>
                  <Link to="/training" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Training
                  </Link>
                </li>
                <li>
                  <Link to="/calendar" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Calendar
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/signup" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Join Academy
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => document.getElementById("coaches")?.scrollIntoView({ behavior: "smooth" })}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Our Coaches
                  </button>
                </li>
                <li>
                  <Link to="/sponsorship" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Sponsorship
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-gray-600 hover:text-gray-900 transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} className="text-gray-900" />
                  <a href="mailto:info@secfa.academy" className="hover:text-gray-900 transition-colors">
                    info@secfa.academy
                  </a>
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Phone size={16} className="text-gray-900" />
                  <span>+961 70 123 456</span>
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} className="text-gray-900" />
                  <span>Beirut, Lebanon</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="border-t border-gray-300 mt-10 pt-6 text-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} SE Class Football Academy. Built with by Tech Tok Team.
            </p>
          </div>
        </div>
      </footer>



    </div>
  );
}
