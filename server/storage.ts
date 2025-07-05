import { 
  users, 
  resumes, 
  interviewQuestions, 
  jobRoles, 
  jobMatches,
  skillGapRecommendations,
  type User, 
  type InsertUser,
  type Resume,
  type InsertResume,
  type InterviewQuestion,
  type InsertInterviewQuestion,
  type JobRole,
  type InsertJobRole,
  type JobMatch,
  type InsertJobMatch,
  type SkillGapRecommendation,
  type InsertSkillGapRecommendation
} from "@shared/schema";

// Extended interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Resume operations
  createResume(resume: InsertResume): Promise<Resume>;
  getUserResumes(userId: number): Promise<Resume[]>;
  getRecentResumes(userId: number): Promise<Resume[]>;
  deleteResume(userId: number, resumeId: number): Promise<void>;
  
  // Interview question operations
  createInterviewQuestion(question: InsertInterviewQuestion): Promise<InterviewQuestion>;
  getRecentInterviewQuestions(userId: number): Promise<InterviewQuestion[]>;
  
  // Job role operations
  createJobRole(jobRole: InsertJobRole): Promise<JobRole>;
  getAllJobRoles(): Promise<JobRole[]>;
  
  // Job matching operations
  matchJobRoles(userId: number, resumeId: number): Promise<void>;
  getRecentJobMatches(userId: number): Promise<any[]>;
  
  // Analytics operations
  getDashboardStats(userId: number): Promise<any>;
  getUserSkillsOverview(userId: number): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private resumes: Map<number, Resume>;
  private interviewQuestions: Map<number, InterviewQuestion>;
  private jobRoles: Map<number, JobRole>;
  private jobMatches: Map<number, JobMatch>;
  private skillGapRecommendations: Map<number, SkillGapRecommendation>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.resumes = new Map();
    this.interviewQuestions = new Map();
    this.jobRoles = new Map();
    this.jobMatches = new Map();
    this.skillGapRecommendations = new Map();
    this.currentId = 1;
    
    // Initialize with some default job roles
    this.initializeJobRoles();
  }

  private initializeJobRoles() {
    const defaultJobRoles: InsertJobRole[] = [
      {
        title: "Full Stack Developer",
        requiredSkills: ["JavaScript", "React", "Node.js", "HTML", "CSS", "MongoDB", "Express", "Git"],
        description: "Develop and maintain web applications using modern technologies",
        experienceLevel: "Mid"
      },
      {
        title: "Frontend Developer",
        requiredSkills: ["JavaScript", "React", "HTML", "CSS", "TypeScript", "Redux", "Webpack"],
        description: "Create responsive and interactive user interfaces",
        experienceLevel: "Entry"
      },
      {
        title: "Backend Developer",
        requiredSkills: ["Node.js", "Python", "Java", "SQL", "MongoDB", "API Design", "Docker"],
        description: "Build robust server-side applications and APIs",
        experienceLevel: "Mid"
      },
      {
        title: "Data Scientist",
        requiredSkills: ["Python", "R", "Machine Learning", "SQL", "Pandas", "NumPy", "TensorFlow"],
        description: "Analyze data and build predictive models",
        experienceLevel: "Mid"
      },
      {
        title: "DevOps Engineer",
        requiredSkills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Terraform", "Jenkins"],
        description: "Manage infrastructure and deployment pipelines",
        experienceLevel: "Senior"
      }
    ];

    defaultJobRoles.forEach(role => {
      const id = this.currentId++;
      const jobRole: JobRole = { 
        id,
        title: role.title,
        requiredSkills: [...role.requiredSkills],
        description: role.description || null,
        experienceLevel: role.experienceLevel || null
      };
      this.jobRoles.set(id, jobRole);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.firebaseUid === firebaseUid);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Resume operations
  async createResume(insertResume: InsertResume): Promise<Resume> {
    const id = this.currentId++;
    const resume: Resume = { 
      ...insertResume,
      id,
      createdAt: new Date(),
      extractedSkills: insertResume.extractedSkills ? [...(insertResume.extractedSkills as string[])] : null,
      technicalSkills: insertResume.technicalSkills ? [...(insertResume.technicalSkills as string[])] : null,
      softSkills: insertResume.softSkills ? [...(insertResume.softSkills as string[])] : null,
      overallScore: insertResume.overallScore || null,
      skillMatchPercentage: insertResume.skillMatchPercentage || null,
      formatQuality: insertResume.formatQuality || null,
      keywordDensity: insertResume.keywordDensity || null
    };
    this.resumes.set(id, resume);
    return resume;
  }

  async getUserResumes(userId: number): Promise<Resume[]> {
    return Array.from(this.resumes.values())
      .filter(resume => resume.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getRecentResumes(userId: number): Promise<Resume[]> {
    const userResumes = await this.getUserResumes(userId);
    return userResumes.slice(0, 5);
  }

  async deleteResume(userId: number, resumeId: number): Promise<void> {
    const resume = this.resumes.get(resumeId);
    if (resume && resume.userId === userId) {
      this.resumes.delete(resumeId);
      
      // Also delete related interview questions and job matches
      Array.from(this.interviewQuestions.entries()).forEach(([id, question]) => {
        if (question.userId === userId) {
          this.interviewQuestions.delete(id);
        }
      });
      
      Array.from(this.jobMatches.entries()).forEach(([id, match]) => {
        if (match.resumeId === resumeId) {
          this.jobMatches.delete(id);
        }
      });
    }
  }

  // Interview question operations
  async createInterviewQuestion(insertQuestion: InsertInterviewQuestion): Promise<InterviewQuestion> {
    const id = this.currentId++;
    const question: InterviewQuestion = { 
      ...insertQuestion, 
      id,
      createdAt: new Date()
    };
    this.interviewQuestions.set(id, question);
    return question;
  }

  async getRecentInterviewQuestions(userId: number): Promise<InterviewQuestion[]> {
    return Array.from(this.interviewQuestions.values())
      .filter(question => question.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }

  // Job role operations
  async createJobRole(insertJobRole: InsertJobRole): Promise<JobRole> {
    const id = this.currentId++;
    const jobRole: JobRole = { 
      id,
      title: insertJobRole.title,
      requiredSkills: [...insertJobRole.requiredSkills],
      description: insertJobRole.description || null,
      experienceLevel: insertJobRole.experienceLevel || null
    };
    this.jobRoles.set(id, jobRole);
    return jobRole;
  }

  async getAllJobRoles(): Promise<JobRole[]> {
    return Array.from(this.jobRoles.values());
  }

  // Job matching operations
  async matchJobRoles(userId: number, resumeId: number): Promise<void> {
    const resume = this.resumes.get(resumeId);
    if (!resume) return;

    const jobRoles = await this.getAllJobRoles();
    const userSkills = resume.extractedSkills || [];

    for (const jobRole of jobRoles) {
      const requiredSkills = jobRole.requiredSkills;
      const matchingSkills = userSkills.filter(skill => 
        requiredSkills.some(required => 
          required.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(required.toLowerCase())
        )
      );
      
      const matchPercentage = Math.floor((matchingSkills.length / requiredSkills.length) * 100);
      
      if (matchPercentage > 30) { // Only store matches above 30%
        const missingSkills = requiredSkills.filter(required => 
          !userSkills.some(skill => 
            required.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(required.toLowerCase())
          )
        );

        const id = this.currentId++;
        const jobMatch: JobMatch = {
          id,
          userId,
          resumeId,
          jobRoleId: jobRole.id,
          matchPercentage,
          missingSkills,
          createdAt: new Date()
        };
        
        this.jobMatches.set(id, jobMatch);
      }
    }
  }

  async getRecentJobMatches(userId: number): Promise<any[]> {
    const matches = Array.from(this.jobMatches.values())
      .filter(match => match.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // Include job role information
    return matches.map(match => ({
      ...match,
      jobRole: this.jobRoles.get(match.jobRoleId)
    }));
  }

  // Analytics operations
  async getDashboardStats(userId: number): Promise<any> {
    const userResumes = await this.getUserResumes(userId);
    const userQuestions = Array.from(this.interviewQuestions.values())
      .filter(q => q.userId === userId);
    
    const allSkills = userResumes.flatMap(resume => resume.extractedSkills || []);
    const uniqueSkills = [...new Set(allSkills)];
    
    const totalScore = userResumes.reduce((sum, resume) => sum + (resume.overallScore || 0), 0);
    const averageScore = userResumes.length > 0 ? totalScore / userResumes.length : 0;

    return {
      resumeCount: userResumes.length,
      skillCount: uniqueSkills.length,
      questionCount: userQuestions.length,
      averageScore: Math.round(averageScore * 10) / 10
    };
  }

  async getUserSkillsOverview(userId: number): Promise<any> {
    const userResumes = await this.getUserResumes(userId);
    
    const allTechnicalSkills = userResumes.flatMap(resume => resume.technicalSkills || []);
    const allSoftSkills = userResumes.flatMap(resume => resume.softSkills || []);
    
    const uniqueTechnicalSkills = [...new Set(allTechnicalSkills)];
    const uniqueSoftSkills = [...new Set(allSoftSkills)];

    return {
      technicalSkills: uniqueTechnicalSkills,
      softSkills: uniqueSoftSkills,
      totalSkillsCount: uniqueTechnicalSkills.length + uniqueSoftSkills.length
    };
  }
}

export const storage = new MemStorage();
