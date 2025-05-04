import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { ArrowUp, ArrowDown, PlusCircle, Edit, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimeAgo } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Placeholder for Chart component
const AnalyticsChart = () => {
  return (
    <div className="h-64 w-full bg-[#111827] rounded-lg flex items-center justify-center text-gray-500 border border-gray-700">
      <p>Analytics Chart Visualization</p>
    </div>
  );
};

const CreatorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["/api/creator/videos"],
  });

  const handleDeleteVideo = async (videoId: number) => {
    if (!confirm("Are you sure you want to delete this video?")) {
      return;
    }

    setIsDeleting(videoId);
    try {
      await apiRequest("DELETE", `/api/videos/${videoId}`, undefined);
      
      // Refresh videos list
      queryClient.invalidateQueries({ queryKey: ["/api/creator/videos"] });
      
      toast({
        title: "Video deleted",
        description: "Your video has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <Skeleton className="h-10 w-64 bg-[#1f2937]" />
          <Skeleton className="h-10 w-48 bg-[#1f2937]" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full bg-[#1f2937]" />
          ))}
        </div>
        
        <Skeleton className="h-64 w-full bg-[#1f2937]" />
        
        <Skeleton className="h-80 w-full bg-[#1f2937]" />
      </div>
    );
  }

  // Calculate analytics stats
  const totalViews = videos.reduce((sum: number, video: any) => sum + video.views, 0);
  const totalLikes = videos.reduce((sum: number, video: any) => sum + video.likes, 0);
  const totalVideos = videos.length;
  
  // Calculate average watch time (mock data)
  const avgWatchTime = totalVideos > 0 ? "7:24" : "0:00";

  return (
    <div className="space-y-8">
      <div className="bg-[#1f2937] p-6 rounded-lg border border-gray-700">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Creator Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage your content and view analytics</p>
          </div>
          <Link href="/creator/upload">
            <Button className="bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center">
              <PlusCircle className="h-5 w-5 mr-2" />
              Upload New Video
            </Button>
          </Link>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#111827] border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-400 text-sm">Total Views</h3>
                <svg className="h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-2xl font-bold mt-2">{totalViews.toLocaleString()}</p>
              <p className="text-sm text-green-500 mt-1 flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                12.3% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#111827] border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-400 text-sm">Total Likes</h3>
                <svg className="h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
              </div>
              <p className="text-2xl font-bold mt-2">{totalLikes.toLocaleString()}</p>
              <p className="text-sm text-green-500 mt-1 flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                8.7% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#111827] border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-400 text-sm">Avg. Watch Time</h3>
                <svg className="h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-2xl font-bold mt-2">{avgWatchTime}</p>
              <p className="text-sm text-red-500 mt-1 flex items-center">
                <ArrowDown className="h-3 w-3 mr-1" />
                2.1% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#111827] border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-400 text-sm">Total Videos</h3>
                <svg className="h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <p className="text-2xl font-bold mt-2">{totalVideos}</p>
              <p className="text-sm text-green-500 mt-1 flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                New videos this month: {Math.floor(totalVideos * 0.2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card className="mb-8 bg-[#111827] border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Performance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsChart />
          </CardContent>
        </Card>

        {/* Videos Table */}
        <Tabs defaultValue="videos">
          <TabsList className="mb-4">
            <TabsTrigger value="videos">Your Videos</TabsTrigger>
            <TabsTrigger value="comments">Recent Comments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="videos">
            <div className="overflow-x-auto">
              <Table className="min-w-full bg-[#111827] rounded-lg overflow-hidden">
                <TableHeader className="bg-[#1f2937]">
                  <TableRow>
                    <TableHead className="w-[400px]">Video</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Likes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-800">
                  {videos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                        No videos found. Upload your first video to get started!
                      </TableCell>
                    </TableRow>
                  ) : (
                    videos.map((video: any) => (
                      <TableRow key={video.id} className="hover:bg-[#1f2937]">
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="h-10 w-16 bg-[#1f2937] rounded overflow-hidden flex-shrink-0 mr-3">
                              <img 
                                src={video.thumbnail} 
                                alt={video.title} 
                                className="h-full w-full object-cover" 
                              />
                            </div>
                            <div>
                              <Link href={`/video/${video.id}`}>
                                <a className="font-medium text-white hover:underline">
                                  {video.title}
                                </a>
                              </Link>
                              <p className="text-xs text-gray-400">{video.duration}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-400">
                          {formatTimeAgo(video.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-300">
                          {video.views.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-gray-300">
                          {video.likes.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className={`px-2 py-1 text-xs rounded-md ${
                            video.status === 'active' 
                              ? 'bg-green-900 bg-opacity-30 text-green-400 border border-green-800' 
                              : video.status === 'pending' 
                              ? 'bg-yellow-900 bg-opacity-30 text-yellow-400 border border-yellow-800'
                              : 'bg-red-900 bg-opacity-30 text-red-400 border border-red-800'
                          }`}>
                            {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link href={`/creator/edit/${video.id}`}>
                              <Button variant="ghost" size="sm" className="text-primary-500 hover:text-primary-400 p-0 h-auto">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 hover:text-red-400 p-0 h-auto"
                              onClick={() => handleDeleteVideo(video.id)}
                              disabled={isDeleting === video.id}
                            >
                              <Trash className="h-4 w-4 mr-1" />
                              {isDeleting === video.id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="comments">
            <div className="text-center py-8 text-gray-400">
              <p>Comment analytics coming soon!</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreatorDashboard;
