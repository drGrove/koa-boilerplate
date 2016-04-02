'use strict';

var repl = require('repl');
var net = require('net');

module.exports = net.createServer( (socket) => {
  var r = repl.start({
    prompt: `[${process.pid}] ${socket.remoteAddress}:${socket.remotePort}> `,
    input: socket,
    output: socket,
    terminal: true,
    userGlobal: false
  });

  r.on('exit', () => {
    socket.end()
  });

  r.context.socket =  socket;
}).listen(1337);
