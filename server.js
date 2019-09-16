const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const userRouter = require('./users/users-router.js');
const Users = require('./users/users-model.js');
const restricted = require('./auth/restricted.js');

const server = express();


server.use(helmet());
server.use(cors());
server.use(express.json());
server.use('/api/users', userRouter);

server.get('/', (req, res) => {
  // get all species from the database
  res.status(200).send({ message: "Good to go." })
});

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

module.exports = server;