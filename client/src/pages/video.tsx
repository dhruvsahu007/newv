import { useParams } from "wouter";
import VideoPlayer from "@/components/video-player";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";

const VideoPage = () => {
  const { id } = useParams<{ id: string }>();
  const videoId = parseInt(id);

  const { data: video, isLoading } = useQuery({
    queryKey: [`/api/videos/${videoId}`],
    enabled: !isNaN(videoId),
  });

  if (isNaN(videoId)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-xl text-gray-400">Invalid video ID</p>
      </div>
    );
  }

  return (
    <>
      {!isLoading && video && (
        <Helmet>
          <title>{video.title} | CodeCast</title>
          <meta name="description" content={video.description} />
        </Helmet>
      )}
      <VideoPlayer videoId={videoId} />
    </>
  );
};

export default VideoPage;
