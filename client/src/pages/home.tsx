import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import VideoCard from "@/components/video-card";
import PopularTags from "@/components/popular-tags";
import VideoFilters from "@/components/video-filters";
import RoleSwitcher from "@/components/auth/role-switcher";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const Home = () => {
  const [location] = useLocation();
  const [filters, setFilters] = useState({
    category: "",
    difficulty: "",
    tag: "",
    search: "",
  });

  // Parse query params from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split("?")[1] || "");
    const newFilters = {
      category: searchParams.get("category") || "",
      difficulty: searchParams.get("difficulty") || "",
      tag: searchParams.get("tag") || "",
      search: searchParams.get("search") || "",
    };
    
    setFilters(newFilters);
    
    // Log the search parameters for debugging
    if (newFilters.search) {
      console.log("Search term detected:", newFilters.search);
    }
  }, [location]);

  // Build the queryKey with filters
  const buildQueryKey = () => {
    let queryKey = "/api/videos";
    const params = new URLSearchParams();

    if (filters.category) params.append("category", filters.category);
    if (filters.difficulty) params.append("difficulty", filters.difficulty);
    if (filters.tag) params.append("tag", filters.tag);
    if (filters.search) params.append("search", filters.search);

    const queryString = params.toString();
    if (queryString) {
      queryKey += `?${queryString}`;
    }

    return queryKey;
  };

  const { data: initialVideos, isLoading } = useQuery({
    queryKey: [buildQueryKey()],
  });

  const loadMoreVideos = async (page: number) => {
    // In a real app, we would call the API with pagination
    // For this MVP, we'll just return empty array to simulate end of content
    return [];
  };

  const {
    data: videos,
    isLoading: isLoadingMore,
    hasMore,
    loadMore,
  } = useInfiniteScroll({
    loadMore: loadMoreVideos,
    initialData: initialVideos || [],
  });

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <Skeleton className="h-8 w-64 bg-[#1f2937]" />
            <Skeleton className="h-4 w-80 mt-2 bg-[#1f2937]" />
          </div>
          <Skeleton className="h-10 w-64 bg-[#1f2937]" />
        </div>

        <Skeleton className="h-12 w-full bg-[#1f2937]" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-80 w-full bg-[#1f2937] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <RoleSwitcher />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Discover Developer Videos</h1>
          <p className="text-gray-400 mt-1">
            Find the best code tutorials, system designs and tech talks
          </p>
        </div>
        <VideoFilters />
      </div>

      <PopularTags />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos && videos.length > 0 ? (
          videos.map((video: any) => (
            <VideoCard
              key={video.id}
              id={video.id}
              title={video.title}
              thumbnail={video.thumbnail}
              duration={video.duration}
              difficulty={video.difficulty}
              creatorName="Creator" // In a real app, we would fetch creator info
              creatorInitials="CC"
              tags={video.tags}
              views={video.views}
              likes={video.likes}
              comments={42} // In a real app, we would fetch comment count
            />
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-xl text-gray-400">No videos found</p>
            <p className="text-gray-500 mt-2">
              Try adjusting your filters or search criteria
            </p>
          </div>
        )}
      </div>

      {hasMore && videos.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="px-4 py-2 bg-[#1f2937] text-gray-300 rounded-md hover:bg-[#111827] border border-gray-700 flex items-center"
          >
            {isLoadingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Home;
