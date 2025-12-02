import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Trophy, Calendar, Bell, DollarSign, BarChart3, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AdminPanel() {
  const { profile } = useAuth();

  const { data: trainings } = useQuery({
    queryKey: ["trainings"],
    queryFn: async () => {
      const { data } = await apiClient.getTrainings();
      return data || [];
    }
  });

  const { data: matches } = useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const { data } = await apiClient.getMatches();
      return data || [];
    }
  });

  const { data: announcements } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data } = await apiClient.getAnnouncements();
      return data || [];
    }
  });

  const { data: campaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data } = await apiClient.getCampaigns();
      return data || [];
    }
  });

  // Redirect if not admin
  if (profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const stats = [
    {
      title: "Total Trainings",
      value: trainings?.length || 0,
      icon: Users,
      description: "Training sessions",
      color: "text-primary"
    },
    {
      title: "Total Matches",
      value: matches?.length || 0,
      icon: Trophy,
      description: "Scheduled matches",
      color: "text-secondary"
    },
    {
      title: "Announcements",
      value: announcements?.length || 0,
      icon: Bell,
      description: "Active announcements",
      color: "text-accent"
    },
    {
      title: "Active Campaigns",
      value: campaigns?.filter((c: any) => c.status === 'active').length || 0,
      icon: DollarSign,
      description: "Fundraising campaigns",
      color: "text-success"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Shield className="h-10 w-10 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">System overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-border/40 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="border-border/40 shadow-md">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Link to="/users">
                <Card className="border-border/40 hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardContent className="pt-6 text-center space-y-2">
                    <Users className="h-8 w-8 text-primary mx-auto" />
                    <h3 className="font-semibold">Manage Users</h3>
                    <p className="text-sm text-muted-foreground">View and manage user accounts</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/coach-students">
                <Card className="border-border/40 hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardContent className="pt-6 text-center space-y-2">
                    <Activity className="h-8 w-8 text-primary mx-auto" />
                    <h3 className="font-semibold">Coach Assignments</h3>
                    <p className="text-sm text-muted-foreground">Assign students to coaches</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/analytics">
                <Card className="border-border/40 hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardContent className="pt-6 text-center space-y-2">
                    <BarChart3 className="h-8 w-8 text-primary mx-auto" />
                    <h3 className="font-semibold">View Analytics</h3>
                    <p className="text-sm text-muted-foreground">System-wide performance metrics</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/fundraising">
                <Card className="border-border/40 hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardContent className="pt-6 text-center space-y-2">
                    <DollarSign className="h-8 w-8 text-primary mx-auto" />
                    <h3 className="font-semibold">Fundraising</h3>
                    <p className="text-sm text-muted-foreground">Manage campaigns and sponsors</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* System Activity */}
        <Card className="border-border/40 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system events and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements?.slice(0, 5).map((announcement: any) => (
                <div key={announcement.id} className="flex items-start gap-3 p-3 border border-border/40 rounded-lg">
                  <Bell className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{announcement.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(announcement.published_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!announcements || announcements.length === 0) && (
                <p className="text-center text-muted-foreground py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-border/40 shadow-md">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system health</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <span className="flex items-center gap-2 text-sm text-success">
                  <div className="h-2 w-2 rounded-full bg-success"></div>
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Authentication</span>
                <span className="flex items-center gap-2 text-sm text-success">
                  <div className="h-2 w-2 rounded-full bg-success"></div>
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">File Storage</span>
                <span className="flex items-center gap-2 text-sm text-success">
                  <div className="h-2 w-2 rounded-full bg-success"></div>
                  Operational
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-md">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Next scheduled activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[...trainings || [], ...matches || []]
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 3)
                .map((event: any) => {
                  const isTraining = 'duration_minutes' in event;
                  const Icon = isTraining ? Users : Trophy;
                  return (
                    <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <Icon className="h-4 w-4 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              {(!trainings?.length && !matches?.length) && (
                <p className="text-center text-muted-foreground py-4 text-sm">No upcoming events</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
