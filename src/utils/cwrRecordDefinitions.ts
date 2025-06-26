import { CWRRecordDefinition, CWRRecordType } from "../types/cwrTypes";


// Each Transaction Header and Detail Record contains this prefix
const RECORD_PREFIX: CWRRecordDefinition['fields'] = {
  transactionSeq: {
    header: 'Transaction Sequence Number',
    desc: 'The sequence number of a work (transaction) within a group',
    start: 3,
    size: 8,
    required: true
  },
  recordSeq: {
    header: 'Record Sequence Number',
    desc: 'The sequence number of a line (record) within this work (group)',
    start: 11,
    size: 8,
    required: true
  }
};

export const HDR_RECORD: CWRRecordDefinition = {
  recordType: 'HDR',
  desc: 'Transmission Header',
  fields: {
    senderType: {
      header: 'Sender Type',
      desc: 'Indicates if the sender is a society or publisher',
      start: 3,
      size: 2,
      required: true
    },
    senderId: {
      header: 'Sender ID',
      desc: 'Senders CWR IPI number or society code',
      start: 5,
      size: 9,
      required: true
    },
    senderName: {
      header: 'Sender Name',
      desc: 'The name of the sender (publisher, society, agent)',
      start: 14,
      size: 45,
      required: true
    },
    ediVersion: {
      header: 'EDI Version Number',
      desc: 'Indicates the header/trailer version number used (must be 01.10)',
      start: 59,
      size: 5,
      required: true
    },
    creationDate: {
      header: 'Creation Date',
      desc: 'Date the file was created YYYYMMDD',
      start: 64,
      size: 8,
      required: true
    },
    creationTime: {
      header: 'Creation Time',
      desc: 'Time the file was created HHMMSS',
      start: 72,
      size: 6,
      required: true
    },
    transmissionDate: {
      header: 'Transmission Date',
      desc: 'Date the file was transmitted YYYYMMDD',
      start: 78,
      size: 8,
      required: true
    },
    characterSet: {
      header: 'Character Set',
      desc: 'Character set used if different from ASCII (optional)',
      start: 86,
      size: 15,
      required: false
    }
  }
};

export const GRH_RECORD: CWRRecordDefinition = {
  recordType: 'GRH',
  desc: 'Group Header',
  fields: {
    transactionType: {
      header: 'Transaction Type',
      desc: 'Types of transactions included in this group (refer to transaction type table)',
      start: 3,
      size: 3,
      required: true
    },
    groupId: {
      header: 'Group ID',
      desc: 'Unique sequential number for this group starting at 00001',
      start: 6,
      size: 5,
      required: true
    },
    transactionTypeVersion: {
      header: 'Transaction Type Version',
      desc: 'Version of the transaction type (e.g. 02.10 for CWR v2.1)',
      start: 11,
      size: 5,
      required: true 
    },
    batchRequest: {
      header: 'Batch Request',
      desc: 'Submitter managed sequential number to identify the group (optional)',
      start: 16,
      size: 10,
      required: false
    },
    distType: {
      header: 'Submission/Distribution Type',
      desc: 'Set to blank - Not used for CWR',
      start: 26,
      size: 2,
      required: false
    }
  }
};

export const GRT_RECORD: CWRRecordDefinition = {
  recordType: 'GRT',
  desc: 'Group Trailer',
  fields: {
    groupId: {
      header: 'Group ID',
      desc: 'Same Group ID as present in the group header',
      start: 3,
      size: 5,
      required: true
    },
    transactionCount: {
      header: 'Transaction Count',
      desc: 'Number of transactions in this group',
      start: 8,
      size: 8,
      required: true
    },
    recordCount: {
      header: 'Record Count',
      desc: 'Number of physical records in this count include GRH and GRT',
      start: 16,
      size: 8,
      required: true
    },
    currencyIndicator: {
      header: 'Currency Indicator',
      desc: 'ISO 427 currency mode (optional, not used in CWR)',
      start: 24,
      size: 3,
      required: false
    },
    monetaryValue: {
      header: 'Total Monetary Value',
      desc: 'Total monetary value of the group',
      start: 27,
      size: 10,
      required: false
    }
  }
};

export const TRL_RECORD: CWRRecordDefinition = {
  recordType: 'TRL',
  desc: 'Transmission Trailer',
  fields: {
    groupCount: {
      header: 'Group Count',
      desc: 'Number of groups in this file',
      start: 3,
      size: 5,
      required: true
    },
    transactionCount: {
      header: 'Transaction Count',
      desc: 'Number of transactions in this file',
      start: 8,
      size: 8,
      required: true
    },
    recordCount: {
      header: 'Record Count',
      desc: 'Number of physical records in this file, including HDR and TRL',
      start: 16,
      size: 8,
      required: true
    }
  }
};

export const AGR_RECORD: CWRRecordDefinition = {
  recordType: 'AGR',
  desc: 'Agreement Supporting Work Registration',
  fields: {
    ...RECORD_PREFIX,
    agrNum: {
      header: 'Submitter Agreement Number',
      desc: 'Thie submitter\'s unique identifier for this agreement',
      start: 19,
      size: 14,
      required: true
    },
    isac: {
      header: 'International Agreement Code',
      desc: 'The ISAC assigned to this agreement',
      start: 33,
      size: 14,
      required: false
    },
    agrType: {
      header: 'Agreement Type',
      desc: 'Code defining the category of agreement',
      start: 47,
      size: 2,
      required: true
    },
    agrStartDate: {
      header: 'Agreement Start Date',
      desc: 'Date on which the transfer of rights becomes affective',
      start: 49,
      size: 8,
      required: true
    },
    agrEndDate: {
      header: 'Agreement End Date',
      desc: 'Date on which the transfer of rights ceases',
      start: 57,
      size: 8,
      required: false
    },
    retentionEndDate: {
      header: 'Retention End Date',
      desc: 'The end date for the retentino period',
      start: 65,
      size: 8,
      required: false
    },
    royaltyStatus: {
      header: 'Prior Royalty Status',
      desc: 'Indicates whether the acquiring party is entitled to accrued collection',
      start:73,
      size: 1,
      required: true
    },
    royaltyStartDate: {
      header: 'Prior Royalty Start Date',
      desc: 'Date before the agreement start date from which royalties are accrued',
      start: 74,
      size: 8,
      required: false
    },
    collectionStatus: {
      header: 'Post-Term Collection Status',
      desc: 'Indicates whether the acquiring party is entitled to collect monies accrued before the Retention End Date',
      start: 82,
      size: 1,
      required: true
    },
    collectionEndDate: {
      header: 'Post-Term Collection End Date',
      desc: 'Date at which accrued royalties can no longer be collected',
      start: 83,
      size: 8,
      required: false
    },
    signDate: {
      header: 'Date of Signature of Agreement',
      desc: 'The date when the written form of the agreement was signed',
      start: 91,
      size: 8,
      required: false
    },
    numWorks: {
      header: 'Number of Works',
      desc: 'Number of works registered subject to this agreement specific to this file',
      start: 99,
      size: 5,
      required: true
    },
    clause: {
      header: 'Sales/Manufacture Clause',
      desc: 'Indicates whether acquiring party has rights for products sold or manufactured',
      start: 104,
      size: 1,
      required: false
    },
    sharesChange: {
      header: 'Shares Change',
      desc: 'If the shares for the writer interest can change',
      start: 105,
      size: 1,
      required: false
    },
    advanceGiven: {
      header: 'Advance Given',
      desc: 'If there is an advance paid for this agreement',
      start: 106,
      size: 1,
      required: false
    },
    societyAgrNum: {
      header: 'Society-Assigned Agreement Number',
      desc: 'The agreement number assigned by the society',
      start: 107,
      size: 14,
      required: false
    }
  }
};

