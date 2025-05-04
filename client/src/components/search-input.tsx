import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

const SearchInput = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useLocation();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // When component mounts, check if there's a search term in the URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split("?")[1] || "");
    const urlSearchTerm = searchParams.get("search");
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, []);

  // When search term changes, update the URL
  useEffect(() => {
    if (debouncedSearchTerm) {
      // Preserve other query parameters
      const searchParams = new URLSearchParams(location.split("?")[1] || "");
      searchParams.set("search", debouncedSearchTerm);
      const newLocation = `/?${searchParams.toString()}`;
      console.log("Updating search URL:", newLocation);
      setLocation(newLocation);
    } else if (location.includes("search=")) {
      // Remove the search parameter if search is cleared
      const searchParams = new URLSearchParams(location.split("?")[1] || "");
      searchParams.delete("search");
      const newQuery = searchParams.toString();
      const newLocation = newQuery ? `/?${newQuery}` : "/";
      console.log("Clearing search from URL:", newLocation);
      setLocation(newLocation);
    }
  }, [debouncedSearchTerm, location, setLocation]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search videos, topics, creators..."
        value={searchTerm}
        onChange={handleSearch}
        className="bg-[#1f2937] rounded-lg py-2 pl-10 pr-10 w-full text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 border-gray-700"
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      {searchTerm && (
        <button 
          onClick={clearSearch}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
