import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import VideoCard from "@/components/video-card";
import { Video } from "@shared/schema";

interface WatchLaterVideo extends Video {
  addedAt: string;
}

export default function WatchLater() {
  const { user, token } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);

  const { data: watchLaterItems, isLoading } = useQuery({
    queryKey: ['/api/watch-later'],
    enabled: !!token,
  });

  const { data: allVideos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ['/api/videos'],
  });

  useEffect(() => {
    if (watchLaterItems && allVideos) {
      // Map watch later items to their corresponding videos
      const watchLaterVideos = watchLaterItems.map((item: { videoId: number }) => {
        const video = allVideos.find((v: Video) => v.id === item.videoId);
        return video;
      }).filter(Boolean);
      
      setVideos(watchLaterVideos);
    }
  }, [watchLaterItems, allVideos]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Please log in to view your library</h1>
      </div>
    );
  }

  if (isLoading || isLoadingVideos) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Library</h1>
      
      {videos.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-xl font-medium text-muted-foreground">
            You haven&apos;t added any videos to your library yet
          </h2>
          <p className="mt-2 text-muted-foreground">
            Browse videos and click &quot;Add to Library&quot; to save them for later
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard 
              key={video.id}
              id={video.id}
              title={video.title}
              thumbnail={video.thumbnail || ''}
              duration={video.duration || ''}
              difficulty={video.difficulty}
              creatorName="Creator"
              creatorInitials="C"
              tags={video.tags as string[]}
              views={video.views}
              likes={video.likes}
              comments={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}