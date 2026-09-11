import React, { MouseEvent, useCallback, useMemo, memo } from 'react';
import { TextSegment, Action, HighlightTerms } from '../../types';

type Props = {
  language: 'zh' | 'en' | 'pt';
  segments: readonly TextSegment[];
  dispatch: React.Dispatch<Action>;
  highlightTerms?: HighlightTerms;
};

/** Builds a case-insensitive regex from an array of search terms */
function buildHighlightRegex(terms: string[]): RegExp | null {
  if (!terms || terms.length === 0) return null;
  // Sort by length desc so longer matches take priority
  const sorted = [...terms].sort((a, b) => b.length - a.length);
  const escaped = sorted.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`(${escaped.join('|')})`, 'gi');
}

/** Renders text with highlighted matches */
function renderWithHighlights(text: string, regex: RegExp): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  // Reset regex state
  regex.lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIdx) {
      parts.push(<span key={key++}>{text.slice(lastIdx, match.index)}</span>);
    }
    // Highlighted match
    parts.push(
      <mark
        key={key++}
        className="bg-yellow-200 text-brown-900 rounded px-0.5 font-semibold"
      >
        {match[0]}
      </mark>
    );
    lastIdx = match.index + match[0].length;
  }

  // Remaining text
  if (lastIdx < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIdx)}</span>);
  }

  return parts;
}

export default memo(function Column({
  language,
  segments,
  dispatch,
  highlightTerms,
}: Props) {
  if (segments.length === 0) {
    return (
      <div className="flex-1 p-4 text-brown-600 italic">
        No segments loaded.
      </div>
    );
  }

  const handleCharClick = useCallback(
    (char: string, e: MouseEvent) => {
      e.stopPropagation();
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      dispatch({
        type: 'SHOW_HANZI_TOOLTIP',
        payload: {
          char,
          position: { x: rect.left + rect.width / 2, y: rect.top },
        },
      });
    },
    [language, dispatch]
  );

  // Build highlight regex for this column's language
  const highlightRegex = useMemo(() => {
    if (!highlightTerms || language === 'zh') return null;
    const terms =
      language === 'en' ? highlightTerms.en : highlightTerms.pt;
    return buildHighlightRegex(terms);
  }, [highlightTerms, language]);

  const renderText = useCallback(
    (text: string) => {
      if (language === 'zh') {
        // Chinese: wrap each CJK char in clickable span
        return Array.from(text).map((char, i) => {
          const code = char.charCodeAt(0);
          if (code >= 0x4e00 && code <= 0x9fff) {
            return (
              <span
                key={i}
                className="cursor-pointer hover:bg-cream-300 hover:rounded transition-colors"
                onClick={(e: any) => handleCharClick(char, e)}
              >
                {char}
              </span>
            );
          }
          return <span key={i}>{char}</span>;
        });
      }

      // EN/PT: render with highlights if available
      if (highlightRegex) {
        return renderWithHighlights(text, highlightRegex);
      }
      return text;
    },
    [language, handleCharClick, highlightRegex]
  );

  return (
    <div className="flex-1 p-2 sm:p-4">
      {segments.map((seg) => (
        <div key={seg.id} id={seg.id}>
          <p className="text-justify leading-relaxed whitespace-pre-line text-sm sm:text-base">
            {renderText(seg.content[language])}
          </p>
        </div>
      ))}
    </div>
  );
});