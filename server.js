const log = console.log;
const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const public_path = path.join(__dirname);
const{Users} = require('./users');
let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let users = new Users();
const {isRealString} = require('./isRealString');
const port = process.env.PORT || 3000;
const request = require('request');




app.use(express.static(public_path));

const Ussers = {}
var users_in = new Map()
var users_id = new Map()
var current_new_id = 0;

io.on('connection', (socket) => {
    log('connected')

    socket.on('join', (params, callback) => {
		if(!isRealString(params.name) || !isRealString(params.room)){
			return callback('name and room are required');
		}

        Ussers[socket.id] = current_new_id++;
        users_in.set(current_new_id - 1, params.room)
        users_id.set(current_new_id - 1, params.name)

		socket.join(params.room);//To join to a specific room by not going to other room
		users.removeUser(socket.id);
		users.addUser(socket.id, params.name, params.room);
		//io.to(params.room).emit('updateUsersList',users.getUserList(params.room));
        socket.to(params.room).emit('user-connected', params.name);
		callback();
	})

	   socket.on('send-chat-message', message => {
		//socket.join(message.roomId)
		   //socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] })
		   socket.to(message.roomId).emit('chat-message', { message: message.message, name: users_id.get(Ussers[socket.id]) });  
		})


		socket.on('disconnect', () => {
			socket.join(users_in.get(Ussers[socket.id]))
			//console.log("map mein hai", users_in);
			//console.log(`disconnect hua from room id ${users_in[users[socket.id]]}`)
			//socket.broadcast.emit('user-disconnected', users[socket.id])
			socket.to(users_in.get(Ussers[socket.id])).emit('user-disconnected', users_id.get(Ussers[socket.id]))
			users_in.delete(Ussers[socket.id])
			users_id.delete(Ussers[socket.id])
			delete Ussers[socket.id]
			//socket.broadcast.emit('user-connected', name)
			})

    socket.on('message', (evt) => {
        //log(evt)
        let user = users.getUser(socket.id);
        socket.broadcast.to(user.room).emit('message', evt)
    })
    function compile(code, input, language) {
	//var code = document.querySelector("#editor").value;
	
	var program = {
    script: `${code}` ,
    stdin: `${input}`,
    language: `${language}`,
    versionIndex: "0",
    clientId: "78ac5a00ef4dc94e4560bcf2f7587869",
    clientSecret:"13edd9c3d46c9ec50ae774c6fa5bcc65c24117b87be1b4e19d7edcaf4deb6225"
	};
	request({
	    url: 'https://api.jdoodle.com/v1/execute',
	    method: "POST",
	    json: program
	},
	function (error, response, body) {
		console.log(code)
	    console.log('error:', error);
	    console.log('statusCode:', response && response.statusCode);
	    console.log('body:', body);
	    if(error)
			socket.emit('output', (error))
		else
			socket.emit('output', (body))
	});
	}

    socket.on('news',(code) =>{ 
    	console.log(code.code)
    	console.log(code.inp)
    	console.log(code.lang)
	compile(code.code, code.inp, code.lang)
	})
    
    socket.on('disconnect', (evt) => {
    log('some people left')
	})
    
})


server.listen(port, () => log(`server listening on port: ${port}`))