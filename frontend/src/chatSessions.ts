import { ChatSession } from './types';

export function shouldCreateNewSession(session?: ChatSession) {
  return Boolean(session?.messages.some((message) => message.sender === 'user' && message.content.trim()));
}
