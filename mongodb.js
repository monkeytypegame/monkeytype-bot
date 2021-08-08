const { MongoClient } = require("mongodb");

let mongoClient;

module.exports = {
  async connectDB() {
    return MongoClient.connect("mongodb://localhost:27017")
      .then((client) => {
        mongoClient = client;
      })
      .catch((e) => {
        console.log(e);
        process.exit(1);
      });
  },
  mongoDB() {
    return mongoClient.db("monkeytype");
  },
};
