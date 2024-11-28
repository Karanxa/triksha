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
    // First cast to unknown, then to MessageJson to avoid direct type assertion errors
    const messageJson = msg as unknown as MessageJson;
    
    // Validate the shape of the object
    if (typeof messageJson?.role !== 'string' || typeof messageJson?.content !== 'string') {
      console.error('Invalid message format:', msg);
      return {
        role: 'system',
        content: 'Error: Invalid message format'
      };
    }

    return {
      role: messageJson.role as 'system' | 'user' | 'assistant',
      content: messageJson.content
    };
  });
};