import NodeCache from "node-cache";

const DEFAULT_TTL_SECONDS = 300;
const DEFAULT_CHECK_PERIOD_SECONDS = 60;
const DEFAULT_MAX_KEYS = 1000;

interface CacheConfig {
  stdTTL: number;
  checkperiod: number;
  maxKeys: number;
}

const defaultConfig: CacheConfig = {
  stdTTL: DEFAULT_TTL_SECONDS,
  checkperiod: DEFAULT_CHECK_PERIOD_SECONDS,
  maxKeys: DEFAULT_MAX_KEYS,
} as const;

class CacheService {
  private cache: NodeCache;

  constructor(config: CacheConfig = defaultConfig) {
    this.cache = new NodeCache({
      stdTTL: config.stdTTL,
      checkperiod: config.checkperiod,
      maxKeys: config.maxKeys,
      useClones: false,
    });
  }

  get = <T>(key: string): T | undefined => {
    return this.cache.get<T>(key);
  };

  set = <T>(key: string, value: T, ttl?: number): boolean => {
    return this.cache.set(key, value, ttl ?? defaultConfig.stdTTL);
  };

  del = (key: string | string[]): number => {
    return this.cache.del(key);
  };

  delByPattern = (pattern: string): number => {
    const keys = this.cache.keys();
    const matchingKeys = keys.filter((k: string) => k.includes(pattern));
    return this.cache.del(matchingKeys);
  };

  flush = (): void => {
    this.cache.flushAll();
  };

  has = (key: string): boolean => {
    return this.cache.has(key);
  };

  getStats = () => {
    return this.cache.getStats();
  };

  keys = (): string[] => {
    return this.cache.keys();
  };
}

export const cacheService = new CacheService();
