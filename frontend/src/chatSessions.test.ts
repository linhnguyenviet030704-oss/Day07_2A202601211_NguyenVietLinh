import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldCreateNewSession } from './chatSessions.ts';
import { ChatSession } from './types.ts';

const emptySession: ChatSession = {
  id: 's1',
  title: 'New chat',
  createdAt: '2026-08-03T00:00:00.000Z',
  updatedAt: '2026-08-03T00:00:00.000Z',
  messages: [{ id: 'w1', sender: 'assistant', content: 'Welcome', timestamp: '10:00' }],
  activeDocIds: [],
  retrievalOptions: {
    retrievalMethod: 'dense_cosine',
    topK: 4,
    minSimilarityThreshold: 0.4,
    hybridAlpha: 0.7,
    chatModel: 'local',
    generationMode: 'grounded_strict',
    temperature: 0.2,
    filterDocIds: [],
  },
};

test('does not create another session while the active one has no user message', () => {
  assert.equal(shouldCreateNewSession(emptySession), false);
});

test('creates a session after the active one has user content', () => {
  assert.equal(
    shouldCreateNewSession({
      ...emptySession,
      messages: [...emptySession.messages, { id: 'u1', sender: 'user', content: 'hello', timestamp: '10:01' }],
    }),
    true
  );
});
