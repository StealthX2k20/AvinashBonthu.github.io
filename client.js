var socket = io();
const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')
const l = console.log
function getEl(id) {
    return document.getElementById(id)
}

function scrollToBottom() {
	var textarea = document.getElementById('editor');
	textarea.scrollTop = textarea.scrollHeight;
}
scrollToBottom();
function scrollToBottom1() {
	var textarea = document.getElementById('input_text');
	textarea.scrollTop = textarea.scrollHeight;
}
scrollToBottom1();
function scrollToBottom2() {
	var textarea = document.getElementById('output_text');
	textarea.scrollTop = textarea.scrollHeight;
}
scrollToBottom2();

function scrollToBottom3() {
  let messages = document.querySelector("#message-container").lastElementChild;
  messages.scrollIntoView();
  }
// function scrollToRight() {
// 	var textarea = document.getElementById('editor');
// 	textarea.scrollLeft = textarea.scrollWidth;
// }
// scrollToRight();

var params;

socket.on('connect', () => {
	console.log('connected to server');
	let searchQuery = window.location.search.substring(1);
	 params = JSON.parse('{"' + decodeURI(searchQuery).replace(/&/g, '","').replace(/\+/g,' ').replace(/=/g,'":"') + '"}');

	socket.emit('join', params, function(err){
		if(err){
			alert(err);
			window.location.href = '/join.html';
		}
		else {
			console.log('No error');
		}
	})
});

appendMessage('You joined')
//socket.emit('new-user', {name: name, roomId: params.room})

socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`)
})

socket.on('user-connected', name => {
  appendMessage(`${name} connected`)
})

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`)
})


const editor = getEl("editor")
const output = getEl("output_text")
const input = getEl("input_text")
const language = getEl("language")

document.querySelector("#execute").addEventListener('click',(evt)=>{
	document.querySelector(".loader").style.display = "inline-block"
	const code = editor.value;
	const inp = input.value;
	const lang = language.value
	console.log(code)
	socket.emit('news',{code,inp,lang})
	socket.on('output', (msg)=> {
		console.log(msg.output)
		output.value = msg.output
		const text = output.value
		socket.send({msg:text, id:2})
		document.querySelector(".loader").style.display = "none"
	})
	//compile(code)
})


messageForm.addEventListener('submit', e => {
	e.preventDefault()
	const message = messageInput.value
	appendMessage1(`You: ${message}`)
	socket.emit('send-chat-message', {message: message, roomId: params.room})
	messageInput.value = ''
  })
  
  function appendMessage(message) {
	// const messageElement1 = document.createElement('div')
	const messageElement = document.createElement('div')
	// messageElement1.appendChild(messageElement)
	// messageElement1.style.backgroundColor = "none"
	// messageElement1.style.width = 495 + 'px'
	messageElement.innerText = message
	messageContainer.append(messageElement)
	// messageElement.style.border = "2px solid #24292e"
	// messageElement.style.boderRadius = 20 + "px"
	scrollToBottom3()
  }

  function appendMessage1(message) {
  	// const messageElement1 = document.createElement('div')
	const messageElement = document.createElement('div')
	// messageElement1.append(messageElement)
	// messageElement1.style.width = 495 + 'px'
	// messageElement1.style.backgroundColor = "none"
	messageElement.innerText = message
	messageContainer.append(messageElement)
	messageElement.style.marginLeft = 240 + "px"
	messageElement.style.display = "block"
	// messageElement.style.float = "right"
	// messageElement.style.border = "2px solid #24292e" 
	// messageElement.style.boderRadius = 20 + "px"
	scrollToBottom3()
  }



language.addEventListener('change', (evt3) => {
	const text = language.value
	socket.send({msg:text, id:3})
})

editor.addEventListener('input', (evt) => {
    const text = editor.value
    	socket.send({msg:text, id:0})  
})

output.addEventListener("input", (evt1) =>{
	const text = output.value
	socket.send({msg:text, id:2})
	
})
input.addEventListener('input', (evt2) => {
	const text = input.value
	socket.send({msg:text, id:1})

})
socket.on('message', (data) => {
	if(data.id == 0)
    	editor.value = data.msg
	else if(data.id == 1)
		input.value = data.msg
	else if(data.id == 2) 
		output.value = data.msg
	else if(data.id == 3)
		language.value = data.msg
	scrollToBottom();
	scrollToBottom1();
	scrollToBottom2();
})