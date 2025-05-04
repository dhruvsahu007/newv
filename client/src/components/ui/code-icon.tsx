import { cn } from "@/lib/utils";

interface CodeIconProps {
  className?: string;
}

export function CodeIcon({ className }: CodeIconProps) {
  return (
    <span className={cn("code-gradient text-2xl font-bold", className)}>
      &lt;/&gt;
    </span>
  );
}

export default CodeIcon;
