import { Message } from '../types';
import { Json } from '@/integrations/supabase/types/common';

interface MessageJson {
  role: string;
  content: string;
}

export const convertMessagesToJson = (messages: Message[]): Json => {
  return messages.map(message => ({
    role: message.role,
    content: message.content
  })) as Json;
};

export const convertJsonToMessages = (json: Json): Message[] => {
  if (!Array.isArray(json)) return [];
  
  return json.map(msg => {
    const messageJson = msg as MessageJson;
    return {
      role: messageJson.role as 'system' | 'user' | 'assistant',
      content: messageJson.content
    };
  });
};