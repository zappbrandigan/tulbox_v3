import { CWRTemplateField } from '@/types';

self.onmessage = (e) => {
  const { tableData, template, fileName, format } = e.data;

  if (format === 'csv') {
    const headers = template.fields.map((f: CWRTemplateField) => f.label);
    const rows = tableData.map((row: [string, string | number][]) =>
      template.fields
        .map((field: CWRTemplateField) => {
          const val = new Map(row).get(field.key) ?? '';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    self.postMessage({
      fileName: `${fileName}.csv`,
      content: csv,
      mimeType: 'text/csv',
    });
  }

  if (format === 'json') {
    const jsonData = tableData.map((row: [string, string | number][]) =>
      Object.fromEntries(row)
    );
    const json = JSON.stringify(jsonData, null, 2);
    self.postMessage({
      fileName: `${fileName}.json`,
      content: json,
      mimeType: 'application/json',
    });
  }
};
