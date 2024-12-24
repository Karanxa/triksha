import { useState } from 'react';
import { Message } from '../types/phases';
import { toast } from 'sonner';

export const useMessageHandler = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const addSystemMessage = (content: string) => {
    addMessage({ role: 'system', content });
  };

  const handleError = (error: Error) => {
    console.error('Error in message handling:', error);
    toast.error(error.message);
    addSystemMessage(`Error: ${error.message}`);
  };

  return {
    messages,
    setMessages,
    addMessage,
    addSystemMessage,
    handleError
  };
};