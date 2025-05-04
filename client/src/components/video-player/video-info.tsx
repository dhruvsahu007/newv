import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp, ThumbsDown, Share, BookmarkPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Tag from "@/components/tag";
import { formatNumber } from "@/lib/utils";
import { Video } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface VideoInfoProps {
  video: Video;
}

const VideoInfo = ({ video }: VideoInfoProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [likeLoading, setLikeLoading] = useState(false);
  const [dislikeLoading, setDislikeLoading] = useState(false);
  const [watchLaterLoading, setWatchLaterLoading] = useState(false);

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like videos",
        variant: "destructive",
      });
      return;
    }

    setLikeLoading(true);
    try {
      await apiRequest("POST", `/api/videos/${video.id}/like`, { isLike: true });
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${video.id}`] });
      toast({
        title: "Video liked",
        description: "Your feedback has been recorded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like video",
        variant: "destructive",
      });
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDislike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to dislike videos",
        variant: "destructive",
      });
      return;
    }

    setDislikeLoading(true);
    try {
      await apiRequest("POST", `/api/videos/${video.id}/like`, { isLike: false });
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${video.id}`] });
      toast({
        title: "Video disliked",
        description: "Your feedback has been recorded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to dislike video",
        variant: "destructive",
      });
    } finally {
      setDislikeLoading(false);
    }
  };

  const handleWatchLater = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save videos",
        variant: "destructive",
      });
      return;
    }

    setWatchLaterLoading(true);
    try {
      await apiRequest("POST", "/api/watch-later", { videoId: video.id });
      toast({
        title: "Saved to Watch Later",
        description: "Video has been added to your Watch Later list",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save video",
        variant: "destructive",
      });
    } finally {
      setWatchLaterLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Video link has been copied to clipboard",
    });
  };

  // Get creator initials for avatar
  const getCreatorInitials = () => {
    return "CC"; // In a real app, would get initials from the creator's username
  };

  return (
    <div className="bg-[#1f2937] p-4 mt-4 rounded-lg border border-gray-700">
      <h1 className="text-xl font-bold mb-2">{video.title}</h1>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3 bg-code-blue">
            <AvatarFallback>{getCreatorInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-white">Creator</p>
            <p className="text-sm text-gray-400">Subscribers</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLike}
            disabled={likeLoading}
            className="flex items-center px-3 py-1.5 bg-[#111827] text-gray-300 rounded-md text-sm hover:bg-[#1f2937] border border-gray-700"
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            {formatNumber(video.likes)}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDislike}
            disabled={dislikeLoading}
            className="flex items-center px-3 py-1.5 bg-[#111827] text-gray-300 rounded-md text-sm hover:bg-[#1f2937] border border-gray-700"
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            {formatNumber(video.dislikes)}
          </Button>
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
            Save
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {video.tags.map((tag, index) => (
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
        <p className="mb-2 text-gray-400">{formatNumber(video.views)} views • {video.duration} • Category: {video.category}</p>
        <p>{video.description}</p>
      </div>
    </div>
  );
};

export default VideoInfo;
