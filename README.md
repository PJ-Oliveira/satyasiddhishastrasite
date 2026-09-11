# Satyasiddhiśāstra (成實論) — Treatise on the Realization of Truth

An interactive, trilingual (Chinese, English, Portuguese) web application dedicated to the study and philological analysis of the **Satyasiddhiśāstra** (Chengshilun / 成實論), authored by Harivarman and translated by Kumārajīva.

This platform is engineered to provide an exact, rigorous reading experience aligned with the Abhidharmika and Sautrantika philosophical traditions.

Read this in [Português](README.pt.md).

## 🌟 Key Features

### 📖 Trilingual Interactive Reading
* Read the classical Buddhist Chinese text alongside its English or Portuguese translations.
* **Language Modes:** Seamlessly toggle between 中文/English, 中文/Português, and English/Português.
* **Chapter Pagination:** Efficient navigation displaying one chapter at a time to ensure optimal performance, equipped with a comprehensive chapter index and intuitive navigation arrows.

### 🔍 Advanced Philological Dictionary
* **100% Corpus Coverage:** Every single character (*hanzi*) in the treatise has been mapped and translated.
* **Interactive Tooltips:** Click on any Chinese character to open a tooltip displaying its English and Portuguese meaning, Pinyin pronunciation, and relevant Sanskrit/Pāli equivalents.
* **Compound Semantics:** Automatically detects when a character functions within a compound (e.g., 答曰, 涅槃, 煩惱) and provides the precise contextual meaning within the exact same tooltip.

### ✨ Bidirectional Semantic Alignment
* **Exact Highlighting:** Clicking on a character or a compound not only opens the dictionary but also highlights the exact corresponding translation in the English or Portuguese column.
* **Rigorous Matching:** The visual alignment operates under strict philological conditions. It highlights terms only when the alignment between the original text and the translation is exact and unquestionable.

### 🧠 Anki-style Memorization System (SRS)
* Built-in Spaced Repetition System (SRS) replicating the mechanics of Anki.
* Focuses on memorizing the characters of the treatise.
* **Frequency-Based Ordering:** Cards are introduced based on their exact frequency of occurrence in the *Satyasiddhiśāstra* corpus (descending order).
* Stores study progress persistently in the browser's `localStorage`.
* Supports keyboard shortcuts (Space to reveal, 1-4 for grading, Esc to exit).

### 📥 Export Capabilities
* **PDF Export:** Generate sanitized PDF documents formatted with generous 1.5cm margins, highly legible 14pt fonts, footer pagination, and a fully interactive/clickable Table of Contents.
* **EPUB Export:** Download fully structured EPUB3 files, complete with a native interactive Table of Contents connecting to all chapters, styled with the platform's color scheme for offline reading.

## 🛠️ Technical Architecture

This is a modern Single Page Application (SPA) built with performance and maintainability in mind.

* **Frontend:** React 18, TypeScript, Vite.
* **Styling:** Tailwind CSS (Custom Cream `#FBF5E6` and Brown `#3B2714` typography).
* **State Management:** React `useReducer` for predictable state transitions.
* **Testing:** Vitest with `@testing-library/react`. Achieves an exceptional **>98.5% Code Coverage**.
* **CI/CD:** Automated GitHub Actions pipeline for continuous integration and deterministic deployment to GitHub Pages.

### Project Structure
```
src/
├── components/
│   ├── layout/      # Core layout (App, Reader)
│   ├── ui/          # Reusable UI components (Column, HanziTooltip, ChapterIndex)
│   └── features/    # Complex features (AnkiReview, SettingsModal)
├── store/           # Reducer and actions
├── export/          # PDF and EPUB generation logic (jsPDF, jszip)
├── types/           # TypeScript interfaces
├── styles/          # Tailwind entrypoint
└── test/            # Vitest setup and mocks
```

## 🚀 Getting Started

### Prerequisites
* Node.js (v20+ recommended)
* npm

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd satyasiddhishastrasite
   ```
2. Install dependencies (requires legacy-peer-deps due to specific library combinations):
   ```bash
   npm install --legacy-peer-deps
   ```

### Development
Start the local Vite development server:
```bash
npm run dev
```

### Testing
Run the test suite:
```bash
npm test
```
Generate test coverage report:
```bash
npm run test:coverage
```

### Build for Production
Generate the static artifact in the `dist/` directory:
```bash
npm run build
```

## 🔄 CI/CD Pipeline
This project is configured with GitHub Actions. Any push or pull request merge to the `main` branch automatically triggers the `.github/workflows/deploy.yml` pipeline. It performs type-checking, rigorous testing with coverage, builds the artifact, and automatically deploys to **GitHub Pages**.

## 🙏 Acknowledgements

This work was only made possible through the inspiring lectures and years of profound study with my Teacher of *Abhidharma* and *Vipassana* (discernment) concerning Harivarman's *Satyasiddhiśāstra* (*Chengshilun*), **Sensei Joaquim Monteiro**. My deepest gratitude for his patience, wisdom, and the faithful transmission of the Dharma.


## 📜 License
*Treatise on the Realization of Truth* (Satyasiddhiśāstra).
Translations and interactive platform.
