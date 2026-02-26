/// <reference lib="webworker" />
import type { SearchReplaceRule, fileStatus } from '@/types';
import {
  computeSearchReplacePreviewPayload,
  type PreviewFile,
} from '@/utils/pdf/searchReplacePreview';

type ComputeMsg = {
  type: 'compute';
  requestId: number;
  files: PreviewFile[];
  rules: SearchReplaceRule[];
};

type ResultMsg = {
  type: 'result';
  requestId: number;
  preview: ReturnType<typeof computeSearchReplacePreviewPayload>['preview'];
  previewNameMap: ReturnType<typeof computeSearchReplacePreviewPayload>['previewNameMap'];
  currentHighlightSegmentsMap: ReturnType<
    typeof computeSearchReplacePreviewPayload
  >['currentHighlightSegmentsMap'];
  previewHighlightSegmentsMap: ReturnType<
    typeof computeSearchReplacePreviewPayload
  >['previewHighlightSegmentsMap'];
};

type ErrorMsg = {
  type: 'error';
  requestId: number;
  error: string;
};

let cachedDotifyTransform:
  | ((title: string, hasEpisodeTitle: boolean) => { title: string; status: fileStatus })
  | null = null;
let dotifyTransformPromise: Promise<
  (title: string, hasEpisodeTitle: boolean) => { title: string; status: fileStatus }
> | null = null;

const hasCueRules = (rules: SearchReplaceRule[]): boolean =>
  rules.some(
    (rule) =>
      rule.isEnabled &&
      (rule.replaceWith === 'CUE_SHEET' || rule.replaceWith === 'CUE_SHEET_NO_EP')
  );

const getDotifyTransform = async () => {
  if (cachedDotifyTransform) return cachedDotifyTransform;
  if (!dotifyTransformPromise) {
    dotifyTransformPromise = import('@/utils/pdf/dotify').then((mod) => mod.default);
  }
  cachedDotifyTransform = await dotifyTransformPromise;
  return cachedDotifyTransform;
};

self.onmessage = async (e: MessageEvent<ComputeMsg>) => {
  if (e.data.type !== 'compute') return;
  const { requestId, files, rules } = e.data;

  try {
    const cueTransform = hasCueRules(rules) ? await getDotifyTransform() : undefined;
    const result = computeSearchReplacePreviewPayload(files, rules, {
      cueTransform,
    });
    (self as DedicatedWorkerGlobalScope).postMessage({
      type: 'result',
      requestId,
      preview: result.preview,
      previewNameMap: result.previewNameMap,
      currentHighlightSegmentsMap: result.currentHighlightSegmentsMap,
      previewHighlightSegmentsMap: result.previewHighlightSegmentsMap,
    } satisfies ResultMsg);
  } catch (err) {
    (self as DedicatedWorkerGlobalScope).postMessage({
      type: 'error',
      requestId,
      error: (err as Error).message,
    } satisfies ErrorMsg);
  }
};
