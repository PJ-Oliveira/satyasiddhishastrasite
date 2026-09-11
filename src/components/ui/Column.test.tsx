import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Column from './Column';

const mockDispatch = vi.fn();
const mockSegments = [
  {
    id: 'ch-1',
    content: {
      zh: '佛滅度後弟子問曰',
      en: 'After the Buddha\'s parinirvāṇa, a disciple asked',
      pt: 'Após o parinirvāṇa do Buda, um discípulo perguntou',
    },
  },
] as any;

describe('Column', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  describe('Chinese column', () => {
    it('renders CJK chars as clickable spans', () => {
      render(<Column language="zh" segments={mockSegments} dispatch={mockDispatch} />);
      const spans = document.querySelectorAll('span.cursor-pointer');
      expect(spans.length).toBe(8); // 佛滅度後弟子問曰 = 8 CJK chars
    });

    it('dispatches SHOW_HANZI_TOOLTIP on char click', () => {
      render(<Column language="zh" segments={mockSegments} dispatch={mockDispatch} />);
      const spans = document.querySelectorAll('span.cursor-pointer');
      fireEvent.click(spans[0]); // click '佛'
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SHOW_HANZI_TOOLTIP',
          payload: expect.objectContaining({ char: '佛' }),
        })
      );
    });

    it('does not dispatch for non-CJK chars', () => {
      const segs = [{ id: 'x', content: { zh: 'ABC', en: '', pt: '' } }] as any;
      render(<Column language="zh" segments={segs} dispatch={mockDispatch} />);
      const spans = document.querySelectorAll('span.cursor-pointer');
      expect(spans.length).toBe(0);
    });
  });

  describe('English column', () => {
    it('renders text without clickable spans', () => {
      render(<Column language="en" segments={mockSegments} dispatch={mockDispatch} />);
      expect(screen.getByText(/Buddha's parinirvāṇa/)).toBeInTheDocument();
      const spans = document.querySelectorAll('span.cursor-pointer');
      expect(spans.length).toBe(0);
    });
  });

  describe('Portuguese column', () => {
    it('renders text correctly', () => {
      render(<Column language="pt" segments={mockSegments} dispatch={mockDispatch} />);
      expect(screen.getByText(/parinirvāṇa do Buda/)).toBeInTheDocument();
    });
  });

  describe('Highlighting', () => {
    it('highlights matching terms in EN column', () => {
      const highlights = { en: ['Buddha'], pt: ['Buda'] };
      render(
        <Column
          language="en"
          segments={mockSegments}
          dispatch={mockDispatch}
          highlightTerms={highlights}
        />
      );
      const marks = document.querySelectorAll('mark');
      expect(marks.length).toBeGreaterThan(0);
      expect(marks[0].textContent).toBe('Buddha');
    });

    it('highlights matching terms in PT column', () => {
      const highlights = { en: ['Buddha'], pt: ['Buda'] };
      render(
        <Column
          language="pt"
          segments={mockSegments}
          dispatch={mockDispatch}
          highlightTerms={highlights}
        />
      );
      const marks = document.querySelectorAll('mark');
      expect(marks.length).toBeGreaterThan(0);
      expect(marks[0].textContent).toBe('Buda');
    });

    it('does not highlight in ZH column', () => {
      const highlights = { en: ['佛'], pt: ['佛'] };
      render(
        <Column
          language="zh"
          segments={mockSegments}
          dispatch={mockDispatch}
          highlightTerms={highlights}
        />
      );
      const marks = document.querySelectorAll('mark');
      expect(marks.length).toBe(0);
    });

    it('does not highlight when no match in text', () => {
      const highlights = { en: ['NONEXISTENT'], pt: ['INEXISTENTE'] };
      render(
        <Column
          language="en"
          segments={mockSegments}
          dispatch={mockDispatch}
          highlightTerms={highlights}
        />
      );
      const marks = document.querySelectorAll('mark');
      expect(marks.length).toBe(0);
    });

    it('does not highlight when highlightTerms array is empty', () => {
      render(
        <Column
          language="en"
          segments={mockSegments}
          dispatch={mockDispatch}
          highlightTerms={{ en: [], pt: [] }}
        />
      );
      expect(document.querySelectorAll('mark').length).toBe(0);
    });

    it('handles null highlightTerms gracefully', () => {
      render(
        <Column
          language="en"
          segments={mockSegments}
          dispatch={mockDispatch}
          highlightTerms={null}
        />
      );
      const marks = document.querySelectorAll('mark');
      expect(marks.length).toBe(0);
    });
  });

  describe('Empty state', () => {
    it('renders message when no segments', () => {
      render(<Column language="zh" segments={[]} dispatch={mockDispatch} />);
      expect(screen.getByText(/No segments loaded/)).toBeInTheDocument();
    });
  });
});
