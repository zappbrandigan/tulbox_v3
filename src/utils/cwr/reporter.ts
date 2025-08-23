import {
  ParsedOPU,
  ParsedOWR,
  ParsedSPU,
  ParsedSWR,
  ParsedTransaction,
  ParsedTransmission,
} from 'cwr-parser/types';
import { CWRTemplate, CWRTemplateField } from '@/types';

class CWRReporter {
  /**
   * Normalize a flat map of { ipn: percent } so the values sum to `target`
   * Keeps proportions by scaling, then distributes the rounding remainder.
   */
  static normalizeToTarget(
    input: Record<string, number>,
    target = 100,
    step = 0.01,
    opts?: { absTol?: number; relTol?: number }
  ): Record<string, number> {
    const absTol = opts?.absTol ?? step;
    const relTol = opts?.relTol ?? 0;
    const threshold = Math.max(absTol, Math.abs(target) * relTol);
    // Keep only finite entries
    const entries = Object.entries(input).filter(([, v]) => Number.isFinite(v));
    const sum = entries.reduce((a, [, v]) => a + v, 0);

    // If sum is zero, nothing meaningful to scale
    if (sum === 0) {
      return Object.fromEntries(entries.map(([k]) => [k, 0]));
    }

    // Only normalize if the current sum is close to the target.
    // Otherwise, return values unchanged (for finite keys we kept).
    const delta = Math.abs(sum - target);
    if (delta > threshold) {
      return Object.fromEntries(entries);
    }

    // Proportional scale
    const scaled = entries.map(([k, v]) => [k, (v * target) / sum] as const);

    // Integer units in step
    const targetUnits = Math.round(target / step);
    const rawUnits = scaled.map(([k, v]) => [k, v / step] as const);

    // Floor then distribute remainder
    const floors = rawUnits.map(([k, u]) => {
      const f = Math.floor(u);
      return [k, f, u - f] as const; // [key, floor, fractional remainder]
    });

    const unitsSum = floors.reduce((a, [, f]) => a + f, 0);
    let need = targetUnits - unitsSum;

    const units = new Map<string, number>(floors.map(([k, f]) => [k, f]));

    if (need !== 0) {
      const order =
        need > 0
          ? [...floors].sort((a, b) => b[2] - a[2]).map(([k]) => k) // add to largest remainders
          : [...floors].sort((a, b) => a[2] - b[2]).map(([k]) => k); // remove from smallest remainders

      let i = 0;
      while (need !== 0) {
        const k = order[i % order.length];
        const cur = units.get(k)!;
        if (need > 0) {
          units.set(k, cur + 1);
          need -= 1;
        } else if (cur > 0) {
          units.set(k, cur - 1);
          need += 1;
        }
        i += 1;
      }
    }

    // Back to numbers; clamp minor FP noise to 2 decimals
    const out = Object.fromEntries(
      entries.map(([k]) => [k, Number(((units.get(k) ?? 0) * step).toFixed(2))])
    );

    return out;
  }

  static getContribution(writer: ParsedSWR | ParsedOWR, isControlled: boolean) {
    const PREFERRED_TIS = ['2136', '0840']; // World, then U.S.

    const recs = isControlled
      ? (writer as ParsedSWR).swts ?? []
      : (writer as ParsedOWR).owts ?? [];

    const collectionRecord = PREFERRED_TIS.map((code) =>
      recs.find((t) => t.fields.tisCode === code)
    ).find(Boolean);

    // Use collection share if we found a record; otherwise fall back to ownership share
    const contribution =
      collectionRecord?.fields.prCollectionShare ??
      writer.fields.prOwnershipShare ??
      0;

    return contribution * 2;
  }

