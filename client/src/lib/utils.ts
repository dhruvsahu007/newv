import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(dateString: string | Date): string {
  const now = new Date();
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  } as const;
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  
  return 'just now';
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function getTagColorClasses(tag: string): string {
  // This function returns color classes for tags based on tag content
  // This ensures consistent coloring for the same tags
  const hash = tag.toLowerCase().split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const colors = [
    'blue', 'green', 'yellow', 'pink', 'purple', 'indigo', 'red', 'orange'
  ];
  
  const colorIndex = Math.abs(hash) % colors.length;
  const color = colors[colorIndex];
  
  return `bg-${color}-900 bg-opacity-30 text-${color}-400 border-${color}-800`;
}

export function getDifficultyClass(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return 'bg-green-600 text-white';
    case 'intermediate':
      return 'bg-primary-600 text-white';
    case 'advanced':
      return 'bg-code-pink text-white';
    default:
      return 'bg-gray-600 text-white';
  }
}

export function getYouTubeEmbedUrl(url: string): string {
  // Convert YouTube watch URL to embed URL
  const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : '';
}

export function getVimeoEmbedUrl(url: string): string {
  // Convert Vimeo URL to embed URL
  const videoIdMatch = url.match(/vimeo\.com\/(?:.*\/)?(?:videos\/)?([0-9]+)/);
  return videoIdMatch ? `https://player.vimeo.com/video/${videoIdMatch[1]}` : '';
}

export function getEmbedUrl(url: string, type: string): string {
  switch (type.toLowerCase()) {
    case 'youtube':
      return getYouTubeEmbedUrl(url);
    case 'vimeo':
      return getVimeoEmbedUrl(url);
    default:
      return url;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '…';
}
