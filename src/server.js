var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost";

server.listen(3000);

app.get('/', function(request, response){

response.sendFile(__dirname + '/index.html');

});

Users = [];
ConnectedUsersSockets = [];

io.sockets.on('connection', function(socket){

    console.log("Connected");
    ConnectedUsersSockets.push(socket);

    socket.on('disconnect', function (data) {
        ConnectedUsersSockets.splice(ConnectedUsersSockets.indexOf(socket), 1);
        console.log("Disconnected");
    });

    socket.on('send_message', function(data){

        io.sockets.emit('add_message', { message: data.message, name: data.name });

        const mongoClient = new MongoClient(url, { useUnifiedTopology: true });

        mongoClient.connect(function(err, client){

            if(err){ return console.log(err); }
            
            const db = client.db("usersdb");
            const collection = db.collection("messages");
            let user = {name: data.name, message: data.message};

            collection.insertOne(user, function(err, result){
            if(err) return console.log(err);
                 
                console.log(result);
                client.close();
            });
            
        });

    });

   socket.on('history', function(){

        const mongoClient = new MongoClient(url, { useUnifiedTopology: true });

        mongoClient.connect(function(err, client){

            if(err){ return console.log(err); }
            
            const db = client.db("usersdb");
            const collection = db.collection("messages");

            collection.find().toArray(function(err, results){

                if(err) { return console.log(err); }

               // io.sockets.emit('clear');

                results.forEach(element => {
                    
                    io.sockets.emit('add_message',{message: element.message, name: element.name});
                    //$textarea.append(data.name + ": " + data.message + "\n");
                });

                console.log(results);
                client.close();
            })
            
        });

    });

    socket.on('clear_history', function(data){
        io.sockets.emit('clear');
    });


});





