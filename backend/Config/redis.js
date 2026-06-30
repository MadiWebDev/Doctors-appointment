import Redis from 'ioredis';

let redisClient = null;
let redisDisabled = false;

/**
 * Create Redis Client (Singleton)
 */
function createRedisClient() {
  // Disable Redis if password is set but invalid (to prevent retry loop)
  if (process.env.REDIS_PASSWORD && !process.env.REDIS_HOST) {
    console.warn('⚠️ Redis disabled: REDIS_HOST not set but REDIS_PASSWORD is configured');
    redisDisabled = true;
    return null;
  }

  const client = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB) || 0,

    // 🔁 Retry Strategy (Exponential Backoff)
    retryStrategy(times) {
      const delay = Math.min(times * 100, 3000);
      console.warn(`🔁 Redis retry #${times}, delay ${delay}ms`);
      return delay;
    },

    // ⚡ Performance & Stability
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
    connectTimeout: 10000,

    // 🔄 Auto reconnect on READONLY errors (cluster safe)
    reconnectOnError(err) {
      return err.message.includes('READONLY');
    },
  });

  // 🔌 Events
  client.on('connect', () => console.log('✅ Redis connected'));
  client.on('ready', () => console.log('🚀 Redis ready'));
  client.on('error', (err) => {
    // Disable Redis on auth errors to prevent retry loop
    if (err.message.includes('WRONGPASS')) {
      console.warn('⚠️ Redis auth failed - disabling Redis for this session');
      redisDisabled = true;
      client.disconnect();
      return;
    }
    console.error('❌ Redis error:', err);
  });
  client.on('close', () => console.warn('⚠️ Redis closed'));
  client.on('reconnecting', () => console.log('🔄 Redis reconnecting...'));

  return client;
}

/**
 * Get Redis Client (Singleton)
 */
export async function connectRedis() {
  if (redisDisabled) {
    return null;
  }

  try {
    if (!redisClient) {
      redisClient = createRedisClient();
      if (!redisClient) return null;
      await redisClient.connect(); // required with lazyConnect
    }
    return redisClient;
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    redisDisabled = true;
    return null;
  }
}

/**
 * Get Redis Client (alias for connectRedis)
 */
export async function getRedisClient() {
  return await connectRedis();
}

//////////////////////////////////////////////////////////
// 🔥 CACHE HELPERS
//////////////////////////////////////////////////////////

export async function cacheGet(key) {
  try {
    const client = await getRedisClient();
    if (!client) return null;

    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`❌ GET error [${key}]:`, error);
    return null;
  }
}

export async function cacheSet(key, value, ttl = 3600) {
  try {
    const client = await getRedisClient();
    if (!client) return false;

    const payload = JSON.stringify(value);

    if (ttl > 0) {
      await client.set(key, payload, 'EX', ttl);
    } else {
      await client.set(key, payload);
    }

    return true;
  } catch (error) {
    console.error(`❌ SET error [${key}]:`, error);
    return false;
  }
}

export async function cacheDel(key) {
  try {
    const client = await getRedisClient();
    if (!client) return false;

    await client.del(key);
    return true;
  } catch (error) {
    console.error(`❌ DEL error [${key}]:`, error);
    return false;
  }
}

/**
 * ✅ SAFE delete by pattern (SCAN instead of KEYS)
 */
export async function cacheDelPattern(pattern) {
  try {
    const client = await getRedisClient();
    if (!client) return false;

    const stream = client.scanStream({
      match: pattern,
      count: 100,
    });

    for await (const keys of stream) {
      if (keys.length) {
        await client.del(...keys);
      }
    }

    return true;
  } catch (error) {
    console.error(`❌ DEL PATTERN error [${pattern}]:`, error);
    return false;
  }
}

//////////////////////////////////////////////////////////
// ⚡ AUTO CACHE WRAPPER
//////////////////////////////////////////////////////////

export async function cacheWrap(key, fn, ttl = 3600) {
  const cached = await cacheGet(key);

  if (cached) {
    console.log(`⚡ Cache HIT: ${key}`);
    return cached;
  }

  console.log(`🐢 Cache MISS: ${key}`);
  const result = await fn();

  await cacheSet(key, result, ttl);

  return result;
}

//////////////////////////////////////////////////////////
// 🧹 GRACEFUL SHUTDOWN
//////////////////////////////////////////////////////////

export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('🛑 Redis closed gracefully');
  }
}

export default redisClient;