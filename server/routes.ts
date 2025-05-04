import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertVideoSchema, insertCommentSchema,
  insertWatchHistorySchema, insertWatchLaterSchema
} from "@shared/schema";
import { z } from "zod";
import jwt from "jsonwebtoken";

// JWT secret key (should be in env vars in production)
const JWT_SECRET = "codecast_secret_key";

// Authentication middleware
function authenticate(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header required" });
  }
  
  const token = authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number, role: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Role-based authorization middleware
function authorize(roles: string[]) {
  return (req: Request, res: Response, next: () => void) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden - Insufficient permissions" });
    }
    
    next();
  };
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        role: string;
      };
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // AUTH ROUTES
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username) || 
                          await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username or email already exists" });
      }
      
      // Create user
      const newUser = await storage.createUser(userData);
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser.id, role: newUser.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      
      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        },
        token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) { // In production, use bcrypt for password comparison
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      
      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        token
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // USER ROUTES
  app.get("/api/users/me", authenticate, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // VIDEO ROUTES
  app.get("/api/videos", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      const category = req.query.category as string | undefined;
      const difficulty = req.query.difficulty as string | undefined;
      const tag = req.query.tag as string | undefined;
      const search = req.query.search as string | undefined;
      
      const videos = await storage.getVideos({ 
        limit, offset, category, difficulty, tag, search 
      });
      
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/videos/:id", async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const video = await storage.getVideo(videoId);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      // Increment view count
      await storage.incrementViews(videoId);
      
      res.json(video);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/videos", authenticate, authorize(["creator", "admin"]), async (req, res) => {
    try {
      const videoData = insertVideoSchema.parse({
        ...req.body,
        creatorId: req.user!.userId
      });
      
      const newVideo = await storage.createVideo(videoData);
      
      res.status(201).json(newVideo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/videos/:id", authenticate, authorize(["creator", "admin"]), async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const video = await storage.getVideo(videoId);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      // Verify ownership or admin
      if (video.creatorId !== req.user!.userId && req.user!.role !== "admin") {
        return res.status(403).json({ message: "You don't have permission to update this video" });
      }
      
      const updatedVideo = await storage.updateVideo(videoId, req.body);
      
      res.json(updatedVideo);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/videos/:id", authenticate, authorize(["creator", "admin"]), async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const video = await storage.getVideo(videoId);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      // Verify ownership or admin
      if (video.creatorId !== req.user!.userId && req.user!.role !== "admin") {
        return res.status(403).json({ message: "You don't have permission to delete this video" });
      }
      
      await storage.deleteVideo(videoId);
      
      res.json({ message: "Video deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // CREATOR DASHBOARD ROUTES
  app.get("/api/creator/videos", authenticate, authorize(["creator", "admin"]), async (req, res) => {
    try {
      const videos = await storage.getVideos({ creatorId: req.user!.userId });
      
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // ANALYTICS ROUTES
  app.post("/api/videos/:id/like", authenticate, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const { isLike } = req.body; // true for like, false for dislike
      
      if (typeof isLike !== 'boolean') {
        return res.status(400).json({ message: "isLike parameter must be a boolean" });
      }
      
      const updatedVideo = await storage.toggleLike(videoId, isLike);
      
      if (!updatedVideo) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      res.json(updatedVideo);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // COMMENT ROUTES
  app.get("/api/videos/:id/comments", async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const comments = await storage.getComments(videoId);
      
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/videos/:id/comments", authenticate, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const commentData = insertCommentSchema.parse({
        ...req.body,
        videoId,
        userId: req.user!.userId
      });
      
      const newComment = await storage.createComment(commentData);
      
      res.status(201).json(newComment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // ADMIN ROUTES
  app.get("/api/admin/videos", authenticate, authorize(["admin"]), async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const videos = await storage.getVideos({ status });
      
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/admin/videos/:id/status", authenticate, authorize(["admin"]), async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["active", "pending", "removed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const updatedVideo = await storage.updateVideo(videoId, { status });
      
      if (!updatedVideo) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      res.json(updatedVideo);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/admin/comments/:id/status", authenticate, authorize(["admin"]), async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["active", "flagged", "removed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const success = await storage.updateCommentStatus(commentId, status);
      
      if (!success) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      res.json({ message: "Comment status updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // WATCH HISTORY ROUTES
  app.get("/api/watch-history", authenticate, async (req, res) => {
    try {
      const history = await storage.getWatchHistory(req.user!.userId);
      
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/watch-history", authenticate, async (req, res) => {
    try {
      const historyData = insertWatchHistorySchema.parse({
        ...req.body,
        userId: req.user!.userId
      });
      
      const newHistory = await storage.addToWatchHistory(historyData);
      
      res.status(201).json(newHistory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // WATCH LATER ROUTES
  app.get("/api/watch-later", authenticate, async (req, res) => {
    try {
      const watchLater = await storage.getWatchLater(req.user!.userId);
      
      res.json(watchLater);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/watch-later", authenticate, async (req, res) => {
    try {
      const watchLaterData = insertWatchLaterSchema.parse({
        ...req.body,
        userId: req.user!.userId
      });
      
      const newWatchLater = await storage.addToWatchLater(watchLaterData);
      
      res.status(201).json(newWatchLater);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/watch-later/:videoId", authenticate, async (req, res) => {
    try {
      const videoId = parseInt(req.params.videoId);
      const success = await storage.removeFromWatchLater(req.user!.userId, videoId);
      
      if (!success) {
        return res.status(404).json({ message: "Watch later entry not found" });
      }
      
      res.json({ message: "Removed from watch later successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
