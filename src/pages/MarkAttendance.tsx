import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, ArrowLeft, Download } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { exportAttendanceToPDF, exportAttendanceToCSV } from "@/lib/exportUtils";

export default function MarkAttendance() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, string>>({});

  const { data: training, isLoading } = useQuery({
    queryKey: ["training", id],
    queryFn: async () => {
      const { data } = await apiClient.getTraining(id!);
      if (data?.attendance) {
        const initialStatus: Record<string, string> = {};
        data.attendance.forEach((att: any) => {
          initialStatus[att.student_id] = att.status;
        });
        setAttendanceStatus(initialStatus);
      }
      return data;
    }
  });

  // Check if attendance can be taken (only on or after the event day)
  const isAttendanceAllowed = training?.date 
    ? new Date(training.date).setHours(0, 0, 0, 0) <= new Date().setHours(0, 0, 0, 0)
    : false;

  const markAttendanceMutation = useMutation({
    mutationFn: async (data: { studentId: string; status: string }) => {
      const existing = training?.attendance?.find((a: any) => a.student_id === data.studentId);
      
      if (existing) {
        return apiClient.updateAttendance(existing.id, { status: data.status });
      } else {
        return apiClient.markAttendance({
          training_id: id,
          student_id: data.studentId,
          status: data.status
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training", id] });
      toast.success("Attendance updated");
    },
    onError: () => {
      toast.error("Failed to update attendance");
    }
  });

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceStatus(prev => ({ ...prev, [studentId]: status }));
    markAttendanceMutation.mutate({ studentId, status });
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
          <p className="text-center text-muted-foreground">Training not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <Button variant="ghost" onClick={() => navigate(`/training/${id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Training
        </Button>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold">Mark Attendance</h1>
            <p className="text-muted-foreground">{training.title}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => training.attendance && exportAttendanceToPDF(training.attendance, `attendance-${training.title}-${new Date().toISOString().split('T')[0]}`)}
              disabled={!training.attendance || training.attendance.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={() => training.attendance && exportAttendanceToCSV(training.attendance, `attendance-${training.title}-${new Date().toISOString().split('T')[0]}`)}
              disabled={!training.attendance || training.attendance.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>
              {isAttendanceAllowed 
                ? "Mark attendance status for each student" 
                : "Attendance can only be marked on or after the training day"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {training.attendance && training.attendance.length > 0 ? (
                training.attendance.map((attendance: any) => (
                  <div
                    key={attendance.id}
                    className="flex items-center justify-between p-4 border border-border/40 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={attendance.student?.profile_picture_url} />
                        <AvatarFallback>
                          {attendance.student?.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{attendance.student?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{attendance.student?.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={attendanceStatus[attendance.student_id] === 'present' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusChange(attendance.student_id, 'present')}
                        className={attendanceStatus[attendance.student_id] === 'present' ? 'bg-success' : ''}
                        disabled={!isAttendanceAllowed}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Present
                      </Button>
                      <Button
                        variant={attendanceStatus[attendance.student_id] === 'late' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusChange(attendance.student_id, 'late')}
                        className={attendanceStatus[attendance.student_id] === 'late' ? 'bg-warning' : ''}
                        disabled={!isAttendanceAllowed}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Late
                      </Button>
                      <Button
                        variant={attendanceStatus[attendance.student_id] === 'absent' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusChange(attendance.student_id, 'absent')}
                        className={attendanceStatus[attendance.student_id] === 'absent' ? 'bg-destructive' : ''}
                        disabled={!isAttendanceAllowed}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Absent
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No students registered for this training
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
