import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

const SearchInput = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setLocation(`/?search=${encodeURIComponent(debouncedSearchTerm)}`);
    }
  }, [debouncedSearchTerm, setLocation]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search videos, topics, creators..."
        value={searchTerm}
        onChange={handleSearch}
        className="bg-[#1f2937] rounded-lg py-2 pl-10 pr-4 w-full text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 border-gray-700"
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
};

export default SearchInput;