export const NWR_RECORD: CWRRecordDefinition = {
  recordType: 'NWR',
  desc: 'New Works Registration',
  fields: {
    ...RECORD_PREFIX,
    workTitle: {
      header: 'Work Title',
      desc: 'Title of the work',
      start: 19,
      size: 60,
      required: true
    },
    languageCode: {
      header: 'Language Code',
      desc: 'Language code for the title (optional)',
      start: 79,
      size: 2,
      required: false
    },
    submitterWorkNum: {
      header: 'Submitter Work Number',
      desc: 'Unique work number assigned by the submitter',
      start: 81,
      size: 14,
      required: true
    },
    iswc: {
      header: 'ISWC',
      desc: 'International Standard Work Code',
      start: 95,
      size: 11,
      required: false
    },
    copyrightDate: {
      header: 'Copyright Date',
      desc: 'Original copyright date of the work (optional)',
      start: 106,
      size: 8,
      required: false
    },
    copyrightNum: {
      header: 'Copyright Number',
      desc: 'Original copyright number of the work (optional)',
      start: 114,
      size: 12,
      required: false
    },
    workDistCategory: {
      header: 'Musical Work Distribution Category',
      desc: 'Type of music for distribution rules',
      start: 126,
      size: 3,
      required: true
    },
    duration: {
      header: 'Duration',
      desc: 'Duration of the work (conditional if category is SER or required by society',
      start: 129,
      size: 6,
      required: false
    },
    recordedIndicator: {
      header: 'Recorded Indicator',
      desc: 'Indicates whether the work has ever been recorded',
      start: 135,
      size: 1,
      required: true
    },
    textMusicRel: {
      header: 'Text Music Relationship',
      desc: 'Indicates if the work includes music, text or both (optional)',
      start: 136,
      size: 3,
      required: false
    },
    compositeType: {
      header: 'Composite Type',
      desc: 'Type of composite work (optional)',
      start: 139,
      size: 3,
      required: false
    },
    versionType: {
      header: 'Version Type',
      desc: 'Relationship to other works e.g. arrangement',
      start: 142,
      size: 3,
      required: true
    },
    excerptType: {
      header: 'Excerpt Type',
      desc: 'Type of excerpt if applicable (optional)',
      start: 145,
      size: 3,
      required: false
    },
    musicArrangement: {
      header: 'Music Arrangement',
      desc: 'Type of music arrangement if Version Type is MOD (optional)',
      start: 148,
      size: 3,
      required: false
    },
    lyricAdaptation: {
      header: 'Lyric Adaptation',
      desc: 'Type of lyric adaptation if Version Type is MOD (conditional)',
      start: 151,
      size: 3,
      required: false
    },
    contactName: {
      header: 'Contact Name',
      desc: 'Business person contact name (optional)',
      start: 154,
      size: 30,
      required: false
    },
    contactId: {
      header: 'Contact ID',
      desc: 'Identifier for contact person (optional)',
      start: 184,
      size: 10,
      required: false
    },
    cwrWorkType: {
      header: 'CWR Work Type',
      desc: 'CWR work type (optional)',
      start: 194,
      size: 2,
      required: false
    },
    grandRightsIndicator: {
      header: 'Grand Rights Indicator',
      desc: 'Indicates if the work is intended for stage performance (optional, mandatory for UK)',
      start: 196,
      size: 1,
      required: false
    },
    compositeComponentCount: {
      header: 'Composite Component Count',
      desc: 'Number of components if Composite Count is entered (conditional)',
      start: 197,
      size: 3,
      required: false
    },
    printedPublicationDate: {
      header: 'Date of Publication of Printed Edition',
      desc: 'Date of printed publication, relevant for GEMA (optional)',
      start: 200,
      size: 8,
      required: false
    },
    exceptionalClause: {
      header: 'Exceptional Clause',
      desc: 'Exceptional clause for GEMA printed editions (optional)',
      start: 208,
      size: 1,
      required: false
    },
    opusNum: {
      header: 'Opus Number',
      desc: 'Composer-assigned opus number (optional)',
      start: 209,
      size: 25,
      required: false
    },
    catalogNum: {
      header: 'Catalog Number',
      desc: 'Catalog number with abbreviated name and part number (optional)',
      start: 234,
      size: 25,
      required: false
    },
    priorityFlag: {
      header: 'Priority Flag',
      desc: 'Priority processing indicator for high-profile works (optional)',
      start: 259,
      size: 1,
      required: false
    }
  }
};

export const REV_RECORD: CWRRecordDefinition = {
  ...NWR_RECORD,
  recordType: 'REV',
  desc: 'Revised Registration'
};

export const ISW_RECORD: CWRRecordDefinition = {
  ...NWR_RECORD,
  recordType: 'ISW',
  desc: 'Notification of ISWC Assigned to a Work'
};

export const EXC_RECORD: CWRRecordDefinition = {
  ...NWR_RECORD,
  recordType: 'EXC',
  desc: 'Existing Work which is in Conflict with a Work Registration'
};

export const ACK_RECORD: CWRRecordDefinition = {
  recordType: 'ACK',
  desc: 'Acknowledgment of Transaction',
  fields: {
    ...RECORD_PREFIX,
    creationDate: {
      header: 'Creation Date',
      desc: 'The creation date of the original file that contained the transactions',
      start: 19,
      size: 8,
      required: true
    },
    creationTime: {
      header: 'Creation Time',
      desc: 'The creation time of the original file that contained the transactions',
      start: 27,
      size: 6,
      required: true
    },
    orgGroupId: {
      header: 'Original Group ID',
      desc: 'The group ID within the original transaction',
      start: 33,
      size: 5,
      required: true
    },
    orgTransactionSeqNum: {
      header: 'Original Transaction Sequence Number',
      desc: 'The transaction sequence number of the original transaction',
      start: 38,
      size: 8,
      required: true
    },
    orgTransactionType: {
      header: 'Original Transaction Type',
      desc: 'The transaction type of the original transaction',
      start: 46,
      size: 3,
      required: true
    },
    creationTitle: {
      header: 'Creation Title',
      desc: 'The creation title delivered by the submitter',
      start: 49,
      size: 60,
      required: false
    },
    subCeationNum: {
      header: 'Submitter Creation Number',
      desc: 'The unique identifier assigned by the submitter',
      start: 109,
      size: 20,
      required: false
    },
    recCreationNum: {
      header: 'Recipient Creation Number',
      desc: 'The unique identifier assigned by the recipient to this work',
      start: 129,
      size: 20,
      required: false
    },
    processingDate: {
      header: 'Processing Date',
      desc: 'The dat this transaction or file was formally processed by the recipient',
      start: 149,
      size: 8,
      required: true
    },
    transactionStatus: {
      header: 'Transaction Status',
      desc: 'The current status of this transaction',
      start: 157,
      size: 2,
      required: true
    }
  }
};

