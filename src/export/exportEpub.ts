import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { TextSegment } from '../types';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Extract the EN or PT part from a trilingual label */
function cleanLabel(label: string, language: 'en' | 'pt'): string {
  const m = label.match(/^(\d+)\s+([^\(]*)\(([^|]+)\|([^)]+)\)/);
  if (m) {
    const num = m[1];
    const zh = m[2].trim();
    const en = m[3].trim();
    const pt = m[4].trim();
    return language === 'en'
      ? `${num}. ${zh} — ${en}`
      : `${num}. ${zh} — ${pt}`;
  }
  return label;
}

function textToXhtml(text: string): string {
  const paragraphs = text.split('\n\n').filter((p) => p.trim());
  return paragraphs
    .map((p) => `<p>${escapeXml(p.trim()).replace(/\n/g, '<br/>')}</p>`)
    .join('\n');
}

export async function exportEpub(
  segments: readonly TextSegment[],
  language: 'en' | 'pt'
) {
  const zip = new JSZip();
  const bookTitle = language === 'en'
    ? 'Treatise on the Realization of Truth'
    : 'Tratado da Realização da Verdade';
  const author = 'Harivarman';
  const translator = language === 'en' ? 'Kumārajīva' : 'Kumārajīva';

  // mimetype (uncompressed)
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // META-INF/container.xml
  zip.file(
    'META-INF/container.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  );

  // CSS
  zip.file(
    'OEBPS/style.css',
    `body { font-family: "Noto Serif", Georgia, serif; line-height: 1.7; margin: 1em; color: #3B2714; background: #FBF5E6; }
h1 { text-align: center; font-size: 1.8em; margin: 2em 0 0.5em; color: #3B2714; }
h2 { font-size: 1.2em; margin: 1.5em 0 0.5em; border-bottom: 1px solid #D4C5A0; padding-bottom: 0.3em; color: #5A3A1A; }
p { text-align: justify; margin: 0.5em 0; text-indent: 1.5em; }
.subtitle { text-align: center; font-size: 0.9em; color: #5A3A1A; margin: 0.5em 0; }
.separator { text-align: center; margin: 1em 0; color: #8B7355; }
nav ol { list-style-type: none; padding-left: 0; }
nav li { margin: 0.3em 0; }
nav a { text-decoration: none; color: #3B2714; }
nav a:hover { text-decoration: underline; }`
  );

  // Filter valid chapters
  const validSegs = segments.filter(
    (s) => s.content[language] && !s.content[language].includes('não disponível')
  );

  // Generate chapter files
  const chapterFiles: { id: string; href: string; title: string }[] = [];

  // Title page
  zip.file(
    'OEBPS/title.xhtml',
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${language}">
<head><title>${escapeXml(bookTitle)}</title><link rel="stylesheet" href="style.css"/></head>
<body>
  <h1>${escapeXml(bookTitle)}</h1>
  <p class="subtitle">成實論 — Satyasiddhiśāstra</p>
  <p class="subtitle">${escapeXml(author)}</p>
  <p class="subtitle">${language === 'en' ? 'Translated by' : 'Traduzido por'} ${escapeXml(translator)}</p>
  <p class="separator">⁂</p>
  <p class="subtitle">${validSegs.length} ${language === 'en' ? 'chapters' : 'capítulos'}</p>
</body>
</html>`
  );
  chapterFiles.push({ id: 'title', href: 'title.xhtml', title: bookTitle });

  // Chapters
  for (let i = 0; i < validSegs.length; i++) {
    const seg = validSegs[i];
    const label = cleanLabel(seg.label ?? `Chapter ${i + 1}`, language);
    const filename = `ch${String(i + 1).padStart(3, '0')}.xhtml`;
    const body = textToXhtml(seg.content[language]);

    zip.file(
      `OEBPS/${filename}`,
      `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${language}">
<head><title>${escapeXml(label)}</title><link rel="stylesheet" href="style.css"/></head>
<body>
  <h2>${escapeXml(label)}</h2>
  ${body}
</body>
</html>`
    );
    chapterFiles.push({ id: `ch${i + 1}`, href: filename, title: label });
  }

  // nav.xhtml (TOC)
  const navItems = chapterFiles
    .map((ch) => `    <li><a href="${ch.href}">${escapeXml(ch.title)}</a></li>`)
    .join('\n');
  zip.file(
    'OEBPS/nav.xhtml',
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${language}">
<head><title>Table of Contents</title><link rel="stylesheet" href="style.css"/></head>
<body>
  <nav epub:type="toc">
    <h1>${language === 'en' ? 'Table of Contents' : 'Índice'}</h1>
    <ol>
${navItems}
    </ol>
  </nav>
</body>
</html>`
  );

  // content.opf
  const manifestItems = chapterFiles
    .map((ch) => `    <item id="${ch.id}" href="${ch.href}" media-type="application/xhtml+xml"/>`)
    .join('\n');
  const spineItems = chapterFiles
    .map((ch) => `    <itemref idref="${ch.id}"/>`)
    .join('\n');

  zip.file(
    'OEBPS/content.opf',
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:satyasiddhi-${language}-${Date.now()}</dc:identifier>
    <dc:title>${escapeXml(bookTitle)}</dc:title>
    <dc:creator>${escapeXml(author)}</dc:creator>
    <dc:language>${language}</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString().split('.')[0]}Z</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="css" href="style.css" media-type="text/css"/>
${manifestItems}
  </manifest>
  <spine>
    <itemref idref="nav"/>
${spineItems}
  </spine>
</package>`
  );

  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
  const filename = language === 'en'
    ? 'Treatise-on-the-Realization-of-Truth-English.epub'
    : 'Tratado-da-Realizacao-da-Verdade-Portugues.epub';
  saveAs(blob, filename);
}
