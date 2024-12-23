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
        "w-full p-6 bg-card/80 rounded-lg border border-muted/20",
        "hover:bg-card hover:border-primary/30 hover:animate-card-hover",
        "transition-all duration-300 ease-out",
        "flex flex-col items-start gap-3",
        "shadow-sm hover:shadow-md",
        "bg-gradient-to-br from-card to-background",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-background/50">
          <Icon className="w-6 h-6 text-foreground" />
        </div>
        <span className="text-lg font-medium text-foreground">{title}</span>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      )}
    </button>
  );
};

export default ToolCard;