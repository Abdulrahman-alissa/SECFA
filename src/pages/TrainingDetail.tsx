import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Calendar, MapPin, Clock, ArrowLeft, Edit, UserPlus, UserMinus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function TrainingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: training, isLoading } = useQuery({
    queryKey: ["training", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await apiClient.getTraining(id);
      return data;
    },
    enabled: !!id
  });

  const canManage = profile?.role === 'coach' || profile?.role === 'admin' || profile?.role === 'staff';
  const isStudent = profile?.role === 'student';
  const isJoined = training?.attendance?.some((a: any) => a.student_id === profile?.id && a.status !== 'cancelled');

  const joinTrainingMutation = useMutation({
    mutationFn: async () => {
      if (!id || !profile?.id) throw new Error("Missing data");
      return await apiClient.joinTraining(id, profile.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training", id] });
      toast.success("Successfully joined the training!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to join training");
    }
  });

  const leaveTrainingMutation = useMutation({
    mutationFn: async () => {
      if (!id || !profile?.id) throw new Error("Missing data");
      return await apiClient.leaveTraining(id, profile.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training", id] });
      toast.success("Left the training");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to leave training");
    }
  });

  const getAttendanceColor = (status: string) => {
    const colors: Record<string, string> = {
      present: "bg-success",
      absent: "bg-destructive",
      late: "bg-warning"
    };
    return colors[status] || "bg-gray-500";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!training) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="border-border/40">
            <CardContent className="py-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Training not found</h2>
              <Button onClick={() => navigate("/trainings")} variant="outline">
                ← Back to Trainings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const attendanceStats = {
    total: training.attendance?.length || 0,
    present: training.attendance?.filter((a: any) => a.status === 'present').length || 0,
    absent: training.attendance?.filter((a: any) => a.status === 'absent').length || 0,
    late: training.attendance?.filter((a: any) => a.status === 'late').length || 0
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate("/trainings")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Trainings
        </Button>

        {/* Training Header */}
        <Card className="border-border/40 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl">{training.title}</CardTitle>
            <CardDescription className="text-lg">{training.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Training Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-base">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{new Date(training.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(training.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-base">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>{training.duration_minutes} minutes</span>
                </div>
                <div className="flex items-center gap-3 text-base">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>{training.location}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-base">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Coach: {training.coach?.full_name}</span>
                </div>
                {training.max_participants && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Capacity</p>
                    <p className="font-medium text-lg">
                      {attendanceStats.total} / {training.max_participants} Participants
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Student Actions */}
            {isStudent && (
              <div className="flex gap-3 pt-4 border-t border-border">
                {!isJoined ? (
                  <Button 
                    className="flex-1 bg-gradient-primary" 
                    onClick={() => joinTrainingMutation.mutate()}
                    disabled={joinTrainingMutation.isPending || (training.max_participants && training.attendance?.filter((a: any) => a.status !== 'cancelled').length >= training.max_participants)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {joinTrainingMutation.isPending ? "Joining..." : "Join Training"}
                  </Button>
                ) : (
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => leaveTrainingMutation.mutate()}
                    disabled={leaveTrainingMutation.isPending}
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    {leaveTrainingMutation.isPending ? "Leaving..." : "Leave Training"}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Attendance Stats */}
          <Card className="border-border/40 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Attendance Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-success"></div>
                  <span className="text-sm">Present</span>
                </div>
                <span className="font-bold text-lg">{attendanceStats.present}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive"></div>
                  <span className="text-sm">Absent</span>
                </div>
                <span className="font-bold text-lg">{attendanceStats.absent}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-warning"></div>
                  <span className="text-sm">Late</span>
                </div>
                <span className="font-bold text-lg">{attendanceStats.late}</span>
              </div>
              {canManage && (
                <Button className="w-full mt-4 bg-gradient-primary" asChild>
                  <Link to={`/training/${id}/attendance`}>
                    Mark Attendance
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Attendance List */}
          <Card className="lg:col-span-2 border-border/40 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Participants
              </CardTitle>
              <CardDescription>Students registered for this training session</CardDescription>
            </CardHeader>
            <CardContent>
              {training.attendance && training.attendance.length > 0 ? (
                <div className="space-y-3">
                  {training.attendance.map((record: any) => (
                    <div key={record.id} className="flex items-center gap-3 p-3 border border-border/40 rounded-lg hover:bg-muted/30 transition-colors">
                      <Avatar>
                        <AvatarImage src={record.student?.profile_picture_url} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {record.student?.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{record.student?.full_name}</p>
                        {record.notes && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{record.notes}</p>
                        )}
                      </div>
                      <Badge className={`${getAttendanceColor(record.status)} text-white capitalize`}>
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No attendance records yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
