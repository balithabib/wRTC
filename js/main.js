var socket = io.connect('http://localhost:8080');

$('#loginform').submit(function(event){
  event.preventDefault();
  socket.emit('login', $('#username').val());
  $(".row").css("display", "flex");
});

socket.on('newusr', function(user){  
  $('#users' ).append('<span class=""><input id="'+user.id+'" type="button" value="'+ user.name +'">');
});

socket.on('call', function(i){  
  for(let k = 0 ; k< i ; k++){  
    $('#'+k).click(function(){

    });
  }
});

socket.on('logged',function(users){
  $('#divlogin').toggle();
});

socket.on('disusr', function(user){
  $('#' + user.id).remove();
});

socket.on('reçu',function(e){
  console.log("salut : " + e.target);
}); 

function sendToServer(data){
      socket.emit('envoi',data);
}

var server = {
  iceServers: [
      {url: "stun:23.21.150.121"},
      {url: "stun:stun.l.google.com:19302"},
      {url: "turn:numb.viagenie.ca", credential: "webrtcdemo", username: "louis%40mozilla.com"}
  ]
};