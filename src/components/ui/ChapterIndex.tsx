import React, { useState } from 'react';
import { TextSegment } from '../../types';

type Props = {
  segments: readonly TextSegment[];
  onSelect: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
};

export default function ChapterIndex({ segments, onSelect, isOpen, onToggle }: Props) {
  const [search, setSearch] = useState('');

  const filtered = segments.filter((seg) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (seg.label ?? '').toLowerCase().includes(q) ||
      seg.id.includes(q)
    );
  });

  return (
    <>
      {/* Toggle button - always visible */}
      <button
        className="fixed top-4 left-4 z-30 bg-brown-800 text-cream-100 px-3 py-2 rounded-lg shadow-lg hover:bg-brown-900 transition-colors text-sm"
        onClick={onToggle}
      >
        {isOpen ? '✕ Close' : '☰ Chapters'}
      </button>

      {/* Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-20 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-30" onClick={onToggle} />

          {/* Panel */}
          <aside className="relative w-80 max-w-[85vw] bg-cream-50 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-cream-300">
              <h2 className="text-lg font-bold text-brown-800 mb-3">
                成實論 — Índice
              </h2>
              <input
                type="text"
                placeholder="Search chapters..."
                className="w-full px-3 py-2 rounded border border-cream-300 bg-cream-100 text-brown-800 text-sm placeholder-brown-600 focus:outline-none focus:ring-2 focus:ring-brown-600"
                value={search}
                onChange={(e: any) => setSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {filtered.map((seg) => {
                const chNum = seg.id.replace('ch-', '');
                return (
                  <button
                    key={seg.id}
                    className="w-full text-left px-4 py-3 border-b border-cream-200 hover:bg-cream-200 transition-colors"
                    onClick={() => {
                      onSelect(seg.id);
                      onToggle();
                    }}
                  >
                    <span className="text-xs text-brown-600 font-mono mr-2 flex-shrink-0">
                      {chNum.padStart(3, '\u2007')}
                    </span>
                    <span className="text-sm text-brown-800 leading-snug">
                      {seg.label?.replace(/^\d+\s+/, '') ?? seg.id}
                    </span>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="p-4 text-brown-600 italic text-sm">No chapters found.</p>
              )}
            </div>

            <div className="p-3 border-t border-cream-300 text-center text-xs text-brown-600">
              {segments.length} chapters total
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
