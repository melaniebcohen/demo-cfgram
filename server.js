'use strict';

const express = require('express');
const debug = require('debug')('cfgram:server');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(morgan('dev'));

const server = app.listen(PORT, () => {
  debug(`listening on port ${PORT}`)
})

server.isRunning = true;