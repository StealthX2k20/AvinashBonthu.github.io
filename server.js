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
const port = process.env.PORT || 9352;



app.use(express.static(public_path));

io.on('connection', (socket) => {
    log('connected')

    socket.on('join', (params, callback) => {
		if(!isRealString(params.name) || !isRealString(params.room)){
			return callback('name and room are required');
		}

		socket.join(params.room);//To join to a specific room by not going to other room
		users.removeUser(socket.id);
		users.addUser(socket.id, params.name, params.room);
		//io.to(params.room).emit('updateUsersList',users.getUserList(params.room));

		callback();
	})


    socket.on('message', (evt) => {
        //log(evt)
        let user = users.getUser(socket.id);
        socket.broadcast.to(user.room).emit('message', evt)
    })
    
    socket.on('disconnect', (evt) => {
    log('some people left')
	})
    
})


server.listen(port, () => log(`server listening on port: ${port}`))