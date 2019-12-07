var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
})

var users = {};
var usernames = [];

io.on('connection', function(socket){
	//ketika ada user
	socket.broadcast.emit('newMessage', 'someone connected');

	//ketika ada user yang daftar
	socket.on('registerUser', function(username){
		if(usernames.indexOf(username) != -1){
			socket.emit('registerRespond', false);
		}else{
			users[socket.id] = username;
			usernames.push(username);
			socket.emit('registerRespond', true);
			io.emit('addOnlineUsers', usernames);
		}
	})

	//kalo ada message baru
	socket.on('newMessage', function(msg){
		io.emit('newMessage', msg);
		console.log('Chat baru: ' + msg);
	})

	socket.on('newTyping', function(msg){
		io.emit('newTyping', msg);
	})

	//kalo user disconnect
	socket.on('disconnect', function(msg){
		socket.broadcast.emit('newMessage', 'someone left the chat');

		var index = usernames.indexOf(users[socket.id]);
		usernames.splice(index, 1);

		delete users[socket.id];

		io.emit('addOnlineUsers', usernames);
	})
})

http.listen(3000, function(){
	console.log('listening on 3000..');
})