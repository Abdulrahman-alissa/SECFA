import { supabase } from "@/integrations/supabase/client";

/**
 * API Client - Single point of communication with backend
 * All frontend requests must go through this layer
 * This allows for easy migration to Node.js + Express + MySQL later
 */

class ApiClient {
  // Auth endpoints
  async signup(email: string, password: string, userData: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });
    return { data, error };
  }

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    return { error };
  }

  // User endpoints
  async getUser(id: string) {
    return await supabase.from("profiles").select("*").eq("id", id).single();
  }

  async updateUser(id: string, updates: any) {
    return await supabase.from("profiles").update(updates).eq("id", id);
  }

  async getAllUsers() {
    return await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
  }

  async getUsersByRole(role: "student" | "coach" | "staff" | "admin") {
    return await supabase
      .from("profiles")
      .select("*")
      .eq("role", role)
      .order("created_at", { ascending: false });
  }

  // Match endpoints
  async getMatches() {
    return await supabase
      .from("matches")
      .select("*, coach:profiles!coach_id(*)")
      .order("date", { ascending: true });
  }

  async getMatch(id: string) {
    return await supabase
      .from("matches")
      .select("*, coach:profiles!coach_id(*), match_roster(*, student:profiles!student_id(*))")
      .eq("id", id)
      .single();
  }

  async createMatch(matchData: any) {
    return await supabase.from("matches").insert(matchData).select().single();
  }

  async updateMatch(id: string, updates: any) {
    return await supabase.from("matches").update(updates).eq("id", id);
  }

  async deleteMatch(id: string) {
    return await supabase.from("matches").delete().eq("id", id);
  }

  async joinMatch(matchId: string, studentId: string) {
    return await supabase.from("match_roster").insert({ match_id: matchId, student_id: studentId });
  }

  async leaveMatch(matchId: string, studentId: string) {
    return await supabase.from("match_roster").delete().match({ match_id: matchId, student_id: studentId });
  }

  // Match attendance endpoints
  async getMatchAttendance(matchId: string) {
    return await supabase
      .from("match_attendance")
      .select("*, student:profiles!student_id(*)")
      .eq("match_id", matchId);
  }

  async markMatchAttendance(attendanceData: { match_id: string; student_id: string; status: string; notes?: string }) {
    return await supabase
      .from("match_attendance")
      .upsert(attendanceData, { onConflict: "match_id,student_id" })
      .select()
      .single();
  }

  async bulkMarkMatchAttendance(matchId: string, attendanceRecords: { student_id: string; status: string; notes?: string }[]) {
    const records = attendanceRecords.map(record => ({ ...record, match_id: matchId }));
    return await supabase
      .from("match_attendance")
      .upsert(records, { onConflict: "match_id,student_id" });
  }

  // Training endpoints
  async getTrainings() {
    return await supabase
      .from("trainings")
      .select("*, coach:profiles!coach_id(*)")
      .order("date", { ascending: true });
  }

  async getTraining(id: string) {
    return await supabase
      .from("trainings")
      .select("*, coach:profiles!coach_id(*), attendance(*, student:profiles!student_id(*))")
      .eq("id", id)
      .single();
  }

  async createTraining(trainingData: any) {
    return await supabase.from("trainings").insert(trainingData).select().single();
  }

  async updateTraining(id: string, updates: any) {
    return await supabase.from("trainings").update(updates).eq("id", id);
  }

  async deleteTraining(id: string) {
    return await supabase.from("trainings").delete().eq("id", id);
  }

  async joinTraining(trainingId: string, studentId: string) {
    return await supabase.from("attendance").insert({ 
      training_id: trainingId, 
      student_id: studentId, 
      status: 'registered' 
    });
  }

  async leaveTraining(trainingId: string, studentId: string) {
    return await supabase.from("attendance").delete().match({ 
      training_id: trainingId, 
      student_id: studentId 
    });
  }

  // Attendance endpoints
  async markAttendance(attendanceData: any) {
    return await supabase.from("attendance").insert(attendanceData);
  }

  async updateAttendance(id: string, updates: any) {
    return await supabase.from("attendance").update(updates).eq("id", id);
  }

  async deleteAttendance(id: string) {
    return await supabase.from("attendance").delete().eq("id", id);
  }

  async getAttendanceByTraining(trainingId: string) {
    return await supabase
      .from("attendance")
      .select("*, student:profiles!student_id(*)")
      .eq("training_id", trainingId);
  }

  // Announcement endpoints
  async getAnnouncements() {
    return await supabase
      .from("announcements")
      .select("*, author:profiles!author_id(*)")
      .order("published_at", { ascending: false });
  }

  async createAnnouncement(announcementData: any) {
    return await supabase.from("announcements").insert(announcementData).select().single();
  }

  async updateAnnouncement(id: string, updates: any) {
    return await supabase.from("announcements").update(updates).eq("id", id);
  }

  async deleteAnnouncement(id: string) {
    return await supabase.from("announcements").delete().eq("id", id);
  }

  // Analytics endpoints
  async getStudentPerformance(studentId: string) {
    return await supabase
      .from("performance_notes")
      .select("*, coach:profiles!coach_id(*)")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });
  }

  async getAttendanceStats(studentId: string) {
    return await supabase
      .from("attendance")
      .select("*")
      .eq("student_id", studentId);
  }

  // Fundraising endpoints
  async getCampaigns() {
    return await supabase
      .from("fundraising_campaigns")
      .select("*, creator:profiles!created_by(*)")
      .order("created_at", { ascending: false });
  }

  async createCampaign(campaignData: any) {
    return await supabase.from("fundraising_campaigns").insert(campaignData).select().single();
  }

  async updateCampaign(id: string, updates: any) {
    return await supabase.from("fundraising_campaigns").update(updates).eq("id", id);
  }

  // Sponsorship endpoints
  async getSponsorships() {
    return await supabase
      .from("sponsorship_submissions")
      .select("*")
      .order("submitted_at", { ascending: false });
  }

  async createSponsorship(sponsorshipData: any) {
    return await supabase.from("sponsorship_submissions").insert(sponsorshipData).select().single();
  }

  async updateSponsorship(id: string, updates: any) {
    return await supabase.from("sponsorship_submissions").update(updates).eq("id", id);
  }

  // Performance notes endpoints
  async createPerformanceNote(noteData: any) {
    return await supabase.from("performance_notes").insert(noteData).select().single();
  }

  async getPerformanceNotes(studentId?: string) {
    let query = supabase
      .from("performance_notes")
      .select("*, student:profiles!student_id(*), coach:profiles!coach_id(*)")
      .order("created_at", { ascending: false });
    
    if (studentId) {
      query = query.eq("student_id", studentId);
    }
    
    return query;
  }

  // Notification endpoints
  async getNotifications(userId: string) {
    return await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
  }

  async createNotification(notificationData: { user_id: string; title: string; message: string; type?: string; link?: string }) {
    return await supabase.from("notifications").insert(notificationData).select().single();
  }

  async markNotificationRead(id: string) {
    return await supabase.from("notifications").update({ read: true }).eq("id", id);
  }

  // File upload
  async uploadFile(bucket: string, path: string, file: File) {
    return await supabase.storage.from(bucket).upload(path, file, {
      upsert: true
    });
  }

  async getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async uploadProfilePicture(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await this.uploadFile('profile-pictures', filePath, file);
    if (uploadError) throw uploadError;

    const publicUrl = await this.getPublicUrl('profile-pictures', filePath);
    
    const { error: updateError } = await this.updateUser(userId, { 
      profile_picture_url: publicUrl 
    });
    if (updateError) throw updateError;

    return { publicUrl };
  }
}

export const apiClient = new ApiClient();
