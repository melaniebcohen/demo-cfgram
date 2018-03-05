'use strict';

const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const User = require('../model/user.js');
const serverToggle = require('../lib/server-toggle.js')
const server = require('../server.js');

require('jest');

const url = `http://localhost:3000`;

const exampleUser = {
  username: 'embeecee',
  password: 'yoyoyo',
  email: 'embeecee@gmail.com'
}

describe('Auth Routes', function() {
  beforeAll( done => {
    serverToggle.serverOn(server, done);
  })
  afterAll( done => {
    serverToggle.serverOff(server, done);
  })

  describe('POST: /api/signup', function() {
    describe('with a valid body', function() {
      // after you've made a post request, remove the example user from our database
      afterEach( done => { 
        User.remove({})
          .then( () => done() )
          .catch(done);
      })
      it('should return a token', done => {
        // our route should generate a token for us using JWT
        // token can now be used to be authorized into other subsequent routes
        request.post(`${url}/api/signup`)
          .send(exampleUser)
          .end((err, res) => {
            if (err) return done(err);

            // Test that our token is a text string & that it's a token
            console.log('signup token', res.text)
            expect(res.status).toEqual(200);
            expect(typeof res.text).toEqual('string');
            done();
          })
      })
    })
  })

  describe('GET: /api/signin', function() {
    describe('with a valid body', function() {
      // create user
      beforeEach( done => {
        let user = new User(exampleUser)
        user.generatePasswordHash(exampleUser.password)
          .then( user => user.save())
          .then( user => {
            this.tempUser = user;
            done()
          })
          .catch(done);
      })
      afterEach( done => {
        User.remove({})
          .then( () => done())
          .catch(done)
      })
      it('should return a token', done => {
        /* in order to be able to sign in you must have:
          headers: {
            Authorization: 'username: pw'
          }
        */
        request.get(`${url}/api/signin`)
          .auth('embeecee','yoyoyo')
          .end(( err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(200);
            expect(typeof res.text).toEqual('string');
            console.log('signin token', res.text)
            done();
          })
      })
    })
  })
})