var http = require('http');
var io = require('socket.io'); 
var i = 0;

var httpServer = http.createServer(function(req, res){
    console.log('un utilisateur a affiché la page');
});

httpServer.listen(8080); 

var io = require('socket.io').listen(httpServer);
var sequenceNumberByClient = new Map();

var users = {};

io.sockets.on('connection', function(socket){
    var me = {name: '',id : -1};
    for(var k in users){
        socket.emit('newusr', users[k]);
    }
    
    socket.on('login', function(user){
        me.name = user;
        me.id = i++;
        me.socketId = socket.id;
        users[me.id] = me;
        socket.broadcast.emit('newusr',me);
        io.sockets.emit('call',i);
        socket.emit('logged');
        console.log(user+ ' est connecter  '+socket.id);
    });    
    
    socket.on('disconnect', function(){
        if(me.id == -1)
            return false;
        console.log(me.name+ ' est deconnecter');
        delete users[me.id];
		io.sockets.emit('disusr', me);
    });

    socket.on('envoi',function(msg){
        //var msgString = JSON.stringify(msg);
        for(var k in users){
            if (users[k].name === msg.target) {   
                io.to(users[k].socketId).emit('reçu', msg); 
                break;
            }
        }
    });
});
