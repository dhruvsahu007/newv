import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Bookmark, X, Library } from "lucide-react";
import VideoCard from "@/components/video-card";
import { Video } from "@shared/schema";
import { formatTimeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

interface WatchLaterItem {
  id: number;
  userId: number;
  videoId: number;
  createdAt: string;
}

export default function WatchLater() {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not logged in
  if (!token) {
    setLocation("/login");
    return null;
  }

  // Fetch watch later list
  const { 
    data: watchLaterItems = [], 
    isLoading: isLoadingWatchLater 
  } = useQuery({
    queryKey: ['/api/watch-later'],
    enabled: !!token,
  });

  // Fetch all videos to match with watch later list
  const { 
    data: allVideos = [], 
    isLoading: isLoadingVideos 
  } = useQuery({
    queryKey: ['/api/videos'],
  });

  // Remove from watch later mutation
  const { mutate: removeFromWatchLater } = useMutation({
    mutationFn: async (videoId: number) => {
      return await apiRequest("DELETE", `/api/watch-later/${videoId}`);
    },
    onSuccess: () => {
      toast({
        title: "Removed from library",
        description: "Video removed from your library",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/watch-later'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove video from library",
        variant: "destructive",
      });
    },
  });

  // Loading state
  if (isLoadingWatchLater || isLoadingVideos) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-64 bg-[#1f2937]" />
          <Skeleton className="h-4 w-80 mt-2 bg-[#1f2937]" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-80 w-full bg-[#1f2937] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Find the matching videos for the watch later items
  const videosInLibrary = watchLaterItems
    .map((item: WatchLaterItem) => {
      const video = allVideos.find((v: any) => v.id === item.videoId);
      if (video) {
        return {
          ...video,
          watchLaterId: item.id,
          addedAt: item.createdAt
        };
      }
      return null;
    })
    .filter(Boolean);

  // No videos in library
  if (videosInLibrary.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">My Library</h1>
          <p className="text-gray-400 mt-1">
            Save videos to watch later
          </p>
        </div>
        
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
            <Library className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-xl text-gray-400">Your library is empty</p>
          <p className="text-gray-500 mt-2">
            Add videos to your library by clicking "Add to Library" on any video
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
      <div>
        <h1 className="text-2xl font-bold">My Library</h1>
        <p className="text-gray-400 mt-1">
          Videos saved to watch later
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videosInLibrary.map((video: any) => (
          <div key={video.id} className="relative group">
            <div className="absolute top-2 right-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 hover:text-red-500"
                onClick={() => removeFromWatchLater(video.id)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="text-sm text-gray-400 flex items-center">
                <Bookmark className="h-3 w-3 mr-1" />
                Added {formatTimeAgo(video.addedAt)}
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