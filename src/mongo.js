const MongoClient = require('mongodb').MongoClient;
const config = require('./config');
const MONGO_URL = `mongodb://${config.url}/${config.db}`;

module.exports = async app => {
  try {
    const connection = await MongoClient.connect(MONGO_URL);
    app.todos = connection.collection(config.collection);
    console.log('Database connection established');
  } catch (e) {
    console.error(e);
  }
};
