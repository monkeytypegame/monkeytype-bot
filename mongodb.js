const { MongoClient } = require("mongodb");
const config = require("./config.json");

let mongoClient;

module.exports = {
  async connectDB() {
    if (mongoClient) return mongoClient;
    return MongoClient.connect(process.env.DB_URI)
      .then((client) => {
        mongoClient = client;
      })
      .catch((e) => {
        console.log(e);
        process.exit(1);
      });
  },
  mongoDB() {
    return mongoClient.db(process.env.DB_NAME);
  },
};
