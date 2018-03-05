'use strict';

// user router...

const jsonParser = require('body-parser').json();
const debug = require('debug')('cfgram:auth-router.js');
const router = require('express').Router;
const basicAuth = require('../lib/basic-auth-middleware.js')
const User = require('../model/user.js');

const authRouter = module.exports = Router();

// attach post and get methods to our router
authRouter.post('/api/signup', jsonParser, function(req, res, next) {
  debug('POST: /api/signup');

  // TO DO: route logic goes here
})

authRouter.get('/api/signin', basicAuth, function(req, res, next) {
  debug('GET: /api/signin');

  // TO DO: route logic goes here
})