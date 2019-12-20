const express = require('express');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const crypto = require('crypto');

const { MongoClient } = require('mongodb');

const url = /* process.env['conurl'] || */ 'mongodb://localhost';

server.listen(3000);

app.use(express.static(`${__dirname}/public`));
app.get('/', (request, response) => {
  response.sendFile(`${__dirname}/index.html`);
});

users = [];
ConnectedUsersSockets = [];

io.sockets.on('connection', socket => {
  console.log(`Connected ${socket.id}`);
  ConnectedUsersSockets.push(socket);

  socket.on('disconnect', data => {
    ConnectedUsersSockets.splice(ConnectedUsersSockets.indexOf(socket), 1);
    console.log(`Disconnected ${socket.id}`);
  });

  socket.on('signin', data => {
    const mongoClient = new MongoClient(url, { useUnifiedTopology: true });

    mongoClient.connect((err, client) => {
      if (err) {
        return console.log(err);
      }

      const db = client.db('usersdb'); // подключение бд
      const usersdb = db.collection('users'); // создание коллекции
      const user = { name: data.name, password: data.password };

      usersdb.find({ name: data.name }).toArray((err, results) => {
        if (err) {
          return console.log(err);
        }

        if (results.length === 0) {
          console.log(' Adding new user ');
          usersdb.insertOne(user, (err, result) => {
            // добавление нового сообщения в бд
            if (err) return console.log(err);
            socket.emit('loggedin');
            console.log(`New user: ${user.name} ${user.password}`);
            console.log(result);
          });
        } else {
          console.log(`Account already exist name: ${user.name}`);
          socket.emit('alert', ' Account with this login is already exist, choose another login ');
        }

        client.close();
      });
    });
  });

  socket.on('login', data => {
    const mongoClient = new MongoClient(url, { useUnifiedTopology: true });

    mongoClient.connect((err, client) => {
      if (err) {
        return console.log(err);
      }

      const db = client.db('usersdb'); // подключение бд
      const usersdb = db.collection('users'); // создание коллекции
      const user = { name: data.name, password: data.password };

      usersdb.find({ name: user.name }).toArray((err, nameResults) => {
        if (err) {
          return console.log(err);
        }

        if (nameResults.length !== 0) {
          usersdb.find(user).toArray((err, passwordResults) => {
            if (err) {
              return console.log(err);
            }

            if (passwordResults.length !== 0) {
              socket.emit('loggedin');
            } else {
              console.log(`Wrong password, login: ${user.name}`);
              socket.emit('alert', ' Wrong password ');
            }
          });
        } else {
          console.log(`There is no account with such login. login: ${user.name}`);
          socket.emit('alert', ' No account with such login was found ');
        }

        client.close();
      });
    });
  });

  socket.on('send_message', data => {
    // отправка сообщения
    io.sockets.emit('add_message', { message: data.message, name: data.name });

    const mongoClient = new MongoClient(url, { useUnifiedTopology: true });

    mongoClient.connect((err, client) => {
      if (err) {
        return console.log(err);
      }

      const db = client.db('usersdb'); // подключение бд
      const messages = db.collection('messages'); // создание коллекции
      const user = { name: data.name, message: data.message };

      messages.insertOne(user, (err, result) => {
        // добавление нового сообщения в бд
        if (err) return console.log(err);

        console.log(result);
      });
      client.close();
    });
  });

  socket.on('history', () => {
    // вывод истории
    const mongoClient = new MongoClient(url, { useUnifiedTopology: true });

    mongoClient.connect((err, client) => {
      if (err) {
        return console.log(err);
      }

      const db = client.db('usersdb'); // подключение бд
      const messages = db.collection('messages');

      messages.find().toArray((err, results) => {
        if (err) {
          return console.log(err);
        }

        socket.emit('clear'); // очищение textbox

        results.forEach(element => {
          // вывод всех сообщений из бд
          socket.emit('add_message', { message: element.message, name: element.name });
        });

        console.log(results);
        client.close();
      });
    });
  });
});
