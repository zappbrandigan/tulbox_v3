/// <reference lib="webworker" />
import { CWRConverter } from 'cwr-parser';
import type {
  CWRConverterRecord,
  CWRParsedRecord,
  ParseStatistics,
} from 'cwr-parser/types';

interface ParseMsg {
  type: 'parse';
  fileContent: string;
  file: string;
  chunk: number;
}

type OutMsg =
  | { type: 'progress'; pct: number }
  | { type: 'done'; result: CWRConverterRecord };

const converter = new CWRConverter();

self.onmessage = async (e: MessageEvent<ParseMsg>) => {
  if (e.data.type !== 'parse') return;
  const { fileContent, file, chunk } = e.data;

  const rawLines = fileContent.split(/\r?\n/);
  const total = rawLines.length;

  /* -------------------------------------------------------------- */
  /*  Accumulators                                                  */
  /* -------------------------------------------------------------- */
  let result: CWRConverterRecord | null = null;
  let stats: ParseStatistics | null = null;
  let allLines: CWRParsedRecord<Map<string, string>>[] = [];

  /* -------------------------------------------------------------- */
  /*  Chunk loop                                                    */
  /* -------------------------------------------------------------- */
  for (let i = 0; i < total; i += chunk) {
    const sliceText = rawLines.slice(i, i + chunk).join('\n');
    const partial = converter.mapString(sliceText, file) as CWRConverterRecord;

    /* Capture header/meta from first slice ----------------------- */
    if (!result) {
      result = { ...partial, lines: [] };

      // deep-clone statistics to mutate safely
      stats = {
        totalRecords: 0,
        recordCounts: {},
        errors: [],
        warnings: [],
        hasErrors: false,
        hasWarnings: false,
      };
    }

    /* Merge statistics ------------------------------------------ */
    if (stats && partial.statistics) {
      stats.totalRecords += partial.statistics.totalRecords;

      // recordCounts — sum per record type
      for (const key of Object.keys(partial.statistics.recordCounts)) {
        stats.recordCounts[key] =
          (stats.recordCounts[key] ?? 0) + partial.statistics.recordCounts[key];
      }

      // concatenate errors / warnings
      stats.errors.push(...partial.statistics.errors);
      stats.warnings.push(...partial.statistics.warnings);
    }

    /* Accumulate rows ------------------------------------------- */
    allLines = allLines.concat(partial.lines);

    /* Progress --------------------------------------------------- */
    (self as DedicatedWorkerGlobalScope).postMessage({
      type: 'progress',
      pct: Math.min((i + chunk) / total, 1),
    } satisfies OutMsg);

    await 0;
  }

  /* -------------------------------------------------------------- */
  /*  Finalise & send                                              */
  /* -------------------------------------------------------------- */
  if (result && stats) {
    stats.hasErrors = stats.errors.length > 0;
    stats.hasWarnings = stats.warnings.length > 0;
    result.lines = allLines;
    result.statistics = stats;

    (self as DedicatedWorkerGlobalScope).postMessage({
      type: 'done',
      result,
    } satisfies OutMsg);
  }
};
