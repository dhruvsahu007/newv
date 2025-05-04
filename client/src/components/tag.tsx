import { getTagColorClasses } from "@/lib/utils";

interface TagProps {
  tag: string;
  size?: "small" | "medium";
  onClick?: () => void;
  className?: string;
}

const Tag = ({ tag, size = "medium", onClick, className = "" }: TagProps) => {
  const colorClasses = getTagColorClasses(tag);
  const sizeClasses = size === "small" ? "px-2 py-0.5 text-xs" : "px-2 py-1 text-xs";
  
  const classes = `${sizeClasses} ${colorClasses} rounded-md border inline-block ${onClick ? 'cursor-pointer' : ''} ${className}`;
  
  if (onClick) {
    return (
      <button onClick={onClick} className={classes}>
        {tag}
      </button>
    );
  }
  
  return <span className={classes}>{tag}</span>;
};

export default Tag;