export const TER_RECORD: CWRRecordDefinition = {
  recordType: 'TER',
  desc: 'Territory in Agreement',
  fields: {
    ...RECORD_PREFIX,
    inExIndicator: {
      header: 'Inclusion/Exclusion Indicator',
      desc: 'Whether the territory in this record is in scope of agreement',
      start: 19,
      size: 1,
      required: true
    },
    tisCode: {
      header: 'TIS Numeric Code',
      desc: 'Numeric identifier of a territory according to CISAC territory standard',
      start: 20,
      size: 4,
      required: true
    }
  }
};

export const IPA_RECORD: CWRRecordDefinition = {
  recordType: 'IPA',
  desc: 'Interested Party of Agreement',
  fields: {
    ...RECORD_PREFIX,
    agrRoleCode: {
      header: 'Agreement Role Code',
      desc: 'Code defining the role of the interested party in this agreement',
      start: 19,
      size: 2,
      required: true
    },
    ipiNameNum: {
      header: 'Interested Party Name Number',
      desc: 'The IPI name # assigned to this interested party',
      start: 21,
      size: 11,
      required: false 
    },
    ipiBaseNum: {
      header: 'IPI Base Number',
      desc: 'The IPI base number assigned to this interested party',
      start: 32,
      size: 13,
      required: false
    },
    ipNum: {
      header: 'Interested Party Number',
      desc: 'Submitter\'s unique identifier for this interested party',
      start: 45,
      size: 9,
      required: true
    },
    lastName: {
      header: 'Interested Party Last Name',
      desc: 'The last name of this writer or the name of the publisher',
      start: 54,
      size: 45,
      required: true
    },
    firstName: {
      header: 'Interested Party Writer First Name',
      desc: 'The first name of this writer along with all qualifying and middle names',
      start: 99,
      size: 30, 
      required: false
    },
    prSociety: {
      header: 'Performing Rights Affiliation Society',
      desc: 'Number assigned to the performing rights society',
      start: 129,
      size: 3,
      required: false
    },
    prShare: {
      header: 'Performing Rights Share',
      desc: 'Percentage of the performing rights',
      start: 132,
      size: 5, 
      required: false
    },
    mrSociety: {
      header: 'Mechanical Rights Affiliation Society',
      desc: 'Number assigned to the mechanical rights society',
      start: 137,
      size: 5,
      required: false
    },
    mrShare: {
      header: "Mechanical Rights Share",
      desc: 'Percentage of the mechanical rights to the work',
      start: 140,
      size: 5,
      required: false
    },
    srSociety:{
      header: 'Sync Affiliation Society',
      desc: 'Number assigned to the synchronization rights society',
      start: 145,
      size: 3,
      required: false
    },
    srShare: {
      header: 'Sync Rights Society',
      desc: 'Percentage of the synchronization rights',
      start: 148,
      size: 5,
      required: false
    }
  },
};

export const NPA_RECORD: CWRRecordDefinition = {
  recordType: 'NPA',
  desc: 'Non-Roman Alphabet Agreement Part Name',
  fields: {
    ...RECORD_PREFIX,
    ipNum: {
      header: 'Interested Party Number',
      desc: 'Submitting publisher\'s unique identifier for this writer',
      start: 19,
      size: 9,
      required: false
    },
    ipName: {
      header: 'Interested Party Name',
      desc: 'The last of a writer or publisher name',
      start: 28,
      size: 160,
      required: true
    },
    ipFirstName: {
      header: 'Interested Party First Name',
      desc: 'The first name of a writer',
      start: 188,
      size: 160,
      required: true
    },
    languageCode: {
      header: 'Language Code',
      desc: 'The language code of the name',
      start: 348,
      size: 2,
      required: false
    }
  }
};

export const SPU_RECORD: CWRRecordDefinition = {
  recordType: 'SPU',
  desc: 'Publisher Controlled by Submitter',
  fields: {
    ...RECORD_PREFIX,
    publisherSeqNum: {
      header: 'Publisher Sequence #',
      desc: 'Sequential number assigned to the original publishers of this work',
      start: 19,
      size: 2,
      required: true
    },
    ipNum: {
      header: 'Interested Part Number',
      desc: 'Submitter\'s unique identifier for this publisher (mandatory for SPU, optional for OPU)',
      start: 21,
      size: 9,
      required: true
    },
    publisherName: {
      header: 'Publisher Name',
      desc: 'Publisher\'s name (mandatory for SPU, optional for OPU',
      start: 30,
      size: 45,
      required: true
    },
    publisherUnknownIndicator: {
      header: 'Publisher Unknown Indicator',
      desc: 'Set to \'Y\' if publisher name is unknown for OPU (must be blank of SPU)',
      start: 75,
      size: 1,
      required: false
    },
    publisherType: {
      header: 'Publisher Type',
      desc: 'Code defining the publisher\'s role (mandatory for SPU, optional for OPU)',
      start: 76,
      size: 2,
      required: true
    },
    taxIdNum: {
      header: 'Tax ID Number',
      desc: 'Tax identification number of the publisher (optional)',
      start: 78,
      size: 9,
      required: false
    },
    ipiNameNum: {
      header: 'Publisher IPI Name Number',
      desc: 'IPI name number assigned to this publisher (mandatory if SPU is followed by SPT)',
      start: 87,
      size: 11,
      required: false
    },
    submitterAgreementNum: {
      header: 'Submitter Agreement Number',
      desc: 'Submitter\'s agreement number for this publisher (optional)',
      start: 98,
      size: 14,
      required: false
    },
    prAffiliationSocietyNum: {
      header: 'PR Affiliation Society Number',
      desc: 'Society code for performing rights affiliation number (conditional)',
      start: 112,
      size: 3,
      required: false
    },
    prOwnershipShare: {
      header: 'PR Ownership Share',
      desc: 'Percentage of performing rights ownership (conditional, 0-50%)',
      start: 115,
      size: 5,
      required: false
    },
    mrSociety: {
      header: 'MR Affiliation Society Number',
      desc: 'Society code for mechanical rights affiliation (conditional)',
      start: 120,
      size: 3,
      required: false
    },
    mrOwnershipShare: {
      header: 'MR Ownership Share',
      desc: 'Percentage of mechanical rights ownership (conditional, 0-100%)',
      start: 123,
      size: 5,
      required: false
    },
    srSociety: {
      header: 'SR Society Affiliation Society Number',
      desc: 'Society code for synchronization rights affiliation (conditional)',
      start: 128,
      size: 3,
      required: false
    },
    srOwnershipShare: {
      header: 'SR Ownership Share',
      desc: 'Percentage of synchronization rights ownership (conditional, 0-100%)',
      start: 131,
      size: 5,
      required: false
    },
    specialAgreementsIndicator: {
      header: 'Special Agreements Indicator',
      desc: 'Indicates publisher claiming reversionary rights (optional, applies to specific societies)',
      start: 136,
      size: 1,
      required: false
    },
    firstRecording: {
      header: 'First Recording Refusal Indicator',
      desc: 'Indicates refusal of first recording authority (mandatory for UK registrations)',
      start: 137,
      size: 1,
      required: false
    },
    filler: {
      header: 'Filler',
      desc: 'Fill with a blank (optional)',
      start: 138,
      size: 1,
      required: true
    },
    ipiBaseNum: {
      header: 'Publisher IPI Base Number',
      desc: 'IPI base number assigned to this publisher (optional)',
      start: 139,
      size: 13,
      required: false
    },
    isac: {
      header: 'International Standard Agreement Code',
      desc: 'ISAC assigned to the agreement (optional)',
      start: 152,
      size: 14,
      required: false
    },
    societyAgreementNum: {
      header: 'Society-assigned Agreement Number',
      desc: 'Agreement number assigned by the society (optional)',
      start: 168,
      size: 14,
      required: false
    },
    agreementType: {
      header: 'Agreement Type',
      desc: 'Code defining the category of agreement (optional)',
      start: 180,
      size: 2,
      required: false
    },
    usaLicense: {
      header: 'USA License Indicator',
      desc: 'Indicates US rights flow through SESAC/BMI/ASCAP/AMRA (optional)',
      start: 182,
      size: 1,
      required: false
    }
  }
};