  static buildContributionMap(
    transaction: ParsedTransaction
  ): Record<string, number> {
    const items = [
      ...(transaction.work?.swrs ?? []),
      ...(transaction.work?.owrs ?? []),
    ];

    const out: Record<string, number> = {};

    for (const w of items) {
      const ipn = String(w.fields.interestedPartyNumber);
      const isControlled = w.fields.recordType === 'SWR';
      const contrib = this.getContribution(w, isControlled);

      out[ipn] = (out[ipn] ?? 0) + contrib;
    }

    return out;
  }

  static getPublisherInfo(
    {
      songCode,
      workType,
      workTitle,
    }: {
      songCode: string | number;
      workType: string;
      workTitle: string;
    },
    publisher: ParsedSPU | ParsedOPU,
    columns: [string, string][]
  ) {
    const row = new Map<string, string | number>(columns);
    const publisherName =
      publisher.fields.publisherUnknownIndicator === 'Y'
        ? 'UNKNOWN PUBLISHER'
        : publisher.fields.publisherName ?? 'UNKNOWN PUBLISHER';
    let prCollectionShare: number = 0;
    let mrCollectionShare: number = 0;
    const publisherControlFlag =
      publisher.fields.recordType === 'SPU' ? 'Y' : 'N';
    if (publisher.fields.recordType === 'SPU') {
      prCollectionShare = Number(
        (publisher as ParsedSPU).spts?.[0].fields.prCollectionShare ??
          publisher.fields.prOwnershipShare ??
          0
      );
      mrCollectionShare = Number(
        (publisher as ParsedSPU).spts?.[0].fields.mrCollectionShare ??
          publisher.fields.mrOwnershipShare ??
          0
      );
    } else {
      prCollectionShare = Number(
        (publisher as ParsedOPU).opts?.[0].fields.prCollectionShare ??
          publisher.fields.prOwnershipShare ??
          0
      );
      mrCollectionShare = Number(
        (publisher as ParsedOPU).opts?.[0].fields.mrCollectionShare ??
          publisher.fields.mrOwnershipShare ??
          0
      );
    }
    row.set('songCode', songCode);
    row.set('workType', workType);
    row.set('workTitle', workTitle);
    row.set('publisherSeqNum', publisher.fields.publisherSequenceNumber);

    row.set('controlled', publisherControlFlag);
    row.set('capacity', publisher.fields.publisherType ?? '');
    row.set('ipNum', publisher.fields.interestedPartyNumber ?? '');
    row.set('publisherName', publisherName);
    row.set('ipiNameNum', Number(publisher.fields.ipiNameNumber ?? ''));
    row.set('society', publisher.fields.prAffiliationSocietyNumber ?? '');
    row.set('prOwnership', (publisher.fields.prOwnershipShare ?? 0).toFixed(2));
    row.set('mrOwnership', (publisher.fields.mrOwnershipShare ?? 0).toFixed(2));
    if ('spts' in publisher) {
      row.set('territoryCode', publisher.spts?.[0]?.fields.tisCode ?? '');
      row.set(
        'ogTerritoryFlag',
        publisher.spts?.[0]?.fields.inclusionExclusionIndicator ?? ''
      );
      row.set('prCollection', (prCollectionShare ?? 0).toFixed(2));
      row.set('mrCollection', (mrCollectionShare ?? 0).toFixed(2));
    }

    return row;
  }

