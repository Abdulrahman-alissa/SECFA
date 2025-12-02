import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Bell, Plus, AlertCircle, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

export default function Announcements() {
  const { profile } = useAuth();
  const canManage = profile?.role === 'staff' || profile?.role === 'admin' || profile?.role === 'coach';
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data } = await apiClient.getAnnouncements();
      return data || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement deleted successfully");
      setDeleteId(null);
    },
    onError: () => {
      toast.error("Failed to delete announcement");
    }
  });

  const filteredAnnouncements = announcements?.filter((announcement: any) => 
    categoryFilter === "all" || announcement.category === categoryFilter
  );

  const canEditDelete = (announcement: any) => {
    if (!profile) return false;
    // Admins can edit/delete any announcement
    if (profile.role === 'admin') return true;
    // Staff and coaches can edit/delete any announcement
    if (profile.role === 'staff' || profile.role === 'coach') return true;
    return false;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-blue-500",
      normal: "bg-green-500",
      high: "bg-amber-500",
      urgent: "bg-destructive"
    };
    return colors[priority] || "bg-gray-500";
  };

  const getCategoryIcon = (category: string) => {
    return category === 'emergency' ? AlertCircle : Bell;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Bell className="h-10 w-10 text-primary" />
              Announcements
            </h1>
            <p className="text-muted-foreground">Stay updated with academy news</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="match">Match</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
            {canManage && (
              <Button className="bg-gradient-primary" asChild>
                <Link to="/announcements/create">
                  <Plus className="mr-2 h-4 w-4" />
                  New Announcement
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Announcements List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredAnnouncements && filteredAnnouncements.length > 0 ? (
          <div className="space-y-4 max-w-4xl mx-auto">
            {filteredAnnouncements.map((announcement: any) => {
              const Icon = getCategoryIcon(announcement.category);
              const showActions = canManage && canEditDelete(announcement);
              
              return (
                <Card key={announcement.id} className="border-border/40 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Icon className={`h-5 w-5 ${announcement.category === 'emergency' ? 'text-destructive' : 'text-primary'}`} />
                        <Badge className={`${getPriorityColor(announcement.priority)} text-white capitalize`}>
                          {announcement.priority}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {announcement.category}
                        </Badge>
                        <Badge variant="secondary" className="capitalize">
                          {announcement.target_audience?.replace('_', ' & ') || 'Everyone'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {showActions && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => navigate(`/announcements/edit/${announcement.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(announcement.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(announcement.published_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <CardTitle>{announcement.title}</CardTitle>
                    <CardDescription>
                      By {announcement.author?.full_name || 'Staff'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground whitespace-pre-wrap">{announcement.content}</p>
                    {announcement.expires_at && (
                      <p className="text-sm text-muted-foreground mt-4">
                        Expires: {new Date(announcement.expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-border/40 max-w-4xl mx-auto">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <Bell className="h-16 w-16 text-muted-foreground mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No announcements</h3>
                  <p className="text-muted-foreground">
                    {canManage ? "Create your first announcement to keep everyone informed" : "Check back later for updates"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
