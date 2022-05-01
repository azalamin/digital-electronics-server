const cors = require("cors");
const express = require("express");
const jwt = require("jsonwebtoken");
const verify = require("jsonwebtoken/verify");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
require("dotenv").config();

const app = express();

// use middleware
app.use(cors());
app.use(express.json());

const JWTverify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized permission" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
};

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

    // AUTHENTICATION
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    // Inventory API
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

    // Get User Inventories
    app.get("/inventories", JWTverify, async (req, res) => {
      const decodedEmail = req?.decoded?.email;
      const email = req?.query?.email;
      console.log(req.decoded);
      if (email === decodedEmail) {
        const query = { email: email };
        const result = await inventoryCollection.find(query).toArray();
        res.send(result);
      } else {
        res.status(403).send({ message: "Forbidden access" });
      }
    });

    // Post Inventory
    app.post("/inventory", async (req, res) => {
      const data = req.body;
      const result = await inventoryCollection.insertOne(data);
      res.send(result);
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

    // Handle MY Item delete
    app.delete("/myInventory", async (req, res) => {
      const id = req.query.id;
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
