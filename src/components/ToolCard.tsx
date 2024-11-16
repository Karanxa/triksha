import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  onClick?: () => void;
  className?: string;
}

const ToolCard = ({ icon: Icon, title, onClick, className }: ToolCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 sm:p-6 bg-card rounded-lg border border-muted/20",
        "hover:bg-secondary/10 hover:border-primary/30 hover:animate-card-hover",
        "transition-all duration-200 ease-out",
        "flex items-center gap-3 text-left",
        className
      )}
    >
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
      <span className="text-base sm:text-lg font-medium text-foreground">{title}</span>
    </button>
  );
};

export default ToolCard;