  static getWriterInfo(
    {
      songCode,
      workType,
      workTitle,
    }: {
      songCode: string | number;
      workType: string;
      workTitle: string;
    },
    writer: ParsedSWR | ParsedOWR,
    contriubtion: number,
    columns: [string, string][]
  ) {
    const row = new Map<string, string | number>(columns);
    const writerName = !writer.fields.writerLastName
      ? 'UNKNOWN WRITER'
      : !writer.fields.writerFirstName
      ? writer.fields.writerLastName
      : `${writer.fields.writerLastName}, ${writer.fields.writerFirstName}`;
    const writerControlFlag = writer.fields.recordType === 'SWR' ? 'Y' : 'N';
    // const adjustedContribution = (writer.fields.prOwnershipShare ?? 0) * 2;

    row.set('contribution', contriubtion.toFixed(2)); // e.g., 16.67

    row.set('songCode', songCode);
    row.set('workType', workType);
    row.set('workTitle', workTitle);
    row.set('publisherSeqNum', '');

    row.set('controlled', writerControlFlag);
    row.set('capacity', writer.fields.writerDesignationCode);
    row.set('ipNum', writer.fields.interestedPartyNumber);
    row.set('publisherName', '');
    row.set('composerName', writerName);
    row.set('ipiNameNum', Number(writer.fields.ipiNameNumber ?? ''));
    row.set('society', writer.fields.prAffiliationSocietyNumber ?? '');
    row.set('prOwnership', (writer.fields.prOwnershipShare ?? 0).toFixed(2));
    row.set('mrOwnership', (writer.fields.mrOwnershipShare ?? 0).toFixed(2));
    if ('swts' in writer) {
      row.set('territoryCode', writer.swts?.[0]?.fields.tisCode ?? '');
      row.set(
        'ogTerritoryFlag',
        writer.swts?.[0]?.fields.inclusionExclusionIndicator ?? ''
      );
      row.set(
        'prCollection',
        (writer.swts?.[0]?.fields.prCollectionShare ?? 0).toFixed(2)
      );
      row.set(
        'mrCollection',
        (writer.swts?.[0]?.fields.mrCollectionShare ?? 0).toFixed(2)
      );
    } else if ('owts' in writer) {
      row.set('territoryCode', writer.owts?.[0]?.fields.tisCode ?? '');
      row.set(
        'ogTerritoryFlag',
        writer.owts?.[0]?.fields.inclusionExclusionIndicator ?? ''
      );
      row.set(
        'prCollection',
        (writer.owts?.[0]?.fields.prCollectionShare ?? 0).toFixed(2)
      );
      row.set(
        'mrCollection',
        (writer.owts?.[0]?.fields.mrCollectionShare ?? 0).toFixed(2)
      );
    }
    return row;
  }

  static generateWorkReport(
    transmission: ParsedTransmission,
    template: CWRTemplate
  ) {
    const warnings: string[] = [];
    const rowCollection: Map<string, string | number>[] = [];
    const columns = template.fields.map(
      (field: CWRTemplateField) => [field.key, ''] as [string, string]
    );

    for (const group of transmission.groups ?? []) {
      for (const transaction of group.transactions ?? []) {
        const rows: Map<string, string | number>[] = [];
        if (!transaction.work) continue;
        const currentWork = transaction.work;
        const songCode = currentWork.header.fields.submitterWorkNumber;
        const workType =
          currentWork.header.fields.recordType === 'NWR' ? 'New' : 'Rev.';

        const repeatedData = {
          songCode,
          workType,
          languageCode: currentWork.header.fields.languageCode ?? '',
          workTitle: currentWork.header.fields.workTitle,
        };

        let totalContribution = 0;
        const contributionLookup = this.buildContributionMap(transaction);
        const normalizedContributions =
          this.normalizeToTarget(contributionLookup);

        Object.values(normalizedContributions).forEach(
          (v) => (totalContribution += v)
        );
        if (Math.abs(totalContribution - 100) > 1e-6)
          warnings.push(
            `<span class="text-rose-600 dark:text-rose-300 font-semibold">[Contribution %]</span>
            <span class="text-gray-500 dark:text-gray-400 font-medium">Title: ${
              repeatedData.workTitle
            }</span>
            <span class="text-blue-600 dark:text-blue-300 font-medium">
            Contribution percentage total: ${totalContribution.toFixed(2)}
            </span>`
          );

        for (const publisher of [
          ...(currentWork.spus ?? []),
          ...(currentWork.opus ?? []),
        ]) {
          rows.push(this.getPublisherInfo(repeatedData, publisher, columns));
        }
        for (const ip of Object.keys(normalizedContributions)) {
          const writer = [
            ...(currentWork.swrs ?? []),
            ...(currentWork.owrs ?? []),
          ].find((w) => w.fields.interestedPartyNumber === ip)!;
          rows.push(
            this.getWriterInfo(
              repeatedData,
              writer,
              normalizedContributions[ip],
              columns
            )
          );
        }

        if (
          [...(currentWork.swrs ?? []), ...(currentWork.owrs ?? [])].length ===
          0
        )
          warnings.push(
            `<span class="text-rose-600 dark:text-rose-300 font-semibold">[Missing Writer]</span>
            <span class="text-gray-500 dark:text-gray-400 font-medium">Title: ${repeatedData.workTitle}</span>
            <span class="text-blue-600 dark:text-blue-300 font-medium">
            No writers listed for this work
            </span>`
          );

        rowCollection.push(...rows);
      }
    }

    return { rows: rowCollection, warnings };
  }

