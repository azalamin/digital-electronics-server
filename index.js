const cors = require("cors");
const express = require("express");
const port = process.env.PORT || 5000;
require("dotenv").config();

const app = express();

// use middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    app.get("/inventory", async (req, res) => {
      const homeInventory = parseInt(req.query.homeInventory);
      const query = {};
      let inventories;
      if (homeInventory) {
        inventories = await inventoryCollection
          .find(query)
          .limit(homeInventory)
          .toArray();
      } else {
        inventories = await inventoryCollection.find(query).toArray();
      }
      res.send(inventories);
    });

    // Post Inventory
    app.post("/inventory", async (req, res) => {
        const data = req.body;
        const result = await inventoryCollection.insertOne(data);
        res.send(result)
    });

    // Get Single Inventory Details
    app.get("/inventoryDetails", async (req, res) => {
      const id = req.query.manageId;
      const query = { _id: ObjectId(id) };
      const result = await inventoryCollection.findOne(query);
      res.send(result);
    });

    // Update Inventory Quantity
    app.put("/updateQuantity", async (req, res) => {
      const id = req.query.manageId;
      const quantity = parseInt(req.body.quantity);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: quantity,
        },
      };
      const result = await inventoryCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // handle delete
    app.delete("/inventory", async (req, res) => {
      const id = req.query.inventoryId;
      const query = { _id: ObjectId(id) };
      const result = await inventoryCollection.deleteOne(query);
      res.send(result);
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
