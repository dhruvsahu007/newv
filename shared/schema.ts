import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("viewer"), // viewer, creator, admin
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
});

// Video model
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(), // Could be file path or external embed URL
  embedType: text("embed_type").notNull().default("youtube"), // youtube, vimeo, upload
  thumbnail: text("thumbnail"),
  duration: text("duration"), // Video duration in format HH:MM:SS
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced
  tags: json("tags").$type<string[]>().notNull().default([]),
  views: integer("views").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  dislikes: integer("dislikes").notNull().default(0),
  avgWatchTime: text("avg_watch_time").default("0:00"), // Mock data for average watch time
  status: text("status").notNull().default("active"), // active, pending, removed
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVideoSchema = createInsertSchema(videos).pick({
  creatorId: true,
  title: true,
  description: true,
  url: true,
  embedType: true,
  thumbnail: true,
  duration: true,
  category: true,
  difficulty: true,
  tags: true,
  status: true,
});

// Comment model
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videos.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  likes: integer("likes").notNull().default(0),
  parentId: integer("parent_id").references(() => comments.id), // For nested replies
  status: text("status").notNull().default("active"), // active, flagged, removed
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  videoId: true,
  userId: true,
  content: true,
  parentId: true,
});

// Watch history model
export const watchHistory = pgTable("watch_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  videoId: integer("video_id").notNull().references(() => videos.id),
  progress: integer("progress").notNull().default(0), // Progress in seconds
  completed: boolean("completed").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWatchHistorySchema = createInsertSchema(watchHistory).pick({
  userId: true,
  videoId: true,
  progress: true,
  completed: true,
});

// Watch later model
export const watchLater = pgTable("watch_later", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  videoId: integer("video_id").notNull().references(() => videos.id),
  addedAt: timestamp("added_at").defaultNow(),
});

export const insertWatchLaterSchema = createInsertSchema(watchLater).pick({
  userId: true,
  videoId: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type WatchHistory = typeof watchHistory.$inferSelect;
export type InsertWatchHistory = z.infer<typeof insertWatchHistorySchema>;

export type WatchLater = typeof watchLater.$inferSelect;
export type InsertWatchLater = z.infer<typeof insertWatchLaterSchema>;