export const OPU_RECORD: CWRRecordDefinition = {
  ...SPU_RECORD,
  recordType: 'OPU',
  desc: 'Other Publisher'
};

export const NPN_RECORD: CWRRecordDefinition = {
  recordType: 'NPN',
  desc: 'Non-Roman Alphabet Publisher Name',
  fields: {
    ...RECORD_PREFIX,
    publisherSeqNum: {
      header: 'Publisher Sequence Number',
      desc: 'Sequential number assinged to the original publishers on this work',
      start: 19,
      size: 2,
      required: true
    },
    ipNum: {
      header: 'Interested Part Number',
      desc: 'Submitting publisher\'s unique identifier for this publisher',
      start: 21,
      size: 9,
      required: true
    },
    publisherName: {
      header: 'Publisher Name',
      desc: 'Name of this publishing company in non-roman alphabet',
      start: 30,
      size: 480,
      required: true
    },
    languageCode: {
      header: 'Language Code',
      desc: 'Language code of the name',
      start: 510,
      size: 2,
      required: false
    }
  }
};

export const SPT_RECORD: CWRRecordDefinition = {
  recordType: 'SPT',
  desc: 'Publisher Territory of Control',
  fields: {
    ...RECORD_PREFIX,
    ipNum: {
      header: 'Interested Party Number',
      desc: 'Submitting publisher\'s unique indentifier for this publisher',
      start: 19,
      size: 9,
      required: true
    },
    constant: {
      header: 'Constant',
      desc: 'Set equal to spaces',
      start: 28,
      size: 6,
      required: true
    },
    prCollectionShare: {
      header: 'PR Collection Share',
      desc: 'Percentage of performing royalties collected by the publisher in this territories (0-50)',
      start: 34,
      size: 5,
      required: false
    },
    mrCollectionShare: {
      header: 'MR Collection Share',
      desc: 'Percentage of mechanical royalties collected by the publisher in this territory (0-100)',
      start: 39,
      size: 5,
      required: false
    },
    srCollectionShare: {
      header: 'SR Collection Share',
      desc: 'Percentage of synchronization royalties collected by the publisher in this territory (0-100)',
      start: 44,
      size: 5,
      required: false
    },
    inExIndicator: {
      header: 'Inclusion/Exclusion Indicator',
      desc: 'I = Include, E = Excluded territory',
      start: 49,
      size: 1,
      required: true
    },
    tisCode: {
      header: 'TIS Numeric Code',
      desc: 'The territory in which has this collecting share',
      start: 50,
      size: 4,
      required: true
    },
    sharesChange: {
      header: 'Shares Change',
      desc: 'Set to \'Y\' if writer shares change in this territory (optional)',
      start: 54,
      size: 1,
      required: false
    },
    seqNum: {
      header: 'Sequence Number',
      desc: 'Sequential number assigned to each territory following an SPU',
      start: 55,
      size: 3,
      required: true
    }
  }
};

export const SWR_RECORD: CWRRecordDefinition = {
  recordType: 'SWR',
  desc: 'Writer Controlled by Submitter',
  fields: {
    ...RECORD_PREFIX,
    ipNum: {
      header: 'Interested Party Number',
      desc: 'Submitter\'s unique identifier for this writer (mandatory for SWR, optional for OWR)',
      start: 19,
      size: 9,
      required: false
    },
    lastName: {
      header: 'Writer\'s Last Name',
      desc: 'Writer\'s last name or full name if not split (mandatory for SWR, optional for OWR)',
      start: 28,
      size: 45,
      required: true
    },
    firstName: {
      header: 'Writer\'s First Name',
      desc: 'Writer\'s first name with qualifying or middle names',
      start: 73,
      size: 30,
      required: false
    },
    writerUnknown: {
      header: 'Writer Unknown Indicator',
      desc: 'Set to \'Y\' if writer is unknown for OWR (must be blank for SWR)',
      start: 103,
      size: 1,
      required: false
    },
    writerDesignationCode: {
      header: 'Writer Designation Code',
      desc: 'Code defining the writer\'s role in the composition (mandator for SWR, optional for OWR)',
      start: 104,
      size: 2,
      required: false
    },
    taxIdNum: {
      header: 'Tax ID Number',
      desc: 'Tax identification number of the writer (optional)',
      start: 106,
      size: 9,
      required: false
    },
    ipiNameNum: {
      header: 'Writer IPI Name Number',
      desc: 'IPI name number assigned to writer (optional)',
      start: 115,
      size: 11,
      required: false
    },
    prSocietyNum: {
      header: 'PR Affiliation Societry Number',
      desc: 'Society code for performing rights affiliation',
      start: 126,
      size: 3,
      required: false
    },
    prOwnershipShare: {
      header: 'Performance Ownership Share',
      desc: 'Percentage of writer\'s performing rights ownership',
      start: 129,
      size: 5,
      required: false
    },
    mrSocietyNum: {
      header: 'MR Affiliation Society Number',
      desc: 'Society code for mechanical rights affiliation',
      start: 134,
      size: 3,
      required: false
    },
    mrOwnershipShare: {
      header: 'MR Ownership Share',
      desc: 'Percentage of writer\'s mechanical rights ownership',
      start: 137,
      size: 5,
      required: false
    },
    srSocietyNum: {
      header: 'SR Affiliation Society Number',
      desc: 'Society code for synchronization rights affiliation',
      start: 142,
      size: 3,
      required: false
    },
    srOwnershipShare: {
      header: 'SR Ownership Share',
      desc: 'Percentage of writer\'s synchronization rights onwerhsip',
      start: 145,
      size: 5,
      required: false
    },
    reversionary: {
      header: 'Reversionary Indicator',
      desc: 'Indicates if writer is involved in a reversionary claim',
      start: 150,
      size: 1,
      required: false
    },
    firstRecordRefusal: {
      header: 'First Recording Refusal Indicator',
      desc: 'Indicates refusal of first recording authority (mandatory of UK registrations)',
      start: 151,
      size: 1,
      required: false
    },
    workForHire: {
      header: 'Work For Hire Indicator',
      desc: 'Indicates if the work was written as a work for hire',
      start: 152,
      size: 1,
      required: false
    },
    filler: {
      header: 'Filler',
      desc: 'Fill with a blank',
      start: 153,
      size: 1,
      required: false
    },
    ipiBaseNum: {
      header: 'Writer IPI Base Number',
      desc: 'IPI base number assigned to this writer',
      start: 154,
      size: 13,
      required: false
    },
    personalNum: {
      header: 'Personal Number',
      desc: 'Personal number assigned to writer in their country of residence',
      start: 167,
      size: 12,
      required: false
    },
    usaLicense: {
      header: 'USA License Indicator',
      desc: 'Indicates US rights flow through SESAC/BMI/ASCAP/AMRA',
      start: 179,
      size: 1,
      required: false
    }
  }
};

