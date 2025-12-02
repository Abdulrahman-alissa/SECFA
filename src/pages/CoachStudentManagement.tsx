import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Trash2, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CoachStudentManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCoach, setSelectedCoach] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  const { data: coaches } = useQuery({
    queryKey: ["coaches"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "coach");
      return data || [];
    },
  });

  const { data: students } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student");
      return data || [];
    },
  });

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["coach-students"],
    queryFn: async () => {
      const { data } = await supabase
        .from("coach_students")
        .select(`
          *,
          coach:coach_id(id, full_name, email, profile_picture_url),
          student:student_id(id, full_name, email, profile_picture_url)
        `);
      return data || [];
    },
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("coach_students")
        .insert({
          coach_id: selectedCoach,
          student_id: selectedStudent,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-students"] });
      toast.success("Student assigned to coach successfully");
      setSelectedCoach("");
      setSelectedStudent("");
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        toast.error("This student is already assigned to this coach");
      } else {
        toast.error("Failed to assign student");
      }
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("coach_students")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-students"] });
      toast.success("Assignment removed successfully");
    },
    onError: () => {
      toast.error("Failed to remove assignment");
    },
  });

  const handleAssign = () => {
    if (!selectedCoach || !selectedStudent) {
      toast.error("Please select both coach and student");
      return;
    }
    assignMutation.mutate();
  };

  if (profile?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Access denied. Admin only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Users className="h-10 w-10 text-primary" />
            Coach-Student Assignments
          </h1>
          <p className="text-muted-foreground">Manage which students are supervised by which coaches</p>
        </div>

        {/* Assignment Form */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Assign Student to Coach</CardTitle>
            <CardDescription>Select a coach and student to create an assignment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Coach</label>
                <Select value={selectedCoach} onValueChange={setSelectedCoach}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select coach" />
                  </SelectTrigger>
                  <SelectContent>
                    {coaches?.map((coach: any) => (
                      <SelectItem key={coach.id} value={coach.id}>
                        {coach.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Student</label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students?.map((student: any) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={handleAssign} 
                  className="w-full"
                  disabled={assignMutation.isPending}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {assignMutation.isPending ? "Assigning..." : "Assign"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Assignments */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Current Assignments</CardTitle>
            <CardDescription>All coach-student relationships</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : assignments && assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment: any) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 border border-border/40 rounded-lg"
                  >
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={assignment.coach?.profile_picture_url} />
                          <AvatarFallback>{assignment.coach?.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{assignment.coach?.full_name}</p>
                          <p className="text-sm text-muted-foreground">Coach</p>
                        </div>
                      </div>
                      
                      <div className="text-muted-foreground">→</div>
                      
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={assignment.student?.profile_picture_url} />
                          <AvatarFallback>{assignment.student?.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{assignment.student?.full_name}</p>
                          <p className="text-sm text-muted-foreground">Student</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMutation.mutate(assignment.id)}
                      disabled={removeMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No coach-student assignments yet
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
