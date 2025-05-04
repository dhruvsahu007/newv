import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Tag from "@/components/tag";

// Popular tags hardcoded for demo, in a real app would come from the API
const POPULAR_TAGS = [
  "React",
  "Node.js",
  "JavaScript",
  "GraphQL",
  "TypeScript",
  "Next.js",
  "Python",
  "Docker",
  "AWS",
  "MongoDB",
];

const PopularTags = () => {
  const [location, setLocation] = useLocation();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    // Extract tag from URL if present
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const tagParam = searchParams.get('tag');
    setActiveTag(tagParam);
  }, [location]);

  const handleTagClick = (tag: string) => {
    if (tag === activeTag) {
      // Remove tag filter
      setLocation('/');
      setActiveTag(null);
    } else {
      // Apply tag filter
      setLocation(`/?tag=${encodeURIComponent(tag)}`);
      setActiveTag(tag);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <span className="text-gray-400 self-center mr-2">Popular:</span>
      {POPULAR_TAGS.map((tag) => (
        <Tag 
          key={tag} 
          tag={tag} 
          onClick={() => handleTagClick(tag)} 
          className={activeTag === tag ? 'ring-2 ring-white' : ''}
        />
      ))}
    </div>
  );
};

export default PopularTags;