  static generateIsrcReport(
    transmission: ParsedTransmission,
    template: CWRTemplate
  ) {
    const warnings: string[] = [];
    const rowCollection: Map<string, string | number>[] = [];
    const columns = template.fields.map(
      (field: CWRTemplateField) => [field.key, ''] as [string, string]
    );

    for (const group of transmission.groups) {
      for (const transaction of group.transactions ?? []) {
        const rows: Map<string, string | number>[] = [];
        if (!transaction.work?.recs?.length) {
          continue;
        } // skip if not REC records
        for (const recording of transaction.work?.recs ?? []) {
          if (!recording.fields.isrc) continue; // skip if REC has no ISRC
          const row = new Map<string, string | number>(columns);
          row.set(
            'songCode',
            transaction.work.header.fields.submitterWorkNumber
          );
          row.set('isrc', recording.fields.isrc ?? '');
          rows.push(row);
        }
        rowCollection.push(...rows);
      }
    }
    return { rows: rowCollection, warnings };
  }

  static generateIswcReport(
    transmission: ParsedTransmission,
    template: CWRTemplate
  ) {
    const warnings: string[] = [];
    const rowCollection: Map<string, string | number>[] = [];
    const columns = template.fields.map(
      (field: CWRTemplateField) => [field.key, ''] as [string, string]
    );

    for (const group of transmission.groups) {
      for (const transaction of group.transactions ?? []) {
        const rows: Map<string, string | number>[] = [];
        const iswc = transaction.work?.header.fields.iswc ?? '';
        if (!iswc) {
          continue;
        }
        const row = new Map<string, string | number>(columns);
        row.set(
          'songCode',
          transaction.work?.header.fields.submitterWorkNumber ?? ''
        );
        row.set('iswc', iswc);
        rows.push(row);
        rowCollection.push(...rows);
      }
    }
    return { rows: rowCollection, warnings };
  }

  static generateAkaReport(
    transmission: ParsedTransmission,
    template: CWRTemplate
  ) {
    function isRowDuplicate(
      row: Map<string, string | number>,
      existingRows: Map<string, string | number>[]
    ): boolean {
      const songCode = row.get('songCode');
      const aka = row.get('aka');
      const lang = row.get('languageCode');

      return existingRows.some(
        (r) =>
          r.get('songCode') === songCode &&
          r.get('aka') === aka &&
          r.get('languageCode') === lang
      );
    }

    const warnings: string[] = [];
    const rowCollection: Map<string, string | number>[] = [];
    const columns = template.fields.map(
      (field: CWRTemplateField) => [field.key, ''] as [string, string]
    );

    for (const group of transmission.groups) {
      for (const transaction of group.transactions ?? []) {
        if (!transaction.work?.alts?.length) continue;

        const rows: Map<string, string | number>[] = [];

        for (const alternativeTitle of transaction.work.alts) {
          const row = new Map<string, string | number>(columns);
          row.set(
            'songCode',
            transaction.work.header.fields.submitterWorkNumber
          );
          row.set('aka', alternativeTitle.fields.alternativeTitle);
          row.set('languageCode', alternativeTitle.fields.languageCode ?? '');
          row.set('workTitle', transaction.work.header.fields.workTitle);
          // Only add the row if it's not a duplicate
          if (!isRowDuplicate(row, rows)) {
            rows.push(row);
          }
        }
        rowCollection.push(...rows);
      }
    }
    return { rows: rowCollection, warnings };
  }

