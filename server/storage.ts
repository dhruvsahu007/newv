import { 
  User, InsertUser, Video, InsertVideo, Comment, InsertComment, 
  WatchHistory, InsertWatchHistory, WatchLater, InsertWatchLater,
  users, videos, comments, watchHistory, watchLater
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Video operations
  getVideos(options?: { 
    limit?: number, 
    offset?: number, 
    category?: string, 
    difficulty?: string, 
    tag?: string, 
    search?: string,
    status?: string,
    creatorId?: number
  }): Promise<Video[]>;
  
  getVideo(id: number): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: number, video: Partial<Video>): Promise<Video | undefined>;
  deleteVideo(id: number): Promise<boolean>;
  
  // Comment operations
  getComments(videoId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateCommentStatus(id: number, status: string): Promise<boolean>;
  
  // Watch history operations
  getWatchHistory(userId: number): Promise<WatchHistory[]>;
  addToWatchHistory(history: InsertWatchHistory): Promise<WatchHistory>;
  
  // Watch later operations
  getWatchLater(userId: number): Promise<WatchLater[]>;
  addToWatchLater(watchLater: InsertWatchLater): Promise<WatchLater>;
  removeFromWatchLater(userId: number, videoId: number): Promise<boolean>;
  
  // Analytics
  incrementViews(videoId: number): Promise<boolean>;
  toggleLike(videoId: number, value: boolean): Promise<Video | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private videos: Map<number, Video>;
  private comments: Map<number, Comment>;
  private watchHistory: Map<number, WatchHistory>;
  private watchLater: Map<number, WatchLater>;
  private userId: number;
  private videoId: number;
  private commentId: number;
  private watchHistoryId: number;
  private watchLaterId: number;

  constructor() {
    this.users = new Map();
    this.videos = new Map();
    this.comments = new Map();
    this.watchHistory = new Map();
    this.watchLater = new Map();
    this.userId = 1;
    this.videoId = 1;
    this.commentId = 1;
    this.watchHistoryId = 1;
    this.watchLaterId = 1;

    // Add default users
    this.createUser({
      username: "admin",
      password: "admin123",
      email: "admin@codecast.com",
      role: "admin"
    });
    
    this.createUser({
      username: "creator",
      password: "creator123",
      email: "creator@codecast.com",
      role: "creator"
    });
    
    this.createUser({
      username: "viewer",
      password: "viewer123",
      email: "viewer@codecast.com",
      role: "viewer"
    });

    // Add some sample videos for demonstration
    this.createVideo({
      creatorId: 2, // Creator user
      title: "React Hooks Deep Dive - useEffect Explained",
      description: "In this comprehensive tutorial, we dive deep into React's useEffect hook. You'll learn how the dependency array works, common pitfalls, and advanced patterns.",
      url: "https://www.youtube.com/watch?v=0ZJgIjIuY7U",
      embedType: "youtube",
      thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
      duration: "15:42",
      category: "Frontend Development",
      difficulty: "intermediate",
      tags: ["React", "Hooks", "Frontend"],
      status: "active"
    });

    this.createVideo({
      creatorId: 2, // Creator user
      title: "System Design: Building Scalable Microservices Architecture",
      description: "Learn how to design scalable microservices architecture for large-scale applications.",
      url: "https://www.youtube.com/watch?v=sSm2dRarhPo",
      embedType: "youtube",
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
      duration: "42:17",
      category: "System Design",
      difficulty: "advanced",
      tags: ["Microservices", "System Design", "Architecture"],
      status: "active"
    });

    this.createVideo({
      creatorId: 2, // Creator user
      title: "Getting Started with Next.js 13 - Server Components & App Router",
      description: "A beginner-friendly introduction to Next.js 13's new features including Server Components and the App Router.",
      url: "https://www.youtube.com/watch?v=_w0Ikk4JY7U",
      embedType: "youtube",
      thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      duration: "22:05",
      category: "Frontend Development",
      difficulty: "beginner",
      tags: ["Next.js", "React", "Web Dev"],
      status: "active"
    });

    this.createVideo({
      creatorId: 2, // Creator user
      title: "Docker for JavaScript Developers - From Zero to Production",
      description: "Learn how to use Docker for your JavaScript projects, from local development to production deployment.",
      url: "https://www.youtube.com/watch?v=gAkwW2tuIqE",
      embedType: "youtube",
      thumbnail: "https://images.unsplash.com/photo-1542831371-29b0f74f9713",
      duration: "30:47",
      category: "DevOps",
      difficulty: "intermediate",
      tags: ["Docker", "JavaScript", "DevOps"],
      status: "active"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  // Video operations
  async getVideos(options: { 
    limit?: number, 
    offset?: number, 
    category?: string, 
    difficulty?: string, 
    tag?: string, 
    search?: string,
    status?: string,
    creatorId?: number
  } = {}): Promise<Video[]> {
    let videos = Array.from(this.videos.values());
    
    // Filter by creator if specified
    if (options.creatorId) {
      videos = videos.filter(video => video.creatorId === options.creatorId);
    }
    
    // Filter by status if specified
    if (options.status) {
      videos = videos.filter(video => video.status === options.status);
    } else {
      // By default, only show active videos
      videos = videos.filter(video => video.status === 'active');
    }
    
    // Filter by category if specified
    if (options.category) {
      videos = videos.filter(video => video.category === options.category);
    }
    
    // Filter by difficulty if specified
    if (options.difficulty) {
      videos = videos.filter(video => video.difficulty === options.difficulty);
    }
    
    // Filter by tag if specified
    if (options.tag) {
      videos = videos.filter(video => 
        video.tags.some(tag => tag.toLowerCase() === options.tag?.toLowerCase())
      );
    }
    
    // Filter by search term if specified
    if (options.search) {
      const searchTerm = options.search.toLowerCase();
      videos = videos.filter(video => 
        video.title.toLowerCase().includes(searchTerm) || 
        video.description.toLowerCase().includes(searchTerm) ||
        video.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    // Sort by latest
    videos.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Apply pagination
    if (options.offset !== undefined && options.limit !== undefined) {
      videos = videos.slice(options.offset, options.offset + options.limit);
    } else if (options.limit !== undefined) {
      videos = videos.slice(0, options.limit);
    }
    
    return videos;
  }

  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = this.videoId++;
    const now = new Date();
    const video: Video = { 
      ...insertVideo, 
      id, 
      views: 0, 
      likes: 0, 
      dislikes: 0, 
      avgWatchTime: "0:00", 
      createdAt: now
    };
    this.videos.set(id, video);
    return video;
  }

  async updateVideo(id: number, updates: Partial<Video>): Promise<Video | undefined> {
    const video = this.videos.get(id);
    if (!video) return undefined;
    
    const updatedVideo = { ...video, ...updates };
    this.videos.set(id, updatedVideo);
    return updatedVideo;
  }

  async deleteVideo(id: number): Promise<boolean> {
    return this.videos.delete(id);
  }

  // Comment operations
  async getComments(videoId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.videoId === videoId && comment.status === 'active')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.commentId++;
    const now = new Date();
    const comment: Comment = { 
      ...insertComment, 
      id, 
      likes: 0, 
      status: 'active', 
      createdAt: now 
    };
    this.comments.set(id, comment);
    return comment;
  }

  async updateCommentStatus(id: number, status: string): Promise<boolean> {
    const comment = this.comments.get(id);
    if (!comment) return false;
    
    comment.status = status;
    this.comments.set(id, comment);
    return true;
  }

  // Watch history operations
  async getWatchHistory(userId: number): Promise<WatchHistory[]> {
    return Array.from(this.watchHistory.values())
      .filter(history => history.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async addToWatchHistory(insertHistory: InsertWatchHistory): Promise<WatchHistory> {
    // Check if entry already exists
    const existing = Array.from(this.watchHistory.values()).find(
      h => h.userId === insertHistory.userId && h.videoId === insertHistory.videoId
    );
    
    if (existing) {
      // Update existing entry
      const updated: WatchHistory = { 
        ...existing, 
        progress: insertHistory.progress, 
        completed: insertHistory.completed,
        updatedAt: new Date()
      };
      this.watchHistory.set(existing.id, updated);
      return updated;
    } else {
      // Create new entry
      const id = this.watchHistoryId++;
      const now = new Date();
      const history: WatchHistory = { 
        ...insertHistory, 
        id, 
        updatedAt: now 
      };
      this.watchHistory.set(id, history);
      return history;
    }
  }

  // Watch later operations
  async getWatchLater(userId: number): Promise<WatchLater[]> {
    return Array.from(this.watchLater.values())
      .filter(wl => wl.userId === userId)
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  }

  async addToWatchLater(insertWatchLater: InsertWatchLater): Promise<WatchLater> {
    // Check if already exists
    const existing = Array.from(this.watchLater.values()).find(
      wl => wl.userId === insertWatchLater.userId && wl.videoId === insertWatchLater.videoId
    );
    
    if (existing) {
      return existing;
    }
    
    const id = this.watchLaterId++;
    const now = new Date();
    const watchLater: WatchLater = { 
      ...insertWatchLater, 
      id, 
      addedAt: now 
    };
    this.watchLater.set(id, watchLater);
    return watchLater;
  }

  async removeFromWatchLater(userId: number, videoId: number): Promise<boolean> {
    const entry = Array.from(this.watchLater.values()).find(
      wl => wl.userId === userId && wl.videoId === videoId
    );
    
    if (!entry) return false;
    return this.watchLater.delete(entry.id);
  }

  // Analytics
  async incrementViews(videoId: number): Promise<boolean> {
    const video = this.videos.get(videoId);
    if (!video) return false;
    
    video.views += 1;
    this.videos.set(videoId, video);
    return true;
  }

  async toggleLike(videoId: number, isLike: boolean): Promise<Video | undefined> {
    const video = this.videos.get(videoId);
    if (!video) return undefined;
    
    if (isLike) {
      video.likes += 1;
    } else {
      video.dislikes += 1;
    }
    
    this.videos.set(videoId, video);
    return video;
  }
}

// Create DatabaseStorage class
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async getVideos(options?: { 
    limit?: number, 
    offset?: number, 
    category?: string, 
    difficulty?: string, 
    tag?: string, 
    search?: string,
    status?: string,
    creatorId?: number
  }): Promise<Video[]> {
    let query = db
      .select()
      .from(videos)
      .orderBy(desc(videos.createdAt));
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.offset(options.offset);
    }
    
    if (options?.category) {
      query = query.where(eq(videos.category, options.category));
    }
    
    if (options?.difficulty) {
      query = query.where(eq(videos.difficulty, options.difficulty));
    }
    
    if (options?.status) {
      query = query.where(eq(videos.status, options.status));
    }
    
    if (options?.creatorId) {
      query = query.where(eq(videos.creatorId, options.creatorId));
    }
    
    // Tag and search filters are more complex and might require specialized query logic
    // This is a simplification
    if (options?.tag) {
      query = query.where(sql`${videos.tags} @> ${sql.array([options.tag], 'text')}`);
    }
    
    if (options?.search) {
      const searchTerm = `%${options.search}%`;
      query = query.where(
        or(
          sql`${videos.title} ILIKE ${searchTerm}`,
          sql`${videos.description} ILIKE ${searchTerm}`
        )
      );
    }
    
    return await query;
  }
  
  async getVideo(id: number): Promise<Video | undefined> {
    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.id, id));
    
    return video || undefined;
  }
  
  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const [video] = await db
      .insert(videos)
      .values(insertVideo)
      .returning();
    
    return video;
  }
  
  async updateVideo(id: number, updates: Partial<Video>): Promise<Video | undefined> {
    const [updatedVideo] = await db
      .update(videos)
      .set(updates)
      .where(eq(videos.id, id))
      .returning();
    
    return updatedVideo;
  }
  
  async deleteVideo(id: number): Promise<boolean> {
    const result = await db
      .delete(videos)
      .where(eq(videos.id, id));
    
    return result.count > 0;
  }
  
  async getComments(videoId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.videoId, videoId))
      .orderBy(desc(comments.createdAt));
  }
  
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();
    
    return comment;
  }
  
  async updateCommentStatus(id: number, status: string): Promise<boolean> {
    const result = await db
      .update(comments)
      .set({ status })
      .where(eq(comments.id, id));
    
    return result.count > 0;
  }
  
  async getWatchHistory(userId: number): Promise<WatchHistory[]> {
    return await db
      .select()
      .from(watchHistory)
      .where(eq(watchHistory.userId, userId))
      .orderBy(desc(watchHistory.updatedAt));
  }
  
  async addToWatchHistory(insertHistory: InsertWatchHistory): Promise<WatchHistory> {
    // Check if entry already exists
    const [existingEntry] = await db
      .select()
      .from(watchHistory)
      .where(
        and(
          eq(watchHistory.userId, insertHistory.userId),
          eq(watchHistory.videoId, insertHistory.videoId)
        )
      );
    
    if (existingEntry) {
      // Update the existing entry
      const [updated] = await db
        .update(watchHistory)
        .set({ 
          updatedAt: new Date(),
          watchTime: insertHistory.watchTime,
          completed: insertHistory.completed 
        })
        .where(eq(watchHistory.id, existingEntry.id))
        .returning();
      
      return updated;
    } else {
      // Create a new entry
      const [history] = await db
        .insert(watchHistory)
        .values(insertHistory)
        .returning();
      
      return history;
    }
  }
  
  async getWatchLater(userId: number): Promise<WatchLater[]> {
    return await db
      .select()
      .from(watchLater)
      .where(eq(watchLater.userId, userId))
      .orderBy(desc(watchLater.createdAt));
  }
  
  async addToWatchLater(insertWatchLater: InsertWatchLater): Promise<WatchLater> {
    const [watchLaterEntry] = await db
      .insert(watchLater)
      .values(insertWatchLater)
      .returning();
    
    return watchLaterEntry;
  }
  
  async removeFromWatchLater(userId: number, videoId: number): Promise<boolean> {
    const result = await db
      .delete(watchLater)
      .where(
        and(
          eq(watchLater.userId, userId),
          eq(watchLater.videoId, videoId)
        )
      );
    
    return result.count > 0;
  }
  
  async incrementViews(videoId: number): Promise<boolean> {
    const result = await db
      .update(videos)
      .set({
        views: sql`${videos.views} + 1`
      })
      .where(eq(videos.id, videoId));
    
    return result.count > 0;
  }
  
  async toggleLike(videoId: number, isLike: boolean): Promise<Video | undefined> {
    const result = await db
      .update(videos)
      .set({
        likes: sql`${videos.likes} + ${isLike ? 1 : -1}`
      })
      .where(eq(videos.id, videoId))
      .returning();
    
    return result[0];
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
