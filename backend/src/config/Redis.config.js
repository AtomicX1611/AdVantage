import Redis from 'ioredis';

const redisConnection =  new Redis(process.env.REDIS_URL);

redisConnection.on('connect', () => {
    console.log('Redis connected successfully (ioredis).')
});

redisConnection.on('error', (err) => {
    console.error('Redis Client Error:', err)
});

redisConnection.on('ready', () => {
    console.log('Redis is ready to receive commands.')
});

export default redisConnection;