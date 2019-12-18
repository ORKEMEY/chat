const express = require('express');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost';

server.listen(3000);

app.get('/', (request, response) => {
  response.sendFile(`${__dirname}/index.html`);
});

ConnectedUsersSockets = [];

io.sockets.on('connection', (socket) => {
  console.log(`Connected ${socket.id}`);
  ConnectedUsersSockets.push(socket);

  socket.on('disconnect', (data) => {
    ConnectedUsersSockets.splice(ConnectedUsersSockets.indexOf(socket), 1);
    console.log(`Disconnected ${socket.id}`);
  });

  socket.on('send_message', (data) => {
    io.sockets.emit('add_message', { message: data.message, name: data.name });

    const mongoClient = new MongoClient(url, { useUnifiedTopology: true });

    mongoClient.connect((err, client) => {
      if (err) {
        return console.log(err);
      }

      const db = client.db('usersdb');
      const collection = db.collection('messages');
      const user = { name: data.name, message: data.message };

      collection.insertOne(user, (err, result) => {
        if (err) return console.log(err);

        console.log(result);
        client.close();
      });
    });
  });

  socket.on('history', () => {
    const mongoClient = new MongoClient(url, { useUnifiedTopology: true });

    mongoClient.connect((err, client) => {
      if (err) {
        return console.log(err);
      }

      const db = client.db('usersdb');
      const collection = db.collection('messages');

      collection.find().toArray((err, results) => {
        if (err) {
          return console.log(err);
        }

        socket.emit('clear');

        results.forEach((element) => {
          socket.emit('add_message', { message: element.message, name: element.name });
        });

        console.log(results);
        client.close();
      });
    });
  });
});
