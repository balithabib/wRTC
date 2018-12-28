//identifiant pour l'utilisateur
var name; 
//
var user;
// connexion à notre serveur de signalisation
var connection = new WebSocket('ws://52.47.197.4');
 
// variables récuperer à l'aide des query selector 
//
var divLogin = document.querySelector('#divlogin'); 
var userName = document.querySelector('#username'); 
var loginButton = document.querySelector('#loginButton'); 
// 
var divPrimry = document.querySelector('#divprimry');
var localVideo = document.querySelector('#localVideo'); 
var remoteVideo = document.querySelector('#remoteVideo'); 
var callToUsername = document.querySelector('#callToUsername');
var callButton = document.querySelector('#callButton'); 
var hangUpButton = document.querySelector('#hangUpButton');
//  
var localPeer; 
var stream;
//  
divPrimry.style.display = "none";

//
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;    

//
connection.onopen = function () { 
   console.log("Connection avec le serveur de sinialisation est réussi"); 
};

//  
connection.onerror = function (err) { 
   console.log("error :", err); 
};

/* le code à executer quand nous avons reçu un message d'un serveur de signalisation
 en utilisant un switch pour traités plusieurs cas */
connection.onmessage = function (message) { 
   console.log("Le message : ", message.data);
   var data = JSON.parse(message.data); 
   console.log(callToUsername.value);
   switch(data.type) { 
      case "login": 
      	// quand quelqu'un veut nous appeler
        handleLogin(data.success); 
        break; 
      case "offer":
      	// quand l'offrer est crée
        handleOffer(data.offer, data.name); 
        break; 
      case "answer": 
      	// quand la repence est crée
        handleAnswer(data.answer); 
        break; 
      case "candidate": 
      	// quand un pair distant nous envoie un candidat glace
        handleCandidate(data.candidate); 
        break; 
      case "leave":
        //
        handleLeave(); 
        break; 
      default: 
        break; 
   }
};
  
// fonction pour l'envoi de messages codés sous forme JSON
function send(message) { 
   // affecter le nom de l'autre utilisateur peer à nos messages
   if (user) { 
      message.name = user; 
   } 
   // envoi du message à l'aide nde notre serveur de sinialisation
   connection.send(JSON.stringify(message)); 
};
  
// le code éxecuté quand l'utilisateur clique sur le bouton loginButton
loginButton.addEventListener("click", function (event) { 
   name = username.value;
   //si l'utilisateur tape un username
   if (name.length > 0) { 
   		// envoi un message de type login avec le nom de l'utilisateur au serveur
      	send({ 
        	type: "login", 
         	name: name 
      	}); 
   }  
});

//fonction executé lorsque l'utilisateur est logé correctement    
function handleLogin(success) { 
   if (success === false) { 
      alert("-_-  Essayez un autre nom d'utilisateur !!!"); 
   } else { 
   	  	//le div de login sera cacher 
      	divLogin.style.display = "none";
      	//le div principale sera afficher 
      	divPrimry.style.display = "block";
      	//Démarrer une connexion entre homologues
      	// obtenir le flux vidéo local
      	navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(function (myStream) { 
         	stream = myStream; 
         	// affichage du flux vidéo local sur la page
        	localVideo.srcObject =stream;         
			//variable de configuration de l'objet RTCPeerConnection, on utilisent le serveur stun de Google 
         	var configuration = { "iceServers": [{ "urls": "stun:stun2.1.google.com:19302" }]}; 
        	// création de l'homologues local à l'aide de l'objet RTCPeerConnection
         	localPeer = new RTCPeerConnection(configuration); 
         	// configuration du flux d'écoute
         	localPeer.addStream(stream); 
         	// lorsqu'un utilisateur distant ajoute un flux à la connexion entre homologues, nous l'afficherons
        	localPeer.ontrack = function (event) { 
            	remoteVideo.srcObject = event.stream; 
        	};
         	//Configuration de la gestion de la glace
         	localPeer.onicecandidate = function (event) { 
            	// si l'evenement candidate est déclanché 
            	if (event.candidate) { 
            		// envoi d'un message de type candidate
	               	send({ 
	                  	type: "candidate", 
	                  	candidate: event.candidate 
	               	}); 
            	} 
         	};  
      	}).catch (function(error) {
      		//en cas d'erreur affichage de l'erreur 
        	console.log(error); 
      	}); 
   	} 
}
  
//le code executé lorsque on click sur le bouton call  
callButton.addEventListener("click", function () {
   	var username = callToUsername.value;
   	//si en tape un username
   	if (username.length > 0) {
      	user = username;
      	// creation de l'offre 
      	localPeer.createOffer(function (offer) {
      		// envoi d'un message de type offer au serveur 
        	send({ 
            	type: "offer", 
            	offer: offer 
         	}); 
         	// modifie la description locale associée à la connexion avec en argument l'offre crée
        	localPeer.setLocalDescription(offer); 
      	}, function (error) { 
        	alert("Erreur lors de la création d'une offre"); 
      	}); 
   	} 
});

//fonction executé quand quelqu'un nous envoie une offre  
function handleOffer(offer, name) { 
   	user = name; 
   	localPeer.setRemoteDescription(new RTCSessionDescription(offer));
   	// créer une réponse à une offre
   	localPeer.createAnswer(function (answer) { 
   		// modifie la description locale associée à la connexion avec en argument la réponse crée
      	localPeer.setLocalDescription(answer); 
        // envoi d'un messsage de type answer au serveur
      	send({ 
         	type: "answer", 
        	answer: answer 
      	}); 
	}, function (error) { 
      	alert("Erreur lors de la création d'une réponse"); 
  	}); 
};
  
// fonction executé quand on reçoit une réponse d'un utilisateur distant
function handleAnswer(answer) { 	
  	// modifie la description distante associée à la connexion avec en argument la réponse reçu
  	localPeer.setRemoteDescription(new RTCSessionDescription(answer)); 
};
  
// fonction executé quand on reçoit un candidat glace d'un utilisateur distant 
function handleCandidate(candidate) { 
	// modifie la description distante associée à la connexion avec en argument un candidat glace reçu
   	localPeer.addIceCandidate(new RTCIceCandidate(candidate)); 
};
   
//le code executé lorsque on click sur le bouton hangUP  
hangUpButton.addEventListener("click", function () { 
   	//envoi d'un message de type leave au serveur
   	send({ 
      	type: "leave" 
   	});  
   	// appelle de la fonction handleLeave
	handleLeave(); 
});
  
// fonction executé lorsque l'utilisateur raccrouche l'appele actuelle  
function handleLeave() { 
   user = null; 
   remoteVideo.src = null; 
   
   localPeer.close(); 
   localPeer.onicecandidate = null; 
   localPeer.ontrack = null; 
};

/*
boutons 
               <input id = "callButton" type="image" src="c2.png" alt="Call" height="50px" width="50px" class="Button"/>
               <input id = "hangUpButton" type="image" src="c1.png" alt="Hang Up" height="50px" width="50px" class="Button"/>
*/