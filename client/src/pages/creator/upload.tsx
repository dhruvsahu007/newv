import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VideoUploadForm from "@/components/upload/video-upload-form";

const CreatorUpload = () => {
  return (
    <div className="space-y-8">
      <Card className="bg-[#1f2937] border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Upload New Video</CardTitle>
        </CardHeader>
        <CardContent>
          <VideoUploadForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorUpload;
