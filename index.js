const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.port || 5000;

// middlware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mzertuj.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const categoryCollection = client.db("ToyHub").collection("categories");

    // Creating index on one field
    // const indexKeys = { title: 1 }; // Replace field1 and field2 with your actual field names
    // const indexOptions = { name: "titleCategory" }; // Replace index_name with the desired index name
    // const result = await categoryCollection.createIndex(
    //   indexKeys,
    //   indexOptions
    // );
    // console.log(result);

    app.get("/getToysByText/:text", async (req, res) => {
      const text = req.params.text;
      const result = await categoryCollection
        .find({
          $or: [{ name: { $regex: text, $options: "i" } }],
        })
        .toArray();
      res.json(result);
    });

    app.get("/categories", async (req, res) => {
      const cursor = categoryCollection.find();
      const result = await cursor.toArray();
      res.json(result);
    });

    app.get("/categories/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await categoryCollection.findOne(query);
      res.json(result);
    });

    // recive data from client side and store data in mongodb database
    app.post("/toyinfos", async (req, res) => {
      const info = req.body;
      console.log(info);
      //  store data in mongodb
      const result = await categoryCollection.insertOne({
        ...info,
        price: parseFloat(info.price),
      });
      res.json(result);
    });

    app.get("/sorting", async (req, res) => {
      const email = req.query.email;
      const filter = { email: email };
      const result = await categoryCollection
        .find(filter)
        .sort({ price: 1 })
        .toArray();
      res.json(result);
    });

    app.get("/disending", async (req, res) => {
      const email = req.query.email;
      const filter = { email: email };
      const result = await categoryCollection
        .find(filter)
        .sort({ price: -1 })
        .toArray();
      res.json(result);
    });

    // send all toys data to the AllToys page
    app.get("/alltoys", async (req, res) => {
      const cursor = categoryCollection.find();
      const result = await cursor.limit(20).toArray();
      res.json(result);
    });

    // send dynamic data in details page
    app.get("/alltoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await categoryCollection.findOne(query);
      res.json(result);
    });

    // send some data in client side using query
    app.get("/mytoys", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await categoryCollection.find(query).toArray();
      res.json(result);
    });

    // send specific data for update
    app.get("/updatetoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await categoryCollection.findOne(query);
      res.json(result);
    });

    // update mytoys data
    app.put("/updatetoys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const info = req.body;
      const updateToys = {
        $set: {
          price: info.price,
          quantity: info.quantity,
          description: info.description,
        },
      };
      const result = await categoryCollection.updateOne(filter, updateToys);
      res.json(result);
    });

    //  delete data in mytoys page
    app.delete("/mytoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await categoryCollection.deleteOne(query);
      res.json(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("ToyHub server is running smoothly");
});

app.listen(port, () => {
  console.log(`ToyHub server is running on port: ${port}`);
});
