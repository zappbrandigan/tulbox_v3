import { useState } from 'react';
import TooltipPortal from './TooltipPortal';
import { recordFields } from 'cwr-parser';
import { FieldDefinition, RecordTypeKey } from 'cwr-parser/types';

const RecordLine = ({
  line,
  isFullScreen,
}: {
  line: Map<string, string>;
  isFullScreen: boolean;
}) => {
  const [tooltip, setTooltip] = useState<{
    title: string;
    description: string;
    position: { x: number; y: number };
  } | null>(null);

  const recordType = line.get('recordType') as RecordTypeKey;
  const recordDefinition = recordFields[recordType];

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
        x: rect.right - rect.width,
        y: rect.top,
      },
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div>
      {[...line.entries()].map(([key, value]) => {
        const fieldDefinition: FieldDefinition =
          recordDefinition.find((f) => f.name === key) ??
          ({
            title: 'Error',
            description: 'Missing info',
            type: 'string',
            length: value.length,
            required: false,
          } as FieldDefinition);
        const size = fieldDefinition?.length ?? value.length;
        const isPercentage = fieldDefinition.type === 'percentage';

        return (
          <span
            key={key}
            onMouseEnter={(e) =>
              handleMouseEnter(
                e,
                fieldDefinition.title,
                fieldDefinition.description
              )
            }
            onMouseLeave={handleMouseLeave}
            className="text-sm bg-gray-300 text-gray-800 px-1.5 py-0.5 mx-1 rounded whitespace-pre hover:bg-blue-100"
          >
            {isPercentage ? (
              <>
                <span className="tracking-widest">{value.slice(0, -2)}</span>
                <span className="text-[.8em] relative -top-1">
                  {value.slice(-2)}
                </span>
              </>
            ) : (
              value.padEnd(size)
            )}
          </span>
        );
      })}
      {tooltip && !isFullScreen && (
        <TooltipPortal position={tooltip.position}>
          <h2 className="font-bold">{tooltip.title}</h2>
          {tooltip.description}
        </TooltipPortal>
      )}
    </div>
  );
};

export default RecordLine;
