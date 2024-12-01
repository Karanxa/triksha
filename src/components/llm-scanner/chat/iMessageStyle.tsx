import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
}

export const MessageBubble = ({ content, isUser, timestamp }: MessageBubbleProps) => {
  return (
    <div className={cn(
      "flex",
      isUser ? "justify-end" : "justify-start",
      "mb-4"
    )}>
      <div className={cn(
        "max-w-[70%] rounded-2xl px-4 py-2",
        isUser ? "bg-[#007AFF] text-white rounded-tr-sm" : "bg-[#E9E9EB] text-black rounded-tl-sm"
      )}>
        <p className="text-sm">{content}</p>
        {timestamp && (
          <span className="text-[10px] opacity-70 mt-1 block">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
};

export const ChatContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-[#FFFFFF] dark:bg-[#000000] rounded-lg p-4 h-[500px] overflow-y-auto">
      {children}
    </div>
  );
};