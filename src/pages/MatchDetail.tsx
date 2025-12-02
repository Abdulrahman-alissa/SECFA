import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy, Calendar, MapPin, Users, ArrowLeft, UserPlus, UserMinus, Edit, ClipboardCheck, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: match, isLoading } = useQuery({
    queryKey: ["match", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await apiClient.getMatch(id);
      return data;
    },
    enabled: !!id
  });

  const joinMatchMutation = useMutation({
    mutationFn: async () => {
      if (!id || !profile?.id) return;
      return await apiClient.joinMatch(id, profile.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", id] });
      toast.success("Successfully joined the match!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to join match");
    }
  });

  const leaveMatchMutation = useMutation({
    mutationFn: async () => {
      if (!id || !profile?.id) return;
      return await apiClient.leaveMatch(id, profile.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", id] });
      toast.success("Left the match");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to leave match");
    }
  });

  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});

  const { data: matchAttendance } = useQuery({
    queryKey: ["match-attendance", id],
    queryFn: async () => {
      if (!id) return [];
      const { data } = await apiClient.getMatchAttendance(id);
      // Initialize attendance map from existing records
      const map: Record<string, string> = {};
      data?.forEach((record: any) => {
        map[record.student_id] = record.status;
      });
      setAttendanceMap(prev => ({ ...prev, ...map }));
      return data || [];
    },
    enabled: !!id
  });

  const saveAttendanceMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      const records = Object.entries(attendanceMap).map(([student_id, status]) => ({
        student_id,
        status
      }));
      return await apiClient.bulkMarkMatchAttendance(id, records);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match-attendance", id] });
      toast.success("Attendance saved successfully");
    },
    onError: () => {
      toast.error("Failed to save attendance");
    }
  });

  const isOnRoster = match?.match_roster?.some((r: any) => r.student_id === profile?.id);
  const canManage = profile?.role === 'coach' || profile?.role === 'admin' || profile?.role === 'staff';
  const isStudent = profile?.role === 'student';

  // Check if match date is in the past
  const isMatchPast = match?.date 
    ? new Date(match.date).setHours(0, 0, 0, 0) <= new Date().setHours(0, 0, 0, 0)
    : false;

  // State for edit result dialog
  const [editResultOpen, setEditResultOpen] = useState(false);
  const [matchResult, setMatchResult] = useState(match?.result || "");

  // State for edit match dialog
  const [editMatchOpen, setEditMatchOpen] = useState(false);
  const [editMatchData, setEditMatchData] = useState({
    title: "",
    opponent: "",
    description: "",
    location: "",
    date: "",
    match_type: "",
    max_roster_size: 20
  });

  useEffect(() => {
    if (match) {
      setEditMatchData({
        title: match.title || "",
        opponent: match.opponent || "",
        description: match.description || "",
        location: match.location || "",
        date: match.date ? new Date(match.date).toISOString().slice(0, 16) : "",
        match_type: match.match_type || "friendly",
        max_roster_size: match.max_roster_size || 20
      });
    }
  }, [match]);

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const updateResultMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      return await apiClient.updateMatch(id, { result: matchResult });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", id] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Match result updated");
      setEditResultOpen(false);
    },
    onError: () => {
      toast.error("Failed to update result");
    }
  });

  const updateMatchMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      return await apiClient.updateMatch(id, {
        ...editMatchData,
        date: new Date(editMatchData.date).toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", id] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Match updated");
      setEditMatchOpen(false);
    },
    onError: () => {
      toast.error("Failed to update match");
    }
  });

  const deleteMatchMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      return await apiClient.deleteMatch(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Match deleted");
      navigate("/matches");
    },
    onError: () => {
      toast.error("Failed to delete match");
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

  if (!match) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="border-border/40">
            <CardContent className="py-12 text-center">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Match not found</h2>
              <Button onClick={() => navigate("/matches")} variant="outline">
                ← Back to Matches
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate("/matches")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Matches
        </Button>

        {/* Match Header */}
        <Card className="border-border/40 shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <Badge className={`${getMatchTypeColor(match.match_type)} text-white capitalize`}>
                {match.match_type}
              </Badge>
              {canManage && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditMatchOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Match
                  </Button>
                  {isMatchPast && (
                    <Button variant="outline" size="sm" onClick={() => {
                      setMatchResult(match.result || "");
                      setEditResultOpen(true);
                    }}>
                      <Trophy className="mr-2 h-4 w-4" />
                      {match.result ? "Edit Result" : "Add Result"}
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
            <CardTitle className="text-3xl">{match.title}</CardTitle>
            <CardDescription className="text-lg">{match.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Match Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">OPPONENT</p>
                  <p className="font-bold text-2xl">{match.opponent}</p>
                </div>
                <div className="flex items-center gap-3 text-base">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{new Date(match.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-base">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>{match.location}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-base">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Coach: {match.coach?.full_name}</span>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Roster Status</p>
                  <p className="font-medium text-lg">
                    {match.match_roster?.length || 0} / {match.max_roster_size} Players
                  </p>
                </div>
                {match.result && (
                  <div className="p-4 bg-success/10 text-success rounded-lg text-center">
                    <p className="text-sm mb-1">FINAL RESULT</p>
                    <p className="font-bold text-xl">{match.result}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Student Actions */}
            {isStudent && (
              <div className="flex gap-3">
                {!isOnRoster ? (
                  <Button 
                    className="flex-1 bg-gradient-primary" 
                    onClick={() => joinMatchMutation.mutate()}
                    disabled={joinMatchMutation.isPending || (match.match_roster?.length >= match.max_roster_size)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {joinMatchMutation.isPending ? "Joining..." : "Join Match"}
                  </Button>
                ) : (
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => leaveMatchMutation.mutate()}
                    disabled={leaveMatchMutation.isPending}
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    {leaveMatchMutation.isPending ? "Leaving..." : "Leave Match"}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Match Roster */}
        <Card className="border-border/40 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Match Roster
            </CardTitle>
            <CardDescription>Players registered for this match</CardDescription>
          </CardHeader>
          <CardContent>
            {match.match_roster && match.match_roster.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {match.match_roster.map((roster: any) => (
                  <div key={roster.id} className="flex items-center gap-3 p-3 border border-border/40 rounded-lg hover:bg-muted/30 transition-colors">
                    <Avatar>
                      <AvatarImage src={roster.student?.profile_picture_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {roster.student?.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{roster.student?.full_name}</p>
                      {roster.position && (
                        <p className="text-sm text-muted-foreground">{roster.position}</p>
                      )}
                      {roster.jersey_number && (
                        <p className="text-xs text-muted-foreground">#{roster.jersey_number}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No players registered yet</p>
            )}
          </CardContent>
        </Card>

        {/* Match Attendance - Coaches/Admins Only */}
        {canManage && match.match_roster && match.match_roster.length > 0 && (
          <Card className="border-border/40 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                    Match Attendance
                  </CardTitle>
                  <CardDescription>
                    {isMatchPast 
                      ? "Track player attendance for this match" 
                      : "Attendance can only be marked on or after the match day"}
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => saveAttendanceMutation.mutate()}
                  disabled={saveAttendanceMutation.isPending || Object.keys(attendanceMap).length === 0 || !isMatchPast}
                  className="bg-gradient-primary"
                >
                  {saveAttendanceMutation.isPending ? "Saving..." : "Save Attendance"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {match.match_roster.map((roster: any) => (
                  <div key={roster.id} className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={roster.student?.profile_picture_url} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {roster.student?.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-medium">{roster.student?.full_name}</p>
                    </div>
                  <Select
                      value={attendanceMap[roster.student_id] || ""}
                      onValueChange={(value) => setAttendanceMap(prev => ({ ...prev, [roster.student_id]: value }))}
                      disabled={!isMatchPast}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="excused">Excused</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Result Dialog */}
        <Dialog open={editResultOpen} onOpenChange={setEditResultOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{match?.result ? "Edit Match Result" : "Add Match Result"}</DialogTitle>
              <DialogDescription>Enter the final result for this match</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Result (e.g., "3-2 Win", "1-1 Draw")</Label>
                <Input
                  value={matchResult}
                  onChange={(e) => setMatchResult(e.target.value)}
                  placeholder="Enter match result"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditResultOpen(false)}>Cancel</Button>
              <Button onClick={() => updateResultMutation.mutate()} disabled={updateResultMutation.isPending}>
                {updateResultMutation.isPending ? "Saving..." : "Save Result"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Match Dialog */}
        <Dialog open={editMatchOpen} onOpenChange={setEditMatchOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Match</DialogTitle>
              <DialogDescription>Update match details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editMatchData.title}
                  onChange={(e) => setEditMatchData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Match title"
                />
              </div>
              <div className="space-y-2">
                <Label>Opponent</Label>
                <Input
                  value={editMatchData.opponent}
                  onChange={(e) => setEditMatchData(prev => ({ ...prev, opponent: e.target.value }))}
                  placeholder="Opponent team"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={editMatchData.description}
                  onChange={(e) => setEditMatchData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Match description"
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={editMatchData.location}
                  onChange={(e) => setEditMatchData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Match location"
                />
              </div>
              <div className="space-y-2">
                <Label>Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={editMatchData.date}
                  onChange={(e) => setEditMatchData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Match Type</Label>
                <Select 
                  value={editMatchData.match_type} 
                  onValueChange={(value) => setEditMatchData(prev => ({ ...prev, match_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="league">League</SelectItem>
                    <SelectItem value="tournament">Tournament</SelectItem>
                    <SelectItem value="cup">Cup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Max Roster Size</Label>
                <Input
                  type="number"
                  value={editMatchData.max_roster_size}
                  onChange={(e) => setEditMatchData(prev => ({ ...prev, max_roster_size: parseInt(e.target.value) || 20 }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditMatchOpen(false)}>Cancel</Button>
              <Button onClick={() => updateMatchMutation.mutate()} disabled={updateMatchMutation.isPending}>
                {updateMatchMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-destructive">Delete Match</DialogTitle>
              <DialogDescription>Are you sure you want to delete this match? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteMatchMutation.mutate()} disabled={deleteMatchMutation.isPending}>
                {deleteMatchMutation.isPending ? "Deleting..." : "Delete Match"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
