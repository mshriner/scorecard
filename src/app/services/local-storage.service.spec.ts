import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  Mocked,
  vi,
} from 'vitest';
import { LOCAL_STORAGE_KEYS } from '../models/constants';
import { assertStorageSafe } from '../models/storage-object';
import { LocalUserWithFilters } from '../models/user';
import { AppDatabase } from './app-database.service';
import { LocalStorageService } from './local-storage.service';

export function createLocalStorageServiceTestMock(): Mocked<LocalStorageService> {
  return {
    getUser: vi.fn(),
    setUser: vi.fn(),
    getCourse: vi.fn(),
    setCourse: vi.fn(),
    getRound: vi.fn(),
    setRound: vi.fn(),
    getCurrentUserId: vi.fn(),
    setCurrentUserId: vi.fn(),
    getAllUserIds: vi.fn(() => []),
    setAllUserIds: vi.fn(),
    getStorageUsageBytes: vi.fn(),
  } as unknown as Mocked<LocalStorageService>;
}

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

  return new Proxy({} as Storage, {
    get(target, prop, receiver) {
      if (prop === 'getItem')
        return (key: string) => store.get(String(key)) ?? null;
      if (prop === 'setItem')
        return (key: string, value: string) =>
          store.set(String(key), String(value));
      if (prop === 'removeItem')
        return (key: string) => store.delete(String(key));
      if (prop === 'clear') return () => store.clear();
      if (prop === 'key')
        return (idx: number) => Array.from(store.keys())[idx] ?? null;
      if (prop === 'length') return store.size;

      // Ensure internal JS calls (like Symbol.toStringTag) don't crash
      return Reflect.get(target, prop, receiver);
    },
    ownKeys() {
      return Array.from(store.keys());
    },
    getOwnPropertyDescriptor() {
      return { enumerable: true, configurable: true };
    },
  });
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

  const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

  const initializeService = async () => {
    service = TestBed.inject(LocalStorageService);
    await service.initialize();
  };

  beforeEach(async () => {
    vi.stubGlobal('localStorage', createLocalStorageMock());
    mockDb = createMockDb();

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        LocalStorageService,
        { provide: AppDatabase, useValue: mockDb },
      ],
    }).compileComponents();
  });

  it('should be created', async () => {
    await initializeService();
    expect(service).toBeTruthy();
  });

  it('should store ALL_USERS metadata and return the cached value', async () => {
    await initializeService();
    service.setAllUserIds(['one', 'two']);
    await flushPromises();

    expect(mockDb.metadata.put).toHaveBeenCalledWith({
      key: LOCAL_STORAGE_KEYS.ALL_USERS,
      value: ['one', 'two'],
    });
  });

  it('should store CURRENT_USER_ID metadata and return the cached value', async () => {
    await initializeService();

    expect(service.setCurrentUserId('user-123')).toBe(true);
    expect(mockDb.metadata.put).toHaveBeenCalledWith({
      key: LOCAL_STORAGE_KEYS.CURRENT_USER_ID,
      value: 'user-123',
    });
    expect(service.getCurrentUserId()).toBe('user-123');
  });

  it('should support typed metadata and user accessors', async () => {
    await initializeService();

    expect(service.setAllUserIds(['user-a', 'user-b'])).toBe(true);
    expect(service.getAllUserIds()).toEqual(['user-a', 'user-b']);

    expect(service.setCurrentUserId('user-a')).toBe(true);
    expect(service.getCurrentUserId()).toBe('user-a');

    const typedUser: LocalUserWithFilters = {
      id: 'user-a',
      name: 'Typed User',
      roundIds: [],
      courseIds: [],
      appFontScaling: 0,
    };

    expect(service.setUser(typedUser)).toBe(true);
    expect(service.getUser(typedUser.id)).toEqual(typedUser);
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

    expect(service.setUser(user)).toBe(true);
    expect(mockDb.users.put).toHaveBeenCalledWith({ ...user, id: user.id });
    expect(service.getUser(user.id)).toEqual(user);
  });

  it('should reject non-serializable values before saving to Dexie', async () => {
    await initializeService();

    expect(() =>
      assertStorageSafe({
        id: 'bad-round',
        notAllowed: () => 'nope',
      }),
    ).toThrow(TypeError);

    expect(
      service.setRound({
        id: 'round-1',
        dateStringISO: new Date().toISOString(),
        courseId: 'course-1',
        strokes: [4, 4, 4, 4, 4, 4, 4, 4, 4],
        putts: [1, 1, 1, 1, 1, 1, 1, 1, 1],
        roundVariety: 'EIGHTEEN' as any,
        generalNotes: 'note',
        // @ts-expect-error intentional invalid value for storage-safety test
        buggyValue: () => 'bad',
      }),
    ).toBe(false);
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
    service.setUser(user);

    service.removeItem(user.id);

    expect(mockDb.users.delete).toHaveBeenCalledWith(user.id);
    expect(service.getUser(user.id)).toBeNull();
  });

  it('should clear all storage and DB tables without removing unrelated localStorage keys', async () => {
    await initializeService();
    service.setCurrentUserId('any-user');
    localStorage.setItem('legacy-key', 'legacy-value');

    await service.clear();

    expect(mockDb.users.clear).toHaveBeenCalled();
    expect(mockDb.courses.clear).toHaveBeenCalled();
    expect(mockDb.rounds.clear).toHaveBeenCalled();
    expect(mockDb.metadata.clear).toHaveBeenCalled();
    expect(localStorage.getItem('legacy-key')).toBeNull();
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

    service.setAllUserIds(['one']);
    const bytes = service.getStorageUsageBytes();

    expect(bytes).toBeGreaterThan(0);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    TestBed.resetTestingModule();
  });
});
