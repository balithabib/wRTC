//our username 
var name; 
var connectedUser;
//connecting to our signaling server
var conn = new WebSocket('ws://localhost:9090');
 
var divLogin = document.querySelector('#divlogin'); 
var userName = document.querySelector('#username'); 
var loginBtn = document.querySelector('#loginbtn'); 

var divPrimry = document.querySelector('#divprimry'); 
var callToUsernameInput = document.querySelector('#callToUsernameInput');
var callBtn = document.querySelector('#callBtn'); 

var hangUpBtn = document.querySelector('#hangUpBtn');
  
var localVideo = document.querySelector('#localVideo'); 
var remoteVideo = document.querySelector('#remoteVideo'); 

var yourConn; 
var stream;
  
divPrimry.style.display = "none";


navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;    


conn.onopen = function () { 
   console.log("Connection avec le serveur de sinialisation"); 
};
  
//when we got a message from a signaling server 
conn.onmessage = function (msg) { 
   console.log("Le message : ", msg.data);
   var data = JSON.parse(msg.data); 
   console.log(callToUsernameInput.value);
   switch(data.type) { 
      case "login": 
         handleLogin(data.success); 
         break; 
      //when somebody wants to call us 
      case "offer": 
         handleOffer(data.offer, data.name); 
         break; 
      case "answer": 
         handleAnswer(data.answer); 
         break; 
      //when a remote peer sends an ice candidate to us 
      case "candidate": 
         handleCandidate(data.candidate); 
         break; 
      case "leave": 
         handleLeave(); 
         break; 
      default: 
         break; 
   }
};
  
conn.onerror = function (err) { 
   console.log("error :", err); 
};
  
//alias for sending JSON encoded messages 
function send(message) { 
   //attach the other peer username to our messages 
   if (connectedUser) { 
      message.name = connectedUser; 
   } 
   
   conn.send(JSON.stringify(message)); 
};
  
