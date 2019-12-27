const express = require('express');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const mongoose = require('mongoose');

const CONFIG = require(`${__dirname}/../config.json`);
const SCHEME = require(`${__dirname}/../models.json`);
const { URL } = CONFIG;
const PORT = process.env.PORT || CONFIG.PORT;

const { Schema } = mongoose;
const userScheme = SCHEME.userScheme;
const messageScheme = SCHEME.messageScheme;

mongoose.connect(URL, { useUnifiedTopology: true });

const User = mongoose.model('User', userScheme);
const Message = mongoose.model('Message', messageScheme);

server.listen(PORT, () => {
  console.log('Server is up!');
});

app.use(express.static(`${__dirname}/public`));
app.get('/', (request, response) => { 
  response.sendFile(`${__dirname}/index.html`);
});

io.sockets.on('connection', socket => {
  console.log(`Connected ${socket.id}`);

  socket.on('disconnect', data => {
    console.log(`Disconnected ${socket.id}`);
  });

  socket.on('signin', data => {
    const user = new User({
      name: data.name,
      password: data.password,
    });

    User.findOne({ name: user.name }, (err, nameResult) => {
      if (err) return console.log(err);

      if (nameResult === null) {
        console.log(' Adding new user ');

        user.save(err => {
          if (err) return console.log(err);
          socket.emit('loggedin');
          console.log(`New user: ${User.name} ${User.password}`);
        });
      } else {
        console.log(`Account already exist name: ${user.name}`);
        socket.emit('alert', ' Account with this login is already exist, choose another login ');
      }
    });
  });

  socket.on('login', data => {
    const user = new User({
      name: data.name,
      password: data.password,
    });

    User.findOne({ name: user.name }, (err, nameResult) => {
      if (err) return console.log(err);
      if (nameResult !== null) {
        User.findOne({ name: user.name, password: user.password }, (err, passwordResult) => {
          if (err) return console.log(err);

          if (passwordResult !== null) {
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
    });
  });

  socket.on('send_message', data => {
    // отправка сообщения
    io.sockets.emit('add_message', { message: data.message, name: data.name });

    message = new Message({
      message: data.message,
      name: data.name,
    });

    message.save(err => {
      if (err) return console.log(err);
      console.log('New message', message);
    });
  });

  socket.on('history', () => {
    // вывод истории

    Message.find({}, (err, messages) => {
      if (err) return console.log(err);

      socket.emit('clear'); // очищение textbox

      messages.forEach(element => {
        // вывод всех сообщений из бд
        socket.emit('add_message', { message: element.message, name: element.name });
      });

      console.log('Найден объект', messages);
    });
  });
});
