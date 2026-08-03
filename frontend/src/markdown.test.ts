import assert from 'node:assert/strict';
import test from 'node:test';
import { parseMarkdown } from './markdown.ts';

test('parses common chat markdown blocks', () => {
  assert.deepEqual(parseMarkdown('### Heading\n1. First **bold**\n2. Second\n\n$$x = 1$$'), [
    { type: 'heading', text: 'Heading' },
    { type: 'ordered-list', items: ['First **bold**', 'Second'] },
    { type: 'math', text: 'x = 1' },
  ]);
});

test('renders retrieved markdown headings that were emitted as bullets', () => {
  assert.deepEqual(parseMarkdown('Tim thay ngu canh lien quan:\n\n- ###### 2.3.2. Tiêu chuẩn của Anh\n\n||\n\n- Patch test: Dùng để chẩn đoán'), [
    { type: 'paragraph', text: 'Tim thay ngu canh lien quan:' },
    { type: 'heading', text: '2.3.2. Tiêu chuẩn của Anh' },
    { type: 'unordered-list', items: ['Patch test: Dùng để chẩn đoán'] },
  ]);
});
