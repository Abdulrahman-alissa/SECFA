import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, Plus, TrendingUp, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Fundraising() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const queryClient = useQueryClient();
  const [selectedSponsorship, setSelectedSponsorship] = useState<any>(null);
  const [createCampaignOpen, setCreateCampaignOpen] = useState(false);
  const [viewCampaignOpen, setViewCampaignOpen] = useState(false);
  const [editCampaignOpen, setEditCampaignOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [newCampaign, setNewCampaign] = useState({
    title: "",
    description: "",
    goal_amount: "",
    start_date: "",
    end_date: ""
  });
  const [editCampaign, setEditCampaign] = useState({
    title: "",
    description: "",
    goal_amount: "",
    start_date: "",
    end_date: "",
    current_amount: "",
    status: ""
  });

  const { data: campaigns, isLoading: loadingCampaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data } = await apiClient.getCampaigns();
      return data || [];
    }
  });

  const { data: sponsorships, isLoading: loadingSponsorships } = useQuery({
    queryKey: ["sponsorships"],
    queryFn: async () => {
      const { data } = await apiClient.getSponsorships();
      return data || [];
    }
  });

  const updateSponsorshipMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiClient.updateSponsorship(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sponsorships"] });
      toast.success("Sponsorship updated successfully");
      setSelectedSponsorship(null);
    },
    onError: (error) => {
      toast.error("Failed to update sponsorship");
      console.error(error);
    }
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      return await apiClient.createCampaign({
        ...campaignData,
        created_by: profile?.id,
        goal_amount: parseFloat(campaignData.goal_amount),
        current_amount: 0,
        status: 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign created successfully");
      setCreateCampaignOpen(false);
      setNewCampaign({
        title: "",
        description: "",
        goal_amount: "",
        start_date: "",
        end_date: ""
      });
    },
    onError: (error) => {
      toast.error("Failed to create campaign");
      console.error(error);
    }
  });

  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiClient.updateCampaign(id, {
        ...data,
        goal_amount: parseFloat(data.goal_amount),
        current_amount: parseFloat(data.current_amount)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign updated successfully");
      setEditCampaignOpen(false);
      setSelectedCampaign(null);
    },
    onError: (error) => {
      toast.error("Failed to update campaign");
      console.error(error);
    }
  });

  const handleCreateCampaign = () => {
    if (!newCampaign.title || !newCampaign.description || !newCampaign.goal_amount || !newCampaign.start_date || !newCampaign.end_date) {
      toast.error("Please fill in all fields");
      return;
    }
    createCampaignMutation.mutate(newCampaign);
  };

  const handleViewCampaign = (campaign: any) => {
    setSelectedCampaign(campaign);
    setViewCampaignOpen(true);
  };

  const handleEditCampaign = (campaign: any) => {
    setSelectedCampaign(campaign);
    setEditCampaign({
      title: campaign.title,
      description: campaign.description,
      goal_amount: campaign.goal_amount.toString(),
      start_date: campaign.start_date.split('T')[0],
      end_date: campaign.end_date.split('T')[0],
      current_amount: campaign.current_amount.toString(),
      status: campaign.status
    });
    setEditCampaignOpen(true);
  };

  const handleUpdateCampaign = () => {
    if (!editCampaign.title || !editCampaign.description || !editCampaign.goal_amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    updateCampaignMutation.mutate({ id: selectedCampaign.id, data: editCampaign });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-success",
      completed: "bg-primary",
      cancelled: "bg-destructive",
      pending: "bg-warning",
      approved: "bg-success",
      rejected: "bg-destructive"
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <DollarSign className="h-10 w-10 text-primary" />
              Fundraising & Sponsorship
            </h1>
            <p className="text-muted-foreground">Manage campaigns and sponsorship opportunities</p>
          </div>
          {isAdmin && (
            <Button className="bg-gradient-primary" onClick={() => setCreateCampaignOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          )}
        </div>

        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="sponsorships">Sponsorships</TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            {loadingCampaigns ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : campaigns && campaigns.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {campaigns.map((campaign: any) => {
                  const progress = Math.min((campaign.current_amount / campaign.goal_amount) * 100, 100);
                  return (
                    <Card key={campaign.id} className="border-border/40 shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={`${getStatusColor(campaign.status)} text-white capitalize`}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <CardTitle>{campaign.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{campaign.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{progress.toFixed(0)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">${campaign.current_amount.toLocaleString()}</span>
                            <span className="text-muted-foreground">Goal: ${campaign.goal_amount.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>Start: {new Date(campaign.start_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>End: {new Date(campaign.end_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          {isAdmin && (
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditCampaign(campaign)}>
                              Edit
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewCampaign(campaign)}>
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-border/40">
                <CardContent className="py-12">
                  <div className="text-center space-y-4">
                    <DollarSign className="h-16 w-16 text-muted-foreground mx-auto" />
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">No active campaigns</h3>
                      <p className="text-muted-foreground">
                        {isAdmin ? "Create your first fundraising campaign" : "Check back later for fundraising opportunities"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Sponsorships Tab */}
          <TabsContent value="sponsorships" className="space-y-6">
            {/* Sponsorship Tiers */}
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { name: "Bronze", color: "bg-amber-700", icon: "🥉" },
                { name: "Silver", color: "bg-gray-400", icon: "🥈" },
                { name: "Gold", color: "bg-yellow-500", icon: "🥇" },
                { name: "Platinum", color: "bg-blue-400", icon: "💎" }
              ].map((tier) => (
                <Card key={tier.name} className="border-border/40 text-center">
                  <CardContent className="pt-6">
                    <div className="text-4xl mb-2">{tier.icon}</div>
                    <h3 className="font-bold text-lg">{tier.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Tier</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Submit Sponsorship - Non-Admin Only */}
            {!isAdmin && (
              <Card className="border-border/40 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardHeader>
                  <CardTitle>Become a Sponsor</CardTitle>
                  <CardDescription>Support the academy and help develop future football stars</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="bg-gradient-primary">
                    <Users className="mr-2 h-4 w-4" />
                    Submit Sponsorship Application
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Sponsorship Submissions - Admin Only */}
            {isAdmin && (
              <Card className="border-border/40 shadow-md">
                <CardHeader>
                  <CardTitle>Sponsorship Submissions</CardTitle>
                  <CardDescription>Review and manage sponsorship applications</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingSponsorships ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : sponsorships && sponsorships.length > 0 ? (
                    <div className="space-y-4">
                      {sponsorships.map((sponsorship: any) => (
                        <div key={sponsorship.id} className="flex items-center justify-between p-4 border border-border/40 rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold">{sponsorship.company_name}</h4>
                              <Badge className={`${getStatusColor(sponsorship.status)} text-white capitalize`}>
                                {sponsorship.status}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {sponsorship.sponsorship_type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Contact: {sponsorship.contact_name} ({sponsorship.contact_email})
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Submitted: {new Date(sponsorship.submitted_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedSponsorship(sponsorship)}
                            >
                              View
                            </Button>
                            {sponsorship.status === 'pending' && (
                              <>
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  className="bg-success hover:bg-success/90"
                                  onClick={() => updateSponsorshipMutation.mutate({ 
                                    id: sponsorship.id, 
                                    status: 'approved' 
                                  })}
                                  disabled={updateSponsorshipMutation.isPending}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => updateSponsorshipMutation.mutate({ 
                                    id: sponsorship.id, 
                                    status: 'rejected' 
                                  })}
                                  disabled={updateSponsorshipMutation.isPending}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No sponsorship submissions yet</p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Sponsorship Details Dialog */}
      <Dialog open={!!selectedSponsorship} onOpenChange={() => setSelectedSponsorship(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sponsorship Details</DialogTitle>
            <DialogDescription>Review sponsorship application information</DialogDescription>
          </DialogHeader>
          {selectedSponsorship && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                  <p className="mt-1 font-semibold">{selectedSponsorship.company_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sponsorship Type</label>
                  <p className="mt-1 font-semibold capitalize">{selectedSponsorship.sponsorship_type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contact Name</label>
                  <p className="mt-1">{selectedSponsorship.contact_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contact Email</label>
                  <p className="mt-1">{selectedSponsorship.contact_email}</p>
                </div>
              </div>

              {selectedSponsorship.contact_phone && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contact Phone</label>
                  <p className="mt-1">{selectedSponsorship.contact_phone}</p>
                </div>
              )}

              {selectedSponsorship.message && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Message</label>
                  <p className="mt-1 p-4 bg-muted rounded-lg">{selectedSponsorship.message}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge className={`${getStatusColor(selectedSponsorship.status)} text-white capitalize`}>
                      {selectedSponsorship.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Submitted At</label>
                  <p className="mt-1">{new Date(selectedSponsorship.submitted_at).toLocaleString()}</p>
                </div>
              </div>

              {selectedSponsorship.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1 bg-success hover:bg-success/90"
                    onClick={() => updateSponsorshipMutation.mutate({ 
                      id: selectedSponsorship.id, 
                      status: 'approved' 
                    })}
                    disabled={updateSponsorshipMutation.isPending}
                  >
                    Approve Sponsorship
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => updateSponsorshipMutation.mutate({ 
                      id: selectedSponsorship.id, 
                      status: 'rejected' 
                    })}
                    disabled={updateSponsorshipMutation.isPending}
                  >
                    Reject Sponsorship
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Campaign Dialog */}
      <Dialog open={createCampaignOpen} onOpenChange={setCreateCampaignOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>Set up a new fundraising campaign</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Campaign Title</Label>
              <Input
                id="title"
                placeholder="e.g., New Equipment Fund"
                value={newCampaign.title}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the campaign purpose..."
                value={newCampaign.description}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal">Goal Amount ($)</Label>
              <Input
                id="goal"
                type="number"
                placeholder="5000"
                value={newCampaign.goal_amount}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, goal_amount: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Start Date</Label>
                <Input
                  id="start"
                  type="date"
                  value={newCampaign.start_date}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">End Date</Label>
                <Input
                  id="end"
                  type="date"
                  value={newCampaign.end_date}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateCampaignOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCampaign}
              disabled={createCampaignMutation.isPending}
              className="bg-gradient-primary"
            >
              {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Campaign Dialog */}
      <Dialog open={viewCampaignOpen} onOpenChange={setViewCampaignOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Campaign Details</DialogTitle>
            <DialogDescription>View campaign information</DialogDescription>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{selectedCampaign.title}</h3>
                <Badge className={`${getStatusColor(selectedCampaign.status)} text-white capitalize`}>
                  {selectedCampaign.status}
                </Badge>
              </div>
              
              <p className="text-muted-foreground">{selectedCampaign.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {Math.min((selectedCampaign.current_amount / selectedCampaign.goal_amount) * 100, 100).toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min((selectedCampaign.current_amount / selectedCampaign.goal_amount) * 100, 100)} 
                  className="h-3" 
                />
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-primary">${selectedCampaign.current_amount.toLocaleString()}</span>
                  <span className="text-muted-foreground">of ${selectedCampaign.goal_amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <Label className="text-muted-foreground text-xs">Start Date</Label>
                  <p className="font-medium">{new Date(selectedCampaign.start_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">End Date</Label>
                  <p className="font-medium">{new Date(selectedCampaign.end_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs">Created At</Label>
                <p className="font-medium">{new Date(selectedCampaign.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewCampaignOpen(false)}>
              Close
            </Button>
            {isAdmin && selectedCampaign && (
              <Button 
                onClick={() => {
                  setViewCampaignOpen(false);
                  handleEditCampaign(selectedCampaign);
                }}
                className="bg-gradient-primary"
              >
                Edit Campaign
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Campaign Dialog */}
      <Dialog open={editCampaignOpen} onOpenChange={setEditCampaignOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogDescription>Update campaign details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Campaign Title</Label>
              <Input
                id="edit-title"
                value={editCampaign.title}
                onChange={(e) => setEditCampaign(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editCampaign.description}
                onChange={(e) => setEditCampaign(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-goal">Goal Amount ($)</Label>
                <Input
                  id="edit-goal"
                  type="number"
                  value={editCampaign.goal_amount}
                  onChange={(e) => setEditCampaign(prev => ({ ...prev, goal_amount: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-current">Current Amount ($)</Label>
                <Input
                  id="edit-current"
                  type="number"
                  value={editCampaign.current_amount}
                  onChange={(e) => setEditCampaign(prev => ({ ...prev, current_amount: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start">Start Date</Label>
                <Input
                  id="edit-start"
                  type="date"
                  value={editCampaign.start_date}
                  onChange={(e) => setEditCampaign(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end">End Date</Label>
                <Input
                  id="edit-end"
                  type="date"
                  value={editCampaign.end_date}
                  onChange={(e) => setEditCampaign(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={editCampaign.status}
                onChange={(e) => setEditCampaign(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCampaignOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateCampaign}
              disabled={updateCampaignMutation.isPending}
              className="bg-gradient-primary"
            >
              {updateCampaignMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
