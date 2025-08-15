import { CWRTemplate } from '@/types';

const CWR_TEMPLATES: CWRTemplate[] = [
  {
    id: 'raw-viewer',
    version: '1.9.2',
    name: 'Raw File Viewer',
    description:
      'View the original CWR .v21/.v22 file content, hover cells for additional info.',
    fields: [],
  },
  {
    id: 'work-report',
    name: 'Work Report',
    version: '0.0.7',
    description: 'Detailed works information with roles and shares',
    fields: [
      { key: 'songCode', label: 'Song Code', type: 'string', width: 180 },
      { key: 'workType', label: 'New/Rev', type: 'string', width: 100 },
      { key: 'workTitle', label: 'Work Title', type: 'string', width: 300 },
      { key: 'territoryCode', label: 'Terr. Code', type: 'string', width: 100 },
      {
        key: 'publisherSeqNum',
        label: 'Pub. Seq. #',
        type: 'string',
        width: 100,
      },
      { key: 'capacity', label: 'Role', type: 'string', width: 75 },
      { key: 'controlled', label: 'Ctrl', type: 'string', width: 75 },
      { key: 'ipNum', label: 'IP #', type: 'string', width: 150 },
      { key: 'publisherName', label: 'Pub. Name', type: 'string', width: 300 },
      { key: 'composerName', label: 'Writer Name', type: 'string', width: 300 },
      { key: 'ipiNameNum', label: 'IPI Name #', type: 'string', width: 175 },
      { key: 'society', label: 'Society', type: 'string', width: 125 },
      {
        key: 'contribution',
        label: 'Contribution',
        type: 'number',
        width: 125,
        style: { numFmt: '0.00' },
      },
      {
        key: 'prOwnership',
        label: 'PR Ownership',
        type: 'number',
        width: 125,
        style: { numFmt: '0.00' },
      },
      {
        key: 'mrOwnership',
        label: 'MR Ownership',
        type: 'number',
        width: 125,
        style: { numFmt: '0.00' },
      },
      {
        key: 'prCollection',
        label: 'PR Collection',
        type: 'number',
        width: 125,
        style: { numFmt: '0.00' },
      },
      {
        key: 'mrCollection',
        label: 'MR Collection',
        type: 'number',
        width: 125,
        style: { numFmt: '0.00' },
      },
      { key: 'rolledNames', label: 'Rolled Names', type: 'string', width: 125 },
      {
        key: 'additionalInfo',
        label: 'Additional Info',
        type: 'string',
        width: 125,
      },
    ],
  },
  {
    id: 'isrc-report',
    version: '1.0.0',
    name: 'ISRCs',
    description: 'All ISRC records present',
    fields: [
      { key: 'prefCode', label: 'PREF Code', type: 'string', width: 9 },
      { key: 'songCode', label: 'Song Code', type: 'string', width: 9 },
      { key: 'isrc', label: 'ISRCs', type: 'string', width: 13 },
    ],
  },
  {
    id: 'aka-report',
    version: '1.0.2',
    name: 'AKA Titles',
    description: 'All AKAs (ALT record) present',
    fields: [
      { key: 'songCode', label: 'Song Code', type: 'string', width: 9 },
      { key: 'aka', label: 'AKAs', type: 'string', width: 30 },
      { key: 'languageCode', label: 'AKA Lang', type: 'string', width: 10 },
      { key: 'workTitle', label: 'Work Title', type: 'string', width: 30 },
    ],
  },
  {
    id: 'ip-report',
    version: '1.0.0',
    name: 'Interested Parties',
    description: 'All interested parties present in the CWR file',
    fields: [
      {
        key: 'ipNumber',
        label: 'IP #',
        type: 'string',
        width: 100,
      },
      { key: 'type', label: 'IP Type', type: 'string', width: 100 },
      { key: 'name', label: 'IP Name', type: 'string', width: 150 },
      { key: 'ipiNumber', label: 'IPI #', type: 'string', width: 100 },
      { key: 'pro', label: 'PRO', type: 'string', width: 100 },
    ],
  },
  {
    id: 'cat-import',
    version: '0.3.7',
    name: 'Cat Import',
    description: 'CWR data formated for Cat Import.',
    fields: [
      {
        key: 'submitterWorkNumber',
        label: 'Submitter Work No',
        type: 'string',
        width: 125,
      }, // not in CWR
      { key: 'iswc', label: 'ISWC Number', type: 'string', width: 125 },
      { key: 'workTitle', label: 'Song Title', type: 'string', width: 300 },
      {
        key: 'songTypeCode',
        label: 'Song Type Code',
        type: 'string',
        width: 2,
      }, // not in CWR
      { key: 'lastName', label: 'IP Name/Surname', type: 'string', width: 200 },
      { key: 'firstName', label: 'IP First Name', type: 'string', width: 200 },
      { key: 'capacity', label: 'Capacity Code', type: 'string', width: 100 },
      {
        key: 'contribution',
        label: 'Contribution',
        type: 'string',
        width: 125,
      },
      { key: 'controlled', label: 'Controlled', type: 'string', width: 125 },
      { key: 'affiliation', label: 'Affiliation', type: 'string', width: 125 },
      {
        key: 'ipiNameNumber',
        label: 'IPI Name Number',
        type: 'string',
        width: 150,
      },
      { key: 'aka', label: 'AKA Song Title', type: 'string', width: 125 },
      { key: 'pkaIpName', label: 'PKA IP Name', type: 'string', width: 125 },
      {
        key: 'pkaIpFirstName',
        label: 'PKA IP First Name',
        type: 'string',
        width: 125,
      },
    ],
  },
  {
    id: 'msg-report',
    version: '1.0.0',
    name: 'Message Records',
    description: 'All message records present in the CWR file',
    fields: [
      {
        key: 'transactionSeqNum',
        label: 'Tran Seq #',
        type: 'string',
        width: 75,
      },
      { key: 'recSeqNum', label: 'Rec Seq #', type: 'string', width: 75 },
      { key: 'ogRecSeqNum', label: 'OG Rec Seq #', type: 'string', width: 75 },
      { key: 'ogRecType', label: 'OG Rec Type', type: 'string', width: 100 },
      { key: 'msgLevel', label: 'Msg Level', type: 'string', width: 75 },
      {
        key: 'validationLevel',
        label: 'Valication Level',
        type: 'string',
        width: 100,
      },
      { key: 'msgText', label: 'Message', type: 'string', width: 900 },
    ],
  },
] as const;

