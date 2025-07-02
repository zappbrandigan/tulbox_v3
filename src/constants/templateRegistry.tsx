import { CWRReporter } from '@/utils/cwrReporter';
import { CWRTemplate } from '@/types/cwrTypes';
import { ParsedCWRFile } from 'cwr-parser/types';

type ReportGenerator = (
  transmission: ParsedCWRFile,
  template: CWRTemplate
) => Map<string, string | number>[];

export const templateReportGenerators: Record<string, ReportGenerator> = {
  'works-report': CWRReporter.generateWorkReport.bind(CWRReporter),
  'isrc-report': CWRReporter.generateIsrcReport.bind(CWRReporter),
  'aka-report': CWRReporter.generateAkaReport.bind(CWRReporter),
  'cat-import': CWRReporter.generateCatImport.bind(CWRReporter),
};
