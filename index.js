const server = require('./server.js');

const PORT = process.env.PORT || 6000;

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

// withCredentials when using axios.
// configure credentials for cors() on the server