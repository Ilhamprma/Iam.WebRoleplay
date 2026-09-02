import React from 'react';

export function renderFormattedMessage(text: string): React.ReactNode {
  if (!text) return null;

  // Split lines
  const lines = text.split('\n');

  return (
    <div className="space-y-2 leading-relaxed">
      {lines.map((line, lineIdx) => {
        if (!line.trim()) {
          return <div key={lineIdx} className="h-2" />;
        }

        const tokens = tokenizeLine(line);

        return (
          <p key={lineIdx} className="text-inherit">
            {tokens.map((token, tokenIdx) => {
              if (token.type === 'action') {
                return (
                  <span
                    key={tokenIdx}
                    className="italic text-slate-400 dark:text-slate-400 font-normal tracking-wide px-0.5"
                  >
                    {token.content}
                  </span>
                );
              }
              if (token.type === 'dialogue') {
                return (
                  <span
                    key={tokenIdx}
                    className="font-semibold text-slate-900 dark:text-white bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded border border-black/10 dark:border-white/15"
                  >
                    {token.content}
                  </span>
                );
              }
              if (token.type === 'bold') {
                return (
                  <strong key={tokenIdx} className="font-bold text-slate-950 dark:text-white">
                    {token.content}
                  </strong>
                );
              }
              return <span key={tokenIdx}>{token.content}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

export const FormattedStoryMessage: React.FC<{ content: string; isUser?: boolean }> = ({ content, isUser }) => {
  if (isUser) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }
  return renderFormattedMessage(content) as React.ReactElement;
};

interface Token {
  type: 'action' | 'dialogue' | 'bold' | 'text';
  content: string;
}

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  const regex = /(\*[^*]+\*)|("[^"]+")|(\*\*[^*]+\*\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        content: line.slice(lastIndex, match.index),
      });
    }

    const matchedStr = match[0];
    if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
      tokens.push({
        type: 'bold',
        content: matchedStr.slice(2, -2),
      });
    } else if (matchedStr.startsWith('*') && matchedStr.endsWith('*')) {
      tokens.push({
        type: 'action',
        content: matchedStr.slice(1, -1),
      });
    } else if (matchedStr.startsWith('"') && matchedStr.endsWith('"')) {
      tokens.push({
        type: 'dialogue',
        content: matchedStr,
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    tokens.push({
      type: 'text',
      content: line.slice(lastIndex),
    });
  }

  return tokens;
}
