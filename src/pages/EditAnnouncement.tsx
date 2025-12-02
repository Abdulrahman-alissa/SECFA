import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { AnnouncementForm } from "@/components/forms/AnnouncementForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export default function EditAnnouncement() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: announcement, isLoading } = useQuery({
    queryKey: ["announcement", id],
    queryFn: async () => {
      const { data } = await apiClient.getAnnouncements();
      return data?.find((a: any) => a.id === id);
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Announcement not found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <Button variant="ghost" onClick={() => navigate("/announcements")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Announcements
        </Button>

        <AnnouncementForm
          announcement={announcement}
          onSuccess={() => navigate("/announcements")}
          onCancel={() => navigate("/announcements")}
        />
      </main>
    </div>
  );
}