  static generateIpReport(
    transmission: ParsedTransmission,
    template: CWRTemplate
  ) {
    const rowCollection: Map<string, string | number>[] = [];
    const warnings: string[] = [];

    const columnKeys = template.fields.map(
      (field: CWRTemplateField) => field.key
    );

    const seenKeys = new Set<string>();

    const addRowIfUnique = (row: Map<string, string | number>) => {
      // Create a unique key — adjust if more fields need to be included
      const uniqueKey = `${row.get('ipNumber')}|${row.get('name')}|${row.get(
        'ipiNumber'
      )}`;
      if (!seenKeys.has(uniqueKey)) {
        seenKeys.add(uniqueKey);
        rowCollection.push(row);
      }
    };

    for (const group of transmission.groups) {
      for (const transaction of group.transactions ?? []) {
        for (const publisher of [
          ...(transaction.work?.spus ?? []),
          ...(transaction.work?.opus ?? []),
        ]) {
          const row = new Map<string, string | number>(
            columnKeys.map((key: string) => [key, ''])
          );

          row.set('ipNumber', publisher.fields.interestedPartyNumber ?? '');
          row.set('type', 'Publisher');
          row.set(
            'name',
            publisher.fields.publisherName
              ? publisher.fields.publisherName
              : 'Unknown Publisher'
          );
          row.set('ipiNumber', publisher.fields.ipiNameNumber ?? '');
          row.set('pro', publisher.fields.prAffiliationSocietyNumber ?? 'NS');

          addRowIfUnique(row);
        }

        for (const writer of [
          ...(transaction.work?.swrs ?? []),
          ...(transaction.work?.owrs ?? []),
        ]) {
          const row = new Map<string, string | number>(
            columnKeys.map((key: string) => [key, ''])
          );

          row.set('ipNumber', writer.fields.interestedPartyNumber ?? '');
          row.set('type', 'Writer');
          row.set(
            'name',
            writer.fields.writerLastName
              ? `${writer.fields.writerLastName}${
                  writer.fields.writerFirstName
                    ? `, ${writer.fields.writerFirstName}`
                    : ''
                }`
              : 'Unknown Writer'
          );
          row.set('ipiNumber', writer.fields.ipiNameNumber ?? '');
          row.set('pro', writer.fields.prAffiliationSocietyNumber ?? 'NS');

          addRowIfUnique(row);
        }
      }
    }

    return { rows: rowCollection, warnings };
  }

