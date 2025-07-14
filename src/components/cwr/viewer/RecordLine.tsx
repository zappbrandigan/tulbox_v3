import { memo, useMemo, useState, useCallback } from 'react';
import TooltipPortal from './TooltipPortal';
import { recordFields } from 'cwr-parser';
import { FieldDefinition, RecordTypeKey } from 'cwr-parser/types';

interface Props {
  line: Map<string, string>;
  searchQuery: string;
  isTooltipEnabled: boolean;
  isMatched: boolean;
}

export default memo(
  function RecordLine({
    line,
    searchQuery,
    isTooltipEnabled,
    isMatched,
  }: Props) {
    const entries = useMemo(() => [...line.entries()], [line]);

    const recordType = line.get('recordType') as RecordTypeKey;

    const fieldDefMap = useMemo(() => {
      const defs = recordFields[recordType] ?? [];
      return new Map<string, FieldDefinition>(
        defs.map((d) => [d.name, d] as const)
      );
    }, [recordType]);

    const [tooltip, setTooltip] = useState<{
      title: string;
      description: string;
      position: { x: number; y: number };
    } | null>(null);

    const handleMouseEnter = useCallback(
      (
        e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
        def: FieldDefinition
      ) => {
        const { top, right, width } = e.currentTarget.getBoundingClientRect();
        setTooltip({
          title: def.title,
          description: def.description,
          position: { x: right - width, y: top },
        });
      },
      []
    );

    const handleMouseLeave = useCallback(() => setTooltip(null), []);

    const hasSearch = isMatched && searchQuery.length > 0;
    const lowerSearch = hasSearch ? searchQuery.toLowerCase() : '';

    const renderPercentage = (val: string) => (
      <>
        <span className="tracking-widest">{val.slice(0, -2)}</span>
        <span className="text-[.8em] relative -top-1">{val.slice(-2)}</span>
      </>
    );

    return (
      <div className={isMatched ? 'bg-yellow-900/20' : ''}>
        {entries.map(([key, value]) => {
          const def =
            fieldDefMap.get(key) ??
            ({
              title: key,
              description: '',
              type: 'string',
              length: value.length,
              required: false,
            } as FieldDefinition);

          const size = def.length ?? value.length;
          const isPct = def.type === 'percentage';

          const common = {
            onMouseEnter: (e: React.MouseEvent<HTMLSpanElement>) =>
              handleMouseEnter(e, def),
            onMouseLeave: handleMouseLeave,
            className:
              'text-sm bg-gray-300 text-gray-800 px-1.5 py-0.5 mx-1 rounded whitespace-pre hover:bg-blue-100',
          };

          /* ---------- fast branch: no highlighting needed ---------- */
          if (!hasSearch) {
            return (
              <span key={key} {...common}>
                {isPct ? renderPercentage(value) : value.padEnd(size)}
              </span>
            );
          }

          const idx = value.toLowerCase().indexOf(lowerSearch);
          if (idx === -1) {
            return (
              <span key={key} {...common}>
                {isPct ? renderPercentage(value) : value.padEnd(size)}
              </span>
            );
          }

          /* ---------- highlight branch ---------- */
          /* ---------- percentage field with a match ----------------- */
          if (isPct) {
            const trailingStart = value.length - 2; // index where last-2 block begins
            const leading = value.slice(0, trailingStart);
            const trailing = value.slice(trailingStart); // exactly 2 chars

            // idx is already computed right after the fast-path guard
            const matchEnd = idx + lowerSearch.length;

            return (
              <span key={key} {...common}>
                {/* ---------- highlight lives completely in LEADING part ---------- */}
                {matchEnd <= trailingStart && (
                  <>
                    <span className="tracking-widest">
                      {leading.slice(0, idx)}
                      <mark className="bg-yellow-300 text-black font-semibold">
                        {leading.slice(idx, matchEnd)}
                      </mark>
                      {leading.slice(matchEnd)}
                    </span>
                    <span className="text-[.8em] relative -top-1">
                      {trailing}
                    </span>
                  </>
                )}

                {/* ---------- highlight lives completely in TRAILING 2 digits ------ */}
                {idx >= trailingStart && (
                  <>
                    <span className="tracking-widest">{leading}</span>
                    <span className="text-[.8em] relative -top-1">
                      {trailing.slice(0, idx - trailingStart)}
                      <mark className="bg-yellow-300 text-black font-semibold">
                        {trailing.slice(
                          idx - trailingStart,
                          matchEnd - trailingStart
                        )}
                      </mark>
                      {trailing.slice(matchEnd - trailingStart)}
                    </span>
                  </>
                )}

                {/* ---------- highlight CROSSES boundary --------------------------- */}
                {idx < trailingStart && matchEnd > trailingStart && (
                  <>
                    {/* part 1 in leading */}
                    <span className="tracking-widest">
                      {leading.slice(0, idx)}
                      <mark className="bg-yellow-300 text-black font-semibold">
                        {leading.slice(idx)}
                      </mark>
                    </span>
                    {/* part 2 in trailing */}
                    <span className="text-[.8em] relative -top-1">
                      <mark className="bg-yellow-300 text-black font-semibold">
                        {trailing.slice(0, matchEnd - trailingStart)}
                      </mark>
                      {trailing.slice(matchEnd - trailingStart)}
                    </span>
                  </>
                )}
              </span>
            );
          }

          /* ---------- normal (non-percentage) value with highlight ---- */
          return (
            <span key={key} {...common}>
              {value.slice(0, idx)}
              <mark className="bg-yellow-300 text-black font-semibold">
                {value.slice(idx, idx + lowerSearch.length)}
              </mark>
              {value
                .slice(idx + lowerSearch.length)
                .padEnd(size - idx - lowerSearch.length)}
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
  },
  /* ------------- custom memo compare: re-render only when needed ------------- */
  (prev, next) =>
    prev.line === next.line && // same Map instance
    prev.searchQuery === next.searchQuery &&
    prev.isMatched === next.isMatched &&
    prev.isTooltipEnabled === next.isTooltipEnabled
);
