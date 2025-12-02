import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Trophy, Users, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState } from "react";

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

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

  // Combine all events
  const allEvents = [
    ...(trainings?.map((t: any) => ({ ...t, type: 'training', date: new Date(t.date) })) || []),
    ...(matches?.map((m: any) => ({ ...m, type: 'match', date: new Date(m.date) })) || []),
    ...(announcements?.map((a: any) => ({ ...a, type: 'announcement', date: new Date(a.published_at) })) || [])
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Get events for selected date
  const selectedDateEvents = selectedDate
    ? allEvents.filter(event => {
        const eventDate = event.date;
        return eventDate.toDateString() === selectedDate.toDateString();
      })
    : [];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'training': return Users;
      case 'match': return Trophy;
      case 'announcement': return Bell;
      default: return CalendarIcon;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'training': return 'border-l-4 border-l-primary bg-primary/5';
      case 'match': return 'border-l-4 border-l-secondary bg-secondary/5';
      case 'announcement': return 'border-l-4 border-l-accent bg-accent/5';
      default: return 'border-l-4 border-l-muted bg-muted/5';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <CalendarIcon className="h-10 w-10 text-primary" />
            Calendar
          </h1>
          <p className="text-muted-foreground">View all trainings, matches, and announcements</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-1 border-border/40">
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Events List */}
          <Card className="lg:col-span-2 border-border/40">
            <CardHeader>
              <CardTitle>
                {selectedDate ? `Events on ${selectedDate.toLocaleDateString()}` : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map((event: any, index: number) => {
                    const Icon = getEventIcon(event.type);
                    return (
                      <div
                        key={`${event.type}-${event.id}-${index}`}
                        className={`p-4 rounded-lg ${getEventColor(event.type)} flex items-start gap-3`}
                      >
                        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium uppercase text-muted-foreground">
                              {event.type}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <h4 className="font-semibold">{event.title}</h4>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                          {event.opponent && (
                            <p className="text-sm mt-1">vs <span className="font-medium">{event.opponent}</span></p>
                          )}
                          {event.location && (
                            <p className="text-sm text-muted-foreground mt-1">📍 {event.location}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No events scheduled for this date</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Legend */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Event Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-primary"></div>
                <Users className="h-4 w-4" />
                <span className="text-sm">Training Sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-secondary"></div>
                <Trophy className="h-4 w-4" />
                <span className="text-sm">Matches</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-accent"></div>
                <Bell className="h-4 w-4" />
                <span className="text-sm">Announcements</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
