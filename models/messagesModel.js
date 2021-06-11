const connection = require('./connection');

const saveMessagesHistory = async (message) => {
  const db = await connection();
  db.collection('messages').insertOne(message);
};

const uploadMessagesHistory = async () => {
  const db = await connection();
  return db.collection('messages').find().toArray();
};

module.exports = { saveMessagesHistory, uploadMessagesHistory };