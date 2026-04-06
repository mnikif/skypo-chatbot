import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis: Redis;
function getRedis() {
  if (!redis) redis = Redis.fromEnv();
  return redis;
}

let _chatLimit: Ratelimit;
export function getChatRateLimit() {
  if (!_chatLimit) {
    _chatLimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(30, "10 m"),
      prefix: "rl:chat",
    });
  }
  return _chatLimit;
}
