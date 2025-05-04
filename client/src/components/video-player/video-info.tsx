import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Share, BookmarkPlus, ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/utils";
import Tag from "@/components/tag";
import { Video } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

interface VideoInfoProps {
  video: Video;
}

export default function VideoInfo({ video }: VideoInfoProps) {
  const { toast } = useToast();
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  // Add to watch later mutation
  const { mutate: addToWatchLater, isPending: watchLaterLoading } = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/watch-later", {
        videoId: video.id
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to library",
        description: "Video added to your library successfully",
      });
      // Invalidate watch later query
      queryClient.invalidateQueries({ queryKey: ['/api/watch-later'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add video to library",
        variant: "destructive",
      });
    }
  });

  // Like/dislike mutations
  const { mutate: toggleLike } = useMutation({
    mutationFn: async (isLike: boolean) => {
      return await apiRequest("POST", `/api/videos/${video.id}/like`, {
        isLike
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${video.id}`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  });

  const handleLike = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like videos",
      });
      return;
    }
    
    setLiked(!liked);
    if (disliked) setDisliked(false);
    toggleLike(true);
  };

  const handleDislike = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to dislike videos",
      });
      return;
    }
    
    setDisliked(!disliked);
    if (liked) setLiked(false);
    toggleLike(false);
  };

  const handleWatchLater = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add videos to your library",
      });
      return;
    }
    
    addToWatchLater();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Video link copied to clipboard",
    });
  };

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
      <div className="flex flex-wrap justify-between items-center mb-4">
        <div className="flex items-center space-x-2 mb-2 md:mb-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLike}
            className={`flex items-center px-3 py-1.5 rounded-md text-sm border border-gray-700 ${
              liked ? "bg-blue-900 text-blue-100" : "bg-[#111827] text-gray-300 hover:bg-[#1f2937]"
            }`}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            {formatNumber(video.likes)}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDislike}
            className={`flex items-center px-3 py-1.5 rounded-md text-sm border border-gray-700 ${
              disliked ? "bg-red-900 text-red-100" : "bg-[#111827] text-gray-300 hover:bg-[#1f2937]"
            }`}
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex items-center px-3 py-1.5 bg-[#111827] text-gray-300 rounded-md text-sm hover:bg-[#1f2937] border border-gray-700"
          >
            <Share className="h-4 w-4 mr-1" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleWatchLater}
            disabled={watchLaterLoading}
            className="flex items-center px-3 py-1.5 bg-[#111827] text-gray-300 rounded-md text-sm hover:bg-[#1f2937] border border-gray-700"
          >
            <BookmarkPlus className="h-4 w-4 mr-1" />
            Add to Library
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {(video.tags as string[])?.map((tag, index) => (
          <Tag key={index} tag={tag} />
        ))}
        {video.difficulty && (
          <Tag 
            tag={video.difficulty.charAt(0).toUpperCase() + video.difficulty.slice(1)} 
            className="bg-primary-900 bg-opacity-30 text-primary-400 border-primary-800"
          />
        )}
      </div>
      <div className="text-sm text-gray-300 whitespace-pre-line">
        <p className="mb-2 text-gray-400">
          {formatNumber(video.views)} views • {video.duration || 'N/A'} • 
          Category: {video.category}
        </p>
        <p>{video.description}</p>
      </div>
    </div>
  );
}