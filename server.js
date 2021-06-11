const express = require('express');

const app = express();

const http = require('http').createServer(app);
const moment = require('moment');

const PORT = 3000;

const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000',
    method: ['GET', 'POST'],
  },
});

const { renderClient } = require('./controllers/clientController');
const {
  saveMessagesHistory,
  uploadMessagesHistory,
} = require('./models/messagesModel');

let usersArray = [];

const changeUsersArray = (updatedNickname, socket) => usersArray.map((currentUser) => {
  if (currentUser.userId === socket.id) {
    return { userId: socket.id, nickname: updatedNickname };
  }
  return currentUser;
});

const handleNewMessages = (socket) => {
  socket.on('message', async ({ chatMessage, nickname }) => {
    const formattedDate = moment().format('DD-MM-yyyy HH:mm:ss');
    io.emit('message', `${formattedDate} - ${nickname}: ${chatMessage}`);
    await saveMessagesHistory({ timestamp: formattedDate, nickname, message: chatMessage });
  });
};

const seedsFrontEnd = (socket) => {
  socket.on('userOnline', async (nickname) => {
    usersArray.push({ userId: socket.id, nickname });
    io.emit('sendNicknames', usersArray);
    const messages = await uploadMessagesHistory();
    io.emit('uploadMessagesHistory', messages);
  });
};

const removeDisconnectedUsers = (socket) => {
  socket.on('disconnect', () => {
    const newUsersArray = usersArray.filter(({ userId }) => userId !== socket.id);
    usersArray = newUsersArray;
    io.emit('sendNicknames', usersArray);
  });
};

const updatedUsersArray = (socket) => {
  socket.on('updatedUsersArray', (updatedNickname) => {
    const newUsersArray = changeUsersArray(updatedNickname, socket);
    usersArray = newUsersArray;
    io.emit('sendNicknames', usersArray);
  });
};

// Anderson Alves (ajuda para gerar nicknames);
io.on('connection', (socket) => {
  handleNewMessages(socket);
  seedsFrontEnd(socket);
  removeDisconnectedUsers(socket);
  updatedUsersArray(socket);
});

app.use('/', express.static(`${__dirname}/public`));

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', renderClient);

http.listen(PORT, () => console.log('App listening on PORT %s', PORT));
