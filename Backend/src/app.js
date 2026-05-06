const cors = require('cors');
const express = require('express');

const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
