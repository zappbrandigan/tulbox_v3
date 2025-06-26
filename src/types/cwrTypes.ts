export const CWR_RECORD_TYPES = {
  CONTROL: [
    'HDR', 'GRH', 'GRT', 'TRL'
  ] as const,
  TRANSACTION: [
    'AGR', 'NWR', 'REV',
    'ISW', 'EXC', 'ACK'
  ] as const,
  DETAIL: [
    'TER', 'IPA', 'NPA', 'SPU', 'OPU',
    'NPN', 'SPT', 'SWR', 'OWR', 'NWN', 
    'SWT', 'PWR', 'ALT', 'NAT', 'EWT', 
    'VER', 'PER', 'NPR', 'REC', 'ORN',
    'INS', 'IND', 'COM', 'MSG', 'NET',
    'NCT', 'NVT', 'NOW', 'ARI'
  ] as const
};

export type CWRControlHeaders = typeof CWR_RECORD_TYPES.CONTROL[number];
export type CWRTransactionHeaders = typeof CWR_RECORD_TYPES.TRANSACTION[number];
export type CWRDetailRecords = typeof CWR_RECORD_TYPES.DETAIL[number];
export type CWRRecordType = CWRControlHeaders | CWRTransactionHeaders | CWRDetailRecords;

export type CWRFieldDefinition = {
  header: string;
  desc: string;
  start: number;
  size: number;
  required: boolean;
};

export type CWRRecordDefinition = {
  recordType: CWRRecordType;
  desc: string;
  fields: Record<string, CWRFieldDefinition>;
};

export type CWRRecord = Map<string, string>;

export type CWRTransaction = {
  type: CWRTransactionHeaders | string; 
  records: CWRRecord[];
};

export type CWRGroup = {
  header: CWRRecord;
  trailer: CWRRecord;
  transactions: CWRTransaction[];
};

export type CWRTransmission = {
  header: CWRRecord;
  trailer: CWRRecord;
  groups: CWRGroup[];
};

export interface CWRInitialParseResult {
  fileName: string;
  groupCount: number;
  transactionCount: number;
  recordCount: number;
  transmission: CWRTransmission;
  errors: string[];
  parseDate: Date;
}

export interface CWRTemplateField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'array' | 'nested';
  width?: number;
  style?: object;
}

export interface CWRTemplate {
  id: string;
  name: string;
  description: string;
  fields: CWRTemplateField[];
}
