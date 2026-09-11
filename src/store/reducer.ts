import { AppState, Action } from '../types';

export const initialState: Readonly<AppState> = {
  segments: [],
  currentChapter: 0,
  languageMode: 'zh\u2011en',
  overlay: { type: 'none' },
  hanziDict: {},
  compoundDict: {},
  alignmentDict: {},
  highlightTerms: null,
};

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'INIT_SEGMENTS':
      return { ...state, segments: action.payload };
    case 'INIT_HANZI_DICT':
      return { ...state, hanziDict: action.payload };
    case 'INIT_COMPOUNDS':
      return { ...state, compoundDict: action.payload };
    case 'INIT_ALIGNMENTS':
      return { ...state, alignmentDict: action.payload };
    case 'SET_LANGUAGE_MODE':
      return { ...state, languageMode: action.payload };
    case 'GO_TO_CHAPTER': {
      const max = state.segments.length - 1;
      const ch = Math.max(0, Math.min(action.payload, max));
      return { ...state, currentChapter: ch };
    }
    case 'SET_HIGHLIGHT':
      return { ...state, highlightTerms: action.payload };
    case 'SHOW_TOOLTIP':
      return {
        ...state,
        overlay: {
          type: 'tooltip',
          segmentId: action.payload.segmentId,
          position: action.payload.position,
        },
      };
    case 'SHOW_HANZI_TOOLTIP':
      return {
        ...state,
        overlay: {
          type: 'hanzi',
          char: action.payload.char,
          position: action.payload.position,
        },
      };
    case 'SHOW_SETTINGS':
      return { ...state, overlay: { type: 'settings' } };
    case 'HIDE_OVERLAY':
      return { ...state, overlay: { type: 'none' }, highlightTerms: null };
    case 'START_EXPORT':
      return state;
    /* v8 ignore next 3 */
    default:
      const _exhaustiveCheck: never = action;
      return state;
  }
}
