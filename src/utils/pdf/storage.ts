type StoredFileRecord = {
  id: string;
  name: string;
  type: string;
  lastModified: number;
  blob: Blob;
};

const DB_NAME = 'tulbox_pdf_manager';
const STORE_NAME = 'files';
const DB_VERSION = 1;

const isPdfStorageAvailable = (): boolean =>
  typeof indexedDB !== 'undefined';

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const putStoredFile = async (id: string, file: File): Promise<void> => {
  if (!isPdfStorageAvailable()) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({
      id,
      name: file.name,
      type: file.type,
      lastModified: file.lastModified,
      blob: file,
    } satisfies StoredFileRecord);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error);
    };
  });
};

const getStoredFile = async (id: string): Promise<File | null> => {
  if (!isPdfStorageAvailable()) return null;
  const db = await openDb();
  return await new Promise<File | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => {
      const record = request.result as StoredFileRecord | undefined;
      if (!record) {
        resolve(null);
        return;
      }
      const file = new File([record.blob], record.name, {
        type: record.type,
        lastModified: record.lastModified,
      });
      resolve(file);
    };
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
    tx.onabort = () => db.close();
  });
};

const deleteStoredFile = async (id: string): Promise<void> => {
  if (!isPdfStorageAvailable()) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error);
    };
  });
};

const clearStoredFiles = async (): Promise<void> => {
  if (!isPdfStorageAvailable()) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error);
    };
  });
};

export {
  isPdfStorageAvailable,
  putStoredFile,
  getStoredFile,
  deleteStoredFile,
  clearStoredFiles,
};
