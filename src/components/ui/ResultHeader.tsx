import { LucideIcon } from 'lucide-react';

interface Props {
  text: string;
  icon: LucideIcon;
  isVisible: boolean;
}

const ResultHeader: React.FC<Props> = ({ text, icon: Icon, isVisible }) => {
  if (!isVisible) return null;
  return (
    <div className="flex items-center space-x-2 mb-4">
      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {text}
      </h3>
    </div>
  );
};

export default ResultHeader;
