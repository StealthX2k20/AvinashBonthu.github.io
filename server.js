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