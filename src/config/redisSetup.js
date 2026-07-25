import { createClient } from "redis";

 const redis = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
        port: process.env.REDIS_PORT || 6379
    }
});

redis.on("connect", () => {
    console.log("Redis Connected");
});

redis.on("error", err => {
    console.error(err);
});

await redis.connect();

export default redis;