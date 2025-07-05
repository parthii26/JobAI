import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  filename: text("filename").notNull(),
  originalText: text("original_text").notNull(),
  extractedSkills: json("extracted_skills").$type<string[]>().default([]),
  technicalSkills: json("technical_skills").$type<string[]>().default([]),
  softSkills: json("soft_skills").$type<string[]>().default([]),
  overallScore: integer("overall_score").default(0),
  skillMatchPercentage: integer("skill_match_percentage").default(0),
  formatQuality: integer("format_quality").default(0),
  keywordDensity: integer("keyword_density").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interviewQuestions = pgTable("interview_questions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  skill: text("skill").notNull(),
  difficulty: text("difficulty").notNull(), // "Easy", "Intermediate", "Advanced"
  question: text("question").notNull(),
  category: text("category").notNull(), // "Technical", "Behavioral", "Situational"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobRoles = pgTable("job_roles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  requiredSkills: json("required_skills").$type<string[]>().notNull(),
  description: text("description"),
  experienceLevel: text("experience_level"), // "Entry", "Mid", "Senior"
});

export const jobMatches = pgTable("job_matches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  resumeId: integer("resume_id").notNull(),
  jobRoleId: integer("job_role_id").notNull(),
  matchPercentage: integer("match_percentage").notNull(),
  missingSkills: json("missing_skills").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const skillGapRecommendations = pgTable("skill_gap_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  skill: text("skill").notNull(),
  recommendationType: text("recommendation_type").notNull(), // "Course", "Tutorial", "Practice"
  title: text("title").notNull(),
  url: text("url"),
  provider: text("provider"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  createdAt: true,
});

export const insertInterviewQuestionSchema = createInsertSchema(interviewQuestions).omit({
  id: true,
  createdAt: true,
});

export const insertJobRoleSchema = createInsertSchema(jobRoles).omit({
  id: true,
});

export const insertJobMatchSchema = createInsertSchema(jobMatches).omit({
  id: true,
  createdAt: true,
});

export const insertSkillGapRecommendationSchema = createInsertSchema(skillGapRecommendations).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;

export type InterviewQuestion = typeof interviewQuestions.$inferSelect;
export type InsertInterviewQuestion = z.infer<typeof insertInterviewQuestionSchema>;

export type JobRole = typeof jobRoles.$inferSelect;
export type InsertJobRole = z.infer<typeof insertJobRoleSchema>;

export type JobMatch = typeof jobMatches.$inferSelect;
export type InsertJobMatch = z.infer<typeof insertJobMatchSchema>;

export type SkillGapRecommendation = typeof skillGapRecommendations.$inferSelect;
export type InsertSkillGapRecommendation = z.infer<typeof insertSkillGapRecommendationSchema>;
