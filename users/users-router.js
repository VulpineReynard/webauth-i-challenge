const express = require('express');
const restricted = require('../auth/restricted.js');
const Users = require('./users-model.js');

const router = express.Router();

router.route('/')
.get(restricted, (req, res) => {
  Users.find()
    .then(users => {
      console.log(users)
      res.status(200).json(users);
    })
    .catch(err => res.send(err));
})


module.exports = router;