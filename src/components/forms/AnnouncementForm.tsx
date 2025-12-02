import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AnnouncementFormProps {
  announcement?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AnnouncementForm({ announcement, onSuccess, onCancel }: AnnouncementFormProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = !!announcement;

  const [title, setTitle] = useState(announcement?.title || "");
  const [content, setContent] = useState(announcement?.content || "");
  const [priority, setPriority] = useState(announcement?.priority || "normal");
  const [category, setCategory] = useState(announcement?.category || "general");
  const [targetAudience, setTargetAudience] = useState(announcement?.target_audience || "everyone");
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(
    announcement?.expires_at ? new Date(announcement.expires_at) : undefined
  );

  const mutation = useMutation({
    mutationFn: async (announcementData: any) => {
      if (isEditing) {
        return await apiClient.updateAnnouncement(announcement.id, announcementData);
      } else {
        return await apiClient.createAnnouncement(announcementData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success(isEditing ? "Announcement updated successfully" : "Announcement created successfully");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save announcement");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const announcementData = {
      title,
      content,
      priority,
      category,
      target_audience: targetAudience,
      expires_at: expiresAt ? expiresAt.toISOString() : null,
      author_id: profile?.id
    };

    mutation.mutate(announcementData);
  };

  return (
    <Card className="border-border/40 shadow-lg">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Announcement" : "Create New Announcement"}</CardTitle>
        <CardDescription>
          {isEditing ? "Update announcement details" : "Share important information with the academy"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Announcement title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={mutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              placeholder="Announcement details..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={mutation.isPending}
              rows={5}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select value={priority} onValueChange={setPriority} disabled={mutation.isPending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory} disabled={mutation.isPending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="match">Match</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">Target Audience *</Label>
            <Select value={targetAudience} onValueChange={setTargetAudience} disabled={mutation.isPending}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="students">Students Only</SelectItem>
                <SelectItem value="coaches">Coaches Only</SelectItem>
                <SelectItem value="staff">Staff Only</SelectItem>
                <SelectItem value="students_coaches">Students & Coaches</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Expiration Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expiresAt && "text-muted-foreground"
                  )}
                  disabled={mutation.isPending}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiresAt ? format(expiresAt, "PPP") : <span>No expiration</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expiresAt}
                  onSelect={setExpiresAt}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Leave empty for permanent announcement
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={mutation.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary"
              disabled={mutation.isPending}
            >
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Announcement" : "Create Announcement"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
