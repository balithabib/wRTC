// importation de notre bibliothèque websocket
var WebSocketServer = require('ws').Server; 
// création d'un serveur Websocket sur le port 5555
var webSocket = new WebSocketServer({port: 5555}); 
// tous les utilisateurs connectés aux serveur sont sauvegardés dans cette variable
var users = {};
  
// lorsqu'un utilisateur se connecte à votre serveur
webSocket.on('connection', function(connection) {
   console.log("Utilisateur connecté");
   // quand le serveur reçoit un message d'un utilisateur connecté 
   connection.on('message', function(message) { 
      var data; 
      //on  n'acceptant que les messages JSON
      try { 
         data = JSON.parse(message); 
      } catch (e) { 
         console.log("Invalid JSON"); 
         data = {}; 
      }
      
      // switch selon le type du message utilisateur
      switch (data.type) { 
         // lorsqu'un utilisateur tente de se connecter
         case "login": 
            console.log("User logged ", data.name); 
            // si quelqu'un est connecté avec ce nom d'utilisateur, alors refuse
            if(users[data.name]) { 
               sendTo(connection, { 
                  type: "login", 
                  success: false 
               }); 
            } else { 
               // enregistrer la connexion (socket) de l'utilisateur sur le serveur 
               users[data.name] = connection; 
               connection.name = data.name; 
               // envoi d'un message de type login avec une valeur de success vrai à l'utilisateur
               sendTo(connection, { 
                  type: "login", 
                  success: true 
               }); 
            } 
            break;
         // lorsqu'un utilisateur tente d'appele un autre utilisateur  
         case "offer": 
             console.log("Envoi offre à: ", data.name);
            
            // si l'utilisateur data.name existe
            var con = users[data.name]; 
            
            if(con != null) { 
               // paramétrer cet utilisateur à connecté avec l'autre utilisateur
               connection.otherName = data.name; 
               // envoye des détails de l'offre à cette utilisateur
               sendTo(con, { 
                  type: "offer", 
                  offer: data.offer, 
                  name: connection.name 
               }); 
            }
            break;
         // lorsqu'un utilisateur tente de répondre à une offre  
         case "answer": 
            console.log("Envoi de la réponse à: ", data.name); 
            // si l'utilisateur data.name existe
            var conn = users[data.name]; 
            
            if(conn != null) {
               // paramétrer cet utilisateur à connecté avec l'autre utilisateur 
               connection.otherName = data.name; 
               // envoye des détails de la réponse à cette utilisateur
               sendTo(conn, { 
                  type: "answer", 
                  answer: data.answer 
               }); 
            } 
            break; 
         // lorsqu'un utilisateur tente de envoiyé des candidats  
         case "candidate": 
            console.log("Envoi du candidat à: ",data.name); 
            var conn = users[data.name];
            
            if(conn != null) { 
               sendTo(conn, { 
                  type: "candidate", 
                  candidate: data.candidate 
               }); 
            } 
            break;
         // lorsqu'un utilisateur tente de se déconnecter avec l'autre utilisateur   
         case "leave": 
            console.log("Déconnection de ", data.name); 
            var conn = users[data.name]; 
            conn.otherName = null; 

            // informe l'autre utilisateur afin qu'il puisse déconnecter sa connexion homologue
            if(conn != null) {
               sendTo(conn, { 
                  type: "leave" 
              }); 
            }
            break;
            
         default: 
            sendTo(connection, { 
               type: "error", 
               message: "Command not found: " + data.type 
            });             
            break; 
      }
      
   }); 
   
   // quand l'utilisateur quitte, par exemple ferme une fenêtre de navigateur
   connection.on("close", function() { 
   
      if(connection.name) { 
         delete users[connection.name]; 
         
         if(connection.otherName) { 
            console.log("Déconnection de ", connection.otherName); 
            var conn = users[connection.otherName]; 
            conn.otherName = null;
            
            if(conn != null) { 
               sendTo(conn, { 
                  type: "leave" 
               }); 
            }
         } 
      }
      
   });  

    connection.send('{"type":true, "success":true}');  
});
  
 // fonction qui permet d'envoiyer des message à un utilisateur   
function sendTo(connection, message) { 
   connection.send(JSON.stringify(message)); 
}
