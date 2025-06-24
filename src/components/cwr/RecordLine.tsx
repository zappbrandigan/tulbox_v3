import { useState } from "react";
import { TooltipPortal } from "./TooltipPortal";
import { CWRRecordType } from "../../types/cwrTypes";
import { CWR_FIELD_MAP } from "../../utils/cwrRecordDefinitions";
import { CWRRecordDefinition } from "../../types/cwrTypes";

export const RecordLine = ({ line }: { line: Map<string, string> }) => {
  const [tooltip, setTooltip] = useState<{
    title: string;
    description: string;
    position: { x: number; y: number };
  } | null>(null);

  const recordType = line.get('recordType')! as CWRRecordType;
  const recordDefinition: CWRRecordDefinition = CWR_FIELD_MAP[recordType];

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLSpanElement>,
    header: string,
    desc: string
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      title: header,
      description: desc,
      position: {
        x: (rect.right - rect.width),
        y: rect.top,
      }
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div>
      {[...line.entries()].map(([key, value]) => {
        const recordDescription = recordDefinition['desc'];
        const fieldDefinition = recordDefinition['fields'][key];
        const size = fieldDefinition?.size ?? value.length;
        const isPercentage = key.includes('Share');

        return (
          <span
            key={key}
            onMouseEnter={(e) =>
              fieldDefinition?.desc 
              ? handleMouseEnter(e, fieldDefinition.header, fieldDefinition.desc)
              : handleMouseEnter(e, 'Record Indicator', recordDescription)
            }
            onMouseLeave={handleMouseLeave}
            className="text-sm bg-gray-300 text-gray-800 px-1.5 py-0.5 mx-1 rounded whitespace-pre hover:bg-blue-100"
          >
            {isPercentage 
              ? (
                  <>
                    <span className="tracking-widest">{value.slice(0, -2)}</span>
                    <span className="text-[.8em] relative -top-1">{value.slice(-2)}</span>
                  </>
                )
              : value.padEnd(size)}
          </span>
        );
      })}
      {tooltip && (
        <TooltipPortal position={tooltip.position}>
          <h2 className="font-bold">{tooltip.title}</h2>
          {tooltip.description}
        </TooltipPortal>
      )}
    </div>
  );
};
