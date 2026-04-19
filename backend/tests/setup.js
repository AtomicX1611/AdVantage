import { redis } from "../src/config/cache.config.js";

afterAll(async () => {
    if (redis && redis.status !== 'end') {
        redis.disconnect();
    }
    await new Promise(resolve => setImmediate(resolve));
});
