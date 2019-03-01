const express = require("express");
const url = require("url");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const uuid = require("uuid/v4");
const cookie = require("cookie");
const port = 8080;

const serverUser = JSON.stringify(createUser("server", "!", "#ffffff"));
const serverWarning = JSON.stringify(createUser("server", "!", "#ff0000"));

let userCounter = 0;

let users = [];
let messages = [];

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
			user = JSON.stringify(createUser(uuid(), genNickname(), genColor()));
			socket.emit('token', user);
			console.log("New User - " + user);
		}
	}
	else
	{
		user = JSON.stringify(createUser(uuid(), genNickname(), genColor()));
		socket.emit('token', user);
		console.log("New User - " + user);
	}
	
	users.push(user);
	
	socket.emit("message-history", JSON.stringify(messages));
	io.emit("join", user);
	socket.emit("user-list", JSON.stringify(users));
	io.emit("message", JSON.stringify(createMessage(serverUser, JSON.parse(user).nick + " has joined the server!")));
	
	
	socket.on('disconnecting', function(){
		io.emit("leave", user);
		io.emit("message", JSON.stringify(createMessage(serverUser, JSON.parse(user).nick + " has left the server!")));
	});
	
	socket.on('disconnect', function(){
		users.splice(users.indexOf(user), 1);
		console.log("Disconnected: " + user);
		console.log(users);
  	});
	
	socket.on('message', function(msg){
		
		if(msg.startsWith("/nick "))
		{
			console.log("Updating username for user: " + user);
			user = updateNickname(socket, msg, user);
			console.log(user);
		}
		else
		{
			let m = createMessage(user, msg);
			messages.push(m)
			io.emit('message', JSON.stringify(m));	
		}
		
	});
});

function updateNickname(socket, msg, user)
{
	let commandTokens = msg.split(" ");
			
	if(commandTokens.length !== 2 || commandTokens[1].length <= 0)
	{
		socket.emit("message", JSON.stringify(createMessage(serverWarning, 'Invalid number of arguments.')));
		socket.emit("message", JSON.stringify(createMessage(serverWarning, 'The format expected is:')));
		socket.emit("message", JSON.stringify(createMessage(serverWarning, '/nick &lt;new_nickname&gt;')));
		
		return user;
	}
	
	let u = JSON.parse(user);
	let newNick = commandTokens[1];
	
	u.nick = newNick;
	
	let newUser = JSON.stringify(u);
	
	users[users.indexOf(user)] = newUser;
		
	socket.emit("update-nick", newUser);
	
	return newUser;
}

function genNickname()
{
	userCounter++;
	return "Anon-" + userCounter; 
}

function createUser(uuid, nick, color)
{
	return {
		uuid,
		nick,
		color
	};
}
	
function createMessage(user, message)
{
	return {
		user,
		msg: message,
		timestamp: new Date().getTime()
	};
}

function genColor()
{
  	let characters = "0123456789ABCDEF";
	let color = "#";
	
	for(let i = 0; i < 6; i++)
	{
		color += characters[Math.floor(Math.random() * characters.length)]; 
	}
	
	return color;

}