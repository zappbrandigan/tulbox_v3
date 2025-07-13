import { useState } from 'react';
import TooltipPortal from './TooltipPortal';
import { recordFields } from 'cwr-parser';
import { FieldDefinition, RecordTypeKey } from 'cwr-parser/types';

interface RecordLineProps {
  line: Map<string, string>;
  searchQuery: string;
  isTooltipEnabled: boolean;
  isMatched: boolean;
}

const RecordLine: React.FC<RecordLineProps> = ({
  line,
  searchQuery,
  isTooltipEnabled,
  isMatched,
}) => {
  const [tooltip, setTooltip] = useState<{
    title: string;
    description: string;
    position: { x: number; y: number };
  } | null>(null);

  const recordType = line.get('recordType') as RecordTypeKey;
  const recordDefinition = recordFields[recordType];

  /* ------------------------------------------------------------ */
  /*  Helper for % fields                                          */
  /* ------------------------------------------------------------ */
  const renderPercentage = (val: string) => (
    <>
      <span className="tracking-widest">{val.slice(0, -2)}</span>
      <span className="text-[.8em] relative -top-1">{val.slice(-2)}</span>
    </>
  );

  return (
    <div className={isMatched ? 'bg-yellow-900/20' : ''}>
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

        const size = fieldDefinition.length ?? value.length;
        const isPercentage = fieldDefinition.type === 'percentage';

        /* ----------------------------------------- */
        /*  Tooltip handlers                          */
        /* ----------------------------------------- */
        const handleMouseEnter = (
          e: React.MouseEvent<HTMLSpanElement, MouseEvent>
        ) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setTooltip({
            title: fieldDefinition.title,
            description: fieldDefinition.description,
            position: { x: rect.right - rect.width, y: rect.top },
          });
        };

        const handleMouseLeave = () => setTooltip(null);

        /* ----------------------------------------- */
        /*  Fast path – no highlight needed          */
        /* ----------------------------------------- */
        if (!isMatched || !searchQuery) {
          return (
            <span
              key={key}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="text-sm bg-gray-300 text-gray-800 px-1.5 py-0.5 mx-1 rounded whitespace-pre hover:bg-blue-100"
            >
              {isPercentage ? renderPercentage(value) : value.padEnd(size)}
            </span>
          );
        }

        /* ----------------------------------------- */
        /*  Highlight substring inside this value    */
        /* ----------------------------------------- */
        const lowerValue = value.toLowerCase();
        const lowerSearch = searchQuery.toLowerCase();
        const idx = lowerValue.indexOf(lowerSearch);

        return (
          <span
            key={key}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="text-sm bg-gray-300 text-gray-800 px-1.5 py-0.5 mx-1 rounded whitespace-pre hover:bg-blue-100"
          >
            {idx === -1 || isPercentage ? (
              isPercentage ? (
                renderPercentage(value)
              ) : (
                value.padEnd(size)
              )
            ) : (
              <>
                {value.slice(0, idx)}
                <mark className="bg-yellow-300 text-black font-semibold">
                  {value.slice(idx, idx + lowerSearch.length)}
                </mark>
                {value
                  .slice(idx + lowerSearch.length)
                  .padEnd(size - idx - lowerSearch.length)}
              </>
            )}
          </span>
        );
      })}

      {tooltip && isTooltipEnabled && (
        <TooltipPortal position={tooltip.position}>
          <h2 className="font-bold">{tooltip.title}</h2>
          {tooltip.description}
        </TooltipPortal>
      )}
    </div>
  );
};

export default RecordLine;
