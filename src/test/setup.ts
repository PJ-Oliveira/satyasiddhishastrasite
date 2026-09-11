import '@testing-library/jest-dom';

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true });

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch for data files
const mockCorpus = {
  segments: [
    {
      id: 'ch-1',
      label: '1 具足品 (The Complete Qualities | Qualidades Completas)',
      content: {
        zh: '佛滅度後。弟子問曰：一切法中何法為實？答曰：涅槃。因緣眾生煩惱無明。',
        en: 'After the Buddha\'s parinirvāṇa, a disciple asked: "Among all dharmas, which dharma is real?" In reply: "Nirvāṇa. Causes and conditions, sentient beings, afflictions, ignorance."',
        pt: 'Após o parinirvāṇa do Buda, um discípulo perguntou: "Entre todos os dharmas, qual dharma é real?" Em resposta: "Nirvāṇa. Causas e condições, seres sencientes, aflições, ignorância."',
      },
    },
    {
      id: 'ch-2',
      label: '2 苦諦品 (Truth of Suffering | Verdade do Sofrimento)',
      content: {
        zh: '苦諦者。問曰：云何苦諦？答曰：生老病死。是故名為苦。',
        en: 'The truth of suffering. Question: "How is the truth of suffering?" In reply: "Birth, old age, sickness, and death. Therefore it is called suffering."',
        pt: 'A verdade do sofrimento. Pergunta: "Como é a verdade do sofrimento?" Em resposta: "Nascimento, velhice, doença e morte. Portanto é chamado sofrimento."',
      },
    },
  ],
};

const mockDict: Record<string, { en: string; pt: string; py?: string }> = {
  '佛': { en: 'Buddha', pt: 'Buda', py: 'fó' },
  '法': { en: 'dharma', pt: 'dharma', py: 'fǎ' },
  '問': { en: 'to ask, question', pt: 'perguntar, questão', py: 'wèn' },
  '答': { en: 'to answer, reply', pt: 'responder, resposta', py: 'dá' },
  '曰': { en: 'to say (classical)', pt: 'dizer (clássico)', py: 'yuē' },
  '涅': { en: 'nirvāṇa (prefix)', pt: 'nirvāṇa (prefixo)', py: 'niè' },
  '槃': { en: 'nirvāṇa (suffix)', pt: 'nirvāṇa (sufixo)', py: 'pán' },
  '苦': { en: 'suffering, duḥkha', pt: 'sofrimento, duḥkha', py: 'kǔ' },
};

const mockCompounds: Record<string, { en: string; pt: string }> = {
  '答曰': { en: '"In reply:" (response marker)', pt: '"Em resposta:" (marcador de resposta)' },
  '問曰': { en: '"Question:" (question marker)', pt: '"Pergunta:" (marcador de pergunta)' },
  '涅槃': { en: 'nirvāṇa, cessation', pt: 'nirvāṇa, cessação' },
};

const mockAlignments: Record<string, { en: string[]; pt: string[] }> = {
  '佛': { en: ['Buddha'], pt: ['Buda'] },
  '涅槃': { en: ['nirvāṇa', 'Nirvāṇa'], pt: ['nirvāṇa', 'Nirvāṇa'] },
  '答曰': { en: ['In reply'], pt: ['Em resposta'] },
  '問曰': { en: ['Question:'], pt: ['Pergunta:'] },
  '苦': { en: ['suffering'], pt: ['sofrimento'] },
};

global.fetch = vi.fn((url: string) => {
  let data: unknown;
  if (url.includes('corpus.json')) data = mockCorpus;
  else if (url.includes('hanzi_dict.json')) data = mockDict;
  else if (url.includes('compounds.json')) data = mockCompounds;
  else if (url.includes('alignments.json')) data = mockAlignments;
  else return Promise.resolve({ ok: false, status: 404 } as Response);

  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
  } as Response);
}) as unknown as typeof fetch;

export { mockCorpus, mockDict, mockCompounds, mockAlignments };
