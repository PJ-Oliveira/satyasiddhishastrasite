import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import App from './App';

describe('App', () => {
  it('renders loading state initially', () => {
    render(<App />);
    expect(screen.getByText(/Loading 成實論/)).toBeInTheDocument();
  });

  it('loads and renders chapter content', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
    });
    // Should show the first chapter's EN text (ZH is split into individual spans)
    expect(screen.getByText(/After the Buddha/)).toBeInTheDocument();
  });

  it('renders the Anki button', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
    });
    expect(screen.getByText(/📚 Anki/)).toBeInTheDocument();
  });

  it('opens Anki modal on button click', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
    });
    const ankiBtn = screen.getByText(/📚 Anki/);
    await userEvent.click(ankiBtn);
    expect(screen.getByText(/漢字 Anki/)).toBeInTheDocument();
  });

  it('navigates to next chapter', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
    });
    // Click next arrow
    const nextBtn = screen.getByText(/Próximo/);
    await userEvent.click(nextBtn);
    // Should now show chapter 2 content (check EN column since ZH is split into spans)
    await waitFor(() => {
      expect(screen.getByText(/The truth of suffering/)).toBeInTheDocument();
    });
  });

  it('shows hanzi tooltip on character click', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
    });
    // Find a Chinese character span and click it
    const charSpans = document.querySelectorAll('span.cursor-pointer');
    expect(charSpans.length).toBeGreaterThan(0);
    fireEvent.click(charSpans[0]);
    // Tooltip should appear
    await waitFor(() => {
      const tooltipEl = document.querySelector('.fixed.z-50');
      expect(tooltipEl).toBeInTheDocument();
    });
  });

  it('renders settings modal when state.overlay is settings', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
    });
    // Click Export button which dispatches SHOW_SETTINGS
    const exportBtn = screen.getByText(/⬇ Export/);
    fireEvent.click(exportBtn);
    
    // Settings modal should render
    expect(screen.getByText(/Export Satyasiddhiśāstra/)).toBeInTheDocument();
    
    // Close modal
    fireEvent.click(screen.getByText(/Cancel/));
    await waitFor(() => {
      expect(screen.queryByText(/Export Satyasiddhiśāstra/)).not.toBeInTheDocument();
    });
  });

  it('renders error state on fetch failure', async () => {
    // Override global fetch just for this test
    const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
    
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Error: Network error/)).toBeInTheDocument();
    });
    
    fetchSpy.mockRestore();
  });

  it('resolves highlights for compound characters when clicked', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
    });
    // Click '涅' which is part of '涅槃'
    const nieSpan = screen.getByText('涅');
    expect(nieSpan).toBeInTheDocument();
    
    // Clicking should set the highlight state for 'Nirvāṇa'
    fireEvent.click(nieSpan);
    
    // We can verify this by checking if a <mark> element wraps the aligned text
    await waitFor(() => {
      const marks = document.querySelectorAll('mark');
      expect(marks.length).toBeGreaterThan(0);
      expect(marks[0].textContent).toContain('nirvāṇa');
    });
  });
});
