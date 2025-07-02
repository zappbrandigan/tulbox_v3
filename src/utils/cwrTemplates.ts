import { CWRTemplate } from '../types/cwrTypes';

export const CWR_TEMPLATES: CWRTemplate[] = [
  {
    id: 'raw-viewer',
    name: 'Raw File Viewer',
    description:
      'View the original CWR .v21/.v22 file content, hover cells for additional info.',
    fields: [],
  },
  {
    id: 'works-report',
    name: 'Works Report',
    description: 'Detailed works information with roles and shares',
    fields: [
      { key: 'songCode', label: 'Song Code', type: 'string', width: 9 },
      { key: 'workTitle', label: 'Work Title', type: 'string', width: 30 },
      { key: 'prefCode', label: 'PREF Code', type: 'string', width: 9 },
      { key: 'akas', label: 'AKAs', type: 'string', width: 10 },
      { key: 'iswc', label: 'ISWC', type: 'string', width: 12 },
      { key: 'setupNote', label: 'Setup Note', type: 'string' },
      { key: 'titleNote', label: 'Title Note', type: 'string' },
      { key: 'recordingTitle', label: 'Rec. Title', type: 'string' },
      { key: 'albumTitle', label: 'Album Title', type: 'string' },
      { key: 'catalogNum', label: 'Catalog #', type: 'string' },
      { key: 'territoryCode', label: 'Terr. Code', type: 'string', width: 9 },
      { key: 'ogTerritoryFlag', label: 'OG Terr.', type: 'string', width: 7 },
      {
        key: 'publisherSeqNum',
        label: 'Pub. Seq. #',
        type: 'string',
        width: 7,
      },
      { key: 'capacity', label: 'Role', type: 'string', width: 7 },
      { key: 'controlled', label: 'Controlled', type: 'string', width: 7 },
      { key: 'ipNum', label: 'IP #', type: 'string', width: 11 },
      { key: 'publisherName', label: 'Pub. Name', type: 'string', width: 40 },
      { key: 'composerName', label: 'Writer Name', type: 'string', width: 30 },
      { key: 'ipiNameNum', label: 'IPI Name #', type: 'string', width: 12 },
      { key: 'society', label: 'Society', type: 'string', width: 7 },
      {
        key: 'contribution',
        label: 'Contribution',
        type: 'number',
        width: 11,
        style: { numFmt: '0.00' },
      },
      {
        key: 'prOwnership',
        label: 'PR Ownership',
        type: 'number',
        width: 10,
        style: { numFmt: '0.00' },
      },
      {
        key: 'mrOwnership',
        label: 'MR Ownership',
        type: 'number',
        width: 10,
        style: { numFmt: '0.00' },
      },
      {
        key: 'prCollection',
        label: 'PR Collection',
        type: 'number',
        width: 10,
        style: { numFmt: '0.00' },
      },
      {
        key: 'mrCollection',
        label: 'MR Collection',
        type: 'number',
        width: 10,
        style: { numFmt: '0.00' },
      },
      { key: 'rolledNames', label: 'Rolled Names', type: 'string' },
      { key: 'additionalInfo', label: 'Additional Info', type: 'string' },
    ],
  },
  {
    id: 'isrc-report',
    name: 'ISRC Report',
    description: 'All ISRC records present',
    fields: [
      { key: 'prefCode', label: 'PREF Code', type: 'string', width: 9 },
      { key: 'songCode', label: 'Song Code', type: 'string', width: 9 },
      { key: 'isrc', label: 'ISRCs', type: 'string', width: 13 },
    ],
  },
  {
    id: 'aka-report',
    name: 'AKA Titles Report',
    description: 'All AKAs (ALT record) present',
    fields: [
      { key: 'songCode', label: 'Song Code', type: 'string', width: 9 },
      { key: 'aka', label: 'AKAs', type: 'string', width: 30 },
      { key: 'languageCode', label: 'AKA Lang', type: 'string', width: 10 },
      { key: 'workTitle', label: 'Work Title', type: 'string', width: 30 },
    ],
  },
  {
    id: 'cat-import',
    name: 'Cat Import',
    description: 'CWR data formated for Cat Import.',
    fields: [
      {
        key: 'submitterWorkNumber',
        label: 'Submitter Work No',
        type: 'string',
        width: 14,
      }, // not in CWR
      { key: 'iswc', label: 'ISWC Number', type: 'string', width: 15 },
      { key: 'workTitle', label: 'Song Title', type: 'string', width: 60 },
      {
        key: 'songTypeCode',
        label: 'Song Type Code',
        type: 'string',
        width: 2,
      }, // not in CWR
      { key: 'lastName', label: 'IP Name/Surname', type: 'string', width: 70 },
      { key: 'firstName', label: 'IP First Name', type: 'string', width: 30 },
      { key: 'capacity', label: 'Capacity Code', type: 'string', width: 2 },
      { key: 'contribution', label: 'Contribution', type: 'string', width: 5 },
      { key: 'controlled', label: 'Controlled', type: 'string', width: 1 },
      { key: 'affiliation', label: 'Affiliation', type: 'string', width: 9 },
      {
        key: 'ipiNameNumber',
        label: 'IPI Name Number',
        type: 'string',
        width: 11,
      },
      { key: 'aka', label: 'AKA Song Title', type: 'string', width: 60 },
      { key: 'pkaIpName', label: 'PKA IP Name', type: 'string', width: 70 },
      {
        key: 'pkaIpFirstName',
        label: 'PKA IP First Name',
        type: 'string',
        width: 30,
      },
    ],
  },
];

export const getTemplateById = (id: string): CWRTemplate | undefined => {
  return CWR_TEMPLATES.find((template) => template.id === id);
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
