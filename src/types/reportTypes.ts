export interface WriterShare {
  publisherPerfShare?: string;
  publisherMechShare?: string;
  publisherSyncShare?: string;
}

export interface WriterEntry extends WriterShare {
  writerLastName: string;
  writerFirstName: string;
  writerCapacity: string;
  writerPublisher: string;
}

export interface WriterReportRow extends WriterEntry {
  workTitle: string;
}
