const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
const PORT = process.env.PORT || 5002;

const http = require("http");
const server = http.createServer(app);
const cors = require("cors");

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json());

// MongoDB Atlas Connection with error handling
mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://kanban:kanban12345@tasks.nekkp2k.mongodb.net/kanbanDB?retryWrites=true&w=majority", {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000
})
.then(() => console.log("Connected to MongoDB Atlas"))
.catch(err => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});

// User Schema with validation
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"]
  },
  email: { 
    type: String, 
    required: [true, "Email is required"], 
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"]
  },
  tasks: {
    pending: { type: Array, default: [] },
    ongoing: { type: Array, default: [] },
    completed: { type: Array, default: [] }
  }
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || "your-secure-jwt-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Enhanced Authentication Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: "Authorization token required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// Auth Routes
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, email and password are required" 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: "Email already in use" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      tasks: {
        pending: [{ 
          id: Date.now().toString(), 
          title: "Your first task", 
          comments: [],
          createdAt: new Date()
        }],
        ongoing: [],
        completed: []
      }
    });
    
    await user.save();
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({ 
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        tasks: user.tasks
      }
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error during registration",
      error: err.message 
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }
    
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ 
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        tasks: user.tasks
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error during login",
      error: err.message 
    });
  }
});

// Socket.IO Connection with enhanced error handling
// In server.js, modify the socket.io connection handler:
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("getTasks", async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user) {
        socket.emit("tasks", user.tasks);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  });

  socket.on("addTask", async ({ token, task }) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user) {
        const newTask = {
          id: Date.now().toString(),
          title: task,
          comments: [],
          createdAt: new Date()
        };
        user.tasks.pending.push(newTask);
        await user.save();
        io.emit("tasks", user.tasks);
      }
    } catch (err) {
      console.error("Error adding task:", err);
    }
  });

  socket.on("moveTask", async ({ token, source, destination }) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user) {
        const [movedTask] = user.tasks[source.columnId].splice(source.index, 1);
        user.tasks[destination.columnId].splice(destination.index, 0, movedTask);
        await user.save();
        io.emit("tasks", user.tasks);
      }
    } catch (err) {
      console.error("Error moving task:", err);
    }
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK",
    timestamp: new Date(),
    dbStatus: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
  process.exit(1);
});