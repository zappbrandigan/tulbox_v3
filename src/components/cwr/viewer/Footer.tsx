interface Props {
  totalRecords: number;
  errorCount: number;
  warningCount: number;
  templateName: string;
  templateVersion: string;
  cwrFileVersion: string;
}

const CodeViewFooter: React.FC<Props> = ({
  totalRecords,
  errorCount,
  warningCount,
  templateName,
  templateVersion,
  cwrFileVersion,
}) => {
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
          CWR v{Number(cwrFileVersion)} format • {templateName}
          <span className="text-blue-500">v{templateVersion}</span>
        </span>
      </div>
    </div>
  );
};

export default CodeViewFooter;
