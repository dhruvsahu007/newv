import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ThumbsUp, Reply } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { formatTimeAgo } from "@/lib/utils";
import { Comment } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

interface CommentSectionProps {
  videoId: number;
  comments: Comment[];
  isLoading: boolean;
}

const formSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment is too long"),
});

type FormValues = z.infer<typeof formSchema>;

const CommentSection = ({ videoId, comments, isLoading }: CommentSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("POST", `/api/videos/${videoId}/comments`, {
        content: values.content,
      });
      
      // Reset form
      form.reset();
      
      // Invalidate comments query to refresh the list
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${videoId}/comments`] });
      
      toast({
        title: "Comment posted",
        description: "Your comment has been posted anonymously",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = (commentId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like comments",
        variant: "destructive",
      });
      return;
    }

    // In a real app, would call API to like comment
    toast({
      title: "Comment liked",
      description: "Your feedback has been recorded",
    });
  };

  // Generate random initials for anonymous users
  const getRandomInitials = (commentId: number) => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const num = commentId % 100;
    const letter = letters[commentId % 26];
    return `${letter}${num}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-[#1f2937] p-4 mt-4 rounded-lg border border-gray-700">
        <Skeleton className="h-8 w-40 mb-4 bg-[#111827]" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex space-x-3">
              <Skeleton className="h-8 w-8 rounded-full bg-[#111827]" />
              <div className="flex-1">
                <Skeleton className="h-20 w-full bg-[#111827] rounded-lg mb-1" />
                <Skeleton className="h-4 w-32 bg-[#111827]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Group comments by parent-child relationships (for replies)
  const topLevelComments = comments.filter(comment => !comment.parentId);
  const replies = comments.filter(comment => comment.parentId);

  const getCommentReplies = (commentId: number) => {
    return replies.filter(reply => reply.parentId === commentId);
  };

  return (
    <div className="bg-[#1f2937] p-4 mt-4 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold mb-4">
        Comments ({comments.length})
      </h3>
      
      {/* Comment form */}
      <div className="mb-6">
        <div className="flex space-x-3">
          <Avatar className="h-8 w-8 bg-gray-700">
            <AvatarFallback>
              {user ? user.username.slice(0, 2).toUpperCase() : "AN"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={2}
                          placeholder="Add an anonymous comment..."
                          disabled={isSubmitting || !user}
                          className="w-full bg-[#111827] border border-gray-700 rounded-md p-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    type="submit"
                    className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700"
                    disabled={isSubmitting || !user}
                  >
                    {isSubmitting ? "Posting..." : "Comment"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
        {!user && (
          <p className="text-center text-sm text-gray-400 mt-2">
            Please sign in to comment
          </p>
        )}
      </div>
      
      {/* Comments list */}
      <div className="space-y-4">
        {topLevelComments.length === 0 ? (
          <p className="text-center text-gray-400 py-4">No comments yet. Be the first to comment!</p>
        ) : (
          topLevelComments.map((comment) => (
            <div key={comment.id}>
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8 bg-gray-700">
                  <AvatarFallback>{getRandomInitials(comment.id)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-[#111827] rounded-lg p-3">
                    <p className="text-sm text-gray-300">{comment.content}</p>
                  </div>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <span>{formatTimeAgo(comment.createdAt)}</span>
                    <button className="ml-3 text-gray-400 hover:text-gray-300">
                      <Reply className="h-3 w-3 inline mr-1" />
                      Reply
                    </button>
                    <div className="flex items-center ml-3">
                      <button
                        className="text-gray-400 hover:text-gray-300 flex items-center"
                        onClick={() => handleLikeComment(comment.id)}
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {comment.likes}
                      </button>
                    </div>
                  </div>
                  
                  {/* Nested replies */}
                  {getCommentReplies(comment.id).length > 0 && (
                    <div className="mt-3 ml-6 space-y-3">
                      {getCommentReplies(comment.id).map((reply) => (
                        <div key={reply.id} className="flex space-x-3">
                          <Avatar className="h-7 w-7 bg-gray-700">
                            <AvatarFallback>{getRandomInitials(reply.id)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="bg-[#111827] rounded-lg p-3">
                              <p className="text-sm text-gray-300">{reply.content}</p>
                            </div>
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <span>{formatTimeAgo(reply.createdAt)}</span>
                              <button className="ml-3 text-gray-400 hover:text-gray-300">
                                Reply
                              </button>
                              <div className="flex items-center ml-3">
                                <button
                                  className="text-gray-400 hover:text-gray-300 flex items-center"
                                  onClick={() => handleLikeComment(reply.id)}
                                >
                                  <ThumbsUp className="h-3 w-3 mr-1" />
                                  {reply.likes}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {comments.length > 5 && (
          <Button
            variant="ghost"
            className="w-full py-2 text-sm text-primary-500 hover:text-primary-400"
          >
            Load more comments
          </Button>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
