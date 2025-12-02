import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, MapPin, Clock, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export default function Trainings() {
  const { profile } = useAuth();
  const canManage = profile?.role === 'coach' || profile?.role === 'admin';

  const { data: trainings, isLoading } = useQuery({
    queryKey: ["trainings"],
    queryFn: async () => {
      const { data } = await apiClient.getTrainings();
      return data || [];
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Users className="h-10 w-10 text-primary" />
              Training Sessions
            </h1>
            <p className="text-muted-foreground">View and manage training schedules</p>
          </div>
          {canManage && (
            <Button className="bg-gradient-primary" asChild>
              <Link to="/trainings/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Training
              </Link>
            </Button>
          )}
        </div>

        {/* Trainings Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : trainings && trainings.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainings.map((training: any) => (
              <Card key={training.id} className="border-border/40 hover:shadow-lg transition-all hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="line-clamp-2">{training.title}</span>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{training.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{new Date(training.date).toLocaleDateString()} at {new Date(training.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{training.duration_minutes} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="line-clamp-1">{training.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-primary" />
                    <span>Coach: {training.coach?.full_name || 'N/A'}</span>
                  </div>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link to={`/training/${training.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border/40">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <Users className="h-16 w-16 text-muted-foreground mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No trainings scheduled</h3>
                  <p className="text-muted-foreground">
                    {canManage ? "Create your first training session to get started" : "Check back later for upcoming training sessions"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
