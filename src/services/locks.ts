export interface LockService {
  createLock(): Promise<void>;
  listLocks(): Promise<void>;
}

export const lockService: LockService = {
  createLock: async () => Promise.resolve(),
  listLocks: async () => Promise.resolve(),
};
