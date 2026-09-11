import React, { useState } from 'react';
import { Action, TextSegment } from '../../types';
import { exportPdf } from '../../export/exportPdf';
import { exportEpub } from '../../export/exportEpub';

type Props = {
  dispatch: React.Dispatch<Action>;
  close: () => void;
  segments: readonly TextSegment[];
};

export default function SettingsModal({ dispatch, close, segments }: Props) {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (format: 'pdf' | 'epub', language: 'en' | 'pt') => {
    setExporting(`${format.toUpperCase()} (${language.toUpperCase()})`);
    try {
      if (format === 'pdf') {
        await exportPdf(segments, language);
      } else {
        await exportEpub(segments, language);
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Check console for details.');
    } finally {
      setExporting(null);
      close();
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50" onClick={close}>
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-6 text-center">Export Satyasiddhiśāstra</h2>

        {exporting ? (
          <div className="text-center py-8">
            <p className="text-gray-600 animate-pulse">Generating {exporting}…</p>
          </div>
        ) : (
          <>
            {/* PDF Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">PDF</h3>
              <div className="flex gap-3">
                <button
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => handleExport('pdf', 'en')}
                >
                  📄 English PDF
                </button>
                <button
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  onClick={() => handleExport('pdf', 'pt')}
                >
                  📄 Português PDF
                </button>
              </div>
            </div>

            {/* EPUB Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">EPUB</h3>
              <div className="flex gap-3">
                <button
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  onClick={() => handleExport('epub', 'en')}
                >
                  📖 English EPUB
                </button>
                <button
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  onClick={() => handleExport('epub', 'pt')}
                >
                  📖 Português EPUB
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mb-4">
              Portuguese export includes only the {segments.filter(s => !s.content.pt.includes('não disponível')).length} translated chapters.
            </p>

            <button
              className="w-full py-2 text-gray-500 hover:text-gray-700 transition-colors"
              onClick={close}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
