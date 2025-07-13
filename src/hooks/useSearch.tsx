import { useEffect, useRef, useState } from 'react';
import SearchWorker from '@/workers/recordSearchWorker?worker'; // vite/webpack syntax
import { WorkerStatus, WorkerCmd } from '@/types';
import { CWRParsedRecord } from 'cwr-parser/types';

export function useSearch(lines: CWRParsedRecord<Map<string, string>>[]) {
  const workerRef = useRef<Worker>();
  const currentReq = useRef<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [matchLines, setMatchLines] = useState<Set<number>>(new Set());

  /* ---------------- create worker once ---------------- */
  useEffect(() => {
    const w = new SearchWorker();
    workerRef.current = w as unknown as Worker;

    w.onmessage = (e: MessageEvent<WorkerStatus>) => {
      switch (e.data.type) {
        case 'status':
          if (e.data.requestId !== currentReq.current) break; // stale
          setBusy(e.data.status === 'working');
          setProgress(e.data.progress ?? 0);
          break;
        case 'result':
          if (e.data.requestId !== currentReq.current) break;
          setMatchLines(new Set(e.data.matches));
          setProgress(1);
          setBusy(false);
          break;
      }
    };

    return () => w.terminate();
  }, []);

  /* -------------- (re)send raw lines to the worker -------------- */
  useEffect(() => {
    if (!workerRef.current || !lines.length) return;
    const cmd: WorkerCmd = { type: 'init', lines };
    workerRef.current.postMessage(cmd);
  }, [lines]);

  /* ------------------------ search fn ------------------------ */
  const runSearch = (query: string) => {
    if (!workerRef.current) return;

    // cancel previous job
    if (currentReq.current) {
      const cancel: WorkerCmd = {
        type: 'cancel',
        requestId: currentReq.current,
      };
      workerRef.current.postMessage(cancel);
    }

    // kick off new job
    const requestId = crypto.randomUUID();
    currentReq.current = requestId;

    const cmd: WorkerCmd = { type: 'search', query, requestId };
    workerRef.current.postMessage(cmd);

    // optimistic UI reset
    setMatchLines(new Set());
    setProgress(0);
    setBusy(Boolean(query));
  };

  return { runSearch, matchLines, busy, progress };
}
