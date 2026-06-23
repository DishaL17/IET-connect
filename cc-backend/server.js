require("dotenv").config();
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const Item = require("./models/Item");
const User = require("./models/User");
const Club = require("./models/Club");
const Announcement = require("./models/Announcement");
const bcrypt = require("bcrypt");
const Message = require("./models/message");
const Feedback = require("./models/Feedback");
const Review = require("./models/Review");
const app = express();
console.log(process.env.MONGO_URI);
connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});
//Items api 
app.get("/api/items", async (req, res) => {
  try {
    const { type } = req.query;

    const filter = type ? { type } : {};

    const items = await Item.find(filter).sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
       userId: req.body.userId // userId: req.user.id
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
//user api
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log(req.body);
    const existingUser = await User.findOne({ email });

if (existingUser) {
  return res.status(400).json({
    success: false,
    message: "User already exists",
  });
}
const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
  name,
  email,
  password: hashedPassword,
});
res.status(201).json({
  success: true,
  message: "User registered successfully"
});

  } catch (error) {
  console.log("REGISTER ERROR:");
  console.log(error);

  res.status(400).json({
    success: false,
    message: error.message,
  });
}
});

app.post("/login", async (req, res) => {
  try{
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user){
      return res.status(400).json({
          "success": false,
          "message": "User not found"
      })
    }
const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password"
      });
    }
const token = jwt.sign(
  {
    userId: user._id,
    email: user.email
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "1d"
  }
);
console.log("TOKEN:", token);
   res.status(200).json({
  success: true,
  message: "Login successful",
   token,
  user: {
  _id: user._id,
  name: user.name,
  email: user.email,
 
}
});
  } catch(error){
     res.status(500).json({
    success: false,
    message: error.message,
  });
  }
});
app.get("/api/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().select("name email");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.put("/api/profile/:id", async (req, res) => {
  try {
    const { bio, branch, phone_no } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        bio,
        branch,
        phone_no
      },
      { new: true }
    );
    if (!user) {
  return res.status(404).json({
    message: "User not found"
  });
}
  res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/myposts/:userId", async (req, res) => {
  try {
    const posts = await Item.find({
      userId: req.params.userId
    }).sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

//club api
app.post("/api/clubs", async (req, res) => {
  try {
    const club = await Club.create({
      clubName: req.body.clubName,
      headName: req.body.headName,
      foundedYear: req.body.foundedYear,
      description: req.body.description,
      createdBy: req.body.createdBy,
    });

    res.status(201).json(club);

  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});
app.get("/api/clubs", async (req, res) => {
  try {
    const clubs = await Club.find().sort({ createdAt: -1 });
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/clubs/:id", async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        message: "Club not found"
      });
    }

    res.json(club);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/announcements", async (req, res) => {
  try {
    const announcement = await Announcement.create({
      clubName: req.body.clubName,
      title: req.body.title,
      venue: req.body.venue,
      date: req.body.date,
      time: req.body.time
    });

    res.status(201).json(announcement);

  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});
app.get("/api/announcements", async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

app.post("/api/messages", async (req, res) => {
  try {
    const message = await Message.create({
      senderId: req.body.senderId,
      receiverId: req.body.receiverId,
      text: req.body.text
    });

    res.status(201).json(message);

  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});

// Get chat history between two users
app.get("/api/messages/:userId1/:userId2", async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all unique conversation threads for a user
app.get("/api/messages/conversations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find all messages where this user is sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 });

    const conversationMap = new Map();
    for (const msg of messages) {
      if (!msg.senderId || !msg.receiverId) continue;
      const otherId = msg.senderId.toString() === userId ? msg.receiverId.toString() : msg.senderId.toString();
      if (!conversationMap.has(otherId)) {
        conversationMap.set(otherId, msg);
      }
    }

    const conversations = [];
    for (const [otherId, lastMsg] of conversationMap.entries()) {
      const otherUser = await User.findById(otherId).select("name email");
      if (otherUser) {
        conversations.push({
          userId: otherId,
          username: otherUser.name,
          avatar: otherUser.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
          lastMessage: lastMsg.text,
          time: lastMsg.createdAt
        });
      }
    }
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Feedback API
app.post("/api/feedback", async (req, res) => {
  try {
    const feedback = await Feedback.create({
      userId: req.body.userId,
      feedbackType: req.body.feedbackType,
      subject: req.body.subject,
      message: req.body.message
    });
    res.status(201).json(feedback);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reviews API
app.post("/api/reviews", async (req, res) => {
  try {
    const review = await Review.create({
      recipientId: req.body.recipientId,
      reviewerName: req.body.reviewerName,
      rating: req.body.rating,
      text: req.body.text
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/reviews/:userId", async (req, res) => {
  try {
    const reviews = await Review.find({ recipientId: req.params.userId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});