const client = window.io();

const sendButton = document.querySelector('#submitButton');
const changeNicknameBtn = document.querySelector('#changeNicknameBtn');

const createRandomNickname = `User-${Math.random().toString(20).substr(2, 11)}`;

sendButton.addEventListener('click', (event) => {
  event.preventDefault();
  const inputMessage = document.querySelector('#inputMessage');
  if ((inputMessage.value).trim() === '') return false;
  const nickname = sessionStorage.getItem('nickname');
  client.emit('message', {
    chatMessage: inputMessage.value,
    nickname,
  });
  inputMessage.value = '';
});

changeNicknameBtn.addEventListener('click', (event) => {
  event.preventDefault();
  const inputMessage = document.querySelector('#changeNicknameInput');
  if ((inputMessage.value).trim() === '') return false;
  client.emit('updatedUsersArray', inputMessage.value);
  inputMessage.value = '';
});

const printMessage = (message, messageContainer) => {
  const messageBlock = document.createElement('li');
  messageBlock.setAttribute('data-testid', 'message');
  messageBlock.innerText = message;
  messageContainer.appendChild(messageBlock);
};

client.on('message', (message) => {
  const messageContainer = document.querySelector('#messagesContainer');
  printMessage(message, messageContainer);
});

const saveInLocalStorage = (usersArray) => {
  const [currentNickname] = usersArray.filter(({ userId }) => userId === client.id);
  sessionStorage.setItem('nickname', currentNickname.nickname);
};

const printNickNames = (nickname, nicknameContainer) => {
  const nicknameElement = document.createElement('li');
  nicknameElement.setAttribute('data-testid', 'online-user');
  nicknameElement.innerText = nickname;
  nicknameContainer.appendChild(nicknameElement);
};

client.on('sendNicknames', (usersArray) => {
  const nicknameContainer = document.querySelector('#nicknameContainer');
  nicknameContainer.innerHTML = '';
  usersArray.forEach((currentUser) => {
    if (currentUser.userId === client.id) printNickNames(currentUser.nickname, nicknameContainer);
  });
  usersArray.forEach((currentUser) => {
    if (currentUser.userId !== client.id) printNickNames(currentUser.nickname, nicknameContainer);
  });

  saveInLocalStorage(usersArray);
});

client.on('uploadMessagesHistory', (uploadMessagesHistory) => {
  const messageContainer = document.querySelector('#messagesContainer');
  messageContainer.innerHTML = '';
  uploadMessagesHistory.forEach(({ nickname, message, timestamp }) => {
    const currentMessage = `${timestamp} - ${nickname}: ${message}`;
    printMessage(currentMessage, messageContainer);
  });
});

// Anderson Alves (ajuda para gerar nicknames);
client.emit('userOnline', createRandomNickname);
