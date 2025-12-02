import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { TrainingForm } from "@/components/forms/TrainingForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CreateTraining() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <Button variant="ghost" onClick={() => navigate("/trainings")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Trainings
        </Button>

        <TrainingForm
          onSuccess={() => navigate("/trainings")}
          onCancel={() => navigate("/trainings")}
        />
      </main>
    </div>
  );
}
