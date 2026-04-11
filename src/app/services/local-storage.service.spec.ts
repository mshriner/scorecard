import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LOCAL_STORAGE_KEYS } from '../models/constants';
import { LocalUserWithFilters } from '../models/user';
import { AppDatabase } from './app-database.service';
import { LocalStorageService } from './local-storage.service';

interface MockTable {
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
  toArray: ReturnType<typeof vi.fn>;
  bulkPut: ReturnType<typeof vi.fn>;
}

interface MockMetadata {
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
}

const createLocalStorageMock = (): Storage => {
  const store = new Map<string, string>();

  const handler: ProxyHandler<object> = {
    get(_, prop) {
      if (prop === 'getItem') {
        return (key: string) => (store.has(key) ? store.get(key)! : null);
      }
      if (prop === 'setItem') {
        return (key: string, value: string) => {
          store.set(String(key), String(value));
        };
      }
      if (prop === 'removeItem') {
        return (key: string) => store.delete(String(key));
      }
      if (prop === 'clear') {
        return () => store.clear();
      }
      if (prop === 'key') {
        return (index: number) => Array.from(store.keys())[index] ?? null;
      }
      if (prop === 'length') {
        return store.size;
      }
      return (store as any).get(prop as string);
    },
    ownKeys() {
      return [...store.keys()];
    },
    getOwnPropertyDescriptor(_, prop) {
      if (typeof prop === 'string' && store.has(prop)) {
        return {
          configurable: true,
          enumerable: true,
          writable: true,
          value: store.get(prop),
        };
      }
      return undefined;
    },
  };

  return new Proxy({}, handler) as Storage;
};

describe('LocalStorageService', () => {
  let service: LocalStorageService;
  let mockDb: {
    open: ReturnType<typeof vi.fn>;
    users: MockTable;
    courses: MockTable;
    rounds: MockTable;
    metadata: MockMetadata;
  };

  const createMockTable = (): MockTable => ({
    put: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
    toArray: vi.fn().mockResolvedValue([]),
    bulkPut: vi.fn().mockResolvedValue(undefined),
  });

  const createMockDb = () => ({
    open: vi.fn().mockResolvedValue(undefined),
    users: createMockTable(),
    courses: createMockTable(),
    rounds: createMockTable(),
    metadata: {
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
    },
  });

  const initializeService = async () => {
    service = TestBed.inject(LocalStorageService);
    await service.initialize();
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    globalThis.localStorage = createLocalStorageMock();
    mockDb = createMockDb();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: AppDatabase, useValue: mockDb },
      ],
    });
  });

  it('should be created', async () => {
    await initializeService();
    expect(service).toBeTruthy();
  });

  it('should store ALL_USERS metadata and return the cached value', async () => {
    await initializeService();

    expect(service.setItem(LOCAL_STORAGE_KEYS.ALL_USERS, ['one', 'two'])).toBe(
      true,
    );
    expect(mockDb.metadata.put).toHaveBeenCalledWith({
      key: LOCAL_STORAGE_KEYS.ALL_USERS,
      value: ['one', 'two'],
    });
    expect(service.getItem(LOCAL_STORAGE_KEYS.ALL_USERS)).toEqual([
      'one',
      'two',
    ]);
  });

  it('should store CURRENT_USER_ID metadata and return the cached value', async () => {
    await initializeService();

    expect(
      service.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER_ID, 'user-123'),
    ).toBe(true);
    expect(mockDb.metadata.put).toHaveBeenCalledWith({
      key: LOCAL_STORAGE_KEYS.CURRENT_USER_ID,
      value: 'user-123',
    });
    expect(service.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER_ID)).toBe(
      'user-123',
    );
  });

  it('should store and retrieve a user object', async () => {
    await initializeService();

    const user: LocalUserWithFilters = {
      id: 'user-1',
      name: 'Test User',
      roundIds: [],
      courseIds: [],
      appFontScaling: 0,
    };

    expect(service.setItem(user.id, user)).toBe(true);
    expect(mockDb.users.put).toHaveBeenCalledWith({ ...user, id: user.id });
    expect(service.getItem(user.id)).toEqual(user);
    expect(service.getItem(user.id)).not.toBe(user);
  });

  it('should remove an item and delete the record from the DB', async () => {
    await initializeService();

    const user: LocalUserWithFilters = {
      id: 'user-2',
      name: 'Remove Me',
      roundIds: [],
      courseIds: [],
      appFontScaling: 1,
    };
    service.setItem(user.id, user);

    service.removeItem(user.id);

    expect(mockDb.users.delete).toHaveBeenCalledWith(user.id);
    expect(service.getItem(user.id)).toBeNull();
  });

  it('should clear all storage and DB tables', async () => {
    await initializeService();
    service.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER_ID, 'any-user');
    localStorage.setItem('legacy-key', 'legacy-value');

    await service.clear();

    expect(mockDb.users.clear).toHaveBeenCalled();
    expect(mockDb.courses.clear).toHaveBeenCalled();
    expect(mockDb.rounds.clear).toHaveBeenCalled();
    expect(mockDb.metadata.clear).toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
  });

  it('should migrate legacy localStorage entries into IndexedDB on initialize', async () => {
    const legacyUser: LocalUserWithFilters = {
      id: 'legacy-user',
      name: 'Legacy',
      roundIds: [],
      courseIds: [],
      appFontScaling: 0,
    };

    localStorage.setItem(
      LOCAL_STORAGE_KEYS.ALL_USERS,
      JSON.stringify([legacyUser.id]),
    );
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.CURRENT_USER_ID,
      JSON.stringify(legacyUser.id),
    );
    localStorage.setItem(legacyUser.id, JSON.stringify(legacyUser));

    await initializeService();

    expect(mockDb.metadata.put).toHaveBeenCalledWith({
      key: LOCAL_STORAGE_KEYS.ALL_USERS,
      value: [legacyUser.id],
    });
    expect(mockDb.metadata.put).toHaveBeenCalledWith({
      key: LOCAL_STORAGE_KEYS.CURRENT_USER_ID,
      value: legacyUser.id,
    });
    expect(mockDb.users.bulkPut).toHaveBeenCalledWith([legacyUser]);
    expect(localStorage.getItem(legacyUser.id)).toBeNull();
  });

  it('should compute storage usage bytes after caching values', async () => {
    await initializeService();

    service.setItem(LOCAL_STORAGE_KEYS.ALL_USERS, ['one']);
    const bytes = service.getStorageUsageBytes();

    expect(bytes).toBeGreaterThan(0);
  });
});
