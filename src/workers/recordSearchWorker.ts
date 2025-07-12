// src/workers/searchWorker.ts
import { CWRParsedRecord } from 'cwr-parser/types';

let cachedLines: CWRParsedRecord<Map<string, string>>[] = [];

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'init': {
      // store lines once; avoids serialising every search
      cachedLines = payload.lines;
      break;
    }

    case 'search': {
      const query: string = payload.query.toLowerCase();
      postMessage({ type: 'status', status: 'working' });
      if (!query) {
        postMessage({ type: 'result', matches: [] });
        postMessage({ type: 'status', status: 'idle' });
        return;
      }

      const matches = cachedLines
        .map((line, index) => ({ index, line }))
        .filter(({ line }) =>
          Object.values(
            line.data instanceof Map
              ? Object.fromEntries(line.data.entries())
              : line.data
          ).some((v) => v.toLowerCase().includes(query))
        );

      postMessage({ type: 'result', matches });
      postMessage({ type: 'status', status: 'idle' });
      break;
    }
  }
};
