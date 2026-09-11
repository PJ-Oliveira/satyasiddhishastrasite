import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Reader from './Reader';
import type { AppState } from '../../types';

const mockDispatch = vi.fn();

const createState = (overrides: Partial<AppState> = {}): AppState => ({
  segments: [
    {
      id: 'ch-1',
      label: '1 具足品 (Complete | Completas)',
      content: { zh: '佛法', en: 'Buddha dharma', pt: 'Buda dharma' },
    },
    {
      id: 'ch-2',
      label: '2 苦諦品 (Suffering | Sofrimento)',
      content: { zh: '苦諦', en: 'Suffering truth', pt: 'Verdade do sofrimento' },
    },
  ] as any,
  currentChapter: 0,
  languageMode: 'zh\u2011en',
  overlay: { type: 'none' },
  hanziDict: {},
  compoundDict: {},
  alignmentDict: {},
  highlightTerms: null,
  ...overrides,
});

describe('Reader', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  it('renders export buttons', () => {
    render(<Reader state={createState()} dispatch={mockDispatch} />);
    expect(screen.getByText(/⬇ Export/)).toBeInTheDocument();
  });

  it('shows chapter label', () => {
    render(<Reader state={createState()} dispatch={mockDispatch} />);
    expect(screen.getByText(/Complete/)).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(<Reader state={createState()} dispatch={mockDispatch} />);
    expect(screen.getByText(/Anterior/)).toBeInTheDocument();
    expect(screen.getByText(/Próximo/)).toBeInTheDocument();
  });

  it('disables "Anterior" on first chapter', () => {
    render(<Reader state={createState()} dispatch={mockDispatch} />);
    const prevBtn = screen.getByText(/Anterior/);
    expect(prevBtn).toBeDisabled();
  });

  it('disables "Próximo" on last chapter', () => {
    render(<Reader state={createState({ currentChapter: 1 })} dispatch={mockDispatch} />);
    const nextBtn = screen.getByText(/Próximo/);
    expect(nextBtn).toBeDisabled();
  });

  it('dispatches GO_TO_CHAPTER on next click', () => {
    render(<Reader state={createState()} dispatch={mockDispatch} />);
    fireEvent.click(screen.getByText(/Próximo/));
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'GO_TO_CHAPTER', payload: 1 });
  });



  it('shows chapter counter', () => {
    render(<Reader state={createState()} dispatch={mockDispatch} />);
    expect(screen.getByText(/1.*\/.*2/)).toBeInTheDocument();
  });

  it('renders two columns', () => {
    render(<Reader state={createState()} dispatch={mockDispatch} />);
    expect(screen.getByText('Buddha dharma')).toBeInTheDocument();
  });

  it('switches to PT column in zh-pt mode', () => {
    render(<Reader state={createState({ languageMode: 'zh\u2011pt' })} dispatch={mockDispatch} />);
    expect(screen.getByText('Buda dharma')).toBeInTheDocument();
  });

  it('renders en-pt mode correctly', () => {
    const enPtState = { ...createState({ languageMode: 'en\u2011pt' }) };
    render(<Reader state={enPtState} dispatch={mockDispatch} />);
    expect(screen.getByText('Buda dharma')).toBeInTheDocument();
  });
});
