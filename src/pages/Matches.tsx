import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, MapPin, Users, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export default function Matches() {
  const { profile } = useAuth();
  const canManage = profile?.role === 'coach' || profile?.role === 'admin';

  const { data: matches, isLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const { data } = await apiClient.getMatches();
      return data || [];
    }
  });

  const getMatchTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      friendly: "bg-blue-500",
      league: "bg-green-500",
      tournament: "bg-purple-500",
      cup: "bg-amber-500"
    };
    return colors[type] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Trophy className="h-10 w-10 text-primary" />
              Matches
            </h1>
            <p className="text-muted-foreground">View and manage match schedules</p>
          </div>
          {canManage && (
            <Button className="bg-gradient-primary" asChild>
              <Link to="/matches/create">
                <Plus className="mr-2 h-4 w-4" />
                Schedule Match
              </Link>
            </Button>
          )}
        </div>

        {/* Matches Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : matches && matches.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match: any) => (
              <Card key={match.id} className="border-border/40 hover:shadow-lg transition-all hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={`${getMatchTypeColor(match.match_type)} text-white capitalize`}>
                      {match.match_type}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{match.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{match.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">VS</p>
                    <p className="font-bold text-lg">{match.opponent}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{new Date(match.date).toLocaleDateString()} at {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="line-clamp-1">{match.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-primary" />
                    <span>Coach: {match.coach?.full_name || 'N/A'}</span>
                  </div>
                  {match.result && (
                    <div className="p-2 bg-success/10 text-success rounded text-center font-medium">
                      Result: {match.result}
                    </div>
                  )}
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link to={`/match/${match.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border/40">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No matches scheduled</h3>
                  <p className="text-muted-foreground">
                    {canManage ? "Schedule your first match to get started" : "Check back later for upcoming matches"}
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
