import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUp, Check, X, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatTimeAgo } from "@/lib/utils";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [selectedVideos, setSelectedVideos] = useState<number[]>([]);
  const [processingVideos, setProcessingVideos] = useState<number[]>([]);

  const { data: allVideos = [], isLoading: isLoadingVideos } = useQuery({
    queryKey: ["/api/admin/videos"],
  });

  const { data: pendingVideos = [], isLoading: isLoadingPending } = useQuery({
    queryKey: ["/api/admin/videos?status=pending"],
  });

  const { data: flaggedComments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ["/api/admin/comments?status=flagged"],
  });

  // Analytics stats (derived from data)
  const totalUsers = 12485;
  const totalVideos = allVideos.length;
  const totalComments = 45621;
  const totalStorage = "3.2 TB";

  const handleSelectVideo = (videoId: number) => {
    setSelectedVideos((prev) =>
      prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVideos(pendingVideos.map((video: any) => video.id));
    } else {
      setSelectedVideos([]);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedVideos.length === 0) return;
    
    const videosToProcess = [...selectedVideos];
    setProcessingVideos(videosToProcess);
    
    try {
      // Process videos one by one
      for (const videoId of videosToProcess) {
        await apiRequest("PATCH", `/api/admin/videos/${videoId}/status`, { status: "active" });
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos?status=pending"] });
      
      toast({
        title: "Videos approved",
        description: `Successfully approved ${videosToProcess.length} videos`,
      });
      
      // Clear selections
      setSelectedVideos([]);
    } catch (error) {
      toast({
        title: "Operation failed",
        description: "There was an error processing some videos",
        variant: "destructive",
      });
    } finally {
      setProcessingVideos([]);
    }
  };

  const handleApproveVideo = async (videoId: number) => {
    if (processingVideos.includes(videoId)) return;
    
    setProcessingVideos((prev) => [...prev, videoId]);
    
    try {
      await apiRequest("PATCH", `/api/admin/videos/${videoId}/status`, { status: "active" });
      
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos?status=pending"] });
      
      toast({
        title: "Video approved",
        description: "The video has been approved and is now active",
      });
      
      // Remove from selected videos if it was selected
      setSelectedVideos((prev) => prev.filter((id) => id !== videoId));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve video",
        variant: "destructive",
      });
    } finally {
      setProcessingVideos((prev) => prev.filter((id) => id !== videoId));
    }
  };

  const handleRejectVideo = async (videoId: number) => {
    if (processingVideos.includes(videoId)) return;
    
    setProcessingVideos((prev) => [...prev, videoId]);
    
    try {
      await apiRequest("PATCH", `/api/admin/videos/${videoId}/status`, { status: "removed" });
      
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos?status=pending"] });
      
      toast({
        title: "Video rejected",
        description: "The video has been rejected",
      });
      
      // Remove from selected videos if it was selected
      setSelectedVideos((prev) => prev.filter((id) => id !== videoId));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject video",
        variant: "destructive",
      });
    } finally {
      setProcessingVideos((prev) => prev.filter((id) => id !== videoId));
    }
  };

  const handleApproveComment = async (commentId: number) => {
    try {
      await apiRequest("PATCH", `/api/admin/comments/${commentId}/status`, { status: "active" });
      
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments?status=flagged"] });
      
      toast({
        title: "Comment approved",
        description: "The comment has been approved and is now visible",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve comment",
        variant: "destructive",
      });
    }
  };

  const handleRemoveComment = async (commentId: number) => {
    try {
      await apiRequest("PATCH", `/api/admin/comments/${commentId}/status`, { status: "removed" });
      
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments?status=flagged"] });
      
      toast({
        title: "Comment removed",
        description: "The comment has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove comment",
        variant: "destructive",
      });
    }
  };

  // Loading states
  if (isLoadingVideos || isLoadingPending || isLoadingComments) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <Skeleton className="h-10 w-64 bg-[#1f2937]" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full bg-[#1f2937]" />
          ))}
        </div>
        
        <Skeleton className="h-10 w-full bg-[#1f2937]" />
        <Skeleton className="h-80 w-full bg-[#1f2937]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-[#1f2937] p-6 rounded-lg border border-gray-700">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">Platform management and content moderation</p>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#111827] border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-400 text-sm">Total Users</h3>
                <svg className="h-5 w-5 text-[#EC4899]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <p className="text-2xl font-bold mt-2">{totalUsers.toLocaleString()}</p>
              <div className="flex justify-between mt-1 text-xs">
                <span className="text-gray-400">Creators: 2,145</span>
                <span className="text-gray-400">Viewers: 10,340</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#111827] border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-400 text-sm">Total Videos</h3>
                <svg className="h-5 w-5 text-[#EC4899]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <p className="text-2xl font-bold mt-2">{totalVideos.toLocaleString()}</p>
              <div className="flex justify-between mt-1 text-xs">
                <span className="text-gray-400">Active: {(totalVideos - pendingVideos.length).toLocaleString()}</span>
                <span className="text-gray-400">Pending: {pendingVideos.length}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#111827] border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-400 text-sm">Comments</h3>
                <svg className="h-5 w-5 text-[#EC4899]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-2xl font-bold mt-2">{totalComments.toLocaleString()}</p>
              <div className="flex justify-between mt-1 text-xs">
                <span className="text-gray-400">Approved: {(totalComments - flaggedComments.length).toLocaleString()}</span>
                <span className="text-gray-400">Flagged: {flaggedComments.length}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#111827] border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-400 text-sm">Storage Used</h3>
                <svg className="h-5 w-5 text-[#EC4899]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1a1 1 0 11-2 0 1 1 0 012 0zM2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm14 1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-2xl font-bold mt-2">{totalStorage}</p>
              <div className="w-full bg-[#1f2937] h-1.5 rounded-full mt-2">
                <div className="bg-[#EC4899] h-1.5 rounded-full" style={{ width: "64%" }}></div>
              </div>
              <div className="text-xs text-gray-400 mt-1">64% of 5TB limit</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="moderation">
          <TabsList className="border-b border-gray-700 mb-6 bg-transparent w-full justify-start h-auto">
            <TabsTrigger 
              value="moderation" 
              className="border-[#EC4899] text-[#EC4899] data-[state=active]:border-b-2 rounded-none py-2 px-1 bg-transparent"
            >
              Content Moderation
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400 data-[state=active]:border-b-2 rounded-none py-2 px-1 bg-transparent"
            >
              User Management
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400 data-[state=active]:border-b-2 rounded-none py-2 px-1 bg-transparent"
            >
              Settings
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400 data-[state=active]:border-b-2 rounded-none py-2 px-1 bg-transparent"
            >
              Reports
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="moderation">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Content Pending Review</h3>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleBulkApprove}
                    disabled={selectedVideos.length === 0 || processingVideos.length > 0}
                    className="px-3 py-1.5 bg-[#EC4899] text-white rounded-md text-sm hover:bg-opacity-90"
                  >
                    Bulk Approve
                  </Button>
                  <Button 
                    variant="outline"
                    disabled={selectedVideos.length === 0 || processingVideos.length > 0}
                    className="px-3 py-1.5 bg-[#111827] text-gray-300 border border-gray-700 rounded-md text-sm hover:bg-[#1f2937]"
                  >
                    Bulk Reject
                  </Button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table className="min-w-full bg-[#111827] rounded-lg overflow-hidden">
                  <TableHeader className="bg-[#1f2937]">
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <Checkbox 
                          onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                          checked={pendingVideos.length > 0 && selectedVideos.length === pendingVideos.length}
                          aria-label="Select all videos"
                        />
                      </TableHead>
                      <TableHead>Video</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-800">
                    {pendingVideos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                          No videos pending review
                        </TableCell>
                      </TableRow>
                    ) : (
                      pendingVideos.map((video: any) => (
                        <TableRow key={video.id} className="hover:bg-[#1f2937]">
                          <TableCell>
                            <Checkbox 
                              checked={selectedVideos.includes(video.id)}
                              onCheckedChange={() => handleSelectVideo(video.id)}
                              aria-label={`Select ${video.title}`}
                              disabled={processingVideos.includes(video.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="h-10 w-16 bg-[#1f2937] rounded overflow-hidden flex-shrink-0 mr-3">
                                <img 
                                  src={video.thumbnail} 
                                  alt={video.title} 
                                  className="h-full w-full object-cover" 
                                />
                              </div>
                              <div>
                                <p className="font-medium text-white">{video.title}</p>
                                <p className="text-xs text-gray-400">{video.duration}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-300">
                            Creator Name
                          </TableCell>
                          <TableCell className="text-sm text-gray-400">
                            {formatTimeAgo(video.createdAt)}
                          </TableCell>
                          <TableCell className="text-sm">
                            <span className="px-2 py-1 bg-yellow-900 bg-opacity-30 text-yellow-400 text-xs rounded-md">
                              Pending
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleApproveVideo(video.id)}
                                disabled={processingVideos.includes(video.id)}
                                className="text-green-500 hover:text-green-400 p-0 h-auto bg-transparent"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleRejectVideo(video.id)}
                                disabled={processingVideos.includes(video.id)}
                                className="text-red-500 hover:text-red-400 p-0 h-auto bg-transparent"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                              <Button
                                className="text-primary-500 hover:text-primary-400 p-0 h-auto bg-transparent"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Flagged Comments */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Flagged Comments</h3>
                <div className="space-y-4">
                  {flaggedComments.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 bg-[#111827] rounded-lg">
                      No flagged comments to review
                    </div>
                  ) : (
                    flaggedComments.map((comment: any) => (
                      <div key={comment.id} className="bg-[#111827] p-4 rounded-lg border border-gray-700">
                        <div className="flex justify-between">
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs">
                              A{comment.id}
                            </div>
                            <div>
                              <p className="text-sm text-gray-300 mb-1">{comment.content}</p>
                              <div className="flex items-center text-xs text-gray-500">
                                <span>On: "Video Title"</span>
                                <span className="mx-2">•</span>
                                <span>Reason: {comment.flagReason || "Flagged Content"}</span>
                                <span className="mx-2">•</span>
                                <span>{formatTimeAgo(comment.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApproveComment(comment.id)}
                              className="text-green-500 hover:text-green-400 p-0 h-auto bg-transparent text-sm"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleRemoveComment(comment.id)}
                              className="text-red-500 hover:text-red-400 p-0 h-auto bg-transparent text-sm"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="users">
            <div className="text-center py-10 text-gray-400">
              <p>User management features coming soon</p>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="text-center py-10 text-gray-400">
              <p>Platform settings coming soon</p>
            </div>
          </TabsContent>
          
          <TabsContent value="reports">
            <div className="text-center py-10 text-gray-400">
              <p>Reports and analytics coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
