require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
const PORT = 5002;

const http = require("http");
const server = http.createServer(app);
const cors = require("cors");

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB Atlas"))
.catch(err => console.error("MongoDB connection error:", err));

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tasks: {
    pending: { type: Array, default: [] },
    ongoing: { type: Array, default: [] },
    completed: { type: Array, default: [] }
  }
});

const User = mongoose.model("User", UserSchema);

// JWT Secret
const JWT_SECRET = "your-jwt-secret-key";

// Authentication Middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Routes
app.post("/api/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      email,
      password: hashedPassword,
      tasks: {
        pending: [{ id: "1", title: "Sample Task", comments: [] }],
        ongoing: [],
        completed: []
      }
    });
    
    await user.save();
    res.status(201).json({ message: "User created" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, tasks: user.tasks });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Socket.IO Connection
io.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user connected!`);

  socket.on("createTask", async (data) => {
    const userId = jwt.verify(data.token, JWT_SECRET).userId;
    const user = await User.findById(userId);
    
    const newTask = { id: Date.now().toString(), title: data.task, comments: [] };
    user.tasks.pending.push(newTask);
    await user.save();
    
    io.emit("tasks", user.tasks);
  });

  socket.on("taskDragged", async (data) => {
    const userId = jwt.verify(data.token, JWT_SECRET).userId;
    const user = await User.findById(userId);
    
    const { source, destination } = data;
    const [movedItem] = user.tasks[source.droppableId].splice(source.index, 1);
    user.tasks[destination.droppableId].splice(destination.index, 0, movedItem);
    
    await user.save();
    io.emit("tasks", user.tasks);
  });

  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});