import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HanziDict, LanguageMode } from '../../types';

type CardState = {
  /** Interval in minutes: 1, 10, 1440 (1d), 4320 (3d), ... */
  interval: number;
  /** Next review timestamp (ms) */
  due: number;
  /** Times reviewed */
  reps: number;
};

type SrsData = Record<string, CardState>;

const STORAGE_KEY = 'anki-srs-data';

function loadSrs(): SrsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSrs(data: SrsData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

type Props = {
  dict: HanziDict;
  /** Characters sorted by corpus frequency (descending) */
  charsByFreq: { char: string; freq: number }[];
  languageMode: LanguageMode;
  onClose: () => void;
};

export default function AnkiReview({ dict, charsByFreq, languageMode, onClose }: Props) {
  const [srs, setSrs] = useState<SrsData>(loadSrs);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState({ reviewed: 0, total: 0, mastered: 0 });

  // Determine language for meaning display
  const showEn = languageMode.includes('en');
  const showPt = languageMode.includes('pt');

  // Build review queue: due cards first, then new cards in frequency order
  const currentCard = useMemo(() => {
    const now = Date.now();

    // Due cards (review)
    for (const item of charsByFreq) {
      const card = srs[item.char];
      if (card && card.due <= now) {
        return item;
      }
    }

    // New cards (not yet seen, in frequency order)
    for (const item of charsByFreq) {
      if (!srs[item.char]) {
        return item;
      }
    }

    return null; // All reviewed and not due
  }, [charsByFreq, srs]);

  // Update stats
  useEffect(() => {
    const now = Date.now();
    const total = charsByFreq.length;
    const reviewed = Object.keys(srs).length;
    const mastered = Object.values(srs).filter((c) => c.interval >= 1440).length; // 1+ day
    setStats({ reviewed, total, mastered });
  }, [srs, charsByFreq]);

  const handleGrade = useCallback(
    (grade: 'again' | 'hard' | 'good' | 'easy') => {
      if (!currentCard) return;

      const now = Date.now();
      const existing = srs[currentCard.char];
      let interval: number;

      if (!existing || grade === 'again') {
        // Reset or new card
        interval = grade === 'again' ? 1 : 10;
      } else {
        const prev = existing.interval;
        switch (grade) {
          case 'hard':
            interval = Math.max(prev * 1.2, prev + 10);
            break;
          case 'good':
            interval = prev < 10 ? 60 : prev * 2.5;
            break;
          case 'easy':
            interval = prev < 10 ? 1440 : prev * 4;
            break;
        }
      }

      const newSrs = {
        ...srs,
        [currentCard.char]: {
          interval,
          due: now + interval * 60 * 1000,
          reps: (existing?.reps ?? 0) + 1,
        },
      };
      setSrs(newSrs);
      saveSrs(newSrs);
      setShowAnswer(false);
    },
    [currentCard, srs]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (!showAnswer) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setShowAnswer(true);
        }
        return;
      }
      switch (e.key) {
        case '1':
          handleGrade('again');
          break;
        case '2':
          handleGrade('hard');
          break;
        case '3':
        case ' ':
          e.preventDefault();
          handleGrade('good');
          break;
        case '4':
          handleGrade('easy');
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showAnswer, handleGrade, onClose]);

  const entry = currentCard ? dict[currentCard.char] : null;
  const cardSrs = currentCard ? srs[currentCard.char] : null;
  const isNew = !cardSrs;

  const progressPct = stats.total > 0 ? (stats.reviewed / stats.total) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-cream-50 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cream-300 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-brown-800">漢字 Anki</h2>
            <p className="text-xs text-brown-600">
              {stats.reviewed}/{stats.total} estudados · {stats.mastered} dominados
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-brown-600 hover:text-brown-900 text-xl px-2"
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-cream-200">
          <div
            className="h-full bg-brown-700 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {currentCard ? (
          <>
            {/* Card face */}
            <div className="px-6 py-8 text-center min-h-[280px] flex flex-col items-center justify-center">
              {/* Status badge */}
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full mb-4 ${
                  isNew
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {isNew ? 'NOVO' : `Revisão #${cardSrs!.reps + 1}`}
              </span>

              {/* Character */}
              <span className="text-8xl font-serif text-brown-900 mb-2">
                {currentCard.char}
              </span>

              {/* Frequency */}
              <p className="text-xs text-brown-600 mb-6">
                {currentCard.freq}× no 成實論
              </p>

              {showAnswer && entry ? (
                <div className="text-sm space-y-2 text-brown-800 w-full">
                  {entry.py && (
                    <p className="text-brown-600 italic text-lg">{entry.py}</p>
                  )}
                  <hr className="border-cream-300" />
                  {showEn && (
                    <p>
                      <span className="font-semibold text-brown-900">EN:</span>{' '}
                      {entry.en}
                    </p>
                  )}
                  {showPt && (
                    <p>
                      <span className="font-semibold text-brown-900">PT:</span>{' '}
                      {entry.pt}
                    </p>
                  )}
                </div>
              ) : showAnswer ? (
                <p className="text-sm text-brown-600 italic">
                  Sem entrada no dicionário
                </p>
              ) : (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="mt-4 px-8 py-3 bg-brown-800 text-cream-100 rounded-lg hover:bg-brown-900 transition-colors text-sm"
                >
                  Mostrar Resposta
                </button>
              )}
            </div>

            {/* Grade buttons (only when answer shown) */}
            {showAnswer && (
              <div className="px-4 py-4 border-t border-cream-300 grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleGrade('again')}
                  className="py-3 rounded-lg text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                >
                  Errei
                  <br />
                  <span className="text-[10px] opacity-70">1 min</span>
                </button>
                <button
                  onClick={() => handleGrade('hard')}
                  className="py-3 rounded-lg text-xs font-medium bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors"
                >
                  Difícil
                  <br />
                  <span className="text-[10px] opacity-70">10 min</span>
                </button>
                <button
                  onClick={() => handleGrade('good')}
                  className="py-3 rounded-lg text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                >
                  Bom
                  <br />
                  <span className="text-[10px] opacity-70">
                    {cardSrs ? `${Math.round(cardSrs.interval * 2.5)} min` : '1 hr'}
                  </span>
                </button>
                <button
                  onClick={() => handleGrade('easy')}
                  className="py-3 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                >
                  Fácil
                  <br />
                  <span className="text-[10px] opacity-70">
                    {cardSrs ? `${Math.round(cardSrs.interval * 4 / 60)} hr` : '1 dia'}
                  </span>
                </button>
              </div>
            )}

            {/* Keyboard hints */}
            <div className="px-4 py-2 bg-cream-200 text-center text-[10px] text-brown-600">
              {showAnswer
                ? 'Teclas: 1 Errei · 2 Difícil · 3/Espaço Bom · 4 Fácil'
                : 'Espaço: mostrar resposta · Esc: sair'}
            </div>
          </>
        ) : (
          <div className="px-6 py-16 text-center">
            <p className="text-4xl mb-4">🎉</p>
            <p className="text-lg font-bold text-brown-800 mb-2">
              Parabéns!
            </p>
            <p className="text-sm text-brown-600">
              Todos os caracteres foram revisados. Volte depois para a revisão espaçada.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
