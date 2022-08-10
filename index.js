const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

// middle ware
app.use(cors());
app.use(express.json());
// connect to database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hyb1n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    const database = client.db("apolloAmbulance");
    console.log("DB Connected...");
    const bookingCollection = database.collection("booking");

    app.get("/bookings", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = { email: req.query.email };
      }
      const cursor = bookingCollection.find(query);
      if ((await bookingCollection.estimatedDocumentCount()) === 0) {
        console.log("No documents found!");
      }
      const result = await cursor.toArray();
      res.send(result);
    });
    // get food by id
    app.get("/bookings/:id", async (req, res) => {
      let { id } = req.params;
      try {
        const query = { _id: ObjectId(id) };
        const result = await bookingCollection.findOne(query);
        res.send(result);
      } catch (error) {
        res.send({ message: "Not found" });
      }
    });

    app.post("/bookings", async (req, res) => {
      const doc = req.body;
      const result = await bookingCollection.insertOne(doc);
      res.send(result);
    });

    app.patch("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ambulanceNumber: req.body.ambulanceNumber,
          status: req.body.status,
        },
      };

      const filter = { _id: ObjectId(id) };
      const result = await bookingCollection.updateOne(
        filter,
        updateDoc,
        options
      );

      res.send(result);
    });
  } finally {
  }
};
run().catch(console.dir);

//
app.get("/", (req, res) => {
  res.send("Hello from red onion!");
});

// app listen
app.listen(port, () => {
  console.log("Server is running on ", port, "...");
});
