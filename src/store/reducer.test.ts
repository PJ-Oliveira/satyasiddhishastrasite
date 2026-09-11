import { describe, it, expect } from 'vitest';
import { reducer, initialState } from '../store/reducer';
import type { AppState, HanziDict, CompoundDict, AlignmentDict, LanguageMode } from '../types';

describe('reducer', () => {
  describe('initialState', () => {
    it('has correct default values', () => {
      expect(initialState.segments).toEqual([]);
      expect(initialState.currentChapter).toBe(0);
      expect(initialState.languageMode).toBe('zh\u2011en');
      expect(initialState.overlay).toEqual({ type: 'none' });
      expect(initialState.hanziDict).toEqual({});
      expect(initialState.compoundDict).toEqual({});
      expect(initialState.alignmentDict).toEqual({});
      expect(initialState.highlightTerms).toBeNull();
    });
  });

  describe('INIT_SEGMENTS', () => {
    it('sets segments', () => {
      const segs = [{ id: 'ch-1', content: { zh: '佛', en: 'Buddha', pt: 'Buda' } }] as any;
      const state = reducer(initialState, { type: 'INIT_SEGMENTS', payload: segs });
      expect(state.segments).toEqual(segs);
    });
  });

  describe('INIT_HANZI_DICT', () => {
    it('sets hanziDict', () => {
      const dict: HanziDict = { '佛': { en: 'Buddha', pt: 'Buda', py: 'fó' } };
      const state = reducer(initialState, { type: 'INIT_HANZI_DICT', payload: dict });
      expect(state.hanziDict).toEqual(dict);
    });
  });

  describe('INIT_COMPOUNDS', () => {
    it('sets compoundDict', () => {
      const dict: CompoundDict = { '涅槃': { en: 'nirvāṇa', pt: 'nirvāṇa' } };
      const state = reducer(initialState, { type: 'INIT_COMPOUNDS', payload: dict });
      expect(state.compoundDict).toEqual(dict);
    });
  });

  describe('INIT_ALIGNMENTS', () => {
    it('sets alignmentDict', () => {
      const dict: AlignmentDict = { '佛': { en: ['Buddha'], pt: ['Buda'] } };
      const state = reducer(initialState, { type: 'INIT_ALIGNMENTS', payload: dict });
      expect(state.alignmentDict).toEqual(dict);
    });
  });

  describe('SET_LANGUAGE_MODE', () => {
    it('changes language mode', () => {
      const state = reducer(initialState, { type: 'SET_LANGUAGE_MODE', payload: 'zh\u2011pt' });
      expect(state.languageMode).toBe('zh\u2011pt');
    });

    it('supports en-pt mode', () => {
      const state = reducer(initialState, { type: 'SET_LANGUAGE_MODE', payload: 'en\u2011pt' });
      expect(state.languageMode).toBe('en\u2011pt');
    });
  });

  describe('GO_TO_CHAPTER', () => {
    const stateWithSegs = {
      ...initialState,
      segments: [
        { id: 'ch-1', content: { zh: 'a', en: 'a', pt: 'a' } },
        { id: 'ch-2', content: { zh: 'b', en: 'b', pt: 'b' } },
        { id: 'ch-3', content: { zh: 'c', en: 'c', pt: 'c' } },
      ],
    } as AppState;

    it('navigates to valid chapter', () => {
      const state = reducer(stateWithSegs, { type: 'GO_TO_CHAPTER', payload: 1 });
      expect(state.currentChapter).toBe(1);
    });

    it('clamps to 0 for negative values', () => {
      const state = reducer(stateWithSegs, { type: 'GO_TO_CHAPTER', payload: -5 });
      expect(state.currentChapter).toBe(0);
    });

    it('clamps to max for overflow', () => {
      const state = reducer(stateWithSegs, { type: 'GO_TO_CHAPTER', payload: 100 });
      expect(state.currentChapter).toBe(2);
    });
  });

  describe('SET_HIGHLIGHT', () => {
    it('sets highlight terms', () => {
      const terms = { en: ['Buddha'], pt: ['Buda'] };
      const state = reducer(initialState, { type: 'SET_HIGHLIGHT', payload: terms });
      expect(state.highlightTerms).toEqual(terms);
    });

    it('clears highlight terms with null', () => {
      const withHighlights = { ...initialState, highlightTerms: { en: ['x'], pt: ['y'] } };
      const state = reducer(withHighlights, { type: 'SET_HIGHLIGHT', payload: null });
      expect(state.highlightTerms).toBeNull();
    });
  });

  describe('SHOW_HANZI_TOOLTIP', () => {
    it('sets hanzi overlay', () => {
      const state = reducer(initialState, {
        type: 'SHOW_HANZI_TOOLTIP',
        payload: { char: '佛', position: { x: 100, y: 200 } },
      });
      expect(state.overlay).toEqual({
        type: 'hanzi',
        char: '佛',
        position: { x: 100, y: 200 },
      });
    });
  });

  describe('SHOW_TOOLTIP', () => {
    it('sets tooltip overlay', () => {
      const state = reducer(initialState, {
        type: 'SHOW_TOOLTIP',
        payload: { segmentId: 'ch-1', position: { x: 50, y: 75 } },
      });
      expect(state.overlay).toEqual({
        type: 'tooltip',
        segmentId: 'ch-1',
        position: { x: 50, y: 75 },
      });
    });
  });

  describe('SHOW_SETTINGS', () => {
    it('sets settings overlay', () => {
      const state = reducer(initialState, { type: 'SHOW_SETTINGS' });
      expect(state.overlay).toEqual({ type: 'settings' });
    });
  });

  describe('HIDE_OVERLAY', () => {
    it('clears overlay and highlights', () => {
      const withOverlay = {
        ...initialState,
        overlay: { type: 'hanzi' as const, char: '佛', position: { x: 0, y: 0 } },
        highlightTerms: { en: ['Buddha'], pt: ['Buda'] },
      };
      const state = reducer(withOverlay, { type: 'HIDE_OVERLAY' });
      expect(state.overlay).toEqual({ type: 'none' });
      expect(state.highlightTerms).toBeNull();
    });
  });

  describe('START_EXPORT', () => {
    it('returns state unchanged for START_EXPORT', () => {
      const state = { ...initialState, languageMode: 'en\u2011pt' as LanguageMode };
      const next = reducer(state, { type: 'START_EXPORT' } as any);
      expect(next).toEqual(state);
    });

    it('returns state unchanged for unknown action', () => {
      const state = { ...initialState };
      const next = reducer(state, { type: 'UNKNOWN_ACTION' } as any);
      expect(next).toBe(state);
    });
  });
});
