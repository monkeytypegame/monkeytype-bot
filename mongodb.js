const { MongoClient } = require("mongodb");
const config = require("./config.json");

let mongoClient;

module.exports = {
  async connectDB() {
    return MongoClient.connect(config.DB_URI)
      .then((client) => {
        mongoClient = client;
      })
      .catch((e) => {
        console.log(e);
        process.exit(1);
      });
  },
  mongoDB() {
    return mongoClient.db(config.DB_NAME);
  },
};
