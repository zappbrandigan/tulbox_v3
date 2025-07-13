import { CWRParsedRecord } from 'cwr-parser/types';

interface InitMsg {
  type: 'init';
  lines: CWRParsedRecord<Map<string, string>>[];
}

interface SearchMsg {
  type: 'search';
  query: string;
  requestId: string;
}

interface CancelMsg {
  type: 'cancel';
  requestId: string;
}

type InMsg = InitMsg | SearchMsg | CancelMsg;

/* ------------------------------------------------------------------ */
/*  Cached data                                                        */
/* ------------------------------------------------------------------ */
let rawLines: CWRParsedRecord<Map<string, string>>[] = [];
let lowerLines: string[] = []; // one flat, lower-cased string per row
let currentRequest: string | null = null;

self.onmessage = (e: MessageEvent<InMsg>) => {
  const { type } = e.data;

  switch (type) {
    case 'init': {
      rawLines = e.data.lines;
      lowerLines = rawLines.map((rec) =>
        Array.from(
          rec.data instanceof Map ? rec.data.values() : Object.values(rec.data)
        )
          .join('\x1f') // non-printable delimiter keeps strings short
          .toLowerCase()
      );
      break;
    }
    case 'cancel': {
      if (currentRequest === e.data.requestId) currentRequest = null;
      break;
    }
    case 'search': {
      const { query, requestId } = e.data;
      currentRequest = requestId;

      // trivial edge-case
      if (!query) {
        postMessage({ type: 'result', requestId, matches: [] });
        postMessage({ type: 'status', requestId, status: 'idle' });
        return;
      }

      const needle = query.toLowerCase();
      const CHUNK = 2_000;
      const matches: number[] = [];

      postMessage({
        type: 'status',
        requestId,
        status: 'working',
        progress: 0,
      });

      /* ----  Scan in slices so each loop iteration is < 16 ms ------- */
      (async function scan() {
        for (let i = 0; i < lowerLines.length; i += CHUNK) {
          // Early exit if user kicked off another search
          if (currentRequest !== requestId) return;

          for (let j = i; j < Math.min(i + CHUNK, lowerLines.length); j++) {
            if (lowerLines[j].includes(needle)) matches.push(j);
          }

          postMessage({
            type: 'status',
            requestId,
            status: 'working',
            progress:
              Math.min(i + CHUNK, lowerLines.length) / lowerLines.length,
          });

          await 0; // avoid watchdog
        }

        if (currentRequest !== requestId) return; // cancelled while finishing up

        postMessage({ type: 'result', requestId, matches });
        postMessage({ type: 'status', requestId, status: 'idle' });
      })();

      break;
    }
  }
};
