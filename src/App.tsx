import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Trainings from "./pages/Trainings";
import CreateTraining from "./pages/CreateTraining";
import Matches from "./pages/Matches";
import CreateMatch from "./pages/CreateMatch";
import Announcements from "./pages/Announcements";
import CreateAnnouncement from "./pages/CreateAnnouncement";
import EditAnnouncement from "./pages/EditAnnouncement";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";
import Fundraising from "./pages/Fundraising";
import MatchDetail from "./pages/MatchDetail";
import TrainingDetail from "./pages/TrainingDetail";
import MarkAttendance from "./pages/MarkAttendance";
import PerformanceNotes from "./pages/PerformanceNotes";
import AdminPanel from "./pages/AdminPanel";
import StaffPanel from "./pages/StaffPanel";
import UserManagement from "./pages/UserManagement";

import CoachStudentManagement from "./pages/CoachStudentManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/trainings" element={<ProtectedRoute><Trainings /></ProtectedRoute>} />
            <Route path="/trainings/create" element={<ProtectedRoute allowedRoles={['coach', 'admin']}><CreateTraining /></ProtectedRoute>} />
            <Route path="/training/:id" element={<ProtectedRoute><TrainingDetail /></ProtectedRoute>} />
            <Route path="/training/:id/attendance" element={<ProtectedRoute allowedRoles={['coach', 'admin']}><MarkAttendance /></ProtectedRoute>} />
            <Route path="/performance-notes" element={<ProtectedRoute allowedRoles={['coach', 'admin']}><PerformanceNotes /></ProtectedRoute>} />
            <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
            <Route path="/matches/create" element={<ProtectedRoute allowedRoles={['coach', 'admin']}><CreateMatch /></ProtectedRoute>} />
            <Route path="/match/:id" element={<ProtectedRoute><MatchDetail /></ProtectedRoute>} />
            <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
            <Route path="/announcements/create" element={<ProtectedRoute allowedRoles={['staff', 'admin', 'coach']}><CreateAnnouncement /></ProtectedRoute>} />
            <Route path="/announcements/edit/:id" element={<ProtectedRoute allowedRoles={['staff', 'admin', 'coach']}><EditAnnouncement /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/fundraising" element={<ProtectedRoute><Fundraising /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPanel /></ProtectedRoute>} />
            <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffPanel /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
            <Route path="/coach-students" element={<ProtectedRoute allowedRoles={['admin']}><CoachStudentManagement /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
