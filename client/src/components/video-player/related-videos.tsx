import { useQuery } from "@tanstack/react-query";
import { Video } from "@shared/schema";
import VideoCard from "@/components/video-card";
import { Skeleton } from "@/components/ui/skeleton";

interface RelatedVideosProps {
  currentVideoId: number;
}

export default function RelatedVideos({ currentVideoId }: RelatedVideosProps) {
  const { data: videos, isLoading } = useQuery({
    queryKey: ['/api/videos'],
  });
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Related Videos</h2>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[200px] w-full bg-[#1f2937] rounded-lg" />
        ))}
      </div>
    );
  }
  
  if (!videos || videos.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Related Videos</h2>
        <p className="text-gray-400 text-center">No related videos found</p>
      </div>
    );
  }
  
  // Filter out current video and limit to 5 videos
  const relatedVideos = videos
    .filter((video: Video) => video.id !== currentVideoId)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Related Videos</h2>
      {relatedVideos.map((video: Video) => (
        <div key={video.id} className="mb-4">
          <VideoCard 
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
            layout="horizontal"
          />
        </div>
      ))}
    </div>
  );
}