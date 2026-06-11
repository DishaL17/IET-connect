require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const Item = require("./models/Item");

const app = express();
console.log(process.env.MONGO_URI);
connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

app.get("/api/items", async (req, res) => {
  try {
    const query = {};
    if (req.query.type) {
      query.type = req.query.type;
    }
    const items = await Item.find(query).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/items", async (req, res) => {
  try {
    const item = await Item.create({
      title: req.body.title,
      type: req.body.type,
      category: req.body.category,
      description: req.body.description,
      location: req.body.location,
      price: req.body.price,
      imageUrl: req.body.imageUrl,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update item (e.g. resolve it)
app.put("/api/items/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete item
app.delete("/api/items/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});