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
	 console.log(params)
	 joinRoom(params.room)
	socket.emit('join',params, function(err){
		if(err){
			alert(err);
			window.location.href = '/join.html';
		}
		else {
			console.log('No error');
			}
	})
});
// console.log(roomId)
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

///////////video chat///////////////

// const roomSelectionContainer = document.getElementById('room-selection-container')
// const roomInput = document.getElementById('room-input')
// const connectButton = document.getElementById('connect-button')

const videoChatContainer = document.getElementById('video-chat-container')
const localVideoComponent = document.getElementById('local-video')
const remoteVideoComponent = document.getElementById('remote-video')

// Variables.
// const socket = io()
const mediaConstraints = {
  audio: {'echoCancellation': true},
  video: true,
}
let localStream
let remoteStream
let isRoomCreator
let rtcPeerConnection // Connection between the local device and the remote peer.
let roomId

// Free public STUN servers provided by Google.
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
}

// BUTTON LISTENER ============================================================
// connectButton.addEventListener('click', () => {
//   joinRoom(roomInput.value)
// })

document.querySelector("#image").addEventListener('click', () => {
  if(localVideoComponent.muted == false){
    document.querySelector('#image').style.backgroundColor = "#24292e"
    document.querySelector('#img').style.backgroundColor = "#24292e"
    localVideoComponent.muted = true
  }
  else{
    document.querySelector('#image').style.backgroundColor = "white"
    document.querySelector('#img').style.backgroundColor = "white"
    localVideoComponent.muted = false
  }
  
})


// SOCKET EVENT CALLBACKS =====================================================
socket.on('room_created', async () => {
  console.log('Socket event callback: room_created')
  showVideoConference()
  await setLocalStream(mediaConstraints)
  isRoomCreator = true
})

socket.on('room_joined', async () => {
  console.log('Socket event callback: room_joined')
  showVideoConference()
  await setLocalStream(mediaConstraints)
  socket.emit('start_call', roomId)
})

socket.on('full_room', () => {
  console.log('Socket event callback: full_room')

  alert('Enter valid room ID')
})

// FUNCTIONS ==================================================================
function joinRoom(room) {
  if (room === '') {
    alert('Please type a room ID')
  } else {
    roomId = room
    // socket.emit('join', room)
    showVideoConference()
  }
}

function showVideoConference() {
  // roomSelectionContainer.style = 'display: none'
  videoChatContainer.style = 'display: block'
}

async function setLocalStream(mediaConstraints) {
  let stream
  try {
    stream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
  } catch (error) {
    console.error('Could not get user media', error)
  }

  localStream = stream
  localVideoComponent.srcObject = stream
}

socket.on('start_call', async () => {
  console.log('Socket event callback: start_call')

  if (isRoomCreator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers)
    addLocalTracks(rtcPeerConnection)
    rtcPeerConnection.ontrack = setRemoteStream
    rtcPeerConnection.onicecandidate = sendIceCandidate
    await createOffer(rtcPeerConnection)
  }
})

socket.on('webrtc_offer', async (event) => {
  console.log('Socket event callback: webrtc_offer')

  if (!isRoomCreator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers)
    addLocalTracks(rtcPeerConnection)
    rtcPeerConnection.ontrack = setRemoteStream
    rtcPeerConnection.onicecandidate = sendIceCandidate
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
    await createAnswer(rtcPeerConnection)
  }
})

socket.on('webrtc_answer', (event) => {
  console.log('Socket event callback: webrtc_answer')

  rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
})

socket.on('webrtc_ice_candidate', (event) => {
  console.log('Socket event callback: webrtc_ice_candidate')

  // ICE candidate configuration.
  var candidate = new RTCIceCandidate({
    sdpMLineIndex: event.label,
    candidate: event.candidate,
  })
  rtcPeerConnection.addIceCandidate(candidate)
})

socket.on('dis', () => {
  remoteVideoComponent.style.backgroundColor= "black"
})
// FUNCTIONS ==================================================================
function addLocalTracks(rtcPeerConnection) {
  localStream.getTracks().forEach((track) => {
    rtcPeerConnection.addTrack(track, localStream)
  })
}

async function createOffer(rtcPeerConnection) {
  let sessionDescription
  try {
    sessionDescription = await rtcPeerConnection.createOffer()
    rtcPeerConnection.setLocalDescription(sessionDescription)
  } catch (error) {
    console.error(error)
  }

  socket.emit('webrtc_offer', {
    type: 'webrtc_offer',
    sdp: sessionDescription,
    roomId,
  })
}

async function createAnswer(rtcPeerConnection) {
  let sessionDescription
  try {
    sessionDescription = await rtcPeerConnection.createAnswer()
    rtcPeerConnection.setLocalDescription(sessionDescription)
  } catch (error) {
    console.error(error)
  }

  socket.emit('webrtc_answer', {
    type: 'webrtc_answer',
    sdp: sessionDescription,
    roomId,
  })
}

function setRemoteStream(event) {
  remoteVideoComponent.srcObject = event.streams[0]
  remoteStream = event.stream
}

function sendIceCandidate(event) {
  if (event.candidate) {
    socket.emit('webrtc_ice_candidate', {
      roomId,
      label: event.candidate.sdpMLineIndex,
      candidate: event.candidate.candidate,
    })
  }
}