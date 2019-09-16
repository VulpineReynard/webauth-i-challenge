const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const server = express();


server.use(helmet());
server.use(cors());
server.use(express.json());

server.get('/', (req, res) => {
  // get all species from the database
  res.status(200).send({ message: "Good to go." })
});

module.exports = server;