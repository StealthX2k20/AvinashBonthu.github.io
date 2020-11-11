var socket = io('http://localhost:3000');
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
function scrollToRight() {
	var textarea = document.getElementById('editor');
	textarea.scrollLeft = textarea.scrollWidth;
}
scrollToRight();

// function setSelectionRange(input, selectionStart, selectionEnd) {
//   if (input.setSelectionRange) {
//     input.focus();
//     input.setSelectionRange(selectionStart, selectionEnd);
//   }
//   else if (input.createTextRange) {
//     var range = input.createTextRange();
//     range.collapse(true);
//     range.moveEnd('character', selectionEnd);
//     range.moveStart('character', selectionStart);
//     range.select();
//   }
// }

// function getCaret(el) {
// 	if(!el)
// 		console.log("no text area of this name")
//     if (el.selectionStart) {
//         return el.selectionStart;
//     } else if (document.selection) {
//         el.focus();

//         var r = document.selection.createRange();
//         if (r == null) {
//             return 0;
//         }

//         var re = el.createTextRange(),
//             rc = re.duplicate();
//         re.moveToBookmark(r.getBookmark());
//         rc.setEndPoint('EndToStart', re);

//         return rc.text.length;
//     }
//     return 0;
// }

// function setCaretToPos (input, pos) {
//    setSelectionRange(input, pos, pos);
// }

// function InsertText(txtArea, text, currentPos) {
//     var textarea = txtArea;
//     //var currentPos = getCaret(textarea);
//     console.log(currentPos);
//     var strLeft = textarea.value.substring(0, currentPos);
//     var strMiddle = text;
//     var strRight = textarea.value.substring(currentPos, textarea.value.length);
//     textarea.value = strLeft + strMiddle + strRight;
// }

// // function insertAtCursor (input, textToInsert) {
// //   const isSuccess = document.execCommand("insertText", false, textToInsert);

// //   // Firefox (non-standard method)
// //   if (!isSuccess && typeof input.setRangeText === "function") {
// //     const start = input.selectionStart;
// //     input.setRangeText(textToInsert);
// //     // update cursor to be at the end of insertion
// //     input.selectionStart = input.selectionEnd = start + textToInsert.length;

// //     // Notify any possible listeners of the change
// //     const e = document.createEvent("UIEvent");
// //     e.initEvent("input", true, false);
// //     input.dispatchEvent(e);
// //   }
// // }

// function DeleteTextBackward(txtArea, currentPos) {
// 	var textarea = txtArea;
    
//     console.log(currentPos);
//     var strLeft = textarea.value.substring(0, currentPos-1);
//     var strRight = textarea.value.substring(currentPos, textarea.value.length);
//     textarea.value = strLeft + strRight;
// }
// function DeleteTextForward(txtArea, currentPos) {
// 	var textarea = txtArea;
//     //var currentPos = getCaret(textarea);
//     console.log(currentPos);
//     var strLeft = textarea.value.substring(0, currentPos);
//     var strRight = textarea.value.substring(currentPos+1, textarea.value.length);
//     textarea.value = strLeft + strRight;
// }


// function beforeText(txtArea) {
// 	var textarea = txtArea;
// 	var currentPos = getCaret(textarea);
// 	var strLeft = textarea.value.substring(currentPos-1, currentPos);
// 	return strLeft;
// }

socket.on('connect', () => {
	console.log('connected to server');
	let searchQuery = window.location.search.substring(1);
	let params = JSON.parse('{"' + decodeURI(searchQuery).replace(/&/g, '","').replace(/\+/g,' ').replace(/=/g,'":"') + '"}');

	socket.emit('join', params, function(err){
		if(err){
			alert(err);
			window.location.href = '/';
		}
		else {
			console.log('No error');
		}
	})
});

const editor = getEl("editor")
const output = getEl("output_text")
const input = getEl("input_text")

editor.addEventListener('input', (evt) => {
    const text = editor.value
    	socket.send({msg:text, id:0, bck:0})  
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
	//const currentPos = getCaret(editor);
	if(data.id == 0)
		//setCaretToPos (editor, currentPos)
    	editor.value = data.msg
	// 	//console.log(data.bck)
	// 	if(data.bck == 10){
	// 		console.log("yes")
	// 		DeleteTextBackward(editor, currentPos)
	// 	}
	// 	if(data.bck == 11){
	// 		console.log("yes")
	// 		DeleteTextForward(editor, currentPos)
	// 	}
	// 	else if(data.bck == 0)
	// 		InsertText(editor, data.msg, currentPos)
	// }
		
	else if(data.id == 1)
		input.value = data.msg
	else if(data.id == 2) 
		output.value = data.msg
	scrollToBottom();
	scrollToBottom1();
	scrollToBottom2();
	scrollToRight();
})
