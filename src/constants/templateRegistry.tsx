import { CWRReporter } from '@/utils';
import { CWRTemplate } from '@/types';
import { ParsedTransmission } from 'cwr-parser/types';

type ReportGenerator = (
  transmission: ParsedTransmission,
  template: CWRTemplate
) => { rows: Map<string, string | number>[]; warnings: string[] };

export const templateReportGenerators: Record<string, ReportGenerator> = {
  'work-report': CWRReporter.generateWorkReport.bind(CWRReporter),
  'cat-import': CWRReporter.generateCatImport.bind(CWRReporter),
  'isrc-report': CWRReporter.generateIsrcReport.bind(CWRReporter),
  'iswc-report': CWRReporter.generateIswcReport.bind(CWRReporter),
  'aka-report': CWRReporter.generateAkaReport.bind(CWRReporter),
  'rec-report': CWRReporter.generateRecordingReport.bind(CWRReporter),
  'ip-report': CWRReporter.generateIpReport.bind(CWRReporter),
  'msg-report': CWRReporter.generateMsgReport.bind(CWRReporter),
};
