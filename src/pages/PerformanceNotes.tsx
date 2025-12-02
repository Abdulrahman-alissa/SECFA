import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Plus, Download } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { exportPerformanceNotesToPDF, exportPerformanceNotesToCSV } from "@/lib/exportUtils";

export default function PerformanceNotes() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState("");
  const [category, setCategory] = useState("training");
  const [rating, setRating] = useState("3");
  const [note, setNote] = useState("");

  const { data: students } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("role", "student");
      return data || [];
    }
  });

  const { data: notes, isLoading } = useQuery({
    queryKey: ["performance-notes"],
    queryFn: async () => {
      const { data } = await apiClient.getPerformanceNotes();
      return data || [];
    }
  });

  const createNoteMutation = useMutation({
    mutationFn: async (noteData: any) => {
      return apiClient.createPerformanceNote(noteData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-notes"] });
      toast.success("Performance note created");
      setSelectedStudent("");
      setNote("");
      setRating("3");
      setCategory("training");
    },
    onError: () => {
      toast.error("Failed to create note");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !note) {
      toast.error("Please fill in all fields");
      return;
    }

    createNoteMutation.mutate({
      student_id: selectedStudent,
      coach_id: profile?.id,
      category,
      rating: parseInt(rating),
      note
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Star className="h-10 w-10 text-primary" />
              Performance Notes
            </h1>
            <p className="text-muted-foreground">Track student progress and provide feedback</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => notes && exportPerformanceNotesToPDF(notes, `performance-notes-${new Date().toISOString().split('T')[0]}`)}
              disabled={!notes || notes.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={() => notes && exportPerformanceNotesToCSV(notes, `performance-notes-${new Date().toISOString().split('T')[0]}`)}
              disabled={!notes || notes.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create Note Form */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle>Add Performance Note</CardTitle>
              <CardDescription>Record feedback for a student</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student">Student</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="match">Match</SelectItem>
                      <SelectItem value="technical">Technical Skills</SelectItem>
                      <SelectItem value="tactical">Tactical Awareness</SelectItem>
                      <SelectItem value="physical">Physical Fitness</SelectItem>
                      <SelectItem value="mental">Mental Strength</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (1-5)</Label>
                  <Select value={rating} onValueChange={setRating}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(r => (
                        <SelectItem key={r} value={r.toString()}>
                          {r} Star{r > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Notes</Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Enter detailed feedback..."
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-primary" disabled={createNoteMutation.isPending}>
                  <Plus className="mr-2 h-4 w-4" />
                  {createNoteMutation.isPending ? "Creating..." : "Add Note"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Notes */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle>Recent Notes</CardTitle>
              <CardDescription>Latest performance feedback</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : notes && notes.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {notes.map((note: any) => (
                    <div key={note.id} className="p-4 border border-border/40 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{note.student?.full_name}</p>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < note.rating ? "fill-warning text-warning" : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">{note.category}</p>
                      <p className="text-sm">{note.note}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(note.created_at).toLocaleDateString()} - {note.coach?.full_name}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No notes yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
