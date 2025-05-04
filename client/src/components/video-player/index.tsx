import { useEffect, useState } from "react";
import VideoInfo from "./video-info";
import CommentSection from "./comment-section";
import RelatedVideos from "./related-videos";
import { Video, Comment } from "@shared/schema";
import { getEmbedUrl } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoPlayerProps {
  videoId: number;
}

const VideoPlayer = ({ videoId }: VideoPlayerProps) => {
  const [embedUrl, setEmbedUrl] = useState<string>("");

  const { data: video, isLoading: isLoadingVideo } = useQuery({
    queryKey: [`/api/videos/${videoId}`],
    enabled: !!videoId,
  });

  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: [`/api/videos/${videoId}/comments`],
    enabled: !!videoId,
  });

  // Update watch history when video is loaded (for logged in users)
  useEffect(() => {
    if (video) {
      const token = localStorage.getItem("token");
      if (token) {
        // Add to watch history silently
        apiRequest("POST", "/api/watch-history", {
          videoId: video.id,
          progress: 0,
          completed: false,
        }).catch(error => {
          console.error("Failed to update watch history:", error);
        });
      }
    }
  }, [video]);

  useEffect(() => {
    if (video) {
      const url = getEmbedUrl(video.url, video.embedType);
      setEmbedUrl(url);
    }
  }, [video]);

  // Loading state
  if (isLoadingVideo) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Skeleton className="aspect-video w-full bg-[#1f2937]" />
          <Skeleton className="h-[200px] w-full mt-4 bg-[#1f2937]" />
          <Skeleton className="h-[300px] w-full mt-4 bg-[#1f2937]" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-[500px] w-full bg-[#1f2937]" />
        </div>
      </div>
    );
  }

  if (!video) {
    return <div className="text-center py-10">Video not found</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        {/* Video Player */}
        <div className="bg-black rounded-lg overflow-hidden aspect-video">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              Video Unavailable
            </div>
          )}
        </div>

        {/* Video Info */}
        <VideoInfo video={video as Video} />

        {/* Comments Section */}
        <CommentSection 
          videoId={videoId} 
          comments={comments as Comment[]} 
          isLoading={isLoadingComments} 
        />
      </div>

      {/* Related Videos */}
      <div className="lg:col-span-1">
        <RelatedVideos currentVideoId={videoId} />
      </div>
    </div>
  );
};

export default VideoPlayer;
