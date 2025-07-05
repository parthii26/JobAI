import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { verifyFirebaseToken } from "./services/firebase-admin";
import { parseResume } from "./services/resume-parser";
import { extractSkills } from "./services/skill-extractor";
import { generateInterviewQuestions } from "./services/openai";
import { insertResumeSchema, insertInterviewQuestionSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  },
});

async function getOrCreateUser(decodedToken: any) {
  let user = await storage.getUserByFirebaseUid(decodedToken.uid);
  if (!user) {
    const newUser = {
      firebaseUid: decodedToken.uid,
      email: decodedToken.email || "",
      name: decodedToken.name || "",
    };
    user = await storage.createUser(newUser);
  }
  return user;
}

// Middleware to verify Firebase token
async function authenticateUser(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await verifyFirebaseToken(token);
    
    const user = await getOrCreateUser(decodedToken);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid authentication token' });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User registration
  app.post('/api/users', async (req, res) => {
    try {
      const { firebaseUid, email, name } = req.body;
      
      // Verify the user doesn't already exist
      const existingUser = await storage.getUserByFirebaseUid(firebaseUid);
      if (existingUser) {
        return res.json(existingUser);
      }
      
      const user = await storage.createUser({ firebaseUid, email, name });
      res.json(user);
    } catch (error: any) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', authenticateUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Resume upload
  app.post('/api/resumes/upload', authenticateUser, upload.single('resume'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const userId = req.user.id;
      const file = req.file;

      // Parse resume text
      const originalText = await parseResume(file.buffer, file.mimetype);
      
      // Extract skills using AI
      const skillsData = await extractSkills(originalText);
      
      // Calculate scores (simplified scoring logic)
      const overallScore = Math.floor(
        (skillsData.technicalSkills.length * 0.4 + 
         skillsData.softSkills.length * 0.3 + 
         Math.min(originalText.length / 1000, 10) * 0.3)
      );
      
      const skillMatchPercentage = Math.min(
        Math.floor((skillsData.technicalSkills.length + skillsData.softSkills.length) * 5), 
        100
      );
      
      // Create resume record
      const resumeData = insertResumeSchema.parse({
        userId,
        filename: file.originalname,
        originalText,
        extractedSkills: [...skillsData.technicalSkills, ...skillsData.softSkills],
        technicalSkills: skillsData.technicalSkills,
        softSkills: skillsData.softSkills,
        overallScore,
        skillMatchPercentage,
        formatQuality: Math.floor(Math.random() * 3) + 7, // Mock format quality
        keywordDensity: Math.floor(Math.random() * 3) + 7, // Mock keyword density
      });
      
      const resume = await storage.createResume(resumeData);
      
      // Generate interview questions based on skills
      try {
        const questions = await generateInterviewQuestions([...skillsData.technicalSkills, ...skillsData.softSkills]);
        
        for (const questionData of questions) {
          const questionRecord = insertInterviewQuestionSchema.parse({
            userId,
            skill: questionData.skill,
            difficulty: questionData.difficulty,
            question: questionData.question,
            category: questionData.category,
          });
          
          await storage.createInterviewQuestion(questionRecord);
        }
      } catch (error) {
        console.error('Error generating interview questions:', error);
        // Continue without questions if AI service fails
      }
      
      // Match job roles
      await storage.matchJobRoles(userId, resume.id);
      
      res.json({ 
        success: true, 
        resumeId: resume.id, 
        message: 'Resume uploaded and processed successfully' 
      });
      
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get user resumes
  app.get('/api/resumes', authenticateUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const resumes = await storage.getUserResumes(userId);
      res.json(resumes);
    } catch (error: any) {
      console.error('Error fetching resumes:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get recent resumes
  app.get('/api/resumes/recent', authenticateUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const resumes = await storage.getRecentResumes(userId);
      res.json(resumes);
    } catch (error: any) {
      console.error('Error fetching recent resumes:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Delete resume
  app.delete('/api/resumes/:id', authenticateUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const resumeId = parseInt(req.params.id);
      
      await storage.deleteResume(userId, resumeId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting resume:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get skills overview
  app.get('/api/skills/overview', authenticateUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const skillsData = await storage.getUserSkillsOverview(userId);
      res.json(skillsData);
    } catch (error: any) {
      console.error('Error fetching skills overview:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get recent interview questions
  app.get('/api/interview-questions/recent', authenticateUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const questions = await storage.getRecentInterviewQuestions(userId);
      res.json(questions);
    } catch (error: any) {
      console.error('Error fetching interview questions:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get job matches
  app.get('/api/job-matches/recent', authenticateUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const matches = await storage.getRecentJobMatches(userId);
      res.json(matches);
    } catch (error: any) {
      console.error('Error fetching job matches:', error);
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