export const OWR_RECORD: CWRRecordDefinition = {
  ...SWR_RECORD,
  recordType: 'OWR',
  desc: 'Other Writer'
};

export const NWN_RECORD: CWRRecordDefinition = {
  recordType: 'NWN',
  desc: 'Non-Roman Alphabet Writer Name',
  fields: {
    ...RECORD_PREFIX,
    lastName: {
      header: 'Writer\'s Last Name',
      desc: 'Writer\'s first name',
      start: 28,
      size: 160,
      required: true
    },
    firstName: {
      header: 'Writer\'s First Name',
      desc: 'Writer\'s first name (optional)',
      start: 188,
      size: 160,
      required: false
    },
    languageCode: {
      header: 'Language Code',
      desc: '',
      start: 348,
      size: 2,
      required: false
    }
  }
};

export const SWT_RECORD: CWRRecordDefinition = {
  recordType: 'SWT',
  desc: 'Writer Territory of Control',
  fields: {
    ...RECORD_PREFIX,
    ipNum: {
      header: 'Interested Party Number',
      desc: 'Submitting publisher\'s unique indentifier for this publisher',
      start: 19,
      size: 9,
      required: true
    },
    prCollectionShare: {
      header: 'PR Collection Share',
      desc: 'Percentage of performing royalties collected by the publisher in this territories (0-50)',
      start: 28,
      size: 5,
      required: false
    },
    mrCollectionShare: {
      header: 'MR Collection Share',
      desc: 'Percentage of mechanical royalties collected by the publisher in this territory (0-100)',
      start: 33,
      size: 5,
      required: false
    },
    srCollectionShare: {
      header: 'SR Collection Share',
      desc: 'Percentage of synchronization royalties collected by the publisher in this territory (0-100)',
      start: 38,
      size: 5,
      required: false
    },
    inExIndicator: {
      header: 'Inclusion/Exclusion Indicator',
      desc: 'I = Include, E = Excluded territory',
      start: 43,
      size: 1,
      required: true
    },
    tisCode: {
      header: 'TIS Numeric Code',
      desc: 'The territory in which has this collecting share',
      start: 44,
      size: 4,
      required: true
    },
    sharesChange: {
      header: 'Shares Change',
      desc: 'Set to \'Y\' if writer shares change in this territory (optional)',
      start: 48,
      size: 1,
      required: false
    },
    seqNum: {
      header: 'Sequence Number',
      desc: 'Sequential number assigned to each territory following an SPU',
      start: 49,
      size: 3,
      required: true
    }
  }
};

export const PWR_RECORD: CWRRecordDefinition = {
  recordType: 'PWR',
  desc: 'Publisher for Writer',
  fields: {
    ...RECORD_PREFIX,
    publisherIpNum: {
      header: 'Publisher Interested Party Number',
      desc: 'Reference to the SPU/OPU record for the original publisher or income participant representing this writer',
      start: 19,
      size: 9,
      required: true
    },
    publisherName: {
      header: 'Controlling Publisher',
      desc: 'Name of the publisher which controls the writer on the preceding SWR or OWR line',
      start: 28,
      size: 45,
      required: true
    },
    submitterAgreementNum: {
      header: 'Submitter Agreement Number',
      desc: 'Unique agreement number between the publisher and the writer, assigned by the submitter (optional)',
      start: 73,
      size: 14,
      required: false
    },
    societyAgreementNum: {
      header: 'Society-assigned Agreement Number',
      desc: 'Unique agreement number between the publisher and the writer, assigned by the submitter (optional)',
      start: 87,
      size: 14,
      required: false
    },
    writerIpNum: {
      header: 'Writer Interested Part Number',
      desc: 'Reference to the SWR/OWR in an explicit link (optional)',
      start: 101,
      size: 9,
      required: true
    },
    publisherSequenceNum: {
      header: 'Publisher Sequence Number',
      desc: 'Reference to publisher chain this link relates to',
      start: 111,
      size: 2,
      required: true
    }
  }
};

export const ALT_RECORD: CWRRecordDefinition = {
  recordType: 'ALT',
  desc: 'Alternate Title',
  fields: {
    ...RECORD_PREFIX,
    altTitle: {
      header: 'Alternate Title',
      desc: 'Alternate title for the work',
      start: 19,
      size: 60,
      required: true
    },
    titleType: {
      header: 'Title Type',
      desc: 'Type of alternate title',
      start: 79,
      size: 2,
      required: true
    },
    languageCode: {
      header: 'Language Code',
      desc: 'Language code for the translated title, required if title type is OL or AL',
      start: 81,
      size: 2,
      required: false
    }
  }
};

export const NAT_RECORD: CWRRecordDefinition = {
  recordType: 'NAT',
  desc: 'Non-Roman Alphabet Title',
  fields: {
    ...RECORD_PREFIX,
    title: {
      header: 'Title',
      desc: 'The work title in non-Roman alphabet',
      start: 19,
      size: 640,
      required: true
    },
    titleType: {
      header: 'Title Type',
      desc: 'Indicates the type of title',
      start: 659,
      size: 2,
      required: true
    },
    languageCode: {
      header: 'Language Code',
      desc: 'The language code of the title',
      start: 661,
      size: 2,
      required: false
    }
  }
};

export const EWT_RECORD: CWRRecordDefinition = {
  recordType: 'EWT',
  desc: 'Entire Work Title for Excerpts',
  fields: {
    ...RECORD_PREFIX,
    workTitle: {
      header: 'Entire Work Title',
      desc: 'Title of the entire work from which the excerpt is derived',
      start: 19,
      size: 60,
      required: true
    },
    iswc: {
      header: 'Entire Work ISWC',
      desc: 'ISWC assigned to the work from which the excerpt is derived (optional)',
      start: 79,
      size: 11,
      required: false
    },
    languageCode: {
      header: 'Language Code',
      desc: 'Language code of the original work (optional)',
      start: 90,
      size: 2,
      required: false
    },
    writerOneLastName: {
      header: 'Writer One Last Name',
      desc: 'Last or full name of the first writer/composer of the entire work (optional)',
      start: 92,
      size: 45,
      required: false
    },
    writerOneFirstName: {
      header: 'Writer One First Name',
      desc: 'First name of the first writer/composer of the entire work (optional)',
      start: 137,
      size: 30,
      required: false
    },
    source: {
      header: 'Source',
      desc: 'Descriptions of the source from which the work was obtained',
      start: 167,
      size: 60,
      required: false
    },
    writerOneIpiNameNum: {
      header: 'Writer One IPI Name Number',
      desc: 'IPI name number assigned to the first writer (optional)',
      start: 227,
      size: 11,
      required: false
    },
    writerOneIpiBaseNum: {
      header: 'Writer One IPI Base Number',
      desc: 'IPI base number assigned to the first writer (optional)',
      start: 251,
      size: 13,
      required: false
    },
    writerTwoLast: {
      header: 'Writer Two Last Name',
      desc: 'Last or full name of the first writer/composer of the entire work (optional)',
      start: 251,
      size: 45,
      required: false
    },
    writerTwoFirst: {
      header: 'Writer Two First Name',
      desc: 'First name of the first writer/composer of the entire work (optional)',
      start: 296,
      size: 30,
      required: false
    },
    writerTwoIpiNumb: {
      header: 'Writer Two IPI Name Number',
      desc: 'IPI name number assigned to the first writer (optional)',
      start: 326,
      size: 11,
      required: false
    },
    writerTwoIpiBaseNum: {
      header: 'Writer Two IPI Base Number',
      desc: 'IPI base number assigned to the first writer (optional)',
      start: 337,
      size: 13,
      required: false
    },
    submitterWorkNum: {
      header: 'Submitter Work Number',
      desc: 'Unique work number assigned by the submitter',
      start: 350,
      size: 14,
      required: false
    }
  }
};

