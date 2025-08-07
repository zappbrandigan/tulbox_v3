import { CueSheetTemplate } from '@/types';
const CUE_SHEET_FORMATS: CueSheetTemplate[] = [
  {
    id: 'sound-mouse',
    version: '0.0.1',
    name: 'Soundmouse',
    description: 'Soundmouse PDF formatted cue sheets.',
    fields: [
      { key: 'fileName', label: 'File Name', type: 'string', width: 200 },
      { key: 'sequenceNumber', label: 'Seq #', type: 'number', width: 75 },
      { key: 'workTitle', label: 'Work Title', type: 'string', width: 250 },
      { key: 'usage', label: 'Usage', type: 'string', width: 100 },
      { key: 'type', label: 'Type', type: 'string', width: 75 },
      { key: 'duration', label: 'Duration', type: 'string', width: 100 },
      { key: 'publishers', label: 'Publishers', type: 'string', width: 300 },
    ],
    repeatGroup: {
      key: 'writers',
      countKey: 'maxWriters',
      subfields: [
        { key: 'role', label: 'Role', width: 100 },
        { key: 'name', label: 'Writer', width: 250 },
        { key: 'pro', label: 'PRO', width: 100 },
        { key: 'contribution', label: 'Share', width: 100 },
      ],
    },
  },
  {
    id: 'rapid-cue',
    version: '0.0.1',
    name: 'RapidCue',
    description: 'RapidCue PDF formatted cue sheets.',
    fields: [
      { key: 'fileName', label: 'File Name', type: 'string', width: 200 },
      { key: 'sequenceNumber', label: 'Seq #', type: 'number', width: 75 },
      { key: 'workTitle', label: 'Work Title', type: 'string', width: 250 },
      { key: 'usage', label: 'Usage', type: 'string', width: 100 },
      { key: 'type', label: 'Type', type: 'string', width: 75 },
      { key: 'duration', label: 'Duration', type: 'string', width: 100 },
      { key: 'publishers', label: 'Publishers', type: 'string', width: 300 },
    ],
    repeatGroup: {
      key: 'writers',
      countKey: 'maxWriters',
      subfields: [
        { key: 'role', label: 'Role', width: 100 },
        { key: 'name', label: 'Writer', width: 250 },
        { key: 'pro', label: 'PRO', width: 100 },
        { key: 'contribution', label: 'Share', width: 100 },
      ],
    },
    disabled: true,
  },
  {
    id: 'cue-spark',
    version: '0.0.1',
    name: 'CueSpark',
    description: 'CueSpark PDF formatted cue sheets.',
    fields: [
      { key: 'fileName', label: 'File Name', type: 'string', width: 200 },
      { key: 'sequenceNumber', label: 'Seq #', type: 'number', width: 75 },
      { key: 'workTitle', label: 'Work Title', type: 'string', width: 250 },
      { key: 'usage', label: 'Usage', type: 'string', width: 100 },
      { key: 'type', label: 'Type', type: 'string', width: 75 },
      { key: 'duration', label: 'Duration', type: 'string', width: 100 },
      { key: 'publishers', label: 'Publishers', type: 'string', width: 300 },
    ],
    repeatGroup: {
      key: 'writers',
      countKey: 'maxWriters',
      subfields: [
        { key: 'role', label: 'Role', width: 100 },
        { key: 'name', label: 'Writer', width: 250 },
        { key: 'pro', label: 'PRO', width: 100 },
        { key: 'contribution', label: 'Share', width: 100 },
      ],
    },
    disabled: true,
  },
];

export default CUE_SHEET_FORMATS;
