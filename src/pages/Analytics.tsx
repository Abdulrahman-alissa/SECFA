import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Users, Trophy, Calendar, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Analytics() {
  const { profile } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<string>("all");

  const { data: students } = useQuery({
    queryKey: ["students-list"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("role", "student");
      return data || [];
    },
    enabled: profile?.role === 'coach' || profile?.role === 'admin'
  });

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

  // Get attendance based on selected student
  const studentIdForAttendance = selectedStudent === "all" 
    ? (profile?.role === 'student' ? profile?.id : null)
    : selectedStudent;

  const { data: attendance } = useQuery({
    queryKey: ["attendance", studentIdForAttendance],
    queryFn: async () => {
      if (!studentIdForAttendance) {
        // Get all attendance records for admin/coach view
        const { data } = await supabase.from("attendance").select("*");
        return data || [];
      }
      const { data } = await apiClient.getAttendanceStats(studentIdForAttendance);
      return data || [];
    },
    enabled: !!profile?.id
  });

  // Calculate stats
  const totalTrainings = trainings?.length || 0;
  const totalMatches = matches?.length || 0;
  
  // Filter attendance based on selection
  const filteredAttendance = selectedStudent === "all" 
    ? attendance 
    : attendance?.filter((a: any) => a.student_id === selectedStudent);
  
  const attendanceCount = filteredAttendance?.filter((a: any) => a.status === 'present').length || 0;
  const totalAttendanceRecords = filteredAttendance?.length || 0;
  const attendanceRate = totalAttendanceRecords > 0 ? Math.round((attendanceCount / totalAttendanceRecords) * 100) : 0;

  const selectedStudentName = selectedStudent === "all" 
    ? "All Students" 
    : students?.find((s: any) => s.id === selectedStudent)?.full_name || "Selected Student";

  const handleExport = (format: 'pdf' | 'csv') => {
    const fileName = `analytics-report-${selectedStudentName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'csv') {
      const csvData = [
        { Metric: 'Student', Value: selectedStudentName },
        { Metric: 'Total Trainings', Value: totalTrainings },
        { Metric: 'Total Matches', Value: totalMatches },
        { Metric: 'Attendance Rate', Value: `${attendanceRate}%` },
        { Metric: 'Sessions Attended', Value: attendanceCount },
      ];
      exportToCSV(csvData, fileName);
    } else {
      const headers = ['Metric', 'Value'];
      const data = [
        ['Student', selectedStudentName],
        ['Total Trainings', totalTrainings.toString()],
        ['Total Matches', totalMatches.toString()],
        ['Attendance Rate', `${attendanceRate}%`],
        ['Sessions Attended', attendanceCount.toString()],
      ];
      exportToPDF('Analytics Report', headers, data, fileName);
    }
    toast.success(`Report exported as ${format.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <BarChart3 className="h-10 w-10 text-primary" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">Track performance and attendance metrics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters - Only for coaches/admin */}
        {(profile?.role === 'coach' || profile?.role === 'admin') && (
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1 max-w-xs">
                  <label className="text-sm font-medium mb-2 block">Select Student</label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      {students?.map((student: any) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border/40 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Trainings</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalTrainings}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all sessions</p>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
              <Trophy className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalMatches}</div>
              <p className="text-xs text-muted-foreground mt-1">All match types</p>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{attendanceRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedStudent === "all" ? "Overall" : selectedStudentName}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {trainings?.filter((t: any) => {
                  const date = new Date(t.date);
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }).length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Training sessions</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Attendance Chart */}
          <Card className="border-border/40 shadow-md">
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
              <CardDescription>
                {selectedStudent === "all" ? "All students" : selectedStudentName} attendance breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-success"></div>
                    <span className="text-sm">Present</span>
                  </div>
                  <span className="font-medium">{filteredAttendance?.filter((a: any) => a.status === 'present').length || 0}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all" 
                    style={{ width: `${attendanceRate}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-destructive"></div>
                    <span className="text-sm">Absent</span>
                  </div>
                  <span className="font-medium">{filteredAttendance?.filter((a: any) => a.status === 'absent').length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-warning"></div>
                    <span className="text-sm">Late</span>
                  </div>
                  <span className="font-medium">{filteredAttendance?.filter((a: any) => a.status === 'late').length || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Match Participation */}
          <Card className="border-border/40 shadow-md">
            <CardHeader>
              <CardTitle>Match Participation</CardTitle>
              <CardDescription>Match types breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['friendly', 'league', 'tournament', 'cup'].map((type) => {
                  const count = matches?.filter((m: any) => m.match_type === type).length || 0;
                  const percentage = totalMatches > 0 ? Math.round((count / totalMatches) * 100) : 0;
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm capitalize">{type}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Notes - For students */}
        {profile?.role === 'student' && (
          <Card className="border-border/40 shadow-md">
            <CardHeader>
              <CardTitle>Recent Performance Notes</CardTitle>
              <CardDescription>Feedback from your coaches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-center text-muted-foreground py-8">
                  Performance notes will appear here as your coaches add feedback
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