export const VER_RECORD: CWRRecordDefinition = {
  recordType: 'VER',
  desc: 'Original Work Title for Versions',
  fields: {
    ...RECORD_PREFIX,
    workTitle: {
      header: 'Original Work Title',
      desc: 'Original work title of the work from which this version was derived',
      start: 19,
      size: 60,
      required: true
    },
    iswc: {
      header: 'ISWC of Original Work',
      desc: 'ISWC assigned to the orgininal work (optional)',
      start: 79,
      size: 11,
      required: false
    },
    languageCode: {
      header: 'Language Code',
      desc: 'Language code of the original work (optional)',
      start: 90,
      size: 2,
      required: false
    },
    writerOneLast: {
      header: 'Writer 1 Last Name',
      desc: 'Last or full name of the first writer/composer of the entire work (optional)',
      start: 92,
      size: 45,
      required: false
    },
    writerOneFirst: {
      header: 'Writer 1 First Name',
      desc: 'First name of the first writer/composer of the entire work (optional)',
      start: 137,
      size: 30,
      required: false
    },
    source: {
      header: 'Source',
      desc: 'Descriptions of the source from which the work was obtained',
      start: 167,
      size: 60,
      required: false
    },
    writerOneIpiNum: {
      header: 'Writer One IPI Name Number',
      desc: 'IPI name number assigned to the first writer (optional)',
      start: 227,
      size: 11,
      required: false
    },
    writerOneIpiBaseNum: {
      header: 'Writer One IPI Base Number',
      desc: 'IPI base number assigned to the first writer (optional)',
      start: 251,
      size: 13,
      required: false
    },
    writerTwoLastName: {
      header: 'Writer Two Last Name',
      desc: 'Last or full name of the first writer/composer of the entire work (optional)',
      start: 251,
      size: 45,
      required: false
    },
    writerTwoFirstName: {
      header: 'Writer Two First Name',
      desc: 'First name of the first writer/composer of the entire work (optional)',
      start: 296,
      size: 30,
      required: false
    },
    writerTwoIpiNum: {
      header: 'Writer Two IPI Name Number',
      desc: 'IPI name number assigned to the first writer (optional)',
      start: 326,
      size: 11,
      required: false
    },
    writerTwoIpiBaseNum: {
      header: 'Writer Two IPI Base Number',
      desc: 'IPI base number assigned to the first writer (optional)',
      start: 337,
      size: 13,
      required: false
    },
    submitterWorkNum: {
      header: 'Submitter Work Number',
      desc: 'Unique work number assigned by the submitter',
      start: 350,
      size: 14,
      required: false
    }
  }
};

export const PER_RECORD: CWRRecordDefinition = {
  recordType: 'PER',
  desc: 'Performing Artist',
  fields: {
    ...RECORD_PREFIX,
    lastName: {
      header: 'Performing Artist Last Name',
      desc: 'Last name of person or full name of group',
      start: 19,
      size: 45,
      required: true
    },
    firstName: {
      header: 'Performing Artist First Name',
      desc: 'First name of person',
      start: 64,
      size: 30,
      required: false
    },
    ipiNameNum: {
      header: 'IPI Name Number',
      desc: 'IPI name number assigned to this publisher',
      start: 94,
      size: 11,
      required: false
    },
    ipiBaseNum: {
      header: 'IPI Base Number',
      desc: 'IPI base number assigned to this publisher',
      start: 105,
      size: 13,
      required: false
    }
  }
};

export const NPR_RECORD: CWRRecordDefinition = {
  recordType: 'NPR',
  desc: 'Performance Data in Non-Roman Alphabet',
  fields: {
    ...RECORD_PREFIX,
    artistName: {
      header: '',
      desc: '',
      start: 0,
      size: 0,
      required: false
    },
    artistFirstName: {
      header: '',
      desc: '',
      start: 0,
      size: 0,
      required: false
    },
    ipiNameNum: {
      header: '',
      desc: '',
      start: 0,
      size: 0,
      required: false
    },
    ipiBaseNum: {
      header: '',
      desc: '',
      start: 0,
      size: 0,
      required: false
    },
    languageCode: {
      header: '',
      desc: '',
      start: 0,
      size: 0,
      required: false
    },
    performanceLanguage: {
      header: '',
      desc: '',
      start: 0,
      size: 0,
      required: false
    },
    performanceDialect: {
      header: '',
      desc: '',
      start: 0,
      size: 0,
      required: false
    }
  }
};

export const REC_RECORD: CWRRecordDefinition = {
  recordType: 'REC',
  desc: 'Recording Detail',
  fields: {
    ...RECORD_PREFIX,
    firstReleastDate: {
      header: 'First Release Date',
      desc: 'Date the work was/will be released',
      start: 19,
      size: 8,
      required: false
    },
    constant: {
      header: 'Constant',
      desc: 'Fill with blanks',
      start: 27,
      size: 60,
      required: false
    },
    duration: {
      header: 'First Release Duration',
      desc: 'Duration of the first release of the work',
      start: 87,
      size: 6,
      required: false
    },
    filler: {
      header: 'Filler',
      desc: 'Fill with blanks',
      start: 93,
      size: 5,
      required: false
    },
    albumTitle: {
      header: 'First Albmum Title',
      desc: 'Name of the album that includes the work',
      start: 98,
      size: 60,
      required: false
    },
    albumLabel: {
      header: 'First Album Label',
      desc: 'Name of the organization that produced and released the album',
      start: 158,
      size: 60,
      required: false
    },
    catalogNum: {
      header: 'First Release Catalog Number',
      desc: 'Number assigned by the organization releasing the ablum',
      start: 218,
      size: 18,
      required: false
    },
    ean: {
      header: 'EAN',
      desc: 'European Article Number of release (EAN-13)',
      start: 236,
      size: 13,
      required: false
    },
    isrc: {
      header: 'ISRC',
      desc: 'International Standard Recording Code of the recording of the work',
      start: 249,
      size: 12,
      required: false
    },
    recordingFormat: {
      header: 'Recording Format',
      desc: 'Code that identifies the content of the recording',
      start: 261,
      size: 1,
      required: false
    },
    recordingTechnique: {
      header: 'Recording Technique',
      desc: 'Identifies the recording procedure',
      start: 262,
      size: 1,
      required: false
    },
    mediaType: {
      header: 'Media Type',
      desc: 'BIEM/CISAC code for media type',
      start: 263,
      size: 3,
      required: false
    }, // start v2.2
    recordingTitle: {
      header: 'Recording Title',
      desc: 'Title of the Sound Recording',
      start: 266,
      size: 60,
      required: false
    },
    versionTitle: {
      header: 'Version Title',
      desc: 'Title given to the version of the Sound Recording',
      start: 326,
      size: 60,
      required: false
    },
    displayArtist: {
      header: 'Display Artist',
      desc: 'Name of the artist of the Sound Recording',
      start: 386,
      size: 60,
      required: false
    },
    recordLabel: {
      header: 'Record Label',
      desc: 'Name of the organisation that produced the Sound Recording',
      start: 446,
      size: 60,
      required: false
    },
    isrcValidity: {
      header: 'ISRC Validity',
      desc: 'If an ISRC is supplied, Indicates the validity of the ISRC',
      start: 506,
      size: 20,
      required: false
    },
    submitterRecordingId: {
      header: 'Submitter Recording Identifier',
      desc: 'The submitter\'s unique identifier for this recording',
      start: 526,
      size: 14,
      required: false
    }
  }
};

