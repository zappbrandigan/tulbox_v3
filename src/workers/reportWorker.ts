/// <reference lib="webworker" />
import { CWRParser } from 'cwr-parser';
import { templateReportGenerators } from '@/constants/templateRegistry';

import type { ParsedTransmission, ParseStatistics } from 'cwr-parser/types';
import type { CWRTemplate } from '@/types';
import { getTemplateById } from '@/utils';

interface MsgIn {
  type: 'generate';
  fileContent: string;
  fileName: string;
  selectedTemplate: CWRTemplate['id'];
  chunk: number; // lines per slice (e.g. 4_000)
}

type MsgOut =
  | { type: 'progress'; pct: number }
  | {
      type: 'done';
      template: CWRTemplate;
      reportData: Map<string, string | number>[];
    }
  | { type: 'error'; error: string };

const parser = new CWRParser({ convertCodes: true });

/* -------------------------------------------------------------- */
/*           merge helpers                                         */
/* -------------------------------------------------------------- */
function mergeStats(a: ParseStatistics, b: ParseStatistics) {
  a.totalRecords += b.totalRecords;

  // recordCounts
  for (const k of Object.keys(b.recordCounts)) {
    a.recordCounts[k] = (a.recordCounts[k] ?? 0) + b.recordCounts[k];
  }

  a.errors.push(...b.errors);
  a.warnings.push(...b.warnings);
  a.hasErrors ||= b.hasErrors;
  a.hasWarnings ||= b.hasWarnings;
}

self.onmessage = async (e: MessageEvent<MsgIn>) => {
  if (e.data.type !== 'generate') return;

  const { fileContent, fileName, selectedTemplate, chunk } = e.data;
  const template = getTemplateById(selectedTemplate);
  const generator = template && templateReportGenerators[template.id];

  if (!template || !generator) {
    (self as DedicatedWorkerGlobalScope).postMessage({
      type: 'error',
      error: 'Template not found or generator missing',
    } satisfies MsgOut);
    return;
  }

  try {
    /* ---------------- split once ---------------- */
    const lines = fileContent.split(/\r?\n/);
    const total = lines.length;

    /* ---------------- accumulators -------------- */
    let merged: ParsedTransmission | null = null;

    /* ---------------- chunk loop ---------------- */
    for (let i = 0; i < total; i += chunk) {
      const slice = lines.slice(i, i + chunk).join('\n');
      const partial = parser.parseString(slice, fileName) as ParsedTransmission;

      if (!merged) {
        // first slice => shallow clone (will mutate groups/stats)
        merged = { ...partial, groups: [...partial.groups] };
      } else {
        // append groups
        merged.groups.push(...partial.groups);

        // keep last TRL (it has correct totals for this slice)
        merged.trl = partial.trl;

        // merge statistics
        mergeStats(merged.statistics!, partial.statistics!);
      }

      // progress
      (self as DedicatedWorkerGlobalScope).postMessage({
        type: 'progress',
        pct: Math.min((i + chunk) / total, 1),
      } satisfies MsgOut);

      await 0;
    }

    if (!merged) throw new Error('Empty file');

    /* ---------------- generate report once ---------------------- */
    const reportData = generator(merged, template);

    (self as DedicatedWorkerGlobalScope).postMessage({
      type: 'done',
      template,
      reportData,
    } satisfies MsgOut);
  } catch (err) {
    (self as DedicatedWorkerGlobalScope).postMessage({
      type: 'error',
      error: (err as Error).message,
    } satisfies MsgOut);
  }
};
