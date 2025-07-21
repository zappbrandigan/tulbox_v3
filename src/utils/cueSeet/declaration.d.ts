declare module 'pdfjs-dist/build/pdf.worker.mjs' {
  const workerSrc: string;
  export default workerSrc;
}

declare module '*.mjs?url' {
  const url: string;
  export default url;
}
