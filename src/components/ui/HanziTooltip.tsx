import React from 'react';
import { HanziDict, CompoundDict, LanguageMode } from '../../types';

type Props = {
  char: string;
  position: { x: number; y: number };
  dict: HanziDict;
  compoundDict: CompoundDict;
  languageMode: LanguageMode;
  close: () => void;
};

export default function HanziTooltip({
  char,
  position,
  dict,
  compoundDict,
  languageMode,
  close,
}: Props) {
  const entry = dict[char];
  const showEn = languageMode.includes('en');
  const showPt = languageMode.includes('pt');

  // Find compounds that contain this character
  const relatedCompounds = Object.entries(compoundDict).filter(
    ([compound]) => compound.includes(char) && compound.length >= 2
  );

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={close} />

      <div
        className="fixed z-50 bg-cream-50 border border-cream-300 rounded-lg shadow-xl p-4 min-w-[240px] max-w-[360px]"
        style={{
          left: Math.min(Math.max(position.x, 130), window.innerWidth - 150),
          top: Math.max(position.y - 10, 10),
          transform: 'translate(-50%, -100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-1 right-2 text-brown-600 hover:text-brown-900 text-lg"
          onClick={close}
        >
          ×
        </button>

        {/* Character */}
        <div className="text-center mb-2">
          <span className="text-5xl font-serif text-brown-900">{char}</span>
        </div>

        {/* Individual meaning */}
        {entry ? (
          <div className="text-sm space-y-1 text-brown-800">
            {entry.py && (
              <p className="text-brown-600 text-center italic text-base">
                {entry.py}
              </p>
            )}
            <hr className="border-cream-300 my-2" />
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
        ) : (
          <p className="text-sm text-brown-600 text-center italic">
            Caractere sem entrada no dicionário
          </p>
        )}

        {/* Compound meanings */}
        {relatedCompounds.length > 0 && (
          <div className="mt-3 pt-3 border-t border-cream-300">
            <p className="text-[10px] uppercase tracking-wider text-brown-600 mb-2 font-semibold">
              Compostos frequentes
            </p>
            <div className="space-y-2 max-h-[150px] overflow-y-auto">
              {relatedCompounds.slice(0, 6).map(([compound, info]) => (
                <div key={compound} className="text-xs">
                  <span className="text-base font-serif text-brown-900 mr-1">
                    {compound}
                  </span>
                  <span className="text-brown-700">
                    {showPt ? info.pt : info.en}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
