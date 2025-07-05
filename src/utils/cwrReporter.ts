import {
  CWROtherPublisher,
  CWROtherWriter,
  CWRPublisher,
  CWRWriter,
  ParsedCWRFile,
} from 'cwr-parser/types';
import { CWRTemplate, CWRTemplateField } from '@/types';

class CWRReporter {
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
      iswc: string;
      akas: string;
      setupNote: string;
      titleNote: string;
      recordingTitle: string;
      albumTitle: string;
      catalogNum: string;
    },
    publisher: CWRPublisher | CWROtherPublisher,
    columns: [string, string][]
  ) {
    const row = new Map<string, string | number>(columns);
    const publisherName =
      publisher.data.publisherUnknownIndicator === 'Y'
        ? 'UNKNOWN PUBLISHER'
        : publisher.data.publisherName ?? 'UNKNOWN PUBLISHER';
    const publisherControlFlag = publisher.recordType === 'SPU' ? 'Y' : 'N';

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
    row.set(
      'ogTerritoryFlag',
      publisher.territories?.[0]?.data.inclusionExclusionIndicator ?? ''
    );
    row.set('controlled', publisherControlFlag);
    row.set('capacity', publisher.data.publisherType ?? '');
    row.set('ipNum', publisher.data.interestedPartyNumber ?? '');
    row.set('publisherName', publisherName);
    row.set('ipiNameNum', Number(publisher.data.ipiNameNumber ?? ''));
    row.set('society', publisher.data.prAffiliationSocietyNumber ?? '');
    row.set('prOwnership', publisher.data.prOwnershipShare ?? 0);
    row.set('mrOwnership', publisher.data.mrOwnershipShare ?? 0);
    row.set(
      'prCollection',
      publisher.territories?.[0]?.data.prCollectionShare ?? 0
    );
    row.set(
      'mrCollection',
      publisher.territories?.[0]?.data.mrCollectionShare ?? 0
    );

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
      iswc: string;
      akas: string;
      setupNote: string;
      titleNote: string;
      recordingTitle: string;
      albumTitle: string;
      catalogNum: string;
    },
    writer: CWRWriter | CWROtherWriter,
    columns: [string, string][]
  ) {
    const row = new Map<string, string | number>(columns);
    const writerName = !writer.data.writerLastName
      ? 'UNKNOWN WRITER'
      : !writer.data.writerFirstName
      ? writer.data.writerLastName
      : `${writer.data.writerLastName}, ${writer.data.writerFirstName}`;
    const writerControlFlag = writer.recordType === 'SWR' ? 'Y' : 'N';

    const controllingPublisherCount = writer.publishers?.length || 1;
    const totalContribution = (writer.data.prOwnershipShare ?? 0) * 2;
    const individualContribution =
      totalContribution / controllingPublisherCount;
    const individualPerfShare =
      (writer.data.prOwnershipShare ?? 0) / controllingPublisherCount;

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
    row.set(
      'ogTerritoryFlag',
      writer.territories?.[0]?.data.inclusionExclusionIndicator ?? ''
    );
    row.set('controlled', writerControlFlag);
    row.set('capacity', writer.data.writerDesignationCode);
    row.set('ipNum', writer.data.interestedPartyNumber);
    row.set('publisherName', '');
    row.set('composerName', writerName);
    row.set('ipiNameNum', Number(writer.data.ipiNameNumber ?? '')); // will be change to writerIpiNameNumber in next version
    row.set('society', writer.data.prAffiliationSocietyNumber ?? '');
    row.set('prOwnership', individualPerfShare);
    row.set('mrOwnership', writer.data.mrOwnershipShare ?? 0);
    row.set(
      'prCollection',
      writer.territories?.[0]?.data.prCollectionShare ?? 0
    );
    row.set(
      'mrCollection',
      writer.territories?.[0]?.data.mrCollectionShare ?? 0
    );
    return row;
  }

  static generateWorkReport(
    transmission: ParsedCWRFile,
    template: CWRTemplate
  ) {
    const rowCollection: Map<string, string | number>[] = [];
    const columns = template.fields.map(
      (field: CWRTemplateField) => [field.key, ''] as [string, string]
    );

    for (const group of transmission.groups) {
      for (const transaction of group.transactions) {
        const rows: Map<string, string | number>[] = [];
        const songCode = Number(transaction.header.data.submitterWorkNumber);
        const setupNote = transaction.originators?.[0]?.data.intendedPurpose;

        const repeatedData = {
          songCode: isNaN(songCode)
            ? transaction.header.data.submitterWorkNumber
            : songCode,
          languageCode: transaction.header.data.languageCode ?? '',
          workTitle: transaction.header.data.workTitle,
          iswc: transaction.header.data.iswc ?? '',
          akas: transaction.alternativeTitles.length ? 'See AKA Table' : '',
          setupNote: setupNote,
          titleNote: transaction.originators?.[0]?.data.productionTitle ?? '',
          recordingTitle:
            transaction.recordings?.[0]?.data.recordingTitle ??
            'No principal recording identified', // need to add in cwr-parser
          albumTitle:
            transaction.recordings?.[0]?.data.firstAlbumTitle ??
            'No album/single title identified',
          catalogNum:
            transaction.recordings?.[0]?.data.firstReleaseCatalogNumber ??
            'No catalog number identified',
        };

        const publishers = transaction.publishers;
        for (let index = 0; index < transaction.publishers.length; index++) {
          rows.push(
            this.getPublisherInfo(repeatedData, publishers[index], columns)
          );

          const next = index + 1 < publishers.length ? index + 1 : 0;
          if (
            !next ||
            Number(publishers[index].data.publisherSequenceNumber) <
              publishers[next].data.publisherSequenceNumber
          ) {
            for (const writer of transaction.writers) {
              const currentPublisher = writer.publishers?.find(
                (p) =>
                  p.data.publisherInterestedPartyNumber ===
                  publishers[index].data.interestedPartyNumber
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

        // const usedPublishers = new Set<string>();

        while (
          writerIndex < writers.length &&
          publisherIndex < otherPublishers.length
        ) {
          const writer = writers[writerIndex];
          const writerShare = (writer.data.prOwnershipShare ?? 0) * 2;

          let collectedPublisherShare = 0;
          const collectedPublishers: typeof otherPublishers = [];

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
            Math.abs(collectedPublisherShare - writerShare) < 1e-6
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

  static generateIsrcReport(
    transmission: ParsedCWRFile,
    template: CWRTemplate
  ) {
    const rowCollection: Map<string, string | number>[] = [];
    const columns = template.fields.map(
      (field: CWRTemplateField) => [field.key, ''] as [string, string]
    );

    for (const group of transmission.groups) {
      for (const transaction of group.transactions) {
        const rows: Map<string, string | number>[] = [];
        if (!transaction.recordings.length) {
          continue;
        } // skip if not REC records
        for (const recording of transaction.recordings) {
          if (!recording.data.isrc) continue; // skip if REC has no ISRC
          const row = new Map<string, string | number>(columns);
          row.set('songCode', transaction.header.data.submitterWorkNumber);
          row.set('isrc', recording.data.isrc ?? '');
          rows.push(row);
        }
        rowCollection.push(...rows);
      }
    }
    return rowCollection;
  }

  static generateAkaReport(transmission: ParsedCWRFile, template: CWRTemplate) {
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

    const rowCollection: Map<string, string | number>[] = [];
    const columns = template.fields.map(
      (field: CWRTemplateField) => [field.key, ''] as [string, string]
    );

    for (const group of transmission.groups) {
      for (const transaction of group.transactions) {
        if (!transaction.alternativeTitles.length) continue;

        const rows: Map<string, string | number>[] = [];

        for (const alternativeTitle of transaction.alternativeTitles) {
          const row = new Map<string, string | number>(columns);
          row.set('songCode', transaction.header.data.submitterWorkNumber);
          row.set('aka', alternativeTitle.data.alternativeTitle);
          row.set('languageCode', alternativeTitle.data.languageCode ?? '');
          row.set('workTitle', transaction.header.data.workTitle);
          // Only add the row if it's not a duplicate
          if (!isRowDuplicate(row, rows)) {
            rows.push(row);
          }
        }
        rowCollection.push(...rows);
      }
    }
    return rowCollection;
  }

  static generateCatImport(transmission: ParsedCWRFile, template: CWRTemplate) {
    const rowCollection: Map<string, string | number>[] = [];

    // Collect all expected column keys from the template
    const columnKeys = template.fields.map(
      (field: CWRTemplateField) => field.key
    );

    for (const group of transmission.groups) {
      for (const transaction of group.transactions) {
        const iswc = transaction.header.data.iswc ?? '';
        const workTitle = transaction.header.data.workTitle ?? '';
        const songTypeCode = 'OG';

        // Writer rows
        for (const writer of transaction.writers) {
          const row = new Map<string, string | number>(
            columnKeys.map((key: string) => [key, ''])
          );
          const contribution = (writer.data.prOwnershipShare * 2)
            .toFixed(2) // ensures 2 decimal places
            .padStart(6, '0'); // pads total length to 6 (e.g. "005.00")

          row.set('iswc', iswc);
          row.set('workTitle', workTitle);
          row.set('songTypeCode', songTypeCode);
          row.set('lastName', writer.data.writerLastName ?? '');
          row.set('firstName', writer.data.writerFirstName ?? '');
          row.set('capacity', writer.data.writerDesignationCode ?? '');
          row.set('contribution', contribution);
          row.set('controlled', writer.recordType === 'SWR' ? 'Y' : 'N');
          row.set('affiliation', writer.data.prAffiliationSocietyNumber ?? '');
          row.set('ipiNameNumber', writer.data.ipiNameNumber ?? '');
          rowCollection.push(row);
        }

        // Publisher rows
        for (const publisher of transaction.publishers) {
          const row = new Map<string, string | number>(
            columnKeys.map((key) => [key, ''])
          );
          const contribution = (publisher.data.prOwnershipShare * 2)
            .toFixed(2) // ensures 2 decimal places
            .padStart(6, '0'); // pads total length to 6 (e.g. "005.00")
          row.set('iswc', iswc);
          row.set('workTitle', workTitle);
          row.set('songTypeCode', songTypeCode);
          row.set('lastName', publisher.data.publisherName ?? '');
          row.set('firstName', '');
          row.set('capacity', publisher.data.publisherType ?? '');
          row.set('contribution', contribution);
          row.set('controlled', publisher.recordType === 'SPU' ? 'Y' : 'N');

          // This was previously duplicated — pick the correct field
          row.set(
            'affiliation',
            publisher.data.prAffiliationSocietyNumber ?? ''
          );
          row.set('ipiNameNumber', publisher.data.ipiNameNumber ?? '');
          rowCollection.push(row);
        }
      }
    }

    return rowCollection;
  }
}

export default CWRReporter;
