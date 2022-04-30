const cors = require("cors");
const express = require("express");
const port = process.env.PORT || 5000;
require("dotenv").config();

const app = express();

// use middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qaeg0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const inventoryCollection = client
      .db("digitalElectronics")
      .collection("inventories");
    console.log("DB connected");

    // Get inventories
    app.get("/inventory", async(req, res) => {
        const size = parseInt(req.query.size);
        console.log(size);
        const query = {};
        let inventories;
        if (size) {
            inventories = await inventoryCollection.find(query).limit(size).toArray();
        } else{
            inventories = await inventoryCollection.find(query).toArray();
        }
        res.send(inventories)
    });

  } finally {
    // client.close()
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Digital Electronics Server is running");
});

app.listen(port, () => {
  console.log("Listening to the port", port);
});
