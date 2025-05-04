import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, History, X, Clock } from "lucide-react";
import VideoCard from "@/components/video-card";
import { Video } from "@shared/schema";
import { formatTimeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface WatchHistoryItem {
  id: number;
  userId: number;
  videoId: number;
  progress: number;
  completed: boolean;
  updatedAt: string;
}

export default function WatchHistory() {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not logged in
  if (!token) {
    setLocation("/login");
    return null;
  }

  // Fetch watch history list
  const { 
    data: watchHistoryItems = [], 
    isLoading: isLoadingWatchHistory 
  } = useQuery({
    queryKey: ['/api/watch-history'],
    enabled: !!token,
  });

  // Fetch all videos to match with watch history items
  const { 
    data: allVideos = [], 
    isLoading: isLoadingVideos 
  } = useQuery({
    queryKey: ['/api/videos'],
  });

  // Clear watch history mutation
  const { mutate: clearWatchHistory, isPending: isClearingHistory } = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", "/api/watch-history");
    },
    onSuccess: () => {
      toast({
        title: "Watch history cleared",
        description: "Your watch history has been cleared successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/watch-history'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear watch history",
        variant: "destructive",
      });
    },
  });

  // Loading state
  if (isLoadingWatchHistory || isLoadingVideos) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64 bg-[#1f2937]" />
          <Skeleton className="h-10 w-40 bg-[#1f2937]" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full bg-[#1f2937] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Find the matching videos for the watch history items
  const videoHistory = watchHistoryItems
    .map((item: WatchHistoryItem) => {
      const video = allVideos.find((v: any) => v.id === item.videoId);
      if (video) {
        return {
          ...video,
          historyId: item.id,
          progress: item.progress,
          completed: item.completed,
          watchedAt: item.updatedAt
        };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a: any, b: any) => {
      // Sort by most recently watched
      return new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime();
    });

  // No videos in history
  if (videoHistory.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Watch History</h1>
          <p className="text-gray-400 mt-1">
            Track your recently watched videos
          </p>
        </div>
        
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
            <History className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-xl text-gray-400">Your watch history is empty</p>
          <p className="text-gray-500 mt-2">
            Videos you watch will appear here
          </p>
          <Link to="/">
            <Button className="mt-6 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200">
              Discover Videos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Watch History</h1>
          <p className="text-gray-400 mt-1">
            Recently watched videos
          </p>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              className="bg-transparent border border-gray-700 hover:bg-gray-800"
            >
              Clear history
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-gray-800 border border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle>Clear watch history?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your entire watch history. 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border border-gray-700 text-white hover:bg-gray-700">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => clearWatchHistory()}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                disabled={isClearingHistory}
              >
                {isClearingHistory ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Clearing...
                  </>
                ) : "Clear history"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videoHistory.map((video: any) => (
          <div key={video.id} className="relative group">
            <div className="flex flex-col space-y-2">
              <div className="text-sm text-gray-400 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Watched {formatTimeAgo(video.watchedAt)}
                {video.completed && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-green-900/30 text-green-400 rounded-full">
                    Completed
                  </span>
                )}
                {!video.completed && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-blue-900/30 text-blue-400 rounded-full">
                    {Math.round(video.progress)}% watched
                  </span>
                )}
              </div>
              <VideoCard
                id={video.id}
                title={video.title}
                thumbnail={video.thumbnail || ''}
                duration={video.duration || ''}
                difficulty={video.difficulty}
                creatorName={video.creatorName || "Creator"}
                creatorInitials="CC"
                tags={video.tags}
                views={video.views}
                likes={video.likes}
                comments={0}
                layout="horizontal"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}