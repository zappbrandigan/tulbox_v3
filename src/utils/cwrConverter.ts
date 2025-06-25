import { CWRPublisher, CWRWriter, ParsedCWRFile } from 'cwr-parser/types';
import { CWRTransmission, CWRGroup, CWRRecordType, CWRTransaction, CWRInitialParseResult, CWRTemplate } from '../types/cwrTypes';
import { CWR_FIELD_MAP } from './cwrRecordDefinitions';


export class CWRConverter {
  // custom parser for code view
  static convertFile(fileContent: string, fileName: string): CWRInitialParseResult {
    const lines = fileContent.split(/\r?\n/).filter(line => line.trim());
    const transmission: CWRTransmission = {
      header: new Map(),
      trailer: new Map(),
      groups: []
    };
    const errors: string[] = [];

    let currentGroup: CWRGroup | null = null;
    let currentTransaction: CWRTransaction | null = null;

    for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
      const line = lines[lineNumber];
      const recordType = line.substring(0, 3).trim() as CWRRecordType;
      const fieldDef = CWR_FIELD_MAP[recordType];

      if (!fieldDef) {
        errors.push(`Unknown record type '${recordType}' at line ${lineNumber + 1}`);
        continue;
      }

      const record = this.buildRecord(recordType, line);

      switch (recordType) {
        case 'HDR':
          transmission.header = record;
          break;

        case 'TRL':
          transmission.trailer = record;
          break;

        case 'GRH':
          currentGroup = {
            header: record,
            trailer: new Map(),
            transactions: []
          };
          transmission.groups.push(currentGroup);
          currentTransaction = null; // reset for new group
          break;

        case 'GRT':
          if (currentGroup) {
            currentGroup.trailer = record;
          } else {
            errors.push(`GRT without preceding GRH at line ${lineNumber + 1}`);
          }
          break;

        case 'AGR':
        case 'NWR':
        case 'REV':
        case 'ISW':
        case 'EXC':
        case 'ACK':
          if (currentGroup) {
            currentTransaction = {
              type: recordType,
              records: [record] // header is the first record
            };
            currentGroup.transactions.push(currentTransaction);
          } else {
            errors.push(`Transaction '${recordType}' outside of group at line ${lineNumber + 1}`);
          }
          break;

        default:
          if (currentTransaction) {
            currentTransaction.records.push(record);
          } else {
            errors.push(`Record '${recordType}' not part of a transaction at line ${lineNumber + 1}`);
          }
          break;
      }
    }

    return {
      fileName,
      groupCount: Number(transmission.trailer.get('groupCount') ?? '0'),
      transactionCount: Number(transmission.trailer.get('transactionCount') ?? '0'),
      recordCount: Number(transmission.trailer.get('recordCount') ?? '0'),
      transmission,
      errors,
      parseDate: new Date(),
    };
  }

  static flattenRecords (transmission: CWRTransmission): Map<string, string>[] {
    const result: Map<string, string>[] = [];

    result.push(transmission.header);

    for (const group of transmission.groups) {
      result.push(group.header);
      for (const tx of group.transactions) {
        for (const record of tx.records) {
          result.push(record);
        }
      }
      result.push(group.trailer);
    }

    result.push(transmission.trailer);
    return result;
  }

  // static formatCWRShare(raw: string | undefined | null): string {
  //   if (!raw || !/^\d+$/.test(raw)) return '0.00';

  //   const padded = raw.padStart(3, '0'); // ensures at least 3 digits, e.g., '5' → '005'
  //   const len = padded.length;
  //   const share = `${padded.slice(0, len - 2)}.${padded.slice(len - 2)}`;
  //   return parseFloat(share).toFixed(2);
  // }

  static getPublisherInfo(
    { 
      songCode, 
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
      workTitle: string; 
      iswc: string, 
      akas: string, 
      setupNote: string, 
      titleNote: string, 
      recordingTitle: string, 
      albumTitle: string, 
      catalogNum: string 
    },
    publisher: CWRPublisher,
    columns: [string, string][]
  ) {
    const row = new Map<string, string | number>(columns);
    const publisherName = publisher.data.publisherUnknownIndicator === 'Y'
      ? 'UNKNOWN PUBLISHER'
      : publisher.data.publisherName ?? 'UNKNOWN PUBLISHER';
    const publisherControlFlag = publisher.recordType === 'SPU'
      ? 'Y'
      : 'N';

    // const controllingWriterCount = publisher.writers?.length || 1;
    // const perfShare = (publisher.data.prOwnershipShare ?? 0);
    // const individualShare = perfShare / controllingWriterCount;

    row.set('recordingTitle', recordingTitle);
    row.set('albumTitle', albumTitle);
    row.set('catalogNum', catalogNum);
    row.set('songCode', songCode);
    row.set('workTitle', workTitle);
    row.set('iswc', iswc);
    row.set('akas', akas);
    row.set('setupNote', setupNote);
    row.set('titleNote', titleNote);
    row.set('publisherSeqNum', publisher.data.publisherSequenceNumber);
    row.set('territoryCode', publisher.territories?.[0]?.data.tisCode ?? '');
    row.set('ogTerritoryFlag', publisher.territories?.[0]?.data.inclusionExclusionIndicator ?? '');
    row.set('controlled', publisherControlFlag);
    row.set('capacity', publisher.data.publisherType ?? '');
    row.set('ipNum', publisher.data.publisherIpNumber ?? '');
    row.set('publisherName', publisherName);
    row.set('ipiNameNum', Number(publisher.data.publisherIpiNameNumber?? ''));
    row.set('society', publisher.data.prAffiliationSocietyNumber ?? '');
    row.set('prOwnership', publisher.data.prOwnershipShare ?? 0); 
    row.set('mrOwnership', publisher.data.mrOwnershipShare ?? 0);
    row.set('prCollection', publisher.territories?.[0]?.data.prCollectionShare ?? 0);
    row.set('mrCollection', publisher.territories?.[0]?.data.mrCollectionShare ?? 0);

    return row;
  }

  static getWriterInfo(
    { 
      songCode, 
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
      workTitle: string; 
      iswc: string, 
      akas: string, 
      setupNote: string, 
      titleNote: string, 
      recordingTitle: string, 
      albumTitle: string, 
      catalogNum: string 
    },
    writer: CWRWriter,
    columns: [string, string][],
  ) {
      const row = new Map<string, string | number>(columns);
      const writerName = !writer.data.writerLastName
        ? 'UNKNOWN WRITER'
          : !writer.data.writerFirstName
            ? writer.data.writerLastName
              : `${writer.data.writerLastName}, ${writer.data.writerFirstName}`;
      const writerControlFlag = writer.recordType === 'SWR'
        ? 'Y'
        : 'N';

      const controllingPublisherCount = writer.publishers?.length || 1;
      const totalContribution = (writer.data.prOwnershipShare ?? 0) * 2;
      const individualContribution = totalContribution / controllingPublisherCount;
      const individualPerfShare = (writer.data.prOwnershipShare ?? 0) / controllingPublisherCount;
      
      row.set('contribution', individualContribution); // e.g., 16.67

      row.set('recordingTitle', recordingTitle);
      row.set('albumTitle', albumTitle);
      row.set('catalogNum', catalogNum);
      row.set('songCode', songCode);
      row.set('workTitle', workTitle);
      row.set('iswc', iswc);
      row.set('akas', akas);
      row.set('setupNote', setupNote);
      row.set('titleNote', titleNote);
      row.set('publisherSeqNum', '');
      row.set('territoryCode', writer.territories?.[0]?.data.tisCode ?? '');
      row.set('ogTerritoryFlag', writer.territories?.[0]?.data.inclusionExclusionIndicator ?? '');
      row.set('controlled', writerControlFlag);
      row.set('capacity', writer.data.writerDesignationCode);
      row.set('ipNum', writer.data.writerIpNumber);
      row.set('publisherName', '');
      row.set('composerName', writerName);
      row.set('ipiNameNum', Number(writer.data.writerIPINameNumber ?? '')); // will be change to writerIpiNameNumber in next version
      row.set('society', writer.data.prSocietyNumber ?? '');
      row.set('prOwnership', individualPerfShare);
      row.set('mrOwnership', writer.data.mrOwnershipShare ?? 0);
      row.set('prCollection', writer.territories?.[0]?.data.prCollectionShare ?? 0);
      row.set('mrCollection', writer.territories?.[0]?.data.mrCollectionShare ?? 0);
    return row;
  }

  static generateWorkReport(transmission: ParsedCWRFile, template: CWRTemplate) {
    const rowCollection: Map<string, string | number>[] =[];
    const columns = template.fields.map(field => [field.key, ''] as [string, string]);
    for (const group of transmission.groups) {
      for (const transaction of group.transactions) {
        const rows: Map<string, string | number>[] =[];
        const songCode = Number(transaction.header.data.submitterWorkNumber);
        const intendedPurpose = transaction.originators?.[0]?.data.intendedPurpose;
        const setupNote = intendedPurpose === 'TEL' || intendedPurpose === 'FIL' ? 'FTV' : '';

        const repeatedData = {
          songCode: isNaN(songCode) ? transaction.header.data.submitterWorkNumber : songCode,
          languageCode: transaction.header.data.languageCode ?? '',
          workTitle: transaction.header.data.workTitle,
          iswc: transaction.header.data.iswc ?? '',
          akas: transaction.alternativeTitles.length ? 'See AKA Table' : '',
          setupNote: setupNote,
          titleNote: transaction.originators?.[0]?.data.productionTitle ?? '',
          recordingTitle: transaction.recordings?.[0]?.data.recordingTitle ?? 'No principal recording identified', // need to add in cwr-parser
          albumTitle: transaction.recordings?.[0]?.data.firstAlbumTitle ?? 'No album/single title identified',
          catalogNum: transaction.recordings?.[0]?.data.firstReleaseCatalogNumber ?? 'No catalog number identified'
        };

        const publishers = transaction.publishers;
        for (let index = 0; index < transaction.publishers.length; index++) {
          rows.push(this.getPublisherInfo(repeatedData, publishers[index], columns));
        
          const next = index + 1 < publishers.length ? index + 1 : 0;
          if (
            !next || 
            Number(publishers[index].data.publisherSequenceNumber) < publishers[next].data.publisherSequenceNumber
          ) {
            for (const writer of transaction.writers) {
              const currentPublisher = writer.publishers?.find(
                p => p.data.publisherIpNumber === publishers[index].data.publisherIpNumber
              );
              if (currentPublisher) {
                rows.push(this.getWriterInfo(repeatedData, writer, columns));
              }
            }
          }
        }

        const writers = [...transaction.otherWriters];
        const otherPublishers = [...transaction.otherPublishers];

        let writerIndex = 0;
        let publisherIndex = 0;

        while (writerIndex < writers.length && publisherIndex < otherPublishers.length) {
          const writer = writers[writerIndex];
          const writerShare = (writer.data.prOwnershipShare ?? 0) * 2;

          let collectedPublisherShare = 0;
          const collectedPublishers: typeof publishers = [];

          // Collect publishers until their total share matches or exceeds writer's share
          while (
            publisherIndex < otherPublishers.length &&
            collectedPublisherShare < writerShare
          ) {
            const publisher = otherPublishers[publisherIndex];
            const pubShare = (publisher.data.prOwnershipShare ?? 0) * 2;

            collectedPublisherShare += pubShare;
            collectedPublishers.push(publisher);
            publisherIndex++;
          }

          // Only emit if we have enough share
          if (
            collectedPublisherShare >= writerShare ||
            Math.abs(collectedPublisherShare - writerShare) < Number.EPSILON
          ) {
            // Push all collected publishers
            for (const pub of collectedPublishers) {
              rows.push(this.getPublisherInfo(repeatedData, pub, columns));
            }

            // Push the writer
            rows.push(this.getWriterInfo(repeatedData, writer, columns));

            writerIndex++;
          } else {
            // Not enough publisher share to match writer — break to avoid infinite loop
            break;
          }
        }

        rowCollection.push(...rows);
      }
    }
    return rowCollection;
  }

  static generateIsrcReport(transmission: ParsedCWRFile, template: CWRTemplate) {
    const rowCollection: Map<string, string | number>[] =[];
    const columns = template.fields.map(field => [field.key, ''] as [string, string]);

    for (const group of transmission.groups) {
      for (const transaction of group.transactions) {
        const rows: Map<string, string | number>[] =[];
        if (!transaction.recordings.length) { continue; } // skip if not REC records
          for (const recording of transaction.recordings) {
            const row = new Map<string, string | number>(columns);
            row.set('songCode', Number(transaction.header.data.submitterWorkNumber));
            row.set('isrc', recording.data.isrc ?? '');
            rows.push(row);
          }
        rowCollection.push(...rows);
      }
    }
    return rowCollection;
  }

    static generateAkaReport(transmission: ParsedCWRFile, template: CWRTemplate) {
    const rowCollection: Map<string, string | number>[] =[];
    const columns = template.fields.map(field => [field.key, ''] as [string, string]);

    for (const group of transmission.groups) {
      for (const transaction of group.transactions) {
        const rows: Map<string, string | number>[] =[];
        if (!transaction.alternativeTitles.length) { continue; } // skip if not REC records
          for (const alternativeTitle of transaction.alternativeTitles) {
            const row = new Map<string, string | number>(columns);
            row.set('songCode', Number(transaction.header.data.submitterWorkNumber));
            row.set('aka', alternativeTitle.data.alternativeTitle);
            row.set('languageCode', alternativeTitle.data.languageCode ?? '');
            row.set('workTitle', transaction.header.data.workTitle);
            rows.push(row);
          }
        rowCollection.push(...rows);
      }
    }
    return rowCollection;
  }

  // record builder for custum parseFile method for code view
  private static buildRecord(type: CWRRecordType, line: string): Map<string, string> {
    const fieldDef = CWR_FIELD_MAP[type];
    const record = new Map<string, string>();

    record.set('recordType', type);

    for (const [fieldName, def] of Object.entries(fieldDef.fields)) {
      const value = line.substring(def.start, def.start + def.size).trim();
      record.set(fieldName, value);
    }

    return record;
  }
}