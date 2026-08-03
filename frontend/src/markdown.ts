export type MarkdownBlock =
  | { type: 'heading'; text: string }
  | { type: 'ordered-list'; items: string[] }
  | { type: 'unordered-list'; items: string[] }
  | { type: 'math'; text: string }
  | { type: 'paragraph'; text: string };

export function parseMarkdown(markdown: string): MarkdownBlock[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: MarkdownBlock[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    const text = paragraph.join(' ').trim();
    if (text) blocks.push({ type: 'paragraph', text });
    paragraph = [];
  };

  for (let index = 0; index < lines.length; index++) {
    const rawLine = lines[index].trim();
    const line = rawLine.replace(/^[-*]\s+(#{1,6}\s+)/, '$1');
    if (!line) {
      flushParagraph();
      continue;
    }

    if (/^\|+\s*$/.test(line)) {
      flushParagraph();
      continue;
    }

    const heading = line.match(/^#{1,6}\s+(.+)$/);
    if (heading) {
      flushParagraph();
      blocks.push({ type: 'heading', text: heading[1] });
      continue;
    }

    if (line.startsWith('$$') && line.endsWith('$$')) {
      flushParagraph();
      blocks.push({ type: 'math', text: line.slice(2, -2).trim() });
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      flushParagraph();
      const items = [ordered[1]];
      while (lines[index + 1]?.trim().match(/^\d+\.\s+(.+)$/)) {
        items.push(lines[++index].trim().replace(/^\d+\.\s+/, ''));
      }
      blocks.push({ type: 'ordered-list', items });
      continue;
    }

    const unordered = line.match(/^[-*]\s+(.+)$/);
    if (unordered) {
      flushParagraph();
      const items = [unordered[1]];
      while (lines[index + 1]?.trim().match(/^[-*]\s+(.+)$/)) {
        items.push(lines[++index].trim().replace(/^[-*]\s+/, ''));
      }
      blocks.push({ type: 'unordered-list', items });
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  return blocks;
}
