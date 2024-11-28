import { Message } from '../types';
import { Json } from '@/integrations/supabase/types/common';

export const convertMessagesToJson = (messages: Message[]): Json => {
  return messages.map(message => ({
    role: message.role,
    content: message.content
  }));
};

export const convertJsonToMessages = (json: Json): Message[] => {
  if (!Array.isArray(json)) return [];
  return json.map(msg => ({
    role: msg.role as 'system' | 'user' | 'assistant',
    content: msg.content as string
  }));
};