import { cn } from "@/lib/utils";

export const TypingIndicator = () => {
  return (
    <div className="flex space-x-2 p-3 bg-accent rounded-lg w-16">
      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-[bounce_1.4s_infinite_.2s]" />
      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-[bounce_1.4s_infinite_.4s]" />
      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-[bounce_1.4s_infinite_.6s]" />
    </div>
  );
};