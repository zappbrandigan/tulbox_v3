import {
  ParsedOPU,
  ParsedOWR,
  ParsedSPU,
  ParsedSWR,
  ParsedTransmission,
} from 'cwr-parser/types';
import { CWRTemplate, CWRTemplateField } from '@/types';
import Decimal from 'decimal.js-light';

/**
 * Normalize a flat map of { ipn: percent } so the values sum to `target`
 * (default 50), with each value in increments of `step` (default 0.01).
 * Keeps proportions by scaling, then distributes the rounding remainder.
 */
function normalizeToTarget(
  input: Record<string, number>,
  target = 50,
  step = 0.01
): Record<string, number> {
  const entries = Object.entries(input).filter(([, v]) => Number.isFinite(v));
  const sum = entries.reduce((a, [, v]) => a + v, 0);

  // Nothing to normalize
  if (sum === 0) {
    return Object.fromEntries(entries.map(([k]) => [k, 0]));
  }

  // Scale to the target first (preserves proportions)
  const scaled = entries.map(([k, v]) => [k, (v * target) / sum] as const);

  // Work in integer "units" of `step` to avoid float drift
  const targetUnits = Math.round(target / step);
  const rawUnits = scaled.map(([k, v]) => [k, v / step] as const);

  // Floor first, then distribute the remainder by largest fractional parts
  const floors = rawUnits.map(([k, u]) => {
    const f = Math.floor(u);
    return [k, f, u - f] as const; // [key, floor, fractional remainder]
  });

  let unitsSum = floors.reduce((a, [, f]) => a + f, 0);
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

class CWRReporter {
  static getPublisherInfo(
    {
      songCode,
      workType,
      workTitle,
      iswc,
      akas,
      setupNote,
      titleNote,
      recordingTitle,
      albumTitle,
      catalogNum,
    }: {
      songCode: string | number;
      workType: string;
      workTitle: string;
      iswc: string;
      akas: string;
      setupNote: string;
      titleNote: string;
      recordingTitle: string;
      albumTitle: string;
      catalogNum: string;
    },
    publisher: ParsedSPU | ParsedOPU,
    columns: [string, string][]
  ) {
    const row = new Map<string, string | number>(columns);
    const publisherName =
      publisher.fields.publisherUnknownIndicator === 'Y'
        ? 'UNKNOWN PUBLISHER'
        : publisher.fields.publisherName ?? 'UNKNOWN PUBLISHER';
    let publisherControlFlag: 'Y' | 'N' = 'N';
    let prCollectionShare: number = 0;
    let mrCollectionShare: number = 0;
    if (publisher.fields.recordType === 'SPU') {
      publisherControlFlag = 'Y';
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
    } else row.set('recordingTitle', recordingTitle);
    row.set('albumTitle', albumTitle);
    row.set('catalogNum', catalogNum);
    row.set('songCode', songCode);
    row.set('workType', workType);
    row.set('workTitle', workTitle);
    row.set('iswc', iswc);
    row.set('akas', akas);
    row.set('setupNote', setupNote);
    row.set('titleNote', titleNote);
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
      iswc,
      akas,
      setupNote,
      titleNote,
      recordingTitle,
      albumTitle,
      catalogNum,
    }: {
      songCode: string | number;
      workType: string;
      workTitle: string;
      iswc: string;
      akas: string;
      setupNote: string;
      titleNote: string;
      recordingTitle: string;
      albumTitle: string;
      catalogNum: string;
    },
    writer: ParsedSWR | ParsedOWR,
    columns: [string, string][]
  ) {
    const row = new Map<string, string | number>(columns);
    const writerName = !writer.fields.writerLastName
      ? 'UNKNOWN WRITER'
      : !writer.fields.writerFirstName
      ? writer.fields.writerLastName
      : `${writer.fields.writerLastName}, ${writer.fields.writerFirstName}`;
    const writerControlFlag = writer.fields.recordType === 'SWR' ? 'Y' : 'N';
    const adjustedContribution = (writer.fields.prOwnershipShare ?? 0) * 2;
    // const adjustedContribution =
    //   writerControlFlag === 'Y'
    //     ? writer.fields.prOwnershipShare ?? 0
    //     : writer.fields.prOwnershipShare * 2;
    // const adjustedPrShare = writer.fields.prOwnershipShare;

    row.set('contribution', adjustedContribution.toFixed(2)); // e.g., 16.67

    row.set('recordingTitle', recordingTitle);
    row.set('albumTitle', albumTitle);
    row.set('catalogNum', catalogNum);
    row.set('songCode', songCode);
    row.set('workType', workType);
    row.set('workTitle', workTitle);
    row.set('iswc', iswc);
    row.set('akas', akas);
    row.set('setupNote', setupNote);
    row.set('titleNote', titleNote);
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
    }
    return row;
  }

  static calculateTotalShareForPublisher(
    totalSharePerPublisher: Map<
      string,
      {
        prOwnershipShare: Decimal;
        mrOwnershipShare: Decimal;
        srOwnershipShare: Decimal;
      }
    >,
    spu: ParsedSPU
  ) {
    const ipn = spu.fields.interestedPartyNumber;
    const prOwnershipShare = new Decimal(spu.fields.prOwnershipShare ?? 0);
    const mrOwnershipShare = new Decimal(spu.fields.mrOwnershipShare ?? 0);
    const srOwnershipShare = new Decimal(spu.fields.srOwnershipShare ?? 0);

    const prevShares = totalSharePerPublisher.get(ipn) ?? {
      prOwnershipShare: 0,
      mrOwnershipShare: 0,
      srOwnershipShare: 0,
    };
    totalSharePerPublisher.set(ipn, {
      prOwnershipShare: new Decimal(prevShares.prOwnershipShare).plus(
        prOwnershipShare
      ),
      mrOwnershipShare: new Decimal(prevShares.mrOwnershipShare).plus(
        mrOwnershipShare
      ),
      srOwnershipShare: new Decimal(prevShares.srOwnershipShare).plus(
        srOwnershipShare
      ),
    });
  }

  static collapseDuplicatePublishers(
    groupedBySeq: Record<number, ParsedSPU[]>,
    ipnToSeqMap: Map<string, number[]>
  ) {
    const seqsBySingleIPN = new Map();

    for (const [seqStr, spusForSeq] of Object.entries(groupedBySeq)) {
      const seq = Number(seqStr);
      if (spusForSeq.length === 1) {
        const ipn = spusForSeq[0].fields.interestedPartyNumber;
        if (ipn) {
          const list = seqsBySingleIPN.get(ipn) ?? [];
          list.push(seq);
          seqsBySingleIPN.set(ipn, list);
        }
      }
    }

    // Step 2: Collapse duplicate IPNs across single-entry sequences
    for (const [ipn, seqList] of seqsBySingleIPN.entries()) {
      if (seqList.length <= 1) continue;

      // Sum up all shares
      let totalPR = 0;
      let totalMR = 0;
      let totalSR = 0;
      let combinedSPU = { ...groupedBySeq[seqList[0]][0] }; // clone the first

      for (const seq of seqList) {
        const spu = groupedBySeq[seq][0];
        totalPR += Number(spu.fields.prOwnershipShare ?? 0);
        totalMR += Number(spu.fields.mrOwnershipShare ?? 0);
        totalSR += Number(spu.fields.srOwnershipShare ?? 0);
      }

      // Update the combined SPU's shares
      combinedSPU = {
        ...combinedSPU,
        fields: {
          ...combinedSPU.fields,
          prOwnershipShare: totalPR,
          mrOwnershipShare: totalMR,
          srOwnershipShare: totalSR,
        },
      };

      // Replace the first sequence with the collapsed SPU
      const firstSeq = seqList[0];
      groupedBySeq[firstSeq] = [combinedSPU];

      // Remove all other sequences
      for (const seq of seqList.slice(1)) {
        delete groupedBySeq[seq];
      }

      // Update ipnToSeqMap[ipn] to keep only [firstSeq]
      ipnToSeqMap.set(ipn, [firstSeq]);
    }
  }

  static groupSPUsWithSWRs(spus: ParsedSPU[], swrs: ParsedSWR[]) {
    const groupedBySeq: Record<number, ParsedSPU[]> = {};
    const ipnToSeqMap = new Map<string, number[]>();
    const totalSharePerPublisher = new Map<
      string,
      {
        prOwnershipShare: Decimal;
        mrOwnershipShare: Decimal;
        srOwnershipShare: Decimal;
      }
    >();

    for (const spu of spus) {
      const seq = spu.fields.publisherSequenceNumber;
      const ipn = spu.fields.interestedPartyNumber;

      if (!groupedBySeq[seq]) groupedBySeq[seq] = [];
      groupedBySeq[seq].push(spu);

      const list = ipnToSeqMap.get(ipn) ?? [];
      list.push(seq);
      ipnToSeqMap.set(ipn, list);

      this.calculateTotalShareForPublisher(totalSharePerPublisher, spu);
    }

    this.collapseDuplicatePublishers(groupedBySeq, ipnToSeqMap);

    const groupedWithSwrs: Record<
      number,
      { spus: ParsedSPU[]; swrs: ParsedSWR[]; totalSharePerSeq: Decimal }
    > = {};

    for (const [seqStr, spusForSeq] of Object.entries(groupedBySeq)) {
      const seq = Number(seqStr);
      groupedWithSwrs[seq] = {
        spus: spusForSeq,
        swrs: [],
        totalSharePerSeq: spusForSeq.reduce(
          (total, spu) =>
            total.plus(new Decimal(spu.fields.prOwnershipShare ?? 0)),
          new Decimal(0)
        ),
      };
    }

    // Step 1: Group all SWRs into their sequences based on their associated PWRs
    for (const swr of swrs) {
      for (const pwr of swr.pwrs ?? []) {
        const pubIpn = pwr.fields.publisherInterestedPartyNumber;
        const seqs = ipnToSeqMap.get(pubIpn) ?? [];

        for (const seq of seqs) {
          const group = groupedWithSwrs[seq];
          if (!group) continue;

          // Confirm the publisher exists in the sequence with a non-zero share
          const matchingSPU = group.spus.find(
            (spu) =>
              spu.fields.interestedPartyNumber === pubIpn &&
              new Decimal(spu.fields.prOwnershipShare ?? 0).gt(0)
          );

          if (!matchingSPU) continue; // Skip if no valid publisher in this sequence

          if (
            !group.swrs.some(
              (existing) =>
                existing.fields.interestedPartyNumber ===
                swr.fields.interestedPartyNumber
            )
          ) {
            group.swrs.push({ ...swr });
          }
        }
      }
    }

    // Step 2: Recalculate per-sequence writer PR ownership using the new formula
    for (const [, group] of Object.entries(groupedWithSwrs)) {
      const spus = group.spus;
      const swrs = group.swrs;

      const totalPublisherShare = spus.reduce((sum, spu) => {
        const share = new Decimal(spu.fields.prOwnershipShare ?? 0);
        return share.isZero() ? sum : sum.plus(share);
      }, new Decimal(0));

      // const doubledPublisherShare = totalPublisherShare.mul(1);

      const totalWriterPrInSeq = swrs.reduce((sum, swr) => {
        return sum.plus(new Decimal(swr.fields.prOwnershipShare ?? 0));
      }, new Decimal(0));

      group.swrs = swrs.map((swr) => {
        const writerPr = new Decimal(swr.fields.prOwnershipShare ?? 0);

        const weightedShare = totalWriterPrInSeq.isZero()
          ? new Decimal(0)
          : totalPublisherShare
              .mul(writerPr)
              .div(totalWriterPrInSeq)
              .toDecimalPlaces(4);

        return {
          ...swr,
          fields: {
            ...swr.fields,
            prOwnershipShare: weightedShare.toNumber(),
          },
        };
      });
    }

    return { groupedWithSwrs, totalSharePerPublisher };
  }

  static groupOPUsWithOWRs(
    opus: ParsedOPU[],
    owrs: ParsedOWR[]
  ): {
    sequenceNumber: number;
    opus: ParsedOPU[];
    owrs: ParsedOWR[];
  }[] {
    const result: {
      sequenceNumber: number;
      opus: ParsedOPU[];
      owrs: ParsedOWR[];
    }[] = [];

    const remainingOPUs = [...opus];
    const remainingOWRs = [...owrs];
    const MARGIN = 0.06;

    while (remainingOPUs.length > 0 && remainingOWRs.length > 0) {
      const nextOPU = remainingOPUs[0];
      const nextOWR = remainingOWRs[0];
      const opuShare = Number(nextOPU.fields.prOwnershipShare ?? 0);
      const owrShare = Number(nextOWR.fields.prOwnershipShare ?? 0);

      // === CASE 1: Direct 1-to-1 match ===
      if (Math.abs(opuShare - owrShare) < MARGIN) {
        result.push({
          sequenceNumber: nextOPU.fields.publisherSequenceNumber,
          opus: [remainingOPUs.shift()!],
          owrs: [remainingOWRs.shift()!],
        });
        continue;
      }

      // === CASE 2: Combine OPUs to match one OWR ===
      const opuGroup: ParsedOPU[] = [];
      let opuSum = 0;
      let matched = false;

      for (let i = 0; i < remainingOPUs.length; i++) {
        opuGroup.push(remainingOPUs[i]);
        opuSum += Number(remainingOPUs[i].fields.prOwnershipShare ?? 0);

        if (Math.abs(opuSum - owrShare) < MARGIN) {
          result.push({
            sequenceNumber: opuGroup[0].fields.publisherSequenceNumber,
            opus: remainingOPUs.splice(0, opuGroup.length),
            owrs: [remainingOWRs.shift()!],
          });
          matched = true;
          break;
        }
      }

      if (matched) continue;

      // === CASE 3: Combine OWRs to match one OPU ===
      const owrGroup: ParsedOWR[] = [];
      let owrSum = 0;

      for (let j = 0; j < remainingOWRs.length; j++) {
        owrGroup.push(remainingOWRs[j]);
        owrSum += Number(remainingOWRs[j].fields.prOwnershipShare ?? 0);

        if (Math.abs(owrSum - opuShare) < MARGIN) {
          result.push({
            sequenceNumber: nextOPU.fields.publisherSequenceNumber,
            opus: [remainingOPUs.shift()!],
            owrs: remainingOWRs.splice(0, owrGroup.length),
          });
          matched = true;
          break;
        }
      }

      if (matched) continue;

      // === Fallback: Force one-to-one pairing with warning ===
      console.warn(`No accurate match found. Forcing fallback pairing.`, {
        opu: nextOPU.fields.publisherName,
        owrs: remainingOWRs.map((o) => o.fields.writerLastName),
      });

      result.push({
        sequenceNumber: nextOPU.fields.publisherSequenceNumber,
        opus: [remainingOPUs.shift()!],
        owrs: [remainingOWRs.shift()!], // may not match exactly
      });
    }

    return result;
  }

  static generateBatchReport(
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
        const setupNote = currentWork.orns?.[0].fields.intendedPurpose ?? '';

        const repeatedData = {
          songCode,
          workType,
          languageCode: currentWork.header.fields.languageCode ?? '',
          workTitle: currentWork.header.fields.workTitle,
          iswc: currentWork.header.fields.iswc ?? '',
          akas: currentWork.alts?.length ? 'See AKA Table' : '',
          setupNote: setupNote,
          titleNote: currentWork.orns?.[0]?.fields.productionTitle ?? '',
          recordingTitle:
            currentWork.recs?.[0].fields.recordingTitle ??
            'No principal recording identified',
          albumTitle:
            currentWork.recs?.[0].fields.firstAlbumTitle ??
            'No album/single title identified',
          catalogNum:
            currentWork.recs?.[0].fields.firstReleaseCatalogNumber ??
            'No catalog number identified',
        };

        const { groupedWithSwrs } = this.groupSPUsWithSWRs(
          currentWork.spus ?? [],
          currentWork.swrs ?? []
        );
        const uncontrolledGroup = this.groupOPUsWithOWRs(
          currentWork.opus ?? [],
          currentWork.owrs ?? []
        );

        const controlledSplits = Object.entries(groupedWithSwrs).map(
          ([key, value]) => ({
            sequenceNumber: Number(key),
            ...value,
          })
        );

        const uncontrolledSplits = Object.entries(uncontrolledGroup).map(
          ([, value]) => ({
            ...value,
          })
        );

        for (const split of controlledSplits) {
          for (const pub of split.spus) {
            rows.push(this.getPublisherInfo(repeatedData, pub, columns));
          }
          for (const wrt of split.swrs) {
            rows.push(this.getWriterInfo(repeatedData, wrt, columns));
          }
        }
        for (const split of uncontrolledSplits) {
          for (const pub of split.opus) {
            rows.push(this.getPublisherInfo(repeatedData, pub, columns));
          }
          for (const wrt of split.owrs) {
            rows.push(this.getWriterInfo(repeatedData, wrt, columns));
          }
        }

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

    function getContribution(
      writer: ParsedSWR | ParsedOWR,
      isControlled: boolean
    ) {
      if (isControlled) {
        let collectionRecord = (writer as ParsedSWR).swts?.find(
          (t) => t.fields.tisCode === '2136'
        ); // world
        if (!collectionRecord) {
          collectionRecord = (writer as ParsedSWR).swts?.find(
            (t) => t.fields.tisCode === '0840'
          ); // U.S.
        }
        if (!collectionRecord) {
          return (writer as ParsedSWR).fields.prOwnershipShare ?? 0;
        }
        return collectionRecord?.fields.prCollectionShare ?? 0;
      } else {
        let collectionRecord = (writer as ParsedOWR).owts?.find(
          (t) => t.fields.tisCode === '2136'
        ); //world
        if (!collectionRecord) {
          collectionRecord = (writer as ParsedOWR).owts?.find(
            (t) => t.fields.tisCode === '0840'
          ); // U.S.
        }
        if (!collectionRecord) {
          return (writer as ParsedOWR).fields.prOwnershipShare ?? 0;
        }
        return collectionRecord?.fields.prCollectionShare ?? 0;
      }
    }

    for (const group of transmission.groups) {
      for (const transaction of group.transactions ?? []) {
        const iswc = transaction.work?.header.fields.iswc ?? '';
        const workTitle = transaction.work?.header.fields.workTitle ?? '';
        const songTypeCode = 'OG';

        let totalContribution = 0;
        const contributionLookup = Object.fromEntries(
          [
            ...(transaction.work?.swrs ?? []),
            ...(transaction.work?.owrs ?? []),
          ].map((w) => [
            w.fields?.interestedPartyNumber,
            getContribution(w, w.fields.recordType === 'SWR' ? true : false),
          ]) ?? []
        );
        const normalizedContributions = normalizeToTarget(contributionLookup);
        for (const aka of transaction.work?.alts ?? [
          { fields: { alternativeTitle: '' } },
        ]) {
          totalContribution = 0;
          for (const writer of transaction.work?.swrs ?? []) {
            const row = new Map<string, string | number>(
              columnKeys.map((key: string) => [key, ''])
            );
            totalContribution +=
              normalizedContributions[writer.fields.interestedPartyNumber] * 2;
            const contribution = (
              normalizedContributions[writer.fields.interestedPartyNumber] * 2
            )
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
            row.set('controlled', 'Y');
            row.set('affiliation', patchSociety);
            row.set('ipiNameNumber', writer.fields.ipiNameNumber ?? '');
            row.set('aka', aka.fields.alternativeTitle);
            rowCollection.push(row);
          }
          for (const writer of transaction.work?.owrs ?? []) {
            const row = new Map<string, string | number>(
              columnKeys.map((key: string) => [key, ''])
            );
            totalContribution += getContribution(writer, false) * 2;
            const contribution = (getContribution(writer, false) * 2)
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
            row.set('controlled', 'N');
            row.set('affiliation', patchSociety);
            row.set('ipiNameNumber', writer.fields.ipiNameNumber ?? '');
            row.set('aka', aka.fields.alternativeTitle);
            rowCollection.push(row);
          }
        }
        if (Math.abs(totalContribution - 100) > 1e-6)
          warnings.push(
            `<span class="text-rose-600 dark:text-rose-300 font-semibold">[Contribution %]</span>
            <span class="text-gray-500 dark:text-gray-400 font-medium">Title: ${workTitle}</span>
            <span class="text-blue-600 dark:text-blue-300 font-medium">
            Contribution percentage total: ${totalContribution.toFixed(2)}
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
