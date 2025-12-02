import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { AnnouncementForm } from "@/components/forms/AnnouncementForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CreateAnnouncement() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <Button variant="ghost" onClick={() => navigate("/announcements")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Announcements
        </Button>

        <AnnouncementForm
          onSuccess={() => navigate("/announcements")}
          onCancel={() => navigate("/announcements")}
        />
      </main>
    </div>
  );
}
