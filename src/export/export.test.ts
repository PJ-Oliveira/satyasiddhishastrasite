import { describe, it, expect, vi } from 'vitest';

// Mock jsPDF before importing
vi.mock('jspdf', () => {
  const mockInstance = {
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn(),
    setDrawColor: vi.fn(),
    line: vi.fn(),
    setFillColor: vi.fn(),
    rect: vi.fn(),
    setTextColor: vi.fn(),
    addFileToVFS: vi.fn(),
    addFont: vi.fn(),
    setPage: vi.fn(),
    textWithLink: vi.fn(),
    internal: {
      pageSize: { getWidth: () => 210, getHeight: () => 297 },
      getNumberOfPages: () => 5,
    },
    splitTextToSize: vi.fn((text: string, maxWidth: number) => {
      // Simple split simulation
      const words = text.split(' ');
      const lines: string[] = [];
      let line = '';
      for (const w of words) {
        if ((line + ' ' + w).length > 80) {
          lines.push(line.trim());
          line = w;
        } else {
          line += ' ' + w;
        }
      }
      if (line.trim()) lines.push(line.trim());
      return lines.length ? lines : [''];
    }),
  };
  return { default: vi.fn(() => mockInstance) };
});

// Mock jszip
vi.mock('jszip', () => {
  const mockZip = {
    file: vi.fn(),
    folder: vi.fn(() => ({ file: vi.fn() })),
    generateAsync: vi.fn().mockResolvedValue(new Blob(['test'])),
  };
  return { default: vi.fn(() => mockZip) };
});

// Mock file-saver
vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

import { exportPdf } from './exportPdf';
import { exportEpub } from './exportEpub';

const mockSegments = [
  {
    id: 'ch-1',
    label: '1 具足品 (The Complete Qualities | Qualidades Completas)',
    content: {
      zh: '佛滅度後',
      en: 'After the Buddha\'s parinirvāṇa',
      pt: 'Após o parinirvāṇa do Buda',
    },
  },
  {
    id: 'ch-2',
    label: '2 苦諦品 (Truth of Suffering | Verdade do Sofrimento)',
    content: {
      zh: '苦諦者',
      en: 'The truth of suffering',
      pt: 'A verdade do sofrimento',
    },
  },
  {
    id: 'ch-3',
    label: 'Just a random label without regex match',
    content: { zh: '無', en: 'None', pt: 'Nenhum' },
  }
] as any;

// Generate many segments to trigger page breaks in PDF
const largeSegments = Array.from({ length: 100 }).map((_, i) => ({
  id: `ch-huge-${i}`,
  label: `${i + 4} 大量品 (Huge ${i} | Imenso ${i})`,
  content: {
    zh: '大量',
    en: 'Huge content that will definitely wrap and cause page breaks.\n\n'.repeat(50),
    pt: 'Conteúdo imenso que com certeza vai quebrar página.\n\n'.repeat(50),
  }
})) as any;

const allSegments = [...mockSegments, ...largeSegments];

describe('exportPdf', () => {
  it('exports EN PDF without throwing (with page breaks)', async () => {
    await expect(exportPdf(allSegments, 'en')).resolves.toBeUndefined();
  });

  it('exports PT PDF without throwing (with page breaks)', async () => {
    await expect(exportPdf(allSegments, 'pt')).resolves.toBeUndefined();
  });

  it('calls jsPDF constructor', async () => {
    const jsPDF = (await import('jspdf')).default;
    await exportPdf(mockSegments, 'en');
    expect(jsPDF).toHaveBeenCalled();
  });
});

describe('exportEpub', () => {
  it('exports EN EPUB without throwing', async () => {
    await expect(exportEpub(mockSegments, 'en')).resolves.toBeUndefined();
  });

  it('exports PT EPUB without throwing', async () => {
    await expect(exportEpub(mockSegments, 'pt')).resolves.toBeUndefined();
  });
});
