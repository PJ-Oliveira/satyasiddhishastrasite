import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import HanziTooltip from './HanziTooltip';

const mockClose = vi.fn();

const mockDict = {
  '佛': { en: 'Buddha, the Awakened One', pt: 'Buda, o Desperto', py: 'fó' },
  '法': { en: 'dharma, teaching', pt: 'dharma, ensinamento', py: 'fǎ' },
};

const mockCompounds = {
  '佛法': { en: 'Buddha-dharma, the teaching of the Buddha', pt: 'Buddha-dharma, o ensinamento do Buda' },
  '佛陀': { en: 'Buddha (full transliteration)', pt: 'Buda (transliteração completa)' },
};

describe('HanziTooltip', () => {
  beforeEach(() => {
    mockClose.mockClear();
  });

  it('displays character prominently', () => {
    render(
      <HanziTooltip
        char="佛"
        position={{ x: 200, y: 200 }}
        dict={mockDict}
        compoundDict={mockCompounds}
        languageMode={'zh\u2011en'}
        close={mockClose}
      />
    );
    expect(screen.getByText('佛')).toBeInTheDocument();
  });

  it('shows pinyin when available', () => {
    render(
      <HanziTooltip
        char="佛"
        position={{ x: 200, y: 200 }}
        dict={mockDict}
        compoundDict={mockCompounds}
        languageMode={'zh\u2011en'}
        close={mockClose}
      />
    );
    expect(screen.getByText('fó')).toBeInTheDocument();
  });

  it('shows EN meaning in zh-en mode', () => {
    render(
      <HanziTooltip
        char="佛"
        position={{ x: 200, y: 200 }}
        dict={mockDict}
        compoundDict={mockCompounds}
        languageMode={'zh\u2011en'}
        close={mockClose}
      />
    );
    expect(screen.getByText(/Buddha, the Awakened One/)).toBeInTheDocument();
  });

  it('shows PT meaning in zh-pt mode', () => {
    render(
      <HanziTooltip
        char="佛"
        position={{ x: 200, y: 200 }}
        dict={mockDict}
        compoundDict={mockCompounds}
        languageMode={'zh\u2011pt'}
        close={mockClose}
      />
    );
    expect(screen.getByText(/Buda, o Desperto/)).toBeInTheDocument();
  });

  it('shows related compounds', () => {
    render(
      <HanziTooltip
        char="佛"
        position={{ x: 200, y: 200 }}
        dict={mockDict}
        compoundDict={mockCompounds}
        languageMode={'zh\u2011en'}
        close={mockClose}
      />
    );
    expect(screen.getByText(/Compostos frequentes/)).toBeInTheDocument();
    expect(screen.getByText('佛法')).toBeInTheDocument();
    expect(screen.getByText('佛陀')).toBeInTheDocument();
  });

  it('shows fallback for unknown character', () => {
    render(
      <HanziTooltip
        char="龘"
        position={{ x: 200, y: 200 }}
        dict={mockDict}
        compoundDict={mockCompounds}
        languageMode={'zh\u2011en'}
        close={mockClose}
      />
    );
    expect(screen.getByText(/Caractere sem entrada/)).toBeInTheDocument();
  });

  it('calls close on backdrop click', () => {
    render(
      <HanziTooltip
        char="佛"
        position={{ x: 200, y: 200 }}
        dict={mockDict}
        compoundDict={mockCompounds}
        languageMode={'zh\u2011en'}
        close={mockClose}
      />
    );
    // Click the backdrop (first fixed inset-0 div)
    const backdrop = document.querySelector('.fixed.inset-0.z-40') as HTMLElement;
    fireEvent.click(backdrop);
    expect(mockClose).toHaveBeenCalled();
  });

  it('calls close on × button click', () => {
    render(
      <HanziTooltip
        char="佛"
        position={{ x: 200, y: 200 }}
        dict={mockDict}
        compoundDict={mockCompounds}
        languageMode={'zh\u2011en'}
        close={mockClose}
      />
    );
    const closeBtn = screen.getByText('×');
    fireEvent.click(closeBtn);
    expect(mockClose).toHaveBeenCalled();
  });
});
