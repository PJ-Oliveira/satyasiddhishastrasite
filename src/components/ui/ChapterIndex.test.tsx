import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ChapterIndex from './ChapterIndex';

const mockSegments = [
  { id: 'ch-1', label: '1 具足品 (The Complete Qualities | Qualidades Completas)', content: { zh: '', en: '', pt: '' } },
  { id: 'ch-2', label: '2 苦諦品 (Truth of Suffering | Verdade do Sofrimento)', content: { zh: '', en: '', pt: '' } },
  { id: 'ch-3', label: '3 集諦品 (Truth of Arising | Verdade da Originação)', content: { zh: '', en: '', pt: '' } },
] as any;

const mockOnSelect = vi.fn();

describe('ChapterIndex', () => {
  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('renders when open', () => {
    render(
      <ChapterIndex
        segments={mockSegments}
        onSelect={mockOnSelect}
        isOpen={true}
        onToggle={() => {}}
      />
    );
    expect(screen.getByText(/Índice/)).toBeInTheDocument();
  });

  it('lists all chapters', () => {
    render(
      <ChapterIndex
        segments={mockSegments}
        onSelect={mockOnSelect}
        isOpen={true}
        onToggle={() => {}}
      />
    );
    expect(screen.getByText(/具足品/)).toBeInTheDocument();
    expect(screen.getByText(/苦諦品/)).toBeInTheDocument();
    expect(screen.getByText(/集諦品/)).toBeInTheDocument();
  });

  it('calls onSelect when chapter clicked', () => {
    render(
      <ChapterIndex
        segments={mockSegments}
        onSelect={mockOnSelect}
        isOpen={true}
        onToggle={() => {}}
      />
    );
    fireEvent.click(screen.getByText(/苦諦品/));
    expect(mockOnSelect).toHaveBeenCalledWith('ch-2');
  });

  it('filters chapters by search', () => {
    render(
      <ChapterIndex
        segments={mockSegments}
        onSelect={mockOnSelect}
        isOpen={true}
        onToggle={() => {}}
      />
    );
    const searchInput = screen.getByPlaceholderText(/Search chapters/i);
    fireEvent.change(searchInput, { target: { value: '苦' } });
    expect(screen.getByText(/苦諦品/)).toBeInTheDocument();
    expect(screen.queryByText(/集諦品/)).not.toBeInTheDocument();
  });

  it('shows empty message when search yields no results', () => {
    render(
      <ChapterIndex
        segments={mockSegments}
        isOpen={true}
        onSelect={mockOnSelect}
        onToggle={() => {}}
      />
    );
    const searchInput = screen.getByPlaceholderText(/Search chapters/i);
    fireEvent.change(searchInput, { target: { value: 'zzzzzz' } });
    expect(screen.getByText(/No chapters found/)).toBeInTheDocument();
  });
});
