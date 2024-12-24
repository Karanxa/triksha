import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  onClick?: () => void;
  className?: string;
}

const ToolCard = ({ icon: Icon, title, description, onClick, className }: ToolCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-6 rounded-lg border",
        "hover:bg-accent hover:border-primary/30 hover:animate-card-hover",
        "transition-all duration-300 ease-out",
        "flex flex-col items-start gap-3",
        "shadow-sm hover:shadow-md",
        "bg-card text-card-foreground",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-accent">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <span className="text-lg font-medium">{title}</span>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      )}
    </button>
  );
};

export default ToolCard;