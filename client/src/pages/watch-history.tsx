import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { formatTimeAgo } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import VideoCard from "@/components/video-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface WatchHistoryItem {
  id: number;
  userId: number;
  videoId: number;
  progress: number;
  completed: boolean;
  updatedAt: string;
}

const WatchHistory = () => {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if not logged in
  if (!token) {
    setLocation("/login");
    return null;
  }

  // Fetch watch history
  const { data: watchHistoryItems = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ["/api/watch-history"],
    enabled: !!token,
  });

  // Fetch all videos to match with history
  const { data: allVideos = [], isLoading: isLoadingVideos } = useQuery({
    queryKey: ["/api/videos"],
  });

  // Loading state
  if (isLoadingHistory || isLoadingVideos) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-64 bg-[#1f2937]" />
          <Skeleton className="h-4 w-80 mt-2 bg-[#1f2937]" />
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full bg-[#1f2937] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // No watch history
  if (watchHistoryItems.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Watch History</h1>
          <p className="text-gray-400 mt-1">
            Videos you've watched will appear here
          </p>
        </div>
        
        <div className="text-center py-20">
          <p className="text-xl text-gray-400">Your watch history is empty</p>
          <p className="text-gray-500 mt-2">
            Start watching videos to build your history
          </p>
          <Link to="/">
            <button className="mt-6 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200">
              Discover Videos
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Watch History</h1>
        <p className="text-gray-400 mt-1">
          Videos you've watched recently
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {watchHistoryItems.map((item: WatchHistoryItem) => {
          const video = allVideos.find((v: any) => v.id === item.videoId);
          
          if (!video) return null;
          
          return (
            <div key={item.id} className="flex flex-col space-y-2">
              <div className="text-sm text-gray-400">
                Watched {formatTimeAgo(item.updatedAt)}
                {item.completed && <span className="ml-2 text-green-500">• Completed</span>}
              </div>
              <VideoCard
                id={video.id}
                title={video.title}
                thumbnail={video.thumbnail}
                duration={video.duration}
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
          );
        })}
      </div>
    </div>
  );
};

export default WatchHistory;