import { redis } from "../src/config/cache.config.js";

afterAll(async () => {
    if (redis && redis.status !== 'end') {
        redis.quit();
    }
});
