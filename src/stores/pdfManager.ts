import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import type { SearchReplaceRule, fileStatus } from '@/types';

export type PDFFileMeta = {
  id: string;
  originalName: string;
  currentName: string;
  characterCount: number;
  status: fileStatus;
  lastModified: number;
};

type PDFManagerState = {
  filesMeta: PDFFileMeta[];
  searchReplaceRules: SearchReplaceRule[];
  setFilesMeta: (files: PDFFileMeta[]) => void;
  setSearchReplaceRules: (rules: SearchReplaceRule[]) => void;
  clearAll: () => void;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
};

const mem: Record<string, string> = {};
const memoryStorage: StateStorage = {
  getItem: (name) => (name in mem ? mem[name] : null),
  setItem: (name, value) => {
    mem[name] = value;
  },
  removeItem: (name) => {
    delete mem[name];
  },
};

export const usePDFManagerStore = create<PDFManagerState>()(
  persist(
    (set) => ({
      filesMeta: [],
      searchReplaceRules: [],
      setFilesMeta: (files) => set({ filesMeta: files }),
      setSearchReplaceRules: (rules) => set({ searchReplaceRules: rules }),
      clearAll: () => set({ filesMeta: [], searchReplaceRules: [] }),
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'tulbox_pdf_manager',
      storage: createJSONStorage(() =>
        typeof window === 'undefined' ? memoryStorage : sessionStorage
      ),
      version: 1,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
