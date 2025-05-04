import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Comment } from "@shared/schema";

const commentSchema = z.object({
  content: z.string().min(3, "Comment must be at least 3 characters").max(1000, "Comment too long")
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentSectionProps {
  videoId: number;
  comments: Comment[];
  isLoading: boolean;
}

export default function CommentSection({ videoId, comments, isLoading }: CommentSectionProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: ""
    }
  });
  
  const { mutate: submitComment, isPending } = useMutation({
    mutationFn: async (data: CommentFormValues) => {
      return await apiRequest("POST", `/api/videos/${videoId}/comments`, {
        content: data.content,
        isAnonymous
      });
    },
    onSuccess: () => {
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${videoId}/comments`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: CommentFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to post comments",
      });
      return;
    }
    
    submitComment(data);
  };
  
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <MessageSquare className="mr-2 h-5 w-5" />
        Comments {!isLoading && `(${comments.length})`}
      </h3>
      
      {/* Comment form */}
      <div className="mb-6">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Textarea
            placeholder="Share your thoughts..."
            className="mb-2 bg-[#1f2937] border-gray-700 text-gray-200"
            {...form.register("content")}
          />
          {form.formState.errors.content && (
            <p className="text-red-500 text-sm mb-2">{form.formState.errors.content.message}</p>
          )}
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-400">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={() => setIsAnonymous(!isAnonymous)}
                className="mr-2"
              />
              Post anonymously
            </label>
            <Button 
              type="submit" 
              disabled={isPending || !user}
              className="bg-code-blue hover:bg-code-blue-dark text-white"
            >
              {isPending ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      </div>
      
      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex space-x-3">
              <Skeleton className="h-10 w-10 rounded-full bg-[#1f2937]" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32 bg-[#1f2937]" />
                <Skeleton className="h-20 w-full bg-[#1f2937]" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment: Comment) => (
            <div key={comment.id} className="flex space-x-3 border-b border-gray-700 pb-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-500 text-white">
                  {comment.userId ? "U" : "A"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center mb-1">
                  <p className="font-medium text-gray-200">
                    {comment.userId ? "User" : "Anonymous"}
                  </p>
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-300 whitespace-pre-line">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}