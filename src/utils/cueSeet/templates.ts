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
      { key: 'duration', label: 'Duration', type: 'string', width: 100 },
      { key: 'publishers', label: 'Publishers', type: 'string', width: 300 },
    ],
    repeatGroup: {
      key: 'writers',
      countKey: 'maxWriters',
      subfields: [
        { key: 'name', label: 'Writer', width: 250 },
        { key: 'pro', label: 'PRO', width: 100 },
        { key: 'contribution', label: 'Share', width: 100 },
      ],
    },
  },
];

export default CUE_SHEET_FORMATS;