const getTemplateById = (id: CWRTemplate['id']): CWRTemplate => {
  const template = CWR_TEMPLATES.find((template) => template.id === id);
  if (!template) {
    throw new Error(`Template with id ${id} not found`);
  }
  return template;
};

export const getRecordTypeColor = (recordType: string): string => {
  const colors: Record<string, string> = {
    HDR: 'bg-purple-100 text-purple-800 border-purple-200',
    GRH: 'bg-blue-100 text-blue-800 border-blue-200',
    TRL: 'bg-gray-100 text-gray-800 border-gray-200',
    NWR: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    REV: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    SWR: 'bg-amber-100 text-amber-800 border-amber-200',
    SPU: 'bg-orange-100 text-orange-800 border-orange-200',
    TER: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    ALT: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    PER: 'bg-pink-100 text-pink-800 border-pink-200',
    REC: 'bg-teal-100 text-teal-800 border-teal-200',
    ORN: 'bg-lime-100 text-lime-800 border-lime-200',
    INS: 'bg-violet-100 text-violet-800 border-violet-200',
    COM: 'bg-rose-100 text-rose-800 border-rose-200',
    CON: 'bg-sky-100 text-sky-800 border-sky-200',
  };

  return colors[recordType] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export { CWR_TEMPLATES, getTemplateById };
