import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import SettingsModal from './SettingsModal';

// Mock export functions
vi.mock('../../export/exportPdf', () => ({
  exportPdf: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../../export/exportEpub', () => ({
  exportEpub: vi.fn().mockResolvedValue(undefined),
}));

import { exportPdf } from '../../export/exportPdf';
import { exportEpub } from '../../export/exportEpub';

const mockDispatch = vi.fn();
const mockClose = vi.fn();
const mockSegments = [
  { id: 'ch-1', content: { zh: '佛', en: 'Buddha', pt: 'Buda' } },
  { id: 'ch-2', content: { zh: '法', en: 'Dharma', pt: 'Dharma' } },
] as any;

describe('SettingsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders export title', () => {
    render(<SettingsModal dispatch={mockDispatch} close={mockClose} segments={mockSegments} />);
    expect(screen.getByText(/Export/)).toBeInTheDocument();
  });

  it('renders PDF buttons', () => {
    render(<SettingsModal dispatch={mockDispatch} close={mockClose} segments={mockSegments} />);
    expect(screen.getByText(/English PDF/)).toBeInTheDocument();
    expect(screen.getByText(/Português PDF/)).toBeInTheDocument();
  });

  it('renders EPUB buttons', () => {
    render(<SettingsModal dispatch={mockDispatch} close={mockClose} segments={mockSegments} />);
    expect(screen.getByText(/English EPUB/)).toBeInTheDocument();
    expect(screen.getByText(/Português EPUB/)).toBeInTheDocument();
  });

  it('calls exportPdf on English PDF click', async () => {
    render(<SettingsModal dispatch={mockDispatch} close={mockClose} segments={mockSegments} />);
    fireEvent.click(screen.getByText(/English PDF/));
    await waitFor(() => {
      expect(exportPdf).toHaveBeenCalledWith(mockSegments, 'en');
    });
  });

  it('calls exportEpub on Português EPUB click', async () => {
    render(<SettingsModal dispatch={mockDispatch} close={mockClose} segments={mockSegments} />);
    fireEvent.click(screen.getByText(/Português EPUB/));
    await waitFor(() => {
      expect(exportEpub).toHaveBeenCalledWith(mockSegments, 'pt');
    });
  });

  it('calls close on Cancel', () => {
    render(<SettingsModal dispatch={mockDispatch} close={mockClose} segments={mockSegments} />);
    fireEvent.click(screen.getByText(/Cancel/));
    expect(mockClose).toHaveBeenCalled();
  });

  it('calls close on backdrop click', () => {
    render(<SettingsModal dispatch={mockDispatch} close={mockClose} segments={mockSegments} />);
    // Click the outer div (backdrop)
    const backdrop = document.querySelector('.fixed.inset-0.z-40') as HTMLElement;
    fireEvent.click(backdrop);
    expect(mockClose).toHaveBeenCalled();
  });

  it('shows exporting state', async () => {
    render(<SettingsModal dispatch={mockDispatch} close={mockClose} segments={mockSegments} />);
    fireEvent.click(screen.getByText(/English PDF/));
    // Should show "Generating" text briefly
    expect(screen.getByText(/Generating/)).toBeInTheDocument();
  });

  it('shows translated chapters count', () => {
    render(<SettingsModal dispatch={mockDispatch} close={mockClose} segments={mockSegments} />);
    expect(screen.getByText(/2 translated chapters/)).toBeInTheDocument();
  });

  it('handles export failure gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    // Make exportPdf throw
    vi.mocked(exportPdf).mockRejectedValueOnce(new Error('Export failed'));
    
    render(<SettingsModal dispatch={mockDispatch} close={mockClose} segments={mockSegments} />);
    fireEvent.click(screen.getByText(/English PDF/));
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Export failed:', expect.any(Error));
      expect(alertSpy).toHaveBeenCalledWith('Export failed. Check console for details.');
      expect(mockClose).toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
    alertSpy.mockRestore();
  });
});
