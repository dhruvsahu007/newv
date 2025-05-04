import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatTimeAgo } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface RelatedVideosProps {
  currentVideoId: number;
}

const RelatedVideos = ({ currentVideoId }: RelatedVideosProps) => {
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["/api/videos"],
  });

  if (isLoading) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">Related Videos</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-32 h-20 bg-[#1f2937]" />
              <div className="flex-1">
                <Skeleton className="h-4 w-full mb-2 bg-[#1f2937]" />
                <Skeleton className="h-3 w-20 mb-1 bg-[#1f2937]" />
                <Skeleton className="h-3 w-24 bg-[#1f2937]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Filter out the current video and limit to 5 related videos
  const relatedVideos = videos
    .filter((video: any) => video.id !== currentVideoId)
    .slice(0, 5);

  return (
    <>
      <h3 className="text-lg font-semibold mb-4">Related Videos</h3>
      <div className="space-y-4">
        {relatedVideos.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No related videos found</p>
        ) : (
          relatedVideos.map((video: any) => (
            <Link key={video.id} href={`/video/${video.id}`}>
              <a className="bg-[#1f2937] rounded-lg overflow-hidden flex hover:bg-[#374151] transition">
                <div className="w-32 h-20 bg-[#111827] relative flex-shrink-0">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white px-1 py-0.5 text-xs rounded">
                    {video.duration}
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-medium mb-1 line-clamp-2">
                    {video.title}
                  </h4>
                  <p className="text-xs text-gray-400">Creator</p>
                  <p className="text-xs text-gray-500">
                    {video.views} views • {formatTimeAgo(video.createdAt)}
                  </p>
                </div>
              </a>
            </Link>
          ))
        )}
      </div>
    </>
  );
};

export default RelatedVideos;
