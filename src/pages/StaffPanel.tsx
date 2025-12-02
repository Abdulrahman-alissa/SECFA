import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Bell, TrendingUp, GraduationCap, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function StaffPanel() {
  const { profile } = useAuth();

  const { data: trainings, isLoading: trainingsLoading } = useQuery({
    queryKey: ["trainings"],
    queryFn: async () => {
      const { data } = await apiClient.getTrainings();
      return data || [];
    }
  });

  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const { data } = await apiClient.getMatches();
      return data || [];
    }
  });

  const { data: announcements, isLoading: announcementsLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data } = await apiClient.getAnnouncements();
      return data || [];
    }
  });

  const { data: students } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data } = await apiClient.getUsersByRole("student");
      return data || [];
    }
  });

  const { data: coaches } = useQuery({
    queryKey: ["coaches"],
    queryFn: async () => {
      const { data } = await apiClient.getUsersByRole("coach");
      return data || [];
    }
  });

  if (profile?.role !== "staff" && profile?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const stats = [
    {
      title: "Total Students",
      value: students?.length || 0,
      icon: GraduationCap,
      description: "Enrolled in academy"
    },
    {
      title: "Total Coaches",
      value: coaches?.length || 0,
      icon: UserCog,
      description: "Active coaching staff"
    },
    {
      title: "Trainings",
      value: trainings?.length || 0,
      icon: Users,
      description: "Scheduled sessions"
    },
    {
      title: "Matches",
      value: matches?.length || 0,
      icon: Calendar,
      description: "Upcoming matches"
    },
    {
      title: "Announcements",
      value: announcements?.length || 0,
      icon: Bell,
      description: "Active announcements"
    }
  ];

  const quickActions = [
    {
      title: "Create Announcement",
      description: "Post updates to students and coaches",
      icon: Bell,
      to: "/announcements/create"
    },
    {
      title: "View Calendar",
      description: "Manage academy events",
      icon: Calendar,
      to: "/calendar"
    },
    {
      title: "Fundraising",
      description: "Manage campaigns",
      icon: TrendingUp,
      to: "/fundraising"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Staff Panel</h1>
          <p className="text-xl text-muted-foreground">
            Academy administration and content management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-border/40 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
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
            <div className="grid gap-4 md:grid-cols-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Card key={index} className="border-border/40 hover:border-primary/50 transition-colors cursor-pointer">
                    <Link to={action.to}>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-primary" />
                          <CardTitle className="text-base">{action.title}</CardTitle>
                        </div>
                        <CardDescription>{action.description}</CardDescription>
                      </CardHeader>
                    </Link>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Students and Coaches Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Students List */}
          <Card className="border-border/40 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Students
                </CardTitle>
                <Badge variant="secondary">{students?.length || 0}</Badge>
              </div>
              <CardDescription>Academy students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {students && students.length > 0 ? (
                  students.slice(0, 10).map((student: any) => (
                    <div key={student.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.profile_picture_url} />
                        <AvatarFallback>{student.full_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{student.full_name}</p>
                        <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No students found</p>
                )}
                {students && students.length > 10 && (
                  <p className="text-sm text-center text-muted-foreground pt-2">
                    Showing 10 of {students.length} students
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Coaches List */}
          <Card className="border-border/40 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-primary" />
                  Coaches
                </CardTitle>
                <Badge variant="secondary">{coaches?.length || 0}</Badge>
              </div>
              <CardDescription>Coaching staff</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {coaches && coaches.length > 0 ? (
                  coaches.map((coach: any) => (
                    <div key={coach.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={coach.profile_picture_url} />
                        <AvatarFallback>{coach.full_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{coach.full_name}</p>
                        <p className="text-sm text-muted-foreground truncate">{coach.email}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No coaches found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Announcements */}
        <Card className="border-border/40 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Announcements</CardTitle>
                <CardDescription>Latest academy updates</CardDescription>
              </div>
              <Button asChild>
                <Link to="/announcements">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {announcements && announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.slice(0, 5).map((announcement: any) => (
                  <div key={announcement.id} className="p-4 rounded-lg border border-border/40 hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold">{announcement.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {announcement.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{announcement.category}</Badge>
                          <Badge variant={
                            announcement.priority === "high" ? "destructive" :
                            announcement.priority === "medium" ? "default" :
                            "secondary"
                          }>
                            {announcement.priority}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(announcement.published_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No announcements yet</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
