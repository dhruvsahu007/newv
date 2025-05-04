import { useState, useEffect, useCallback } from "react";

interface UseInfiniteScrollProps {
  loadMore: (page: number) => Promise<any[]>;
  initialData?: any[];
  itemsPerPage?: number;
  threshold?: number;
}

export const useInfiniteScroll = ({
  loadMore,
  initialData = [],
  itemsPerPage = 12,
  threshold = 200,
}: UseInfiniteScrollProps) => {
  const [data, setData] = useState<any[]>(initialData);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial data
  useEffect(() => {
    if (initialData.length > 0) {
      setData(initialData);
    } else {
      loadMoreData();
    }
  }, []);

  const loadMoreData = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const newData = await loadMore(page);
      
      if (newData.length === 0 || newData.length < itemsPerPage) {
        setHasMore(false);
      }

      setData((prevData) => [...prevData, ...newData]);
      setPage((prevPage) => prevPage + 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load more data"));
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore, loadMore, itemsPerPage]);

  // Scroll event handler
  const handleScroll = useCallback(() => {
    if (isLoading || !hasMore) return;

    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      loadMoreData();
    }
  }, [isLoading, hasMore, loadMoreData, threshold]);

  // Set up scroll listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return {
    data,
    isLoading,
    hasMore,
    error,
    loadMore: loadMoreData
  };
};
