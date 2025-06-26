import { CWRConverter } from '@/utils/cwrConverter';
import { CWRTemplate } from '@/types/cwrTypes';
import { ParsedCWRFile } from 'cwr-parser/types';

type ReportGenerator = (
  transmission: ParsedCWRFile,
  template: CWRTemplate
) => Map<string, string | number>[];

export const templateReportGenerators: Record<string, ReportGenerator> = {
  'works-report': CWRConverter.generateWorkReport.bind(CWRConverter),
  'isrc-report': CWRConverter.generateIsrcReport.bind(CWRConverter),
  'aka-report': CWRConverter.generateAkaReport.bind(CWRConverter),
};