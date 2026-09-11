import React from 'react';
import { AppState, Action, LanguageMode } from '../../types';
import Column from '../ui/Column';

type Props = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
};

const MODES: { key: LanguageMode; label: string }[] = [
  { key: 'zh\u2011en', label: '中文 / English' },
  { key: 'zh\u2011pt', label: '中文 / Português' },
  { key: 'en\u2011pt', label: 'English / Português' },
];

export default function Reader({ state, dispatch }: Props) {
  const { languageMode, segments, currentChapter } = state;
  const total = segments.length;
  const seg = segments[currentChapter];

  const getLanguages = (mode: LanguageMode) => {
    switch (mode) {
      case 'zh\u2011en':
        return ['zh', 'en'] as const;
      case 'zh\u2011pt':
        return ['zh', 'pt'] as const;
      case 'en\u2011pt':
        return ['en', 'pt'] as const;
    }
  };
  const [leftLang, rightLang] = getLanguages(languageMode);

  const go = (ch: number) => {
    dispatch({ type: 'GO_TO_CHAPTER', payload: ch });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isFirst = currentChapter === 0;
  const isLast = currentChapter >= total - 1;

  // Extract readable label parts
  const chapterLabel = seg?.label ?? `Chapter ${currentChapter + 1}`;

  let mainTitle = '';
  if (languageMode === 'zh\u2011en') {
    mainTitle = '成實論 — Treatise on the Realization of Truth';
  } else if (languageMode === 'zh\u2011pt') {
    mainTitle = '成實論 — Tratado da Realização da Verdade';
  } else if (languageMode === 'en\u2011pt') {
    mainTitle = 'Treatise on the Realization of Truth / Tratado da Realização da Verdade';
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <header className="mb-4 sm:mb-6 text-center pl-10 sm:pl-0">
        <h1 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">
          {mainTitle}
        </h1>
        <p className="text-[10px] sm:text-xs text-brown-600 mb-3 sm:mb-4">
          Harivarman · Kumārajīva · {total} chapters
        </p>

        {/* Language mode selector */}
        <div className="inline-flex flex-wrap justify-center rounded-lg border border-cream-300 overflow-hidden text-xs sm:text-sm">
          {MODES.map((m) => (
            <button
              key={m.key}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 transition-colors ${
                languageMode === m.key
                  ? 'bg-brown-800 text-cream-100'
                  : 'bg-cream-50 text-brown-700 hover:bg-cream-200'
              }`}
              onClick={() => dispatch({ type: 'SET_LANGUAGE_MODE', payload: m.key })}
            >
              {m.label}
            </button>
          ))}
          <button
            className="px-2 sm:px-4 py-1.5 sm:py-2 bg-cream-50 text-brown-700 hover:bg-cream-200 border-l border-cream-300"
            onClick={() => dispatch({ type: 'SHOW_SETTINGS' })}
          >
            ⬇ Export
          </button>
        </div>
      </header>

      {/* Chapter title bar */}
      {seg && (
        <div className="text-center mb-4">
          <p className="text-xs sm:text-sm text-brown-700 font-medium leading-snug px-2">
            {chapterLabel}
          </p>
        </div>
      )}

      {/* Chapter content — single chapter, two columns */}
      {seg && (
        <section className="flex flex-col md:flex-row gap-2 md:gap-6 mb-6">
          <Column language={leftLang} segments={[seg]} dispatch={dispatch} highlightTerms={state.highlightTerms} />
          <div className="hidden md:block w-px bg-cream-300 flex-shrink-0" />
          <hr className="md:hidden border-cream-300" />
          <Column language={rightLang} segments={[seg]} dispatch={dispatch} highlightTerms={state.highlightTerms} />
        </section>
      )}

      {/* Navigation arrows */}
      <nav className="flex items-center justify-center gap-1 sm:gap-2 py-4 border-t border-cream-300">
        <button
          disabled={isFirst}
          onClick={() => go(0)}
          className="px-2 sm:px-3 py-2 rounded-lg text-sm sm:text-base transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-cream-50 text-brown-700 hover:bg-cream-200 border border-cream-300"
          title="Primeiro capítulo"
        >
          ⏮
        </button>
        <button
          disabled={isFirst}
          onClick={() => go(currentChapter - 1)}
          className="px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-cream-50 text-brown-700 hover:bg-cream-200 border border-cream-300"
          title="Capítulo anterior"
        >
          ◀ Anterior
        </button>

        <span className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-brown-600 font-mono select-none">
          {currentChapter + 1} / {total}
        </span>

        <button
          disabled={isLast}
          onClick={() => go(currentChapter + 1)}
          className="px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-cream-50 text-brown-700 hover:bg-cream-200 border border-cream-300"
          title="Próximo capítulo"
        >
          Próximo ▶
        </button>
        <button
          disabled={isLast}
          onClick={() => go(total - 1)}
          className="px-2 sm:px-3 py-2 rounded-lg text-sm sm:text-base transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-cream-50 text-brown-700 hover:bg-cream-200 border border-cream-300"
          title="Último capítulo"
        >
          ⏭
        </button>
      </nav>
    </div>
  );
}
