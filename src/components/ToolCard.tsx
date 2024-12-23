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
        "w-full p-8 bg-card rounded-xl border border-border/40",
        "hover:bg-accent/5 hover:border-primary/30 hover:shadow-lg",
        "transition-all duration-300 ease-out",
        "flex flex-col items-start gap-4",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-primary/10">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <span className="text-xl font-semibold text-foreground">{title}</span>
      </div>
      {description && (
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      )}
    </button>
  );
};

export default ToolCard;