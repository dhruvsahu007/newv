import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000, "Description cannot exceed 5000 characters"),
  embedType: z.enum(["youtube", "vimeo", "upload"]),
  url: z.string().url("Please enter a valid URL"),
  thumbnail: z.string().url("Please enter a valid thumbnail URL"),
  duration: z.string().regex(/^\d+:\d{2}(:\d{2})?$/, "Please enter a valid duration (e.g., 12:34 or 1:23:45)"),
  category: z.string().min(1, "Please select a category"),
  difficulty: z.string().min(1, "Please select a difficulty level"),
  tags: z.array(z.string()).min(1, "Please add at least one tag").max(10, "You can add up to 10 tags"),
});

type FormValues = z.infer<typeof formSchema>;

interface VideoUploadFormProps {
  videoId?: string;
}

const VideoUploadForm = ({ videoId }: VideoUploadFormProps = {}) => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTag, setCurrentTag] = useState("");
  const isEditMode = !!videoId;

  // Fetch video data if in edit mode
  const { data: videoData, isLoading: isLoadingVideo } = useQuery({
    queryKey: [`/api/videos/${videoId}`],
    enabled: isEditMode,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      embedType: "youtube",
      url: "",
      thumbnail: "",
      duration: "",
      category: "",
      difficulty: "",
      tags: [],
    },
  });
  
  // Set form values when video data is loaded
  useEffect(() => {
    if (videoData && isEditMode) {
      form.reset({
        title: videoData.title,
        description: videoData.description,
        embedType: videoData.embedType || "youtube",
        url: videoData.url,
        thumbnail: videoData.thumbnail || "",
        duration: videoData.duration || "",
        category: videoData.category,
        difficulty: videoData.difficulty,
        tags: videoData.tags || [],
      });
    }
  }, [videoData, isEditMode, form]);

  const tags = form.watch("tags");
  const embedType = form.watch("embedType");

  const handleAddTag = () => {
    if (!currentTag) return;
    
    // Normalize tag
    const normalizedTag = currentTag.trim();
    if (!normalizedTag) return;
    
    // Check if tag already exists
    if (tags.includes(normalizedTag)) {
      toast({
        title: "Tag already exists",
        description: "Please add a different tag",
        variant: "destructive",
      });
      return;
    }
    
    // Check tag length
    if (normalizedTag.length > 20) {
      toast({
        title: "Tag too long",
        description: "Tags must be less than 20 characters",
        variant: "destructive",
      });
      return;
    }
    
    // Add tag
    form.setValue("tags", [...tags, normalizedTag]);
    setCurrentTag("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue(
      "tags",
      tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && videoId) {
        // Update existing video
        await apiRequest("PATCH", `/api/videos/${videoId}`, values);
        
        // Update the list of videos in the cache
        queryClient.invalidateQueries({ queryKey: ['/api/creator/videos'] });
        
        toast({
          title: "Video updated",
          description: "Your video has been updated successfully!",
        });
      } else {
        // Create new video
        await apiRequest("POST", "/api/videos", values);
        
        toast({
          title: "Video uploaded",
          description: "Your video has been uploaded successfully!",
        });
      }
      
      // Redirect to dashboard
      setLocation("/creator/dashboard");
    } catch (error) {
      console.error("Form error:", error);
      toast({
        title: isEditMode ? "Update failed" : "Upload failed",
        description: error instanceof Error ? error.message : "Please check your submission and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="embedType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video Source</FormLabel>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <RadioGroupItem value="youtube" />
                  </FormControl>
                  <FormLabel className="font-normal text-sm">
                    YouTube
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <RadioGroupItem value="vimeo" />
                  </FormControl>
                  <FormLabel className="font-normal text-sm">
                    Vimeo
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <RadioGroupItem value="upload" />
                  </FormControl>
                  <FormLabel className="font-normal text-sm">
                    Upload File (coming soon)
                  </FormLabel>
                </FormItem>
              </RadioGroup>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {embedType === "upload" ? (
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-600 justify-center">
                <label className="relative cursor-pointer rounded-md font-medium text-primary-500 hover:text-primary-400">
                  <span>Upload a file</span>
                  <input type="file" className="sr-only" disabled />
                </label>
                <p className="pl-1 text-gray-400">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">MP4, WEBM or MOV up to 1GB</p>
              <p className="text-xs text-yellow-500 mt-2">File upload functionality coming soon!</p>
            </div>
          </div>
        ) : (
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video URL</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={`Enter ${embedType === "youtube" ? "YouTube" : "Vimeo"} URL`}
                    className="bg-[#111827] border-gray-700"
                  />
                </FormControl>
                <FormDescription>
                  {embedType === "youtube"
                    ? "Example: https://www.youtube.com/watch?v=abcdefghijk"
                    : "Example: https://vimeo.com/123456789"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter video title"
                  className="bg-[#111827] border-gray-700"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter video description"
                  rows={3}
                  className="bg-[#111827] border-gray-700"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="thumbnail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thumbnail URL</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter thumbnail image URL"
                    className="bg-[#111827] border-gray-700"
                  />
                </FormControl>
                <FormDescription>
                  URL to the thumbnail image for your video
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., 12:34 or 1:23:45"
                    className="bg-[#111827] border-gray-700"
                  />
                </FormControl>
                <FormDescription>
                  Enter the video duration in MM:SS or HH:MM:SS format
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-[#111827] border-gray-700">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Frontend Development">Frontend Development</SelectItem>
                    <SelectItem value="Backend Development">Backend Development</SelectItem>
                    <SelectItem value="DevOps">DevOps</SelectItem>
                    <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                    <SelectItem value="System Design">System Design</SelectItem>
                    <SelectItem value="Tools & Productivity">Tools & Productivity</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-[#111827] border-gray-700">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="tags"
          render={() => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="flex flex-wrap gap-2 p-2 bg-[#111827] border border-gray-700 rounded-md mb-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-primary-900 bg-opacity-30 text-primary-400 text-xs rounded-md border border-primary-800 flex items-center"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-primary-400 hover:text-primary-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleAddTag}
                  placeholder="Add a tag..."
                  className="flex-grow outline-none bg-transparent text-gray-300 text-sm py-1"
                />
              </div>
              <FormDescription>
                Press Enter or comma to add a tag. Add at least one tag to help viewers find your video.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
            disabled={isSubmitting || isLoadingVideo}
          >
            {isSubmitting 
              ? (isEditMode ? "Saving..." : "Uploading...") 
              : (isEditMode ? "Save Changes" : "Upload Video")
            }
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default VideoUploadForm;
