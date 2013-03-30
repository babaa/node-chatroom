var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/public'));

server.listen(process.env.PORT, process.env.IP);

var messages = [];
var topic = 'Chat topic';

io.sockets.on('connection', function (socket) {
  console.log('Client connected!');
  
  socket.emit('messageHistory', messages);
  socket.emit('setTopic', {topic: topic});
  
  socket.on('nickname', function(name, callback) {
    socket.set('nickname', name, function() {
        io.sockets.emit('updateUserList');
    });
  });
  
  socket.on('message', function (data) {
    socket.get('nickname', function (err, name) {
      messages.push({ message: data.message, user: name || socket.id});
      if(messages.length > 100) messages.shift();
      io.sockets.emit('message', { message: data.message, user: name || socket.id});
    });
  });
  
  socket.on('getConnectedUsers', function(callback) {
    getUserList(io.sockets.clients(), callback);
  });
  
  socket.on('disconnect', function() {
      console.log('Client disconnected!')
      socket.get('nickname', function(err, name) {
          io.sockets.emit('disconnect', name || socket.id);
      });
  });
  
  socket.on('setTopic', function(data) {
    topic = data;
    socket.get('nickname', function (err, name) {
      io.sockets.emit('setTopic', { topic: data, user: name || socket.id});
    });
  });
});


function getUserList(sockets, callback) {
  var users = [];
  for(var i in sockets) {
      var soc = sockets[i];
      soc.get('nickname', function(err, name) {
          users.push(name || soc.id);
      });
  }
  return callback(users);
}
