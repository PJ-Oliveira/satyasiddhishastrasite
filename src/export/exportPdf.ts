import jsPDF from 'jspdf';
import { TextSegment } from '../types';

/**
 * Sanitize text for jsPDF default font (Helvetica).
 * Replaces diacritics with ASCII equivalents.
 */
function sanitize(text: string): string {
  const map: Record<string, string> = {
    'ā': 'a', 'ī': 'i', 'ū': 'u', 'ś': 's', 'ṣ': 's', 'ṃ': 'm',
    'ṇ': 'n', 'ṭ': 't', 'ḍ': 'd', 'ḥ': 'h', 'ñ': 'n', 'ṅ': 'n',
    'Ā': 'A', 'Ī': 'I', 'Ū': 'U', 'Ś': 'S', 'Ṣ': 'S', 'Ṃ': 'M',
    'Ṇ': 'N', 'Ṭ': 'T', 'Ḍ': 'D', 'Ḥ': 'H', 'Ñ': 'N', 'Ṅ': 'N',
    'ã': 'a', 'õ': 'o', 'é': 'e', 'ê': 'e', 'á': 'a', 'à': 'a',
    'ó': 'o', 'ô': 'o', 'í': 'i', 'ú': 'u', 'ç': 'c',
    'É': 'E', 'Ê': 'E', 'Á': 'A', 'À': 'A', 'Ó': 'O', 'Ô': 'O',
    'Í': 'I', 'Ú': 'U', 'Ç': 'C', 'Ã': 'A', 'Õ': 'O',
    '\u2011': '-', '\u2014': '-', '\u2013': '-',
    '\u201c': '"', '\u201d': '"', '\u2018': "'", '\u2019': "'",
    '\u2026': '...', '\u00b7': '.', '\u00d7': 'x',
  };
  // Remove CJK characters entirely
  let result = '';
  for (const ch of text) {
    if (map[ch]) {
      result += map[ch];
    } else if (ch.charCodeAt(0) >= 0x4e00 && ch.charCodeAt(0) <= 0x9fff) {
      /* v8 ignore next 2 */
      // Skip CJK
      continue;
    } else if (ch.charCodeAt(0) > 0x7e && ch.charCodeAt(0) < 0x100) {
      /* v8 ignore next 2 */
      // Latin extended - try to keep
      result += ch;
    } else if (ch.charCodeAt(0) > 0xff) {
      /* v8 ignore next 2 */
      // Other Unicode - replace with ?
      result += '';
    } else {
      result += ch;
    }
  }
  return result;
}

/** Extract the EN or PT part from a trilingual label */
function cleanLabel(label: string, language: 'en' | 'pt'): string {
  // Format: "1 具足品 (The Complete Qualities | Qualidades Completas)"
  const m = label.match(/^(\d+)\s+[^\(]*\(([^|]+)\|([^)]+)\)/);
  if (m) {
    const num = m[1];
    const en = m[2].trim();
    const pt = m[3].trim();
    return `Chapter ${num}: ${language === 'en' ? en : pt}`;
  }
  // Fallback: strip CJK
  return sanitize(label);
}

export async function exportPdf(
  segments: readonly TextSegment[],
  language: 'en' | 'pt'
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15; // 1.5 cm margins
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = 7.5;
  const footerY = pageHeight - 10;

  // Use a single font throughout
  doc.setFont('helvetica', 'normal');

  // ───── TITLE PAGE ─────
  doc.setFontSize(28);
  const mainTitle = language === 'en'
    ? 'Treatise on the Realization of Truth'
    : 'Tratado da Realizacao da Verdade';
  const titleLines = doc.splitTextToSize(mainTitle, maxWidth);
  doc.text(titleLines, pageWidth / 2, 55, { align: 'center' });

  doc.setFontSize(14);
  doc.text('Satyasiddhistra (Chengshilun)', pageWidth / 2, 80, { align: 'center' });

  doc.setFontSize(11);
  doc.text('by Harivarman', pageWidth / 2, 92, { align: 'center' });

  doc.setFontSize(10);
  const translator = language === 'en'
    ? 'Translated from Chinese by Kumarajiva'
    : 'Traduzido do Chines por Kumarajiva';
  doc.text(translator, pageWidth / 2, 104, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`${segments.length} chapters`, pageWidth / 2, 120, { align: 'center' });

  // ───── TABLE OF CONTENTS ─────
  doc.addPage();
  let y = margin + 10;
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const tocTitle = language === 'en' ? 'Table of Contents' : 'Indice';
  doc.text(tocTitle, margin, y);
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);

  // Track TOC entries to add links/page numbers later
  const tocEntries: { label: string; tocPage: number; x: number; y: number; targetPage: number }[] = [];
  
  for (const seg of segments) {
    const content = seg.content[language];
    if (!content || content.includes('nao disponivel')) continue;
    
    const label = cleanLabel(seg.label ?? seg.id, language);
    
    if (y > pageHeight - margin - 15) {
      doc.addPage();
      y = margin + 10;
    }
    
    // Split long TOC labels
    const splitLabel = doc.splitTextToSize(label, maxWidth - 20);
    
    tocEntries.push({
      label: splitLabel[0], // link the first line
      tocPage: (doc.internal as any).getNumberOfPages(),
      x: margin,
      y: y,
      targetPage: 0
    });
    
    doc.text(splitLabel, margin, y);
    y += splitLabel.length * 6 + 2;
  }

  // ───── CHAPTER CONTENT ─────
  let validSegIndex = 0;
  for (const seg of segments) {
    const content = seg.content[language];
    if (!content || content.includes('nao disponivel')) continue;

    doc.addPage();
    const targetPage = (doc.internal as any).getNumberOfPages();
    
    if (validSegIndex < tocEntries.length) {
      tocEntries[validSegIndex].targetPage = targetPage;
    }
    validSegIndex++;

    y = margin + 10;

    // Chapter title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    const chTitle = cleanLabel(seg.label ?? seg.id, language);
    const titleWrapped = doc.splitTextToSize(chTitle, maxWidth);
    doc.text(titleWrapped, margin, y);
    y += titleWrapped.length * 8 + 4;

    // Horizontal rule
    doc.setDrawColor(180);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Body text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14); // Font size 14 as requested
    const cleanContent = sanitize(content);
    const paragraphs = cleanContent.split('\n\n');

    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;

      const lines = doc.splitTextToSize(trimmed, maxWidth);
      for (const line of lines) {
        if (y > footerY - 10) {
          doc.addPage();
          y = margin + 10;
          doc.setFontSize(14);
        }
        doc.text(line, margin, y);
        y += lineHeight;
      }
      y += 4; // Paragraph spacing
    }
  }

  // ───── BACKFILL TOC LINKS & PAGE NUMBERS ─────
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 255); // Blue links
  for (const entry of tocEntries) {
    if (entry.targetPage === 0) continue;
    doc.setPage(entry.tocPage);
    // Draw page number
    doc.text(String(entry.targetPage), pageWidth - margin, entry.y, { align: 'right' });
    // Add invisible clickable link over the text
    doc.textWithLink(entry.label, entry.x, entry.y, { pageNumber: entry.targetPage });
  }

  // Add footers to all pages
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(mainTitle, pageWidth / 2, footerY, { align: 'center' });
    doc.text(String(i), pageWidth - margin, footerY, { align: 'right' });
  }

  const filename = language === 'en'
    ? 'Treatise-on-the-Realization-of-Truth-English.pdf'
    : 'Tratado-da-Realizacao-da-Verdade-Portugues.pdf';
  doc.save(filename);
}
