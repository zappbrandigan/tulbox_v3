import { CWRParser } from 'cwr-parser';
import { templateReportGenerators } from '@/constants/templateRegistry';
import { getTemplateById } from '@/utils/cwr/templates';

self.onmessage = (e) => {
  const { fileContent, fileName, selectedTemplate } = e.data;

  try {
    const parser = new CWRParser({ convertCodes: true });
    const parsedData = parser.parseString(fileContent, fileName);
    const template = getTemplateById(selectedTemplate);
    const generator = template && templateReportGenerators[template.id];
    const result = generator ? generator(parsedData, template) : [];

    (self as DedicatedWorkerGlobalScope).postMessage({
      template,
      reportData: result,
    });
  } catch (err) {
    (self as DedicatedWorkerGlobalScope).postMessage({
      error: (err as Error).message,
    });
  }
};
