'use strict';

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const createError = require('http-errors');
const Promise = require('bluebird');
const debug = require('debug')('cfgram:user');

const Schema = mongoose.Schema;

// BASIC USER SCHEMA
const userSchema = Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  findHash: { type: String, unique: true }
});

// methods object - something built into mongoose - to bind methods to this schema
userSchema.methods.generatePasswordHash = function(password) {
  debug('generatePasswordHash');
  
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return reject(err);
      this.password = hash;
      resolve(this);
    })
  })
}

userSchema.methods.comparePasswordHash = function(password) {
  debug('comparePasswordHash');

  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, valid) => {
      if (err) return reject(err);
      if (!valid) return reject(createError(401, 'invalid password'));
      resolve(this);
    })
  })
}

// GENERATE FIND HASH: Generate a token for us, three chances to generate token
userSchema.methods.generateFindHash = function() {
  debug('generateFindHash');

  return new Promise((resolve, reject) => {
    // recursive function because if there are any errors, we'll try up to 3 times
    let tries = 0;

    _generateFindHash.call(this);

    function _generateFindHash() {
      this.findHash = crypto.randomBytes(32).toString('hex'); // creating our own custom token
      this.save()
        .then( () => resolve(this.findHash))
        .catch( err => {
          if (tries > 3) return reject(err);
          tries++;
          _generateFindHash.call(this); // .call calls a function with a specified context
        })
    }
  })
}

// GENERATE TOKEN: Generate a find hash (randomly generated token using crypto), then take that token and sign this web token with token and secret key (two factor authentication)
userSchema.methods.generateToken = function() {
  debug('generateToken');

  return new Promise((resolve, reject) => {
    this.generateFindHash()
    // if this works, we should have a user with a username, password, hashed password, and token
      .then( findHash => resolve(jwt.sign({ token: findHash }, process.env.APP_SECRET )))
      .catch( err => reject(err));
  })
}

module.exports = mongoose.model('user', userSchema)

/* WHITEBOARD
username: catperson
password: pw123
email: yo@sup.net

object now has {
  username: catperson,
  email: yo@sup.net,
  password: ab28dk192fj2kdflajsdfj38asfk3kd81
}

bcrypt will check our password that we have hashed
*/