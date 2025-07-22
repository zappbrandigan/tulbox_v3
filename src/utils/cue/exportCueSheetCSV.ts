import { CueSheetTemplate } from '@/types';
import { CueRow } from './types';

export function exportCueSheetCSV(
  rows: CueRow[],
  template: CueSheetTemplate,
  filename = 'cue_sheet.csv'
) {
  if (!rows.length) return;

  const maxWriters = Math.max(...rows.map((row) => row.writers.length));

  // Generate dynamic headers from template
  const header: string[] = [
    ...template.fields.map((field) => field.label),
    ...(template.repeatGroup
      ? Array.from({ length: maxWriters }).flatMap((_, i) =>
          template.repeatGroup!.subfields.map((sub) => `${sub.label} ${i + 1}`)
        )
      : []),
  ];

  // Build row values
  const body = rows.map((row) => {
    const staticValues = template.fields.map(
      (field) => row[field.key as keyof typeof row] ?? ''
    );

    const writerValues = template.repeatGroup
      ? Array.from({ length: maxWriters }).flatMap((_, i) => {
          const writer = row.writers[i];
          return template.repeatGroup!.subfields.map(
            (sub) => writer?.[sub.key as keyof typeof writer] ?? ''
          );
        })
      : [];

    return [...staticValues, ...writerValues];
  });

  // Convert to CSV string
  const csv = [header, ...body]
    .map((row) =>
      row
        .map((val) =>
          typeof val === 'string' &&
          (val.includes(',') || val.includes('"') || val.includes('\n'))
            ? `"${val.replace(/"/g, '""')}"`
            : val
        )
        .join(',')
    )
    .join('\n');

  // Trigger download
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
