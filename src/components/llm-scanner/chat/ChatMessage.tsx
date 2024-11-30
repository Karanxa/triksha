import { Message } from '../geraid-engine/types';

interface ChatMessageProps {
  message: Message;
  scrollRef?: React.RefObject<HTMLDivElement>;
}

export const ChatMessage = ({ message, scrollRef }: ChatMessageProps) => {
  return (
    <div
      ref={scrollRef}
      className={`flex ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          message.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : message.role === 'system'
            ? 'bg-muted text-muted-foreground'
            : 'bg-accent'
        }`}
      >
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  );
};