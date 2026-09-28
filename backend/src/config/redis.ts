import Redis from 'ioredis';
import { ENV } from './env';

class RedisManager {
  private client: Redis | null = null;
  private isConnected = false;

  constructor() {
    try {
      this.client = new Redis(ENV.REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableOfflineQueue: false,
        retryStrategy(times) {
          const delay = Math.min(times * 100, 2000);
          return delay;
        },
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        console.log('⚡ Redis Cache Cluster kết nối thành công!');
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        // In local development without active Redis, fallback to in-memory cache gracefully
        console.warn('⚠️ Cảnh báo Redis: Không thể kết nối Redis, chuyển sang Fallback In-memory cache.');
      });
    } catch (e) {
      console.warn('⚠️ Lỗi khởi tạo Redis client.');
    }
  }

  // Fallback in-memory map
  private memoryCache = new Map<string, { value: string; expiry: number }>();

  async get(key: string): Promise<string | null> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch {
        // fallback
      }
    }
    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.memoryCache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds = 60): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.set(key, value, 'EX', ttlSeconds);
        return;
      } catch {
        // fallback
      }
    }
    this.memoryCache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
        return;
      } catch {
        // fallback
      }
    }
    this.memoryCache.delete(key);
  }

  // Geospatial Indexing (GEOADD & GEORADIUS) for 10k CCU location queries
  async updateLocation(key: string, id: string, longitude: number, latitude: number): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await (this.client as any).geoadd(key, longitude, latitude, id);
      } catch {
        // fallback
      }
    }
  }
}

export const redisCache = new RedisManager();
