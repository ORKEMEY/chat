const socket = io.connect();

let $formSignin = $('#Signin'); // форма с авторизацией
let $Login = $('#Login'); // имя пользователя
let $Message = $('#Message');
const $Clear = $('#Clear'); // очищение истории
const $textarea = $('#Textbox'); // сообщение
const $formMessages = $('#Messages'); // форма с сообщениями
let $label = $('#MessagesLabel'); // название формы с сообщениями
const $Password = $('#Password'); // пароль
const $btnSignIn = $('#btnSignIn');
const $btnLogIn = $('#btnLogIn');
let $btnSend;
const $SendFormLabel = $('#SendFormLabel');
let IsLogged = false;

socket.on('add_message', data => {
  $textarea.append(`${data.name}: ${data.message}\n`);
});

$formMessages.submit(event => {
  event.preventDefault();

  if (IsLogged) {
    $label.replaceWith('<label id="MessagesLabel">History</label>');
    $label = $('#MessagesLabel');
    socket.emit('history', $Login.val());
  } else alert('Log in to check history');
});

btnSignIn.onclick = function() {
  if (String($Login.val()).length !== 0) {
    if (String($Password.val()).length !== 0) {
      socket.emit('signin', {
        name: $Login.val(),
        password: CryptoJS.MD5($Password.val()).toString(),
      });
    } else alert('Write your password to sign in');
  } else alert('Write your login to sign in');
};

btnLogIn.onclick = function() {
  if (String($Login.val()).length !== 0) {
    if (String($Password.val()).length !== 0) {
      socket.emit('login', {
        name: $Login.val(),
        password: CryptoJS.MD5($Password.val()).toString(),
      });
    } else alert('Write your password to log in');
  } else alert('Write your login to log in');
};

socket.on('loggedin', () => {
  $SendFormLabel.replaceWith(
    '  <h2 id="SendFormLabel" class="form-signin-heading">Write message</h2>',
  );
  $Login.replaceWith(
    `<input type="text" id="Login" class="input-block-level text-primary" value="${$Login.val()}" placeholder="Login" readonly>`,
  );
  $Password.replaceWith(
    '<input type="text" id="Message" class="input-block-level" placeholder="Your message" >',
  );
  $btnLogIn.replaceWith(
    '<input type="submit" class="btn btn-large btn-primary" id="btnSend" value="Send"></input>',
  );
  $Message = $('#Message');
  $Login = $('#Login');
  $btnSend = $('#btnSend');
  $formSignin = $('#Signin');
  $btnSignIn.remove();
  IsLogged = true;
});

$formSignin.submit(event => {
  event.preventDefault();

  if (String($Message.val()).length !== 0) {
    $label.replaceWith('<label id="MessagesLabel">Messages</label>');
    $label = $('#MessagesLabel');
    socket.emit('send_message', { message: $Message.val(), name: $Login.val() });
  } else alert('Write your message to send it');

  $Message.val('');
});

Clear.onclick = function() {
  $textarea.empty();
};

socket.on('clear', () => {
  $textarea.empty();
});

socket.on('alert', message => {
  alert(message);
});
