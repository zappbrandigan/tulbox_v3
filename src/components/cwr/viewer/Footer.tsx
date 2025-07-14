import { getTemplateById } from '@/utils';

interface Props {
  totalRecords: number;
  errorCount: number;
  warningCount: number;
  templateId: string;
  cwrFileVersion: string;
}

const CodeViewFooter: React.FC<Props> = ({
  totalRecords,
  errorCount,
  warningCount,
  templateId,
  cwrFileVersion,
}) => {
  const template = getTemplateById(templateId);

  return (
    <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>
          <span className="text-emerald-500">{totalRecords}</span>
          {` records • `}
          <span className="text-red-500">{errorCount}</span>
          {` errors • `}
          <span className="text-amber-500">{warningCount}</span>
          {` warnings`}
        </span>
        <span>
          CWR v{Number(cwrFileVersion)} format • {template.name}{' '}
          <span className="text-blue-500">v{template.version}</span>
        </span>
      </div>
    </div>
  );
};

export default CodeViewFooter;
