const keys = require("./keys");
const redis = require("redis");

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});
const subscription = redisClient.duplicate();

function fib(n) {
  if (n < 2) return 1;
  return fib(n - 1) + fib(n - 2);
}

subscription.on("message", (channel, message) => {
  redisClient.hset("values", message, fib(parseInt(message)));
});
subscription.subscribe("insert");
