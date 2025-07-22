import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { CWRConverterRecord } from 'cwr-parser/types';
import { Panel, StatCard } from '../ui';
import WarningModal from '../ui/WarningModal';

interface Props {
  parseResult: CWRConverterRecord | null;
}

const Summary: React.FC<Props> = ({ parseResult }) => {
  const [showWarnings, setShowWarnings] = useState(false);
  if (!parseResult) return null;

  return (
    <>
      <Panel>
        <Panel.Header
          icon={<CheckCircle className="w-6 h-6 text-emerald-500" />}
          title="Results"
          subtitle={`Parsed on ${new Date().toDateString()}`}
        />
        <Panel.Body className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <StatCard
            value={parseResult.lines[0].data.get('senderName')}
            label="Sender"
            bg="bg-gray-50 dark:bg-gray-900/30"
            text="text-gray-600 dark:text-gray-300 text-sm truncate overflow-hidden whitespace-nowrap max-w-[180px] sm:max-w-none"
          />
          <StatCard
            value={parseResult.statistics?.recordCounts.NWR ?? 0}
            label="New Works"
            bg="bg-blue-50 dark:bg-blue-900/30"
            text="text-blue-600 dark:text-blue-300"
          />
          <StatCard
            value={parseResult.statistics?.recordCounts.REV ?? 0}
            label="Revised Works"
            bg="bg-emerald-50 dark:bg-emerald-900/30"
            text="text-emerald-600 dark:text-emerald-300"
          />
          <StatCard
            value={parseResult.statistics?.totalRecords ?? 0}
            label="Total Records"
            bg="bg-purple-50 dark:bg-purple-900/30"
            text="text-purple-600 dark:text-purple-300"
          />
          <StatCard
            value={parseResult.statistics?.errors?.length ?? 0}
            label="Warnings"
            bg="bg-amber-50 dark:bg-amber-900/30"
            text="text-amber-600 dark:text-amber-300"
            onClick={() => setShowWarnings(true)}
          />
        </Panel.Body>
      </Panel>
      <WarningModal
        warnings={parseResult.statistics?.errors ?? []}
        showWarnings={showWarnings}
        setShowWarnings={setShowWarnings}
      />
    </>
  );
};

export default Summary;
