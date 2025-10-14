const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL Client Setup
const { Pool } = require('pg')
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
  ssl:
    process.env.NODE_ENV !== 'production'
      ? false
      : { rejectUnauthorized: false },
});
pgClient.on("connect", (client) => {
  client
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch((err) => console.error(err));
});

// Redis Client Setup
const redis = require('redis')
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});
redisClient.on("error", (err) => console.error(err));
const redisPublisher = redisClient.duplicate();

// Express route handlers
app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/values/all', async (req, res) => {
  try {
    const values = await pgClient.query("SELECT * FROM values");
    res.send(values.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving values');
  }
});

app.get('/values/current', async (req, res) => {
  try {
    redisClient.hgetall('values', (err, values) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error retrieving values');
      }
      res.send(values);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving values');
  }
});

app.post('/values', async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high');
  }     

  try {
    await redisClient.hset('values', index, 'pending');
    await redisPublisher.publish('insert', index);
    await pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
    res.send({ working: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error inserting value');
  }
});

app.listen(5000, err => {
  if (err) {
    console.error('Error starting server:', err);
  } else {
    console.log('Listening on port 5000');
  }
});