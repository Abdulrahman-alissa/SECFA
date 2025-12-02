import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Search, Shield, GraduationCap, UserCog, Building2, Plus, Eye, EyeOff, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function UserManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  
  // View Profile Dialog
  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Create Account Dialog
  const [createAccountOpen, setCreateAccountOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "student" as "student" | "coach" | "staff"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);

  // Delete Account Dialog
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const { data: allUsers, isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const { data } = await apiClient.getAllUsers();
      return data || [];
    }
  });

  if (profile?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const filterUsers = (users: any[], role?: string) => {
    let filtered = users;
    
    if (role) {
      filtered = filtered.filter((user) => user.role === role);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return Shield;
      case "coach":
        return UserCog;
      case "staff":
        return Building2;
      case "student":
        return GraduationCap;
      default:
        return Users;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-destructive text-destructive-foreground";
      case "coach":
        return "bg-primary text-primary-foreground";
      case "staff":
        return "bg-secondary text-secondary-foreground";
      case "student":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleViewProfile = (user: any) => {
    setSelectedUser(user);
    setViewProfileOpen(true);
  };

  const handleCreateAccount = async () => {
    if (!newUserData.fullName || !newUserData.email || !newUserData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (newUserData.password !== newUserData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newUserData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setCreatingAccount(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: newUserData.email,
        password: newUserData.password,
        options: {
          data: {
            full_name: newUserData.fullName,
            phone: newUserData.phone || null,
            role: newUserData.role
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (error) throw error;

      toast.success(`Account created successfully for ${newUserData.fullName}`);
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      setCreateAccountOpen(false);
      setNewUserData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "student"
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setCreatingAccount(false);
    }
  };

  const handleDeleteAccount = (user: any) => {
    setDeletingUser(user);
    setDeleteAccountOpen(true);
  };

  const confirmDeleteAccount = async () => {
    if (!deletingUser) return;

    // Prevent deleting admin accounts
    if (deletingUser.role === "admin") {
      toast.error("Cannot delete admin accounts");
      return;
    }

    // Prevent self-deletion
    if (deletingUser.id === profile?.id) {
      toast.error("You cannot delete your own account");
      return;
    }

    setDeletingAccount(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ userId: deletingUser.id }),
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete account');
      }

      toast.success(`Account deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      setDeleteAccountOpen(false);
      setDeletingUser(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account");
    } finally {
      setDeletingAccount(false);
    }
  };

  const UserCard = ({ user }: { user: any }) => {
    const RoleIcon = getRoleIcon(user.role);
    
    return (
      <Card className="border-border/40 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.profile_picture_url} />
              <AvatarFallback className="text-lg">{user.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{user.full_name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  {user.phone && (
                    <p className="text-xs text-muted-foreground">{user.phone}</p>
                  )}
                </div>
                <Badge className={`${getRoleBadgeColor(user.role)} capitalize flex items-center gap-1`}>
                  <RoleIcon className="h-3 w-3" />
                  {user.role}
                </Badge>
              </div>
              <div className="flex gap-2 pt-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => handleViewProfile(user)}>
                  View Profile
                </Button>
                {user.role !== "admin" && user.id !== profile?.id && (
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteAccount(user)}>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const students = filterUsers(allUsers || [], "student");
  const coaches = filterUsers(allUsers || [], "coach");
  const staff = filterUsers(allUsers || [], "staff");
  const admins = filterUsers(allUsers || [], "admin");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Users className="h-10 w-10 text-primary" />
                User Management
              </h1>
              <p className="text-muted-foreground mt-2">Manage user accounts and roles</p>
            </div>
            <Button onClick={() => setCreateAccountOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Account
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-accent" />
                Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
            </CardContent>
          </Card>
          <Card className="border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserCog className="h-4 w-4 text-primary" />
                Coaches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{coaches.length}</div>
            </CardContent>
          </Card>
          <Card className="border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4 text-secondary" />
                Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staff.length}</div>
            </CardContent>
          </Card>
          <Card className="border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-destructive" />
                Admins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{admins.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="coaches">Coaches</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="admins">Admins</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filterUsers(allUsers || []).length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {filterUsers(allUsers || []).map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            ) : (
              <Card className="border-border/40">
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No users found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="students" className="space-y-4 mt-6">
            {students.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {students.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            ) : (
              <Card className="border-border/40">
                <CardContent className="py-12 text-center">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No students found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="coaches" className="space-y-4 mt-6">
            {coaches.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {coaches.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            ) : (
              <Card className="border-border/40">
                <CardContent className="py-12 text-center">
                  <UserCog className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No coaches found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="staff" className="space-y-4 mt-6">
            {staff.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {staff.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            ) : (
              <Card className="border-border/40">
                <CardContent className="py-12 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No staff members found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="admins" className="space-y-4 mt-6">
            {admins.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {admins.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            ) : (
              <Card className="border-border/40">
                <CardContent className="py-12 text-center">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No admins found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* View Profile Dialog */}
      <Dialog open={viewProfileOpen} onOpenChange={setViewProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>View detailed user information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.profile_picture_url} />
                  <AvatarFallback className="text-xl">{selectedUser.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.full_name}</h3>
                  <Badge className={`${getRoleBadgeColor(selectedUser.role)} capitalize`}>
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <Label className="text-muted-foreground text-xs">Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                {selectedUser.phone && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Phone</Label>
                    <p className="font-medium">{selectedUser.phone}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground text-xs">Joined</Label>
                  <p className="font-medium">
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Language Preference</Label>
                  <p className="font-medium">{selectedUser.language_preference || "English"}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewProfileOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Create Account Dialog */}
      <Dialog open={createAccountOpen} onOpenChange={setCreateAccountOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Account</DialogTitle>
            <DialogDescription>
              Create a new user account (Student, Coach, or Staff)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newFullName">Full Name *</Label>
              <Input
                id="newFullName"
                placeholder="Enter full name"
                value={newUserData.fullName}
                onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newEmail">Email *</Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="Enter email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPhone">Phone Number</Label>
              <Input
                id="newPhone"
                type="tel"
                placeholder="Enter phone number"
                value={newUserData.phone}
                onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newRole">Role *</Label>
              <Select 
                value={newUserData.role} 
                onValueChange={(value: "student" | "coach" | "staff") => setNewUserData({ ...newUserData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Password *</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newConfirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="newConfirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={newUserData.confirmPassword}
                  onChange={(e) => setNewUserData({ ...newUserData, confirmPassword: e.target.value })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateAccountOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAccount} disabled={creatingAccount}>
              {creatingAccount ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingUser && (
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={deletingUser.profile_picture_url} />
                <AvatarFallback>{deletingUser.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{deletingUser.full_name}</p>
                <p className="text-sm text-muted-foreground">{deletingUser.email}</p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteAccountOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteAccount} 
              disabled={deletingAccount}
            >
              {deletingAccount ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
