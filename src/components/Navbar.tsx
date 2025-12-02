import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/NotificationBell";
import { 
  Menu, 
  X, 
  Calendar, 
  Trophy, 
  Users, 
  Bell, 
  BarChart3,
  DollarSign,
  Settings,
  LogOut
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navLinks = user ? [
    { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { to: "/trainings", label: "Trainings", icon: Users },
    { to: "/matches", label: "Matches", icon: Trophy },
    { to: "/calendar", label: "Calendar", icon: Calendar },
    { to: "/announcements", label: "Announcements", icon: Bell },
    ...(profile?.role === 'staff' ? [
      { to: "/staff", label: "Staff Panel", icon: Settings }
    ] : []),
    ...(profile?.role === 'admin' ? [
      { to: "/admin", label: "Admin Panel", icon: Settings },
      { to: "/users", label: "Users", icon: Users }
    ] : []),
    ...(profile?.role === 'admin' || profile?.role === 'staff' ? [
      { to: "/fundraising", label: "Fundraising", icon: DollarSign }
    ] : []),
    ...(profile?.role === 'coach' || profile?.role === 'admin' ? [
      { to: "/performance-notes", label: "Performance", icon: BarChart3 }
    ] : []),
  ] : [];

  return (
    <nav className="sticky top-0 z-50 w-full border-b-2 border-border bg-background/95 backdrop-blur shadow-md supports-[backdrop-filter]:bg-background/90">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-primary p-2 rounded-lg shadow-md">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-foreground uppercase tracking-wider">SECFA</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Button
                  key={link.to}
                  variant="ghost"
                  asChild
                  className="text-foreground hover:text-primary hover:bg-primary/10 font-semibold"
                >
                  <Link to={link.to}>
                    <Icon className="mr-2 h-5 w-5" />
                    {link.label}
                  </Link>
                </Button>
              );
            })}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user && profile && <NotificationBell />}
            {user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile.profile_picture_url} alt={profile.full_name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {profile.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">{profile.full_name}</p>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                    <p className="text-xs text-primary capitalize">{profile.role}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" asChild className="text-foreground hover:text-primary hover:bg-primary/10 font-semibold">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild className="bg-primary text-white hover:bg-primary/90 font-bold shadow-lg">
                  <Link to="/signup">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && user && (
          <div className="md:hidden py-4 space-y-2 animate-slide-up bg-background border-t">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Button
                  key={link.to}
                  variant="ghost"
                  asChild
                  className="w-full justify-start text-foreground hover:text-primary hover:bg-primary/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to={link.to}>
                    <Icon className="mr-2 h-4 w-4" />
                    {link.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};
