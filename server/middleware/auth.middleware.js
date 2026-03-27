import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

//authMiddleware
export const authMiddleware = async(req, res, next) => {
 
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Middleware to protect routes with JWT
export const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies.jwt || 
             (req.headers.authorization?.startsWith('Bearer') && 
              req.headers.authorization.split(' ')[1]);

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

