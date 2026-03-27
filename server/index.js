//index.js
import express from 'express';
import dotenv from "dotenv";
import cors from 'cors';
import database from './db/database.js';
import cookieParser from 'cookie-parser';


// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Database connection
database();


// CORS Configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Routes


const port = process.env.PORT || 5000;

// Server Startup
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});



