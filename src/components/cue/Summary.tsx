import { CheckCircle } from 'lucide-react';
import { StatCard, Panel } from '../ui';

interface Props {
  template: string;
  fileCount: number;
  rowCount: number;
  uniqueCount: number;
  warningCount: number;
  setShowWarnings: React.Dispatch<React.SetStateAction<boolean>>;
}

const Summary: React.FC<Props> = ({
  template,
  fileCount,
  rowCount,
  uniqueCount,
  warningCount,
  setShowWarnings,
}) => {
  if (fileCount === 0) return null;

  return (
    <Panel>
      <Panel.Header
        icon={<CheckCircle className="w-6 h-6 text-emerald-500" />}
        title="Results"
        subtitle={`Parsed on ${new Date().toDateString()}`}
      />
      <Panel.Body className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <StatCard
          value={template}
          label="Format"
          bg="bg-gray-50 dark:bg-gray-900/30"
          text="text-gray-600 dark:text-gray-300 text-sm truncate overflow-hidden whitespace-nowrap max-w-[180px] sm:max-w-none"
        />
        <StatCard
          value={fileCount}
          label="File Count"
          bg="bg-blue-50 dark:bg-blue-900/30"
          text="text-blue-600 dark:text-blue-300"
        />
        <StatCard
          value={rowCount}
          label="Rows"
          bg="bg-emerald-50 dark:bg-emerald-900/30"
          text="text-emerald-600 dark:text-emerald-300"
        />
        <StatCard
          value={uniqueCount}
          label="Unique Rows"
          bg="bg-purple-50 dark:bg-purple-900/30"
          text="text-purple-600 dark:text-purple-300"
        />
        <StatCard
          value={warningCount}
          label="Warnings"
          bg="bg-amber-50 dark:bg-amber-900/30"
          text="text-amber-600 dark:text-amber-300"
          onClick={() => setShowWarnings(true)}
        />
      </Panel.Body>
    </Panel>
  );
};

export default Summary;
