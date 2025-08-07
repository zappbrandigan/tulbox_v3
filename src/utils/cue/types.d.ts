export interface WriterInfo {
  name: string;
  role: string;
  pro: string;
  contribution: string;
}

export interface CueRow {
  fileName: string;
  sequenceNumber: string;
  workTitle: string;
  usage: string;
  type: string;
  duration: string;
  publishers: string;
  writers: WriterInfo[];
}