  static generateCatImport(
    transmission: ParsedTransmission,
    template: CWRTemplate
  ) {
    const rowCollection: Map<string, string | number>[] = [];
    const warnings: string[] = [];

    // Collect all expected column keys from the template
    const columnKeys = template.fields.map(
      (field: CWRTemplateField) => field.key
    );

    for (const group of transmission.groups) {
      for (const transaction of group.transactions ?? []) {
        const iswc = transaction.work?.header.fields.iswc ?? '';
        const workTitle = transaction.work?.header.fields.workTitle ?? '';
        const songTypeCode = 'OG';

        let totalContribution = 0;
        const contributionLookup = this.buildContributionMap(transaction);
        const normalizedContributions = this.normalizeToTarget(
          contributionLookup,
          100,
          0.01,
          { absTol: 0.06 }
        );

        for (const aka of transaction.work?.alts ?? [
          { fields: { alternativeTitle: '' } },
        ]) {
          totalContribution = 0;
          for (const ip of Object.keys(normalizedContributions)) {
            const row = new Map<string, string | number>(
              columnKeys.map((key: string) => [key, ''])
            );
            const writer = [
              ...(transaction.work?.swrs ?? []),
              ...(transaction.work?.owrs ?? []),
            ].find((w) => w.fields.interestedPartyNumber === ip)!;
            const controlled = writer.fields.recordType === 'SWR' ? 'Y' : 'N';
            totalContribution +=
              normalizedContributions[writer.fields.interestedPartyNumber];
            const contribution = normalizedContributions[
              writer.fields.interestedPartyNumber
            ]
              .toFixed(2) // ensures 2 decimal places
              .padStart(6, '0'); // pads total length to 6 (e.g. "005.00")

            const patchSociety = ['099', '000', '', null].includes(
              writer.fields.prAffiliationSocietyNumber
            )
              ? 'NS'
              : writer.fields.prAffiliationSocietyNumber;

            row.set('iswc', iswc);
            row.set('workTitle', workTitle);
            row.set('songTypeCode', songTypeCode);
            row.set('lastName', writer.fields.writerLastName ?? '');
            row.set('firstName', writer.fields.writerFirstName ?? '');
            row.set('capacity', writer.fields.writerDesignationCode ?? '');
            row.set('contribution', contribution);
            row.set('controlled', controlled);
            row.set('affiliation', patchSociety);
            row.set('ipiNameNumber', writer.fields.ipiNameNumber ?? '');
            row.set('aka', aka.fields.alternativeTitle);
            rowCollection.push(row);
          }
        }
        if (Math.abs(totalContribution - 100) > 1e-6) {
          warnings.push(
            `<span class="text-rose-600 dark:text-rose-300 font-semibold">[Contribution %]</span>
            <span class="text-gray-500 dark:text-gray-400 font-medium">Title: ${workTitle}</span>
            <span class="text-blue-600 dark:text-blue-300 font-medium">
            Contribution percentage total: ${totalContribution.toFixed(2)}
            </span>`
          );
        }
        if (
          [...(transaction.work?.swrs ?? []), ...(transaction.work?.owrs ?? [])]
            .length === 0
        )
          warnings.push(
            `<span class="text-rose-600 dark:text-rose-300 font-semibold">[Missing Writer]</span>
            <span class="text-gray-500 dark:text-gray-400 font-medium">Title: ${workTitle}</span>
            <span class="text-blue-600 dark:text-blue-300 font-medium">
            No writers listed for this work
            </span>`
          );
      }
    }

    return { rows: rowCollection, warnings };
  }

  static generateMsgReport(
    transmission: ParsedTransmission,
    template: CWRTemplate
  ) {
    const warnings: string[] = [];
    const rowCollection: Map<string, string | number>[] = [];
    const columns = template.fields.map(
      (field: CWRTemplateField) => [field.key, ''] as [string, string]
    );
    for (const group of transmission.groups) {
      for (const transaction of group.transactions ?? []) {
        if (!transaction.msgs?.length) continue;
        const rows: Map<string, string | number>[] = [];
        for (const msg of transaction.msgs) {
          const row = new Map<string, string | number>(columns);
          row.set('transactionSeqNum', msg.fields.transactionSequenceNumber);
          row.set('recSeqNum', msg.fields.recordSequenceNumber);
          row.set('ogRecSeqNum', msg.fields.originalRecordSequenceNumber);
          row.set('ogRecType', msg.fields.originalRecordType);
          row.set('msgLevel', msg.fields.messageLevel);
          row.set('validationLevel', msg.fields.validationNumber);
          row.set('msgText', msg.fields.messageText);
          rows.push(row);
        }
        rowCollection.push(...rows);
      }
    }
    return { rows: rowCollection, warnings };
  }
}

export default CWRReporter;
