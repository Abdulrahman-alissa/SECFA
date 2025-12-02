import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const getReadAnnouncementIds = (userId: string): string[] => {
  const stored = localStorage.getItem(`read-announcements-${userId}`);
  return stored ? JSON.parse(stored) : [];
};

const markAnnouncementAsRead = (userId: string, announcementId: string) => {
  const readIds = getReadAnnouncementIds(userId);
  if (!readIds.includes(announcementId)) {
    readIds.push(announcementId);
    localStorage.setItem(`read-announcements-${userId}`, JSON.stringify(readIds));
  }
};

export function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    if (user?.id) {
      setReadIds(getReadAnnouncementIds(user.id));
    }
  }, [user?.id]);

  // Fetch announcements as notifications
  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*, author:profiles!author_id(full_name)")
        .order("published_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const unreadCount = announcements.filter((a: any) => !readIds.includes(a.id)).length;

  const handleAnnouncementClick = (announcement: any) => {
    if (user?.id) {
      markAnnouncementAsRead(user.id, announcement.id);
      setReadIds(getReadAnnouncementIds(user.id));
    }
    navigate("/announcements");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <p className="text-sm font-medium">Announcements</p>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => navigate("/announcements")}
          >
            View all
          </Button>
        </div>
        <DropdownMenuSeparator />
        {announcements.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No announcements yet
          </div>
        ) : (
          announcements.map((announcement: any) => (
            <DropdownMenuItem
              key={announcement.id}
              className="flex flex-col items-start p-3 cursor-pointer"
              onClick={() => handleAnnouncementClick(announcement)}
            >
              <div className="flex items-center gap-2 w-full">
                <p className="text-sm font-medium flex-1">{announcement.title}</p>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {announcement.content}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {announcement.published_at ? format(new Date(announcement.published_at), "MMM d, h:mm a") : ""}
              </p>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