export const ORN_RECORD: CWRRecordDefinition = {
  recordType: 'ORN',
  desc: 'Work Origin',
  fields: {
    ...RECORD_PREFIX,
    intendedPurpose: {
      header: 'Intended Purpose',
      desc: 'Type of production from which this record originated',
      start: 19,
      size: 3,
      required: true
    },
    productionTitle: {
      header: 'Production Title',
      desc: 'Name of the production, required if CWR work type on NWR is FM',
      start: 22,
      size: 60,
      required: false
    },
    cdId: {
      header: 'CD Identifier',
      desc: 'CD identifier upon which the work appears',
      start: 82,
      size: 15,
      required: false
    },
    cutNum: {
      header: 'Cut Number',
      desc: 'The track number on the CD identifier',
      start: 97,
      size: 4,
      required: false
    },
    library: {
      header: 'Library',
      desc: '',
      start: 101,
      size: 60,
      required: false
    },
    bltvr: {
      header: 'BLTVR',
      desc: '',
      start: 161,
      size: 1,
      required: false
    },
    filler: {
      header: 'Filler',
      desc: 'Reserved for future use',
      start: 162,
      size: 25,
      required: false
    },
    productionNum: {
      header: 'Production Number',
      desc: 'Number generated by production company to identify work',
      start: 187,
      size: 12,
      required: false
    },
    episodeTitle: {
      header: 'Episode Title',
      desc: 'Title of the episode from which this work originated',
      start: 199,
      size: 60,
      required: false
    },
    episodeNum: {
      header: 'Episode Number',
      desc: 'Number assigned to the episode by the producer',
      start: 259,
      size: 20,
      required: false
    },
    productionYear: {
      header: 'Production Year',
      desc: 'The year in which the production was completed',
      start: 279,
      size: 4,
      required: false
    },
    aviSocietyCode: {
      header: 'AVI Society Code',
      desc: 'The society code for the entry in the AV index',
      start: 283,
      size: 3,
      required: false
    },
    audioVisualNum: {
      header: 'Audio-Visual Number',
      desc: 'Unique number used internally by the owning society',
      start: 286,
      size: 15,
      required: false
    },
    isan: {
      header: 'ISAN',
      desc: 'Root Segment of ISAN',
      start: 301,
      size: 12,
      required: false
    },
    isanEpisode: {
      header: 'Episode',
      desc: 'Episode or Part number of ISAN',
      start: 313,
      size: 4,
      required: false
    }, 
    isanCheckDigitOne: {
      header: 'Check Digit 1',
      desc: 'Check Character for the root and episode segment',
      start: 317,
      size: 1,
      required: false
    },
    isanVersion: {
      header: 'Version',
      desc: 'Version portion of the V-ISAN',
      start: 318,
      size: 8,
      required: false
    },
    isanCheckDigitTwo: {
      header: 'Check Digit 2',
      desc: 'Check Character for the Version Segment',
      start: 326,
      size: 1,
      required: false
    },
    eidr: {
      header: 'EIDR Root Number',
      desc: 'Root Number',
      start: 327,
      size: 20,
      required: false
    },
    eidrCheckDigit: {
      header: 'EIDR Check Digit',
      desc: 'Check Character',
      start: 347,
      size: 1,
      required: false
    }
  //   version: {
  //     header: 'Version',
  //     desc: 'Version portion of the V-ISAN',
  //     start: 162,
  //     size: 8,
  //     required: false
  //   },
  //   isan: {
  //     header: 'ISAN',
  //     desc: '',
  //     start: 170,
  //     size: 12,
  //     required: false
  //   },
  //   episode: {
  //     header: 'Episode',
  //     desc: 'Unique identifier for episode',
  //     start: 182,
  //     size: 4,
  //     required: false
  //   },
  //   checkDigit: {
  //     header: 'Check Digit',
  //     desc: 'Check digit to verify ISAN',
  //     start: 186,
  //     size: 1,
  //     required: false
  //   },
  //   productionNum: {
  //     header: 'Production Number',
  //     desc: 'Number generated by production company to identify work',
  //     start: 187,
  //     size: 1,
  //     required: false
  //   },
  //   episodeTitle: {
  //     header: 'Episode Title',
  //     desc: 'Title of the episode from which this work originated',
  //     start: 199,
  //     size: 60,
  //     required: false
  //   },
  //   episodeNum: {
  //     header: 'Episode Number',
  //     desc: 'Number assigned to the episode by the producer',
  //     start: 259,
  //     size: 20,
  //     required: false
  //   },
  //   productionYear: {
  //     header: 'Production Year',
  //     desc: 'The year in which the production was completed',
  //     start: 279,
  //     size: 4,
  //     required: false
  //   },
  //   aviSocietyCode: {
  //     header: 'AVI Society Code',
  //     desc: 'The society code for the entry in the AV index',
  //     start: 283,
  //     size: 3,
  //     required: false
  //   },
  //   audioVisualNum: {
  //     header: 'Audio-Visual Number',
  //     desc: 'Unique number used internally by the owning society',
  //     start: 286,
  //     size: 15,
  //     required: false
  //   }
  }
};

export const INS_RECORD: CWRRecordDefinition = {
  recordType: 'INS',
  desc: 'Instrumentation Summary',
  fields: {
    ...RECORD_PREFIX,
    numVoices: {
      header: 'Number of Voices',
      desc: 'Indicates the number of independent parts in this work',
      start: 19,
      size: 3,
      required: false
    },
    instrumentationType: {
      header: 'Standard Instrumentation Type',
      desc: 'Describes the instrumentation used on this work',
      start: 22,
      size: 3,
      required: false
    },
    instrumentationDesc: {
      header: 'Instrumentation Description',
      desc: 'Describes non-standard instrumentation used on this work',
      start: 25,
      size: 50,
      required: false
    }
  }
};

export const IND_RECORD: CWRRecordDefinition = {
  recordType: 'IND',
  desc: 'Instrumentation Detail',
  fields: {
    ...RECORD_PREFIX,
    instrumentCode: {
      header: 'Instrument Code',
      desc: 'Indicates the use of a specific instrument',
      start: 19,
      size: 3,
      required: true
    },
    numPlayers: {
      header: 'Number of Players',
      desc: 'Indicates the number of players for the above instrument',
      start: 22,
      size: 3,
      required: false
    }
  }
};

