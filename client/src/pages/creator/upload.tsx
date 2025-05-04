import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VideoUploadForm from "@/components/upload/video-upload-form";
import { useParams } from "wouter";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const CreatorUpload = () => {
  const params = useParams();
  const videoId = params.id;
  const isEditMode = !!videoId;
  
  // If we're in edit mode, check if the video exists
  const { isLoading: isCheckingVideo, isError: videoCheckError } = useQuery({
    queryKey: [`/api/videos/${videoId}`],
    enabled: isEditMode,
    retry: false,
  });
  
  return (
    <div className="space-y-8">
      <Card className="bg-[#1f2937] border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {isEditMode ? "Edit Video" : "Upload New Video"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditMode && isCheckingVideo ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isEditMode && videoCheckError ? (
            <div className="text-center py-6 text-red-500">
              <p>Video not found or you don't have permission to edit it.</p>
            </div>
          ) : (
            <VideoUploadForm videoId={videoId} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorUpload;
