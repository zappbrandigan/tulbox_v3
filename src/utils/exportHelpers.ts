import ExcelJS from 'exceljs';
import { CWRTemplate, CWRTemplateField } from '../types/cwrTypes';

export const exportToCSV = (tableData: Map<string, string | number>[], template: CWRTemplate, fileName: string): void => {
  const headers = template.fields.map((field: CWRTemplateField) => field.label);
  const rows = tableData.map(row =>
    template.fields.map(field => row.get(field.key) ?? '')
  );

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  downloadFile(csvContent, `${fileName}.csv`, 'text/csv');
};

export const exportToXLSX = async (
  tableData: Map<string, string | number>[],
  template: CWRTemplate,
  fileName: string
): Promise<void> => {
  const cleanValue = (value: unknown): string | number => {
    if (typeof value === 'number' && !Number.isFinite(value)) return '';
    if (typeof value === 'string' || typeof value === 'number') return value;
    return '';
  };

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(template.name);

  workbook.creator = 'TūlBOX - CWRConverter';
  workbook.created = new Date();

  if (tableData.length === 0) {
    console.warn('No data to export.');
    return;
  }

  worksheet.columns = template.fields.map((field: CWRTemplateField) => ({
    header: field.label,
    key: field.key,
    width: field.width ?? 20,
    ...(field.style ? { style: field.style } : {}),
  }));

  for (const mapRow of tableData) {
    const rowObj: { [key: string]: string | number } = {};

      // logging
    for (const [k, v] of Object.entries(rowObj)) {
      if (typeof v !== 'string' && typeof v !== 'number') {
        console.warn(`Invalid cell value at key "${k}":`, v);
      }
    }
    
    for (const field of template.fields) {
      rowObj[field.key] = cleanValue(mapRow.get(field.key));
    }

    worksheet.addRow(rowObj);
  }

  


  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 12 };
    cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  downloadFile(
    buffer,
    `${fileName}.xlsx`,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
};


export const exportToJSON = (tableData: Map<string, string | number>[], fileName: string) => {
  const plainObjects = tableData.map(map => Object.fromEntries(map));
  const json = JSON.stringify(plainObjects, null, 2);
  downloadFile(json, `${fileName}.json`, 'application/json');
};

const downloadFile = (content: string | ExcelJS.Buffer, fileName: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};