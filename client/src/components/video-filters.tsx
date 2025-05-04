import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const VideoFilters = () => {
  const [location, setLocation] = useLocation();
  const [category, setCategory] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");

  useEffect(() => {
    // Extract filters from URL if present
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const categoryParam = searchParams.get('category');
    const difficultyParam = searchParams.get('difficulty');
    
    setCategory(categoryParam || "all");
    setDifficulty(difficultyParam || "all");
  }, [location]);

  const updateFilters = () => {
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    
    // Preserve any existing search term
    const searchTerm = searchParams.get('search');
    const tagParam = searchParams.get('tag');
    
    let newUrl = '/';
    const newParams = new URLSearchParams();
    
    if (searchTerm) newParams.set('search', searchTerm);
    if (tagParam) newParams.set('tag', tagParam);
    if (category) newParams.set('category', category);
    if (difficulty) newParams.set('difficulty', difficulty);
    
    const paramsString = newParams.toString();
    if (paramsString) newUrl += `?${paramsString}`;
    
    setLocation(newUrl);
  };

  useEffect(() => {
    updateFilters();
  }, [category, difficulty]);

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        className="px-3 py-1.5 bg-[#1f2937] text-gray-300 rounded-md text-sm hover:bg-[#111827] border border-gray-700 flex items-center"
      >
        <Filter className="h-4 w-4 mr-1" />
        Filter
      </Button>
      
      <div className="relative">
        <Select
          value={category}
          onValueChange={setCategory}
        >
          <SelectTrigger className="w-full md:w-auto min-w-[160px] px-3 py-1.5 h-auto bg-[#1f2937] text-gray-300 rounded-md text-sm hover:bg-[#111827] border border-gray-700">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Frontend Development">Frontend</SelectItem>
              <SelectItem value="Backend Development">Backend</SelectItem>
              <SelectItem value="DevOps">DevOps</SelectItem>
              <SelectItem value="Mobile Development">Mobile</SelectItem>
              <SelectItem value="System Design">System Design</SelectItem>
              <SelectItem value="Tools & Productivity">Tools</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      <div className="relative">
        <Select
          value={difficulty}
          onValueChange={setDifficulty}
        >
          <SelectTrigger className="w-full md:w-auto min-w-[160px] px-3 py-1.5 h-auto bg-[#1f2937] text-gray-300 rounded-md text-sm hover:bg-[#111827] border border-gray-700">
            <SelectValue placeholder="All Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Difficulty</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default VideoFilters;
