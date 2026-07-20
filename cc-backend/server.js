require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const Item = require("./models/Item");
const User = require("./models/user");
const Club = require("./models/Club");
const Announcement = require("./models/Announcement");
const bcrypt = require("bcrypt");
const Message = require("./models/message");
const Feedback = require("./models/Feedback");
const Review = require("./models/Review");
const jwt = require("jsonwebtoken");

const app = express();
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

console.log(process.env.MONGO_URI);
connectDB();

const activeUsers = new Map(); 

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("register", (userId) => {
    if (userId) {
      activeUsers.set(userId, socket.id);
      console.log(`User registered: userId ${userId} maps to socket ${socket.id}`);
    }
  });


  socket.on("sendMessage", async (data) => {
    try {
      const { senderId, receiverId, text } = data;
      if (!senderId || !receiverId || !text) return;

      const savedMessage = await Message.create({
        senderId,
        receiverId,
        text
      });

    
      socket.emit("messageSent", savedMessage);

      const recipientSocketId = activeUsers.get(receiverId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receiveMessage", savedMessage);
      }
    } catch (error) {
      console.error("Error handling sendMessage:", error.message);
      socket.emit("sendError", { error: error.message });
    }
  });


  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        console.log(`Cleaned up registration for userId ${userId}`);
        break;
      }
    }
  });
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
}); 
app.get("/api/items", async (req, res) => {
  try {
    const { type, status } = req.query;

    const filter = {};

    if (type) filter.type = type;
    if (status) filter.status = status;

    const items = await Item.find(filter)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

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
       userId: req.body.userId 
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

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

app.delete("/api/items/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log(req.body);
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Registration restricted: Email must contain 'ietdavv'."
      });
    }
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
      { _id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || "cc_jwt_secret_key_2026",
      { expiresIn: "7d" }
    );

   res.status(200).json({
  success: true,
  message: "Login successful",
  token,
  user: {
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
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

const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "cc_jwt_secret_key_2026");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

app.post("/api/clubs", requireAuth, async (req, res) => {
  try {
    const club = await Club.create({
      clubName: req.body.clubName,
      headName: req.body.headName,
      foundedYear: req.body.foundedYear,
      description: req.body.description,
      createdBy: req.user._id.toString(),
      clubAdmin: req.user._id,
      status: "pending"
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
    const authHeader = req.headers.authorization;
    let filter = { status: "approved" };

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "cc_jwt_secret_key_2026");
        
        if (decoded.role === "admin") {
          filter = {};
        } else {
          filter = {
            $or: [
              { status: "approved" },
              { createdBy: decoded._id.toString() },
              { clubAdmin: decoded._id }
            ]
          };
        }
      } catch (jwtErr) {
       
      }
    }

    const clubs = await Club.find(filter).sort({ createdAt: -1 });
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
app.put("/api/clubs/:id", requireAuth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }

    const clubAdminId = club.clubAdmin ? club.clubAdmin.toString() : club.createdBy;

    
    if (clubAdminId !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Only the club admin can make changes." });
    }

    const updatedClub = await Club.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedClub);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
const isAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "cc_jwt_secret_key_2026");
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

const canPostAnnouncement = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "cc_jwt_secret_key_2026");
    req.user = decoded;

    if (decoded.role === "admin") {
      return next();
    }

    const { clubName } = req.body;
    if (!clubName) {
      return res.status(400).json({ error: "Club name is required." });
    }

    const club = await Club.findOne({
      clubName: { $regex: new RegExp(`^${clubName.trim()}$`, "i") },
      status: "approved"
    });

    if (!club) {
      return res.status(403).json({ error: "Access denied. Club does not exist or is not approved." });
    }

    if (club.clubAdmin && club.clubAdmin.toString() === decoded._id.toString()) {
      return next();
    }

    return res.status(403).json({ error: "Access denied. You are not the admin of this club." });
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};


app.put("/api/clubs/:id/approve", isAdmin, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ error: "Club not found." });
    }

    club.status = "approved";
    await club.save();

    res.json({ message: "Club approved successfully!", club });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/clubs/:id", requireAuth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ error: "Club not found." });
    }

    const isCreator = club.createdBy === req.user._id.toString() || (club.clubAdmin && club.clubAdmin.toString() === req.user._id.toString());
    const isGlobalAdmin = req.user.role === "admin";

    if (!isCreator && !isGlobalAdmin) {
      return res.status(403).json({ error: "Access denied. Only admins or the creator can reject/delete this club request." });
    }

    await Club.findByIdAndDelete(req.params.id);
    res.json({ message: "Club request deleted/rejected successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/announcements", canPostAnnouncement, async (req, res) => {
  try {
    const announcement = await Announcement.create({
      clubName: req.body.clubName,
      title: req.body.title,
      venue: req.body.venue,
      date: req.body.date,
      time: req.body.time,
      description: req.body.description
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
app.get("/api/announcements/latest", async (req, res) => {
  try {
    const announcements = await Announcement
      .find()
      .sort({ createdAt: -1 }) 
      .limit(3); 
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/myannouncements/:userId", requireAuth, async (req, res) => {
  try {
    const userId = req.params.userId;
    if (req.user.role === "admin") {
      const announcements = await Announcement.find().sort({ createdAt: -1 });
      return res.json(announcements);
    }

    const clubs = await Club.find({ clubAdmin: userId });
    const clubNames = clubs.map(c => c.clubName);

    const announcements = await Announcement.find({ clubName: { $in: clubNames } }).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/announcements/:id", requireAuth, async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) {
      return res.status(404).json({ error: "Announcement not found." });
    }

    if (req.user.role !== "admin") {
      const club = await Club.findOne({
        clubName: { $regex: new RegExp(`^${ann.clubName.trim()}$`, "i") },
        clubAdmin: req.user._id
      });
      if (!club) {
        return res.status(403).json({ error: "Access denied. You are not authorized to update this announcement." });
      }
    }

    ann.title = req.body.title || ann.title;
    ann.venue = req.body.venue || ann.venue;
    ann.date = req.body.date || ann.date;
    ann.time = req.body.time || ann.time;
    ann.description = req.body.description !== undefined ? req.body.description : ann.description;

    await ann.save();
    res.json({ message: "Announcement updated successfully!", announcement: ann });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/announcements/:id", requireAuth, async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) {
      return res.status(404).json({ error: "Announcement not found." });
    }

    if (req.user.role !== "admin") {
      const club = await Club.findOne({
        clubName: { $regex: new RegExp(`^${ann.clubName.trim()}$`, "i") },
        clubAdmin: req.user._id
      });
      if (!club) {
        return res.status(403).json({ error: "Access denied. You are not authorized to delete this announcement." });
      }
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: "Announcement deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/messages", async (req, res) => {
  try {
    const message = await Message.create({
      senderId: req.body.senderId,
      receiverId: req.body.receiverId,
      text: req.body.text
    });

   
    const recipientSocketId = activeUsers.get(req.body.receiverId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("receiveMessage", message);
    }

    res.status(201).json(message);

  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});


app.get("/api/messages/conversations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
   
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
        const username = otherUser.name || "Unknown User";
        const avatar = username.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2);
        const unreadCount = await Message.countDocuments({
          senderId: otherId,
          receiverId: userId,
          isRead: { $ne: true }
        });

        conversations.push({
          userId: otherId,
          username: username,
          avatar: avatar || "U",
          lastMessage: lastMsg.text,
          time: lastMsg.createdAt,
          unreadCount: unreadCount
        });
      }
    }
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

app.put("/api/messages/read/:senderId/:receiverId", async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    await Message.updateMany(
      { senderId: senderId, receiverId: receiverId, isRead: { $ne: true } },
      { $set: { isRead: true } }
    );
    
    const recipientSocketId = activeUsers.get(receiverId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("messagesRead", { senderId });
    }

    res.json({ success: true, message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/messages/unread-count/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await Message.countDocuments({ receiverId: userId, isRead: { $ne: true } });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

app.post("/api/forgot-password/verify-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email." });
    }
    res.json({ success: true, message: "Email verified. OTP sent simulation." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/forgot-password/reset", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
    if (code !== "1234") {
      return res.status(400).json({ success: false, message: "Invalid verification code." });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.json({ success: true, message: "Password reset successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put("/api/profile/:id/change-password", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;


    if (req.user._id !== id) {
      return res.status(403).json({ error: "Access denied. Unauthorized request." });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new passwords are required." });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect current password." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post("/api/profile/:id/verification", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rollNumber } = req.body;

    if (req.user._id !== id) {
      return res.status(403).json({ error: "Access denied. Unauthorized request." });
    }

    if (!rollNumber) {
      return res.status(400).json({ error: "Roll number is required." });
    }


    const user = await User.findByIdAndUpdate(
      id,
      {
        rollNumber,
        verificationStatus: "pending",
        isVerified: false
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({
      success: true,
      message: "Account details submitted successfully! Pending admin approval.",
      isVerified: user.isVerified,
      verificationStatus: user.verificationStatus
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get("/api/admin/pending-verifications", isAdmin, async (req, res) => {
  try {
    const users = await User.find({ verificationStatus: "pending" });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/admin/approve-student/:id", isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: "verified",
        isVerified: true
      },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({ message: "Student verified successfully!", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/reject-student/:id", isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: "unverified",
        isVerified: false,
        rollNumber: ""
      },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({ message: "Student verification request rejected successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});