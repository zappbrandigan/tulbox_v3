/// <reference lib="webworker" />
import { CWRParser } from 'cwr-parser';
import { templateReportGenerators } from '@/constants/templateRegistry';
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
      warnings: string[];
    }
  | { type: 'error'; error: string };

const parser = new CWRParser({ convertCodes: true });

self.onmessage = async (e: MessageEvent<MsgIn>) => {
  if (e.data.type !== 'generate') return;

  const { fileContent, selectedTemplate } = e.data;
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
    const parsed = parser.parseString(fileContent);
    const { rows: reportData, warnings } = generator(parsed, template);

    (self as DedicatedWorkerGlobalScope).postMessage({
      type: 'done',
      template,
      reportData,
      warnings,
    } satisfies MsgOut);
  } catch (err) {
    (self as DedicatedWorkerGlobalScope).postMessage({
      type: 'error',
      error: (err as Error).message,
    } satisfies MsgOut);
  }
};
