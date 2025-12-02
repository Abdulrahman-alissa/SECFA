import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Phone, Upload } from "lucide-react";
import { useState, useRef } from "react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function Profile() {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [notificationPrefs, setNotificationPrefs] = useState(
    profile?.notification_preferences || { matches: true, trainings: true, announcements: true }
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await apiClient.updateUser(profile.id, {
        full_name: fullName,
        phone: phone,
        notification_preferences: notificationPrefs
      });

      if (error) throw error;

      await refreshProfile();
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      await apiClient.uploadProfilePicture(profile.id, file);
      await refreshProfile();
      toast.success("Profile picture updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload picture");
    } finally {
      setUploading(false);
    }
  };

  const handleNotificationToggle = (key: string) => {
    setNotificationPrefs((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <User className="h-10 w-10 text-primary" />
            Profile Settings
          </h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        {/* Profile Overview */}
        <Card className="border-border/40 shadow-md">
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
            <CardDescription>Your account information and role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.profile_picture_url} alt={profile.full_name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {profile.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div>
                  <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                  <p className="text-muted-foreground">{profile.email}</p>
                </div>
                <Badge className="bg-primary text-primary-foreground capitalize">
                  {profile.role}
                </Badge>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? "Uploading..." : "Change Photo"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card className="border-border/40 shadow-md">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="pl-10 bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary" 
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="border-border/40 shadow-md">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Training Notifications</p>
                <p className="text-sm text-muted-foreground">Get notified about new training sessions</p>
              </div>
              <Switch
                checked={notificationPrefs.trainings}
                onCheckedChange={() => handleNotificationToggle('trainings')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Match Notifications</p>
                <p className="text-sm text-muted-foreground">Get notified about upcoming matches</p>
              </div>
              <Switch
                checked={notificationPrefs.matches}
                onCheckedChange={() => handleNotificationToggle('matches')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Announcements</p>
                <p className="text-sm text-muted-foreground">Get notified about academy announcements</p>
              </div>
              <Switch
                checked={notificationPrefs.announcements}
                onCheckedChange={() => handleNotificationToggle('announcements')}
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
