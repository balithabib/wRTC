
// variable dans tous les utilisateurs connectés aux serveur sont sauvegardés
var users = {};
// importation des bibliothèques 
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const ws = require('websocket').server;








function print(args){
   console.log(args);
}



const mimeType = {
   '.html': 'text/html',
   '.js': 'text/javascript',
   '.json': 'application/json',
   '.css': 'text/css',
   '.png': 'image/png',
   '.jpg': 'image/jpeg',
};
 
var server = http.createServer(function (req, res) {
   //Source de serveur inspiré dans plusieurs script sur internet
   const urlreq = url.parse(req.url);
   
   const precdir = /^(\.\.[\/\\])+/
   const chemin = path.normalize(urlreq.pathname).replace(precdir, '');
   let nomchemin = path.join('../', chemin);
  
   fs.exists(nomchemin, function (exist) {
     if(!exist) {
       res.statusCode = 404;
       res.end(`File ${nomchemin} not found!`);
       return;
     }

      if (fs.statSync(nomchemin).isDirectory()) {
            nomchemin += '/index.html';
      }

      fs.readFile(nomchemin, function(err, data){
         if(err){
               res.statusCode = 500;
               res.end(`Error getting the file: ${err}.`);
         } else {
         //récuperer avec les bonnes extentions
         const ext = path.parse(nomchemin).ext;
         // fichier introuvable
         res.setHeader('Content-type', mimeType[ext] || 'text/plain');
         res.end(data);
       }
     });
   });

 }).listen(8080);
 

var websocket = new ws({httpServer: server});

/**
* Un gestionnaire d'évènement "connection", lorsqu'un utilisateur se connecte à votre serveur.  
*
* @author: Habib & Anis
* @param {request} request contient la requete du clien
*/ 
 websocket.on('request',(request)=>{
    print("connected");
    var connection = request.accept(null, request.origin);
    
    request.setMaxListeners(100);
    var socket = connection;
    /**
    * Un gestionnaire d'évènement "message", quand le serveur reçoit un message d'un utilisateur connecté.   
    * 
    * @author: Habib & Anis
    * @param {object} message le message reçu
    */ 
    connection.on('message', function(message) { 
      var data; 
      //on  n'acceptant que les messages JSON
      
      try { 
         data = JSON.parse(message['utf8Data']); 
      } catch (e) { 
         console.log("Invalid JSON"); 
         data = {}; 
      }
      
      // switch selon le type du message utilisateur
      switch (data["type"]) { 
         // lorsqu'un utilisateur tente de se connecter
         case "login":

            console.log("User logged ", data['name']); 
            // si quelqu'un est connecté avec ce nom d'utilisateur, alors refuse
            if(users[data['name']]) { 
               sendTo(socket, { 
                  type: "login", 
                  success: false 
               }); 
            } else { 
               // enregistrer la connexion (socket) de l'utilisateur sur le serveur 
               users[data['name']] = socket; 
               socket['name'] = data['name']; 
               // envoi d'un message de type login avec une valeur de success vrai à l'utilisateur
               sendTo(socket, { 
                  "type": "login", 
                  "success": true 
               }); 
            } 
            break;
         // lorsqu'un utilisateur tente d'appele un autre utilisateur  
         case "offer": 
            console.log("Envoi offre à: ", data['name']);      
            var localSocket = users[data['name']]; 
            // si l'utilisateur data['name'] existe
            if(localSocket != null) { 
               // paramétrer cet utilisateur à connecté avec l'autre utilisateur
               socket.otherName = data['name']; 
               // envoye des détails de l'offre à cette utilisateur
               sendTo(localSocket, { 
                  type: "offer", 
                  offer: data.offer, 
                  name: socket.name 
               }); 
            }
            break;
         // lorsqu'un utilisateur tente de répondre à une offre  
         case "answer": 
            console.log("Envoi de la réponse à: ", data['name']); 
            // si l'utilisateur data['name'] existe
            var localSocket = users[data['name']]; 
            
            if(localSocket != null) {
               // paramétrer cet utilisateur à connecté avec l'autre utilisateur 
               socket.otherName = data['name']; 
               // envoye des détails de la réponse à cette utilisateur
               sendTo(localSocket, { 
                  type: "answer", 
                  answer: data.answer 
               }); 
            } 
            break; 
         // lorsqu'un utilisateur tente de envoiyé des candidats  
         case "candidate": 
            console.log("Envoi du candidat à: ",data['name']); 
            var localSocket = users[data['name']];
            
            if(localSocket != null) { 
               sendTo(localSocket, { 
                  type: "candidate", 
                  candidate: data.candidate 
               }); 
            } 
            break;
         // lorsqu'un utilisateur tente de se déconnecter avec l'autre utilisateur   
         case "leave": 
            console.log("Déconnection de ", data['name']); 
            var localSocket = users[data['name']]; 
            //localSocket.otherName = null; 

            // informe l'autre utilisateur afin qu'il puisse déconnecter sa connexion homologue
            if(localSocket != null) {
               sendTo(localSocket, { 
                  "type": "leave" 
              }); 
            }
            break;
            
         default: 
            sendTo(socket, { 
               type: "error", 
               message: "Command not found: " + data.type 
            });             
            break; 
      }
      
   }); 
   
   /**
   * Un gestionnaire d'évènement "close", détecte la fermeture de la connexion à l'initiative du serveur. 
   * @author: Habib & Anis
   */ 
   connection.on("close", function() { 
   
      if(socket.name) { 
         delete users[socket.name]; 
         
         if(socket.otherName) { 
            console.log("Déconnection de ", socket.otherName); 
            var localSocket = users[socket.otherName]; 
            //localSocket.otherName = null;
            
            if(localSocket != null) { 
               sendTo(localSocket, { 
                  type: "leave" 
               }); 
            }
         } 
      }
      
   });  
  connection.send('{"type":true, "success":true}');
});

/**
* Fonction qui permet d'envoiyer des message à un utilisateur (à une socket précise).  
*
* @author: Habib & Anis
* @this {object} socket la connexion actuelle
* @this {object} message la message à envoiyer
*/
function sendTo(socket, message) { 
    socket.send(JSON.stringify(message)); 
}
 
