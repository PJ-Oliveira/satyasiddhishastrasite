import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import AnkiReview from './AnkiReview';

const mockDict = {
  '佛': { en: 'Buddha', pt: 'Buda', py: 'fó' },
  '法': { en: 'dharma', pt: 'dharma', py: 'fǎ' },
  '僧': { en: 'saṅgha', pt: 'saṅgha', py: 'sēng' },
};

const mockCharsByFreq = [
  { char: '佛', freq: 500 },
  { char: '法', freq: 300 },
  { char: '僧', freq: 100 },
];

const mockOnClose = vi.fn();

describe('AnkiReview', () => {
  beforeEach(() => {
    mockOnClose.mockClear();
    localStorage.clear();
  });

  it('renders the Anki modal', () => {
    render(
      <AnkiReview
        dict={mockDict}
        charsByFreq={mockCharsByFreq}
        languageMode={'zh\u2011en'}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText(/漢字 Anki/)).toBeInTheDocument();
  });

  it('shows first character (highest frequency)', () => {
    render(
      <AnkiReview
        dict={mockDict}
        charsByFreq={mockCharsByFreq}
        languageMode={'zh\u2011en'}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('佛')).toBeInTheDocument();
    expect(screen.getByText(/500× no 成實論/)).toBeInTheDocument();
  });

  it('shows NOVO badge for unseen cards', () => {
    render(
      <AnkiReview
        dict={mockDict}
        charsByFreq={mockCharsByFreq}
        languageMode={'zh\u2011en'}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('NOVO')).toBeInTheDocument();
  });

  it('reveals answer on button click', () => {
    render(
      <AnkiReview
        dict={mockDict}
        charsByFreq={mockCharsByFreq}
        languageMode={'zh\u2011en'}
        onClose={mockOnClose}
      />
    );
    const showBtn = screen.getByText(/Mostrar Resposta/);
    fireEvent.click(showBtn);
    expect(screen.getByText('fó')).toBeInTheDocument();
    expect(screen.getByText(/Buddha/)).toBeInTheDocument();
  });

  it('shows grade buttons after revealing answer', () => {
    render(
      <AnkiReview
        dict={mockDict}
        charsByFreq={mockCharsByFreq}
        languageMode={'zh\u2011en'}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByText(/Mostrar Resposta/));
    expect(screen.getAllByText(/Errei/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Difícil/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bom/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Fácil/).length).toBeGreaterThan(0);
  });

  it('advances to next card after grading', () => {
    render(
      <AnkiReview
        dict={mockDict}
        charsByFreq={mockCharsByFreq}
        languageMode={'zh\u2011en'}
        onClose={mockOnClose}
      />
    );
    // Reveal and grade
    fireEvent.click(screen.getByText(/Mostrar Resposta/));
    const bomBtns = screen.getAllByText(/Bom/);
    fireEvent.click(bomBtns[0]);
    // Next card should be '法'
    expect(screen.getByText('法')).toBeInTheDocument();
  });

  it('persists progress to localStorage', () => {
    render(
      <AnkiReview
        dict={mockDict}
        charsByFreq={mockCharsByFreq}
        languageMode={'zh\u2011en'}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByText(/Mostrar Resposta/));
    const bomBtns = screen.getAllByText(/Bom/);
    fireEvent.click(bomBtns[0]);
    const stored = JSON.parse(localStorage.getItem('anki-srs-data') || '{}');
    expect(stored['佛']).toBeDefined();
    expect(stored['佛'].reps).toBe(1);
  });

  it('calls onClose on ✕ click', () => {
    render(
      <AnkiReview
        dict={mockDict}
        charsByFreq={mockCharsByFreq}
        languageMode={'zh\u2011en'}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByText('✕'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows completion message when all cards reviewed', () => {
    // Pre-populate SRS data so all cards are reviewed and not due
    const future = Date.now() + 999999999;
    const srsData = {
      '佛': { interval: 9999, due: future, reps: 5 },
      '法': { interval: 9999, due: future, reps: 5 },
      '僧': { interval: 9999, due: future, reps: 5 },
    };
    localStorage.setItem('anki-srs-data', JSON.stringify(srsData));

    render(
      <AnkiReview
        dict={mockDict}
        charsByFreq={mockCharsByFreq}
        languageMode={'zh\u2011en'}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText(/Parabéns/)).toBeInTheDocument();
  });

  it('shows PT meaning in zh-pt mode', () => {
    render(
      <AnkiReview
        dict={mockDict}
        charsByFreq={mockCharsByFreq}
        languageMode={'zh\u2011pt'}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByText(/Mostrar Resposta/));
    expect(screen.getByText(/Buda/)).toBeInTheDocument();
  });

  it('handles keyboard shortcuts', () => {
    render(
      <AnkiReview
        dict={mockDict}
        charsByFreq={mockCharsByFreq}
        languageMode={'zh\u2011en'}
        onClose={mockOnClose}
      />
    );
    // Space to reveal
    fireEvent.keyDown(window, { key: ' ' });
    expect(screen.getByText('fó')).toBeInTheDocument();
    // '3' to grade Good
    fireEvent.keyDown(window, { key: '3' });
    // Should advance to next card
    expect(screen.getByText('法')).toBeInTheDocument();
  });

  it('Esc key calls onClose', () => {
    render(
      <AnkiReview
        dict={mockDict}
        charsByFreq={mockCharsByFreq}
        languageMode={'zh\u2011en'}
        onClose={mockOnClose}
      />
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalled();
  });
  it('shows review badge for due cards', () => {
    const past = Date.now() - 10000;
    const srsData = {
      '佛': { interval: 10, due: past, reps: 1 },
    };
    localStorage.setItem('anki-srs-data', JSON.stringify(srsData));
    
    render(
      <AnkiReview
        dict={mockDict}
        charsByFreq={mockCharsByFreq}
        languageMode={'zh\u2011en'}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText(/Revisão #2/)).toBeInTheDocument();
  });

  it('shows fallback when character has no dictionary entry', () => {
    render(
      <AnkiReview
        dict={{}} // empty dict
        charsByFreq={[{ char: '無', freq: 1 }]}
        languageMode={'zh\u2011en'}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByText(/Mostrar Resposta/));
    expect(screen.getByText(/Sem entrada no dicionário/)).toBeInTheDocument();
  });

  it('handles Enter to reveal and 1, 2, 4 keyboard shortcuts', () => {
    render(
      <AnkiReview
        dict={mockDict}
        charsByFreq={mockCharsByFreq}
        languageMode={'zh\u2011en'}
        onClose={mockOnClose}
      />
    );
    // Enter to reveal
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(screen.getByText('fó')).toBeInTheDocument();
    
    // 1 to grade Again
    fireEvent.keyDown(window, { key: '1' });
    expect(screen.getByText('法')).toBeInTheDocument();
    
    // Enter to reveal second card
    fireEvent.keyDown(window, { key: 'Enter' });
    // 2 to grade Hard
    fireEvent.keyDown(window, { key: '2' });
    expect(screen.getByText('僧')).toBeInTheDocument();

    // Enter to reveal third card
    fireEvent.keyDown(window, { key: 'Enter' });
    // 4 to grade Easy
    fireEvent.keyDown(window, { key: '4' });
    expect(screen.getByText(/Parabéns/)).toBeInTheDocument();
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('anki-srs-data', 'invalid json {');
    render(
      <AnkiReview
        dict={mockDict}
        charsByFreq={mockCharsByFreq}
        languageMode={'zh\u2011en'}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('佛')).toBeInTheDocument(); // Falls back to empty state
  });
});
