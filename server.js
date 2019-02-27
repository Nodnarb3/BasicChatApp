const express = require("express");
const url = require("url");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const uuid = require("uuid/v4");
const cookie = require("cookie");
const port = 8080;

let userCounter = 0;



app.use(express.static('public'));

server.listen(port, () => console.log(`Listening on port ${port}`));

io.on('connection', function(socket){	
	let user;
	
	if(!!socket.handshake.headers.cookie)
	{
		let c = cookie.parse(socket.handshake.headers.cookie);
		if(!!c.token)
		{
			user = c.token.toString();
			console.log("Reconnected User - " + user);
		}
		else
		{
			user = JSON.stringify(createUser(uuid(), genNickname()));
			socket.emit('token', user);
			console.log("New User - " + user);
		}
	}
	else
	{
		user = JSON.stringify(createUser(uuid(), genNickname()));
		socket.emit('token', user);
		console.log("New User - " + user);

	}
	
	io.emit("join", user);
	
	socket.on('disconnecting', function(){
		io.emit("leave", user);
	});
	
	socket.on('disconnect', function(){
		console.log("Disconnected: " + user);
  });
});

function genNickname()
{
	userCounter++;
	return "Anon-" + userCounter; 
}

function createUser(uuid, nick)
{
	return {
		uuid,
		nick
	};
}