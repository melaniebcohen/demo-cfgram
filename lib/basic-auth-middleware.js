'use strict';

// route level construct to check that you are who you say you are OR you have a token

const createError = require('http-errors');
const debug = require('debug')('cfgram:basic-auth-middleware.js');

// the whole point is to capture incoming request before we pass it along to our server
module.exports = function(req, res, next) {
  debug('basic auth')

  // on our incoming request, there is req.headers, which contains authorization
  var authHeader = req.headers.authorization;
  if (!authHeader) next(createError(401, 'authorization header required'))

  var base64str = authHeader.split('Basic ')[1];
  if (!base64str) next(createError(401, 'username and password required'));

  var utf8str = Buffer.from(base64str, 'base64').toString();
  var authArr = utf8str.split(':');

  req.auth = { username: authArr[0], password: authArr[1] }
  if (!req.auth.username) next(createError(401, 'username required'));
  if (!req.auth.password) next(createError(401, 'password required'));

  next();
}

/* WHITEBOARD
res.writeHead(200, {
  'Content-Type':'text/plain',
  Authorization: Basic username:password
})
*/