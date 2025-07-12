import { useState } from 'react';
import TooltipPortal from './TooltipPortal';
import { recordFields } from 'cwr-parser';
import { FieldDefinition, RecordTypeKey } from 'cwr-parser/types';

interface RecordLineProps {
  line: Map<string, string>;
  isFullScreen: boolean;
  searchQuery: string;
  isTooltipEnabled: boolean;
}

const RecordLine: React.FC<RecordLineProps> = ({
  line,
  isFullScreen,
  searchQuery,
  isTooltipEnabled,
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
              (() => {
                const lowerValue = value.toLowerCase();
                const lowerSearch = searchQuery?.toLowerCase();
                const matchIndex =
                  lowerSearch && lowerSearch.length
                    ? lowerValue.indexOf(lowerSearch)
                    : -1;

                if (matchIndex === -1 || isPercentage) {
                  return isPercentage ? (
                    <>
                      <span className="tracking-widest">
                        {value.slice(0, -2)}
                      </span>
                      <span className="text-[.8em] relative -top-1">
                        {value.slice(-2)}
                      </span>
                    </>
                  ) : (
                    value.padEnd(size)
                  );
                }

                const start = value.slice(0, matchIndex);
                const match = value.slice(
                  matchIndex,
                  matchIndex + lowerSearch.length
                );
                const end = value.slice(matchIndex + lowerSearch.length);

                return (
                  <>
                    {start}
                    <mark className="bg-yellow-300 text-black font-semibold">
                      {match}
                    </mark>
                    {end.padEnd(size - start.length - match.length)}
                  </>
                );
              })()
            )}
          </span>
        );
      })}
      {tooltip && isTooltipEnabled && !isFullScreen && (
        <TooltipPortal position={tooltip.position}>
          <h2 className="font-bold">{tooltip.title}</h2>
          {tooltip.description}
        </TooltipPortal>
      )}
    </div>
  );
};

export default RecordLine;
