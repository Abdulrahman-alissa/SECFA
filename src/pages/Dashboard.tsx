import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, Bell, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export default function Dashboard() {
  const { profile } = useAuth();

  const { data: upcomingTrainings } = useQuery({
    queryKey: ["trainings"],
    queryFn: async () => {
      const { data } = await apiClient.getTrainings();
      return data?.slice(0, 3) || [];
    }
  });

  const { data: upcomingMatches } = useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const { data } = await apiClient.getMatches();
      return data?.slice(0, 3) || [];
    }
  });

  const { data: announcements } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data } = await apiClient.getAnnouncements();
      return data?.slice(0, 3) || [];
    }
  });

  const roleBasedGreeting = {
    student: "Welcome to your training hub",
    coach: "Manage your team effectively",
    staff: "Keep the academy running smoothly",
    admin: "Overview of academy operations"
  }[profile?.role || 'student'];

  const quickActions = {
    student: [
      { label: "View Trainings", to: "/trainings", icon: Users },
      { label: "Browse Matches", to: "/matches", icon: Trophy },
      { label: "Check Calendar", to: "/calendar", icon: Calendar },
    ],
    coach: [
      { label: "Create Training", to: "/trainings?action=create", icon: Users },
      { label: "Schedule Match", to: "/matches?action=create", icon: Trophy },
      { label: "View Analytics", to: "/analytics", icon: TrendingUp },
    ],
    staff: [
      { label: "Staff Panel", to: "/staff", icon: TrendingUp },
      { label: "New Announcement", to: "/announcements/create", icon: Bell },
      { label: "Manage Events", to: "/calendar", icon: Calendar },
    ],
    admin: [
      { label: "Analytics", to: "/analytics", icon: TrendingUp },
      { label: "Fundraising", to: "/fundraising", icon: TrendingUp },
      { label: "System Overview", to: "/admin", icon: TrendingUp },
    ],
  }[profile?.role || 'student'];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2 animate-slide-up">
          <h1 className="text-4xl font-bold">
            Welcome back, <span className="text-gradient">{profile?.full_name}</span>
          </h1>
          <p className="text-xl text-muted-foreground">{roleBasedGreeting}</p>
        </div>

        {/* Quick Actions */}
        <Card className="border-border/40 shadow-md">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with these common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    asChild
                    className="h-24 flex-col space-y-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
                  >
                    <Link to={action.to}>
                      <Icon className="h-8 w-8 text-primary" />
                      <span className="font-medium">{action.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Upcoming Trainings */}
          <Card className="border-border/40 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Upcoming Trainings
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingTrainings && upcomingTrainings.length > 0 ? (
                <>
                  {upcomingTrainings.map((training: any) => (
                    <div key={training.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <Clock className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{training.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(training.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button variant="link" asChild className="w-full">
                    <Link to="/trainings">View All Trainings →</Link>
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-4">No upcoming trainings</p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Matches */}
          <Card className="border-border/40 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Upcoming Matches
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingMatches && upcomingMatches.length > 0 ? (
                <>
                  {upcomingMatches.map((match: any) => (
                    <div key={match.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <Trophy className="h-5 w-5 text-secondary mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{match.title}</p>
                        <p className="text-sm text-muted-foreground">vs {match.opponent}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(match.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button variant="link" asChild className="w-full">
                    <Link to="/matches">View All Matches →</Link>
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-4">No upcoming matches</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Announcements */}
          <Card className="border-border/40 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {announcements && announcements.length > 0 ? (
                <>
                  {announcements.map((announcement: any) => (
                    <div key={announcement.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <p className="font-medium truncate">{announcement.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {announcement.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(announcement.published_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  <Button variant="link" asChild className="w-full">
                    <Link to="/announcements">View All Announcements →</Link>
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-4">No recent announcements</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
