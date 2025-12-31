export interface StorageService {
  upload(uri: string): Promise<void>;
  remove(path: string): Promise<void>;
}

export const storageService: StorageService = {
  upload: async () => Promise.resolve(),
  remove: async (_path: string) => Promise.resolve(),
};
