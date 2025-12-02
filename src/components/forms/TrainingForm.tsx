import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface TrainingFormProps {
  training?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TrainingForm({ training, onSuccess, onCancel }: TrainingFormProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = !!training;

  const [title, setTitle] = useState(training?.title || "");
  const [description, setDescription] = useState(training?.description || "");
  const [date, setDate] = useState<Date | undefined>(training?.date ? new Date(training.date) : undefined);
  const [time, setTime] = useState(training?.date ? format(new Date(training.date), "HH:mm") : "");
  const [duration, setDuration] = useState(training?.duration_minutes?.toString() || "");
  const [location, setLocation] = useState(training?.location || "");
  const [maxParticipants, setMaxParticipants] = useState(training?.max_participants?.toString() || "");

  const mutation = useMutation({
    mutationFn: async (trainingData: any) => {
      if (isEditing) {
        return await apiClient.updateTraining(training.id, trainingData);
      } else {
        return await apiClient.createTraining(trainingData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      toast.success(isEditing ? "Training updated successfully" : "Training created successfully");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save training");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !time) {
      toast.error("Please select a date and time");
      return;
    }

    const [hours, minutes] = time.split(":").map(Number);
    const trainingDate = new Date(date);
    trainingDate.setHours(hours, minutes);

    const trainingData = {
      title,
      description,
      date: trainingDate.toISOString(),
      duration_minutes: parseInt(duration),
      location,
      max_participants: maxParticipants ? parseInt(maxParticipants) : null,
      coach_id: profile?.id
    };

    mutation.mutate(trainingData);
  };

  return (
    <Card className="border-border/40 shadow-lg">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Training" : "Create New Training"}</CardTitle>
        <CardDescription>
          {isEditing ? "Update training session details" : "Schedule a new training session"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Advanced Dribbling Training"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={mutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Training session details and objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={mutation.isPending}
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                    disabled={mutation.isPending}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                disabled={mutation.isPending}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                placeholder="90"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                disabled={mutation.isPending}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                placeholder="Optional"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                disabled={mutation.isPending}
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              placeholder="e.g., Main Training Ground"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              disabled={mutation.isPending}
            />
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
              {isEditing ? "Update Training" : "Create Training"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