export const COM_RECORD: CWRRecordDefinition = {
  recordType: 'COM',
  desc: 'Component',
  fields: {
    ...RECORD_PREFIX,
    title: {
      header: 'Title',
      desc: 'The title of the original work',
      start: 19,
      size: 60,
      required: true
    },
    iswc: {
      header: 'ISWC of Component',
      desc: 'International Standard Work Code',
      start: 79,
      size: 11,
      required: false
    },
    submitterWorkNum: {
      header: 'Submitter Work Number',
      desc: 'Unique number assigned by submitter',
      start: 90,
      size: 14,
      required: false
    },
    duration: {
      header: 'Duration',
      desc: 'The duration of this composite component',
      start: 104,
      size: 6,
      required: false
    },
    writerOneLastName: {
      header: 'Writer One Last Name',
      desc: 'Last name of the first writer of this component',
      start: 110,
      size: 45,
      required: true
    },
    writerOneFirstName: {
      header: 'Writer One First Name',
      desc: 'First name of the first writer of this component',
      start: 155,
      size: 30,
      required: false
    },
    writerOneIpiNameNum: {
      header: 'Writer One IPI Name Number',
      desc: 'IPI Name number assigned to the first writer',
      start: 185,
      size: 11,
      required: false
    },
    writerTwoLastName: {
      header: 'Writer Two Last Name',
      desc: 'Last name of the second writer of this component',
      start: 196,
      size: 46,
      required: false
    },
    writerTwoFirstName: {
      header: 'Writer Two First Name',
      desc: 'First name of the second writer of this component',
      start: 241,
      size: 30,
      required: false
    },
    writerTwoIpiNameNum: {
      header: 'Writer Two IPI Name Number',
      desc: ' IPI Name number assigned to the second writer of this component',
      start: 271,
      size: 11, 
      required: false
    },
    writerOneIpiBaseNum: {
      header: 'Writer One IPI Base Number',
      desc: 'IPI base number assigned to this writer',
      start: 282,
      size: 13,
      required: false
    },
    writerTwoIpiBaseNum: {
      header: 'Writer Two IPI Base Number',
      desc: 'IPI base number assigned to this writer',
      start: 295,
      size: 13,
      required: false
    },
  }
};

export const MSG_RECORD: CWRRecordDefinition = {
  recordType: 'MSG',
  desc: 'Message',
  fields: {
    ...RECORD_PREFIX,
    messageType: {
      header: 'Message Type',
      desc: 'Indicates whether this information is a warning, error, or information only',
      start: 19,
      size: 1,
      required: true
    },
    recordSeqNum: {
      header: 'Original Record Sequence Number',
      desc: 'The record sequence number within the transaction associated with this ACK',
      start: 20,
      size: 8,
      required: true
    },
    recordType: {
      header: 'Record Type',
      desc: 'Record type within the original transaction that caused this message',
      start: 28,
      size: 3,
      required: true
    },
    messageLevel: {
      header: 'Message Level',
      desc: 'The level of editing responsible for this message',
      start: 31,
      size: 1,
      required: true
    },
    validationNum: {
      header: 'Validation Number',
      desc: 'The specific edit condition that generated this message',
      start: 32,
      size: 3,
      required: true
    },
    messageText: {
      header: 'Message Text',
      desc: 'The text associated with this message',
      start: 35,
      size: 150,
      required: true
    }
  }
};

export const NET_RECORD: CWRRecordDefinition = {
  recordType: 'NET',
  desc: 'Non-Roman Alphabet Entire Work Title for Excerpts',
  fields: {
    ...RECORD_PREFIX,
    title: {
      header: 'Title',
      desc: 'The title in non-Roman alphabet',
      start: 19,
      size: 640,
      required: true
    },
    languageCode: {
      header: 'Language Code',
      desc: 'The language code of the title',
      start: 659,
      size: 2,
      required: false
    }
  }
};

export const NCT_RECORD: CWRRecordDefinition = {
  ...NET_RECORD,
  recordType: 'NCT',
  desc: 'Non-Roman Alphabet Title for Components',
};

export const NVT_RECORD: CWRRecordDefinition = {
  ...NET_RECORD,
  recordType: 'NVT',
  desc: 'Non-Roman Alphabet Original Title for Version',
};

export const NOW_RECORD: CWRRecordDefinition = {
  recordType: 'NOW',
  desc: 'Non-Roman Alphabet Other Writer Name',
  fields: {
    ...RECORD_PREFIX,
    lastName: {
      header: 'Writer Name',
      desc: 'Writer\'s last or only name',
      start: 19,
      size: 160,
      required: true
    },
    firstName: {
      header: 'Writer First Name',
      desc: 'Writer\'s first name',
      start: 179,
      size: 160,
      required: true
    },
    languageCode: {
      header: 'Language Code',
      desc: 'The language code of the name',
      start: 339,
      size: 2,
      required: false
    },
    writerPosition: {
      header: 'Writer Position',
      desc: 'Position of the writer in the corresponding EWT, VER, COM',
      start: 341,
      size: 1,
      required: false
    }
  }
};

export const ARI_RECORD: CWRRecordDefinition = {
  recordType: 'ARI',
  desc: 'Additional Related Information',
  fields: {
    ...RECORD_PREFIX,
    societyNum: {
      header: 'Society Number',
      desc: 'Number assigned to the society to which the note is addressed',
      start: 19,
      size: 3,
      required: true
    },
    workNum: {
      header: 'Work number',
      desc: 'Society work number that relates to the registration',
      start: 22,
      size: 14,
      required: false
    },
    rightType: {
      header: 'Type of Right',
      desc: 'Indicates relation to performing, mechanical, sync. or all rights',
      start: 36,
      size: 3,
      required: true
    },
    subjectCode: {
      header: 'Subject Code',
      desc: 'Subject of the ARI',
      start: 39,
      size: 2,
      required: false
    },
    note: {
      header: 'Note',
      desc: 'Free text field',
      start: 41,
      size: 160,
      required: false
    }
  }
};

// Map record type to its field definitions
export const CWR_FIELD_MAP: Record<CWRRecordType, CWRRecordDefinition> = {
  HDR: HDR_RECORD,
  GRH: GRH_RECORD,
  GRT: GRT_RECORD,
  TRL: TRL_RECORD,
  AGR: AGR_RECORD,
  NWR: NWR_RECORD,
  REV: REV_RECORD,
  ISW: ISW_RECORD,
  EXC: EXC_RECORD,
  ACK: ACK_RECORD, 
  TER: TER_RECORD,
  IPA: IPA_RECORD,
  NPA: NPA_RECORD,
  SPU: SPU_RECORD,
  OPU: OPU_RECORD,
  NPN: NPN_RECORD,
  SPT: SPT_RECORD,
  SWR: SWR_RECORD,
  OWR: OWR_RECORD,
  NWN: NWN_RECORD,
  SWT: SWT_RECORD,
  PWR: PWR_RECORD,
  ALT: ALT_RECORD,
  NAT: NAT_RECORD,
  EWT: EWT_RECORD,
  VER: VER_RECORD,
  PER: PER_RECORD,
  NPR: NPR_RECORD,
  REC: REC_RECORD,
  ORN: ORN_RECORD,
  INS: INS_RECORD,
  IND: IND_RECORD,
  COM: COM_RECORD,
  MSG: MSG_RECORD,
  NET: NET_RECORD,
  NCT: NCT_RECORD,
  NVT: NVT_RECORD,
  NOW: NOW_RECORD,
  ARI: ARI_RECORD,
};