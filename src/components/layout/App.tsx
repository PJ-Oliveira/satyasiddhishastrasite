import React, { useReducer, useEffect, useState, useCallback, useMemo } from 'react';
import { AppState, HanziDict, CompoundDict, AlignmentDict } from '../../types';
import { reducer, initialState } from '../../store/reducer';
import Reader from './Reader';
import SettingsModal from '../features/SettingsModal';
import HanziTooltip from '../ui/HanziTooltip';
import ChapterIndex from '../ui/ChapterIndex';
import AnkiReview from '../features/AnkiReview';

async function loadCorpus(): Promise<AppState['segments']> {
  const resp = await fetch('/data/corpus.json');
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
  const raw = (await resp.json()) as unknown;
  if (typeof raw === 'object' && raw !== null && 'segments' in raw && Array.isArray((raw as any).segments)) {
    return (raw as any).segments as AppState['segments'];
  }
  throw new Error('Invalid corpus JSON: missing "segments" array');
}

async function loadHanziDict(): Promise<HanziDict> {
  const resp = await fetch('/data/hanzi_dict.json');
  if (!resp.ok) return {};
  return (await resp.json()) as HanziDict;
}

async function loadCompounds(): Promise<CompoundDict> {
  const resp = await fetch('/data/compounds.json');
  if (!resp.ok) return {};
  return (await resp.json()) as CompoundDict;
}

async function loadAlignments(): Promise<AlignmentDict> {
  const resp = await fetch('/data/alignments.json');
  if (!resp.ok) return {};
  return (await resp.json()) as AlignmentDict;
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [indexOpen, setIndexOpen] = useState(false);
  const [ankiOpen, setAnkiOpen] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const [segs, dict, compounds, alignments] = await Promise.all([
          loadCorpus(),
          loadHanziDict(),
          loadCompounds(),
          loadAlignments(),
        ]);
        dispatch({ type: 'INIT_SEGMENTS', payload: segs });
        dispatch({ type: 'INIT_HANZI_DICT', payload: dict });
        dispatch({ type: 'INIT_COMPOUNDS', payload: compounds });
        dispatch({ type: 'INIT_ALIGNMENTS', payload: alignments });
      } catch (err: any) {
        setError(err.message ?? 'Unknown error loading corpus');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Build frequency-sorted character list for Anki
  const charsByFreq = useMemo(() => {
    if (state.segments.length === 0) return [];
    const freq: Record<string, number> = {};
    for (const seg of state.segments) {
      for (const ch of seg.content.zh) {
        const code = ch.charCodeAt(0);
        if (code >= 0x4e00 && code <= 0x9fff) {
          freq[ch] = (freq[ch] || 0) + 1;
        }
      }
    }
    return Object.entries(freq)
      .map(([char, f]) => ({ char, freq: f }))
      .sort((a, b) => b.freq - a.freq);
  }, [state.segments]);

  const closeOverlay = useCallback(() => {
    dispatch({ type: 'HIDE_OVERLAY' });
  }, []);

  const goToChapter = useCallback((id: string) => {
    const idx = state.segments.findIndex((s: any) => s.id === id);
    if (idx >= 0) {
      dispatch({ type: 'GO_TO_CHAPTER', payload: idx });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [state.segments]);

  // Resolve alignment terms when a hanzi tooltip is shown
  useEffect(() => {
    if (state.overlay.type !== 'hanzi') {
      return;
    }
    const char = state.overlay.char;
    const seg = state.segments[state.currentChapter];
    if (!seg) return;

    const enText = seg.content.en;
    const ptText = seg.content.pt;

    // Collect alignment terms: check char itself, then check for compounds
    // that contain this char and appear near it in the text
    const enTerms: string[] = [];
    const ptTerms: string[] = [];

    // Check single char alignment
    if (state.alignmentDict[char]) {
      const align = state.alignmentDict[char];
      // Only include terms that actually appear in the current chapter text
      for (const t of align.en) {
        if (enText.toLowerCase().includes(t.toLowerCase())) {
          enTerms.push(t);
        }
      }
      for (const t of align.pt) {
        if (ptText.toLowerCase().includes(t.toLowerCase())) {
          ptTerms.push(t);
        }
      }
    }

    // Check compound alignments that include this character
    const zhText = seg.content.zh;
    for (const [compound, align] of Object.entries(state.alignmentDict) as [string, { en: string[], pt: string[] }][]) {
      if (compound.length < 2) continue;
      if (!compound.includes(char)) continue;
      // Check if compound actually appears in the current chapter's Chinese text
      if (!zhText.includes(compound)) continue;
      for (const t of align.en) {
        if (enText.toLowerCase().includes(t.toLowerCase()) && !enTerms.includes(t)) {
          enTerms.push(t);
        }
      }
      for (const t of align.pt) {
        if (ptText.toLowerCase().includes(t.toLowerCase()) && !ptTerms.includes(t)) {
          ptTerms.push(t);
        }
      }
    }

    if (enTerms.length > 0 || ptTerms.length > 0) {
      dispatch({ type: 'SET_HIGHLIGHT', payload: { en: enTerms, pt: ptTerms } });
    } else {
      dispatch({ type: 'SET_HIGHLIGHT', payload: null });
    }
  }, [state.overlay, state.alignmentDict, state.segments, state.currentChapter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100 text-brown-800 font-serif">
        <p className="text-xl">Loading 成實論…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100 text-red-700 font-serif">
        <p className="text-xl">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 text-brown-800 font-serif">
      <ChapterIndex
        segments={state.segments}
        onSelect={goToChapter}
        isOpen={indexOpen}
        onToggle={() => setIndexOpen((v) => !v)}
      />

      {/* Anki button */}
      <button
        className="fixed top-4 right-4 z-30 bg-brown-800 text-cream-100 px-3 py-2 rounded-lg shadow-lg hover:bg-brown-900 transition-colors text-sm"
        onClick={() => setAnkiOpen(true)}
      >
        📚 Anki
      </button>

      <Reader state={state} dispatch={dispatch} />

      {state.overlay?.type === 'settings' && (
        <SettingsModal
          dispatch={dispatch}
          close={closeOverlay}
          segments={state.segments}
        />
      )}
      {state.overlay?.type === 'hanzi' && (
        <HanziTooltip
          char={state.overlay.char}
          position={state.overlay.position}
          dict={state.hanziDict}
          compoundDict={state.compoundDict}
          languageMode={state.languageMode}
          close={closeOverlay}
        />
      )}
      {ankiOpen && (
        <AnkiReview
          dict={state.hanziDict}
          charsByFreq={charsByFreq}
          languageMode={state.languageMode}
          onClose={() => setAnkiOpen(false)}
        />
      )}
    </div>
  );
}
