import { stringify } from 'csv-stringify';
import { CueRow } from './types';

export async function exportToCSV(rows: CueRow[]): Promise<string> {
  const header = [
    'file name',
    'work title',
    'sequence number',
    'publishers',
    'writer 1',
    'capacity',
    'pro',
    'contribution',
    'writer 2',
    'capacity',
    'pro',
    'contribution',
    // extend if needed
  ];

  const data = rows.map((row) => {
    const writerFields = row.writers.flatMap((w) => [
      w.name,
      w.role,
      w.pro,
      w.contribution,
    ]);
    return [
      row.fileName,
      row.workTitle,
      row.sequenceNumber,
      row.publishers,
      ...writerFields,
    ];
  });

  return new Promise((resolve, reject) => {
    stringify([header, ...data], (err, output) => {
      if (err) reject(err);
      else resolve(output);
    });
  });
}
