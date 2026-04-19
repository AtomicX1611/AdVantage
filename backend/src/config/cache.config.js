import Redis from 'ioredis';

// ---------------------------------------------------------------------------
// Redis connection
// ---------------------------------------------------------------------------
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        if (times > 5) return null;           // stop retrying after 5 attempts
        return Math.min(times * 200, 2000);   // 200ms, 400ms, …, 2s
    },
    lazyConnect: process.env.NODE_ENV === 'test',
});

let isReady = false;

redis.on('connect', () => console.log('[Cache] Redis connected'));
redis.on('ready',   () => { isReady = true;  console.log('[Cache] Redis ready'); });
redis.on('error',   (err) => console.error('[Cache] Redis error:', err.message));
redis.on('close',   () => { isReady = false; });

// ---------------------------------------------------------------------------
// TTL map  (seconds)
// ---------------------------------------------------------------------------
const TTL = Object.freeze({
    HOMEPAGE:           15 * 60,     // 15 min – public, should reflect new products fast
    PRODUCT_DETAIL:     30 * 60,     // 30 min – per-product detail page
    SELLER_PRODUCTS:     5 * 60,     //  5 min – frequently mutated
    ADMIN_DATA:          2 * 60,     //  2 min – admin dashboard
    ADMIN_METRICS:       2 * 60,     //  2 min – admin metrics
    ADMIN_ANALYTICS:     2 * 60,     //  2 min – admin payment analytics
});

// ---------------------------------------------------------------------------
// Key builders – single source of truth for every cache key
// ---------------------------------------------------------------------------
const KEYS = Object.freeze({
    homepage:          ()   => 'cache:homepage',
    productDetail:     (id) => `cache:product:${id}`,
    sellerProducts:    (id) => `cache:seller_products:${id}`,
    adminData:         ()   => 'cache:admin_data',
    adminMetrics:      ()   => 'cache:admin_metrics',
    adminAnalytics:    ()   => 'cache:admin_analytics',
});

// ---------------------------------------------------------------------------
// Core helpers (all safe when Redis is down)
// ---------------------------------------------------------------------------

/**
 * Get a cached value. Returns the parsed object or null.
 */
async function cacheGet(key) {
    if (!isReady) {
        console.log(`[Cache] MISS ${key} (redis not ready)`);
        return null;
    }
    try {
        const raw = await redis.get(key);
        if (raw) {
            console.log(`[Cache] HIT ${key}`);
            return JSON.parse(raw);
        }
        console.log(`[Cache] MISS ${key}`);
        return null;
    } catch (err) {
        console.error(`[Cache] GET ${key} failed:`, err.message);
        return null;
    }
}

/**
 * Set a value in cache with a TTL (seconds).
 */
async function cacheSet(key, value, ttl) {
    if (!isReady) return;
    try {
        await redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (err) {
        console.error(`[Cache] SET ${key} failed:`, err.message);
    }
}

/**
 * Delete one or more keys.
 * @param {string | string[]} keys
 */
async function cacheDel(keys) {
    if (!isReady) return;
    const list = Array.isArray(keys) ? keys : [keys];
    if (list.length === 0) return;
    try {
        await redis.del(...list);
    } catch (err) {
        console.error(`[Cache] DEL [${list.join(', ')}] failed:`, err.message);
    }
}

// ---------------------------------------------------------------------------
// Convenience invalidation helpers
// ---------------------------------------------------------------------------

/** Invalidate everything a product mutation can affect */
function invalidateProductCaches(productId, sellerId) {
    const keys = [KEYS.homepage()];
    if (productId) keys.push(KEYS.productDetail(productId));
    if (sellerId)  keys.push(KEYS.sellerProducts(sellerId));
    return cacheDel(keys);
}

/** Invalidate all admin dashboard caches */
function invalidateAdminCaches() {
    return cacheDel([
        KEYS.adminData(),
        KEYS.adminMetrics(),
        KEYS.adminAnalytics(),
    ]);
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
export {
    redis,          // raw client (for tests / shutdown)
    TTL,
    KEYS,
    cacheGet,
    cacheSet,
    cacheDel,
    invalidateProductCaches,
    invalidateAdminCaches,
};

export default {
    redis,
    TTL,
    KEYS,
    get: cacheGet,
    set: cacheSet,
    del: cacheDel,
    invalidateProductCaches,
    invalidateAdminCaches,
};
