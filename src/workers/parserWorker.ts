/// <reference lib="webworker" />
import { CWRConverter } from 'cwr-parser';

self.onmessage = (e) => {
  const { fileContent, file } = e.data;
  const converter = new CWRConverter();
  const result = converter.mapString(fileContent, file);

  (self as DedicatedWorkerGlobalScope).postMessage(result);
};
