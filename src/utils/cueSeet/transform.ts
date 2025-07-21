import { CueRow } from './types';

export function parseSoundmouseText(
  rawText: string,
  fileName: string
): { rows: CueRow[]; warnings: string[] } {
  const cueHeaderPatter =
    /.*\s+\d+\s+of\s+\d+\s+Status:\s+.*\s+Usage\s+Duration/;
  const cuePagePattern =
    /.*\d+\s+of\s+\d+\s+#\s+Reel\s+No\s+Cue\s+Title\s+Role\s+Name\s+Society\s+Usage\s+Duration/g;
  const cueKeyPattern = /Total\s+Duration.*\n.*/;
  let sanitizedText = rawText.replace(cueHeaderPatter, '');
  sanitizedText = sanitizedText.replaceAll(cuePagePattern, '');
  sanitizedText = sanitizedText.replace(cueKeyPattern, '');

  const cueHeaderRegex =
    /\s(\d{1,3})\s{3}(?:\b\d+M\d+[A-Za-z]*\b\s+)?(.*?)\s+((?:[A-Z]{2})(?:\s*\/\s*[A-Z]{1,2})?)\s+(?:\d{2}:)?(\d{2}:\d{2})/g;

  // /\s(\d{1,3})\s{3}(?:\b\d+M\d+[A-Za-z]*\b)?(.*?)\s+(BI|BV|VI|VV|OT|CT|MT|ET|EE)(?:\s?\/\s?L)?\s{3}(?:\d{2}:)?(\d{2}:\d{2})/g;

  const blocks: {
    sequenceNumber: string;
    workTitle: string;
    usage: string;
    duration: string;
    start: number;
    end: number;
  }[] = [];

  let match: RegExpExecArray | null;
  while ((match = cueHeaderRegex.exec(sanitizedText)) !== null) {
    blocks.push({
      sequenceNumber: match[1],
      workTitle: match[2].replace(/\s+/g, ' ').trim(),
      usage: match[3].replace(/\s+/g, ' ').trim(),
      duration: match[4].trim(),
      start: match.index,
      end: 0,
    });
  }

  for (let i = 0; i < blocks.length; i++) {
    blocks[i].end =
      i < blocks.length - 1 ? blocks[i + 1].start : sanitizedText.length;
  }

  const rows: CueRow[] = [];

  for (const block of blocks) {
    const chunk = sanitizedText.slice(block.start, block.end);
    const roleBlockRegex =
      /\s(C|CA|A|AR|PD|E)\s{3}.*?(?=(?:\s(C|CA|A|AR|PD|E)\s{3})|$)/gs;
    const detailLines = [...chunk.matchAll(roleBlockRegex)].map(
      (m) => `${m[1]}   ${m[0].slice(m[1].length + 3).trim()}`
    );
    const composers = detailLines
      .filter(
        (line) =>
          line.startsWith('C') ||
          line.startsWith('CA') ||
          line.startsWith('A') ||
          line.startsWith('AR') ||
          line.startsWith('PD')
      )
      .map((line) => {
        const composerMatch = line.match(
          /^(C|CA|A|AR|PD)\s+(.*?)\s+(?:(non-affiliated|[a-zA-Z]{2,7})(?:\s+\[(\d+.?\d+%)\])?)?$/u
        );
        // Handle fallback case if name ends with PRO-like word
        if (!composerMatch) return null;
        return {
          role: composerMatch[1],
          name: composerMatch[2].replace(/\s+/g, ' ').trim(),
          pro: composerMatch[3],
          contribution: composerMatch[4] ?? '', // optional
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);

    const publishers = detailLines
      .filter(
        (line) =>
          line.startsWith('E') ||
          line.startsWith('SE') ||
          line.startsWith('A') ||
          line.startsWith('AR')
      )
      .map((line) => {
        const pubMatch = line.match(
          /^E\s{3}(.+?)\s+([a-zA-Z]{2,7})(?:\s+\[(\d+%)\])/u
        );

        // Handle fallback case if name ends with PRO-like word
        if (!pubMatch) {
          // Try to split and assume last token is PRO
          const fallback = line
            .replace(/^E\s{3}/, '')
            .trim()
            .split(/\s+/);
          if (fallback.length >= 2) {
            const pro = fallback.pop()!;
            const name = fallback.join(' ').replace(/\s+/g, ' ').trim();
            return `${name} - ${pro}`;
          }
          return null;
        }

        let name = pubMatch[1].replace(/\s+/g, ' ').trim();
        name = pubMatch[1].replace(/,/g, ' ').trim();
        const pro = pubMatch[2];
        const share = pubMatch[3] ?? '';

        return `${name} - ${pro}${share ? ` - ${share}` : ''}`;
      })
      .filter((p): p is string => p !== null);

    rows.push({
      fileName,
      sequenceNumber: block.sequenceNumber,
      workTitle: block.workTitle,
      usage: block.usage,
      duration: block.duration,
      publishers: publishers.join(', '),
      writers: composers,
    });
  }

  const validate = true;
  const warnings: string[] = [];
  if (validate) {
    rows.forEach((row, i) => {
      const expectedSeq = String(i + 1);
      if (row.sequenceNumber !== expectedSeq) {
        warnings.push(
          `<span class="text-yellow-700 font-semibold">[WARN]</span> Expected sequence number <span class="text-blue-600 font-semibold">
          ${expectedSeq}
          </span>, got 
          <span class="text-red-600 font-semibold">${row.sequenceNumber}</span> 
          <span class="font-mono text-gray-600">(${row.fileName})</span>`
        );
      }

      const parsePct = (s: string) => {
        const match = s.match(/(\d+.?\d+)%/);
        return match ? parseFloat(match[1]) : null;
      };

      const composerTotal = row.writers.reduce((acc, w) => {
        const pct = parsePct(w.contribution);
        if (pct === null) {
          warnings.push(
            `<span class="text-yellow-700 font-semibold">[WARN]</span>
            Missing composer percentage: 
            <span class="text-gray-800 dark:text-white font-semibold">"${w.name}"</span> 
            in seq <span class="text-blue-600 font-semibold">${row.sequenceNumber}</span> 
            <span class="font-mono text-gray-600">(${row.fileName})</span>`
          );
        }
        return acc + (pct ?? 0);
      }, 0);

      if (composerTotal !== 100) {
        warnings.push(
          `<span class="text-yellow-700 font-semibold">[WARN]</span> 
          Composer percentages for seq 
          <span class="text-blue-600 font-semibold">${row.sequenceNumber}</span> 
          do not sum to 100: got 
          <span class="text-red-600 font-semibold">${composerTotal}%</span>
          <span class="font-mono text-gray-600">(${row.fileName})</span>`
        );
      }

      const publisherTotal = row.publishers.split(',').reduce((acc, pubStr) => {
        const pct = parsePct(pubStr);
        if (pct === null) {
          warnings.push(
            `<span class="text-yellow-700 font-semibold">[WARN]</span> 
            Missing publisher percentage in: 
            (seq <span class="text-blue-600 font-semibold">${row.sequenceNumber}</span>)
            <span class="font-mono text-gray-600">(${row.fileName})</span>`
          );
        }
        return acc + (pct ?? 0);
      }, 0);

      if (publisherTotal !== 100) {
        warnings.push(
          `<span class="text-yellow-700 font-semibold">[WARN]</span> 
          Publisher percentages for seq 
          <span class="text-blue-600 font-semibold">${row.sequenceNumber}</span> 
          do not sum to 100: got <span class="text-red-600 font-semibold">${publisherTotal}%</span>
          <span class="font-mono text-gray-600">(${row.fileName})</span>`
        );
      }
    });
  }

  return { rows, warnings };
}
