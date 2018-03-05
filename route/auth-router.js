'use strict';

// user router...
const jsonParser = require('body-parser').json();
const debug = require('debug')('cfgram:auth-router.js');
const Router = require('express').Router;
const basicAuth = require('../lib/basic-auth-middleware.js')
const User = require('../model/user.js');

const authRouter = module.exports = Router();

// attach post and get methods to our router
authRouter.post('/api/signup', jsonParser, function(req, res, next) {
  debug('POST: /api/signup');

  // We need to have a password as part of the request body
  let password = req.body.password;
  delete req.body.password;

  let user = new User(req.body);
  user.generatePasswordHash(password)
    .then(user => user.save())
    .then(user => user.generateToken())
    .then(token => res.send(token)) // token is to authorize us for future routes
    .catch(next);
})

authRouter.get('/api/signin', basicAuth, function(req, res, next) {
  debug('GET: /api/signin');

  User.findOne({ username: req.auth.username })
    .then( user => user.comparePasswordHash(req.auth.password))
    .then( user => user.generateToken())
    .then( token => res.send(token))
    .catch(next)
})