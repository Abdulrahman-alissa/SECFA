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

interface MatchFormProps {
  match?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MatchForm({ match, onSuccess, onCancel }: MatchFormProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = !!match;

  const [title, setTitle] = useState(match?.title || "");
  const [description, setDescription] = useState(match?.description || "");
  const [opponent, setOpponent] = useState(match?.opponent || "");
  const [date, setDate] = useState<Date | undefined>(match?.date ? new Date(match.date) : undefined);
  const [time, setTime] = useState(match?.date ? format(new Date(match.date), "HH:mm") : "");
  const [location, setLocation] = useState(match?.location || "");
  const [matchType, setMatchType] = useState(match?.match_type || "friendly");
  const [maxRosterSize, setMaxRosterSize] = useState(match?.max_roster_size?.toString() || "20");
  const [result, setResult] = useState(match?.result || "");

  const mutation = useMutation({
    mutationFn: async (matchData: any) => {
      if (isEditing) {
        return await apiClient.updateMatch(match.id, matchData);
      } else {
        return await apiClient.createMatch(matchData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast.success(isEditing ? "Match updated successfully" : "Match created successfully");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save match");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !time) {
      toast.error("Please select a date and time");
      return;
    }

    const [hours, minutes] = time.split(":").map(Number);
    const matchDate = new Date(date);
    matchDate.setHours(hours, minutes);

    const matchData = {
      title,
      description,
      opponent,
      date: matchDate.toISOString(),
      location,
      match_type: matchType,
      max_roster_size: parseInt(maxRosterSize),
      result: result || null,
      coach_id: profile?.id
    };

    mutation.mutate(matchData);
  };

  return (
    <Card className="border-border/40 shadow-lg">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Match" : "Schedule New Match"}</CardTitle>
        <CardDescription>
          {isEditing ? "Update match details" : "Schedule a new match"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Match Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Home Match vs Rivals"
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
              placeholder="Match details and objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={mutation.isPending}
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="opponent">Opponent *</Label>
              <Input
                id="opponent"
                placeholder="Opposing team name"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                required
                disabled={mutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="matchType">Match Type *</Label>
              <Select value={matchType} onValueChange={setMatchType} disabled={mutation.isPending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="league">League</SelectItem>
                  <SelectItem value="tournament">Tournament</SelectItem>
                  <SelectItem value="cup">Cup</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="Stadium or venue"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                disabled={mutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxRosterSize">Max Roster Size *</Label>
              <Input
                id="maxRosterSize"
                type="number"
                value={maxRosterSize}
                onChange={(e) => setMaxRosterSize(e.target.value)}
                required
                disabled={mutation.isPending}
                min="1"
              />
            </div>
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="result">Match Result</Label>
              <Input
                id="result"
                placeholder="e.g., 3-1 Win"
                value={result}
                onChange={(e) => setResult(e.target.value)}
                disabled={mutation.isPending}
              />
            </div>
          )}

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
              {isEditing ? "Update Match" : "Create Match"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
