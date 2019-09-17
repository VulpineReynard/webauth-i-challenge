const express = require('express');
const server = express()
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const userRouter = require('./users/users-router.js');
const Users = require('./users/users-model.js');
// const session = require('express-session');
const sessions = require('client-sessions');
const KnexSessionStore= require('connect-session-knex')(sessions); // gotcha
const dbConnection = require('./data/db-config.js');

const sessionsConfig = {
  cookieName: 'testCookie', // cookie name dictates the key name added to the request object
  secret: 'blargadeeblargblarg', // should be a large unguessable string
  duration: 1000 * 60 * 60, // how long the session will stay valid in ms
  activeDuration: 1000 * 60 * 60, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
  store: new KnexSessionStore({ // always call a NEW KnexSessionStore
        knex: dbConnection,
        tablename: 'knexsessions',
        sidfieldname: 'sessionId',
        createtable: true,
        clearInterval: 1000 * 60 * 30 // clean out expired session data
      }),
  cookie: {
    path: '/', // cookie will only be sent to requests under '/'
    maxAge: 60000, // duration of the cookie in milliseconds, defaults to duration above
    ephemeral: false, // when true, cookie expires when the browser closes
    httpOnly: true, // when true, cookie is not accessible from javascript
    secure: false // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process
  }
}

// const sessionConfig = {
//   name: 'chocochip', // would name the cooke sid by default
//   secret: process.env.SESSION_SECRET || 'keep it secret, keep it safe',
//   cookie: {
//     maxAge: 1000 * 60 * 60, // in milliseconds
//     secure: false, // true means only send cookie over https
//     httpOnly: true, // true means JS has no access to the cookie
//   },
//   resave: false,
//   saveUninitialized: true, // GDPR compliance
//   store: new KnexSessionStore({// always call a NEW KnexSessionStore
//     knex: dbConnection,
//     tablename: 'knexsessions',
//     sidfieldname: 'sessionId',
//     createtable: true,
//     clearInterval: 1000 * 60 * 30 // clean out expired session data
//   }),
// };

// GLOBAL MIDDLEWARE
server.use(helmet());
server.use(cors());
server.use(express.json());
server.use(sessions(sessionsConfig));

// ROUTERS
server.use('/api/users', userRouter);

// SANITY CHECK
server.get('/', (req, res) => {
  res.status(200).send({ message: "Good to go." })
});

// REGISTER ENDPOINT
server.post('/api/register', (req, res) => {
  let { username, password } = req.body;

  const hash = bcrypt.hashSync(password, 8);

  Users.add({ username, password: hash })
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
})

// LOGIN ENDPOINT
server.post('/api/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Incorrect credentials' });
      } else {
        req.session.user = user;
        res.status(201).json({ message: `Welcome ${username}.` })
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.get('/api/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(error => {
      if (error) {
        res.status(500).json({ message: "You can check out anytime you like, but you can never leave." })
      } else {
        res.status(200).json({ message: 'Goodbye.' })
      }
    });
  } else {
    res.status(200).json({ message: 'Already logged out.' })
  }
})

module.exports = server;