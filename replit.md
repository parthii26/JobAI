# AI Interview Prep Assistant - Architecture Overview

## Overview

This is a full-stack AI-powered interview preparation assistant that helps users analyze resumes, extract skills, and generate personalized interview questions. The application uses a modern web stack with React frontend, Express backend, PostgreSQL database, and integrates with Firebase for authentication and OpenAI for AI-powered features.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with TypeScript support

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Authentication**: Firebase Admin SDK for token verification
- **File Processing**: Multer for file uploads, pdf-parse and mammoth for document parsing
- **API**: RESTful API design with middleware for authentication

### Database Architecture
- **Database**: PostgreSQL with Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Structured tables for users, resumes, interview questions, job roles, and analytics

## Key Components

### Authentication System
- Firebase Authentication for user management
- JWT token verification on backend routes
- Protected routes with authentication middleware
- User session management with automatic token refresh

### Resume Processing Pipeline
1. **File Upload**: Supports PDF, DOC, and DOCX formats up to 10MB
2. **Text Extraction**: Uses pdf-parse for PDFs and mammoth for Word documents
3. **Skill Extraction**: OpenAI GPT-4o integration for intelligent skill categorization
4. **Scoring System**: Automated resume scoring based on multiple factors
5. **Storage**: Parsed data stored in PostgreSQL with JSON fields for flexible skill arrays

### AI Integration
- **OpenAI GPT-4o**: Primary AI model for skill extraction and question generation
- **Intelligent Processing**: Context-aware skill categorization (technical vs. soft skills)
- **Interview Questions**: Dynamic question generation based on extracted skills
- **Structured Responses**: JSON-formatted AI responses for consistent data handling

### Job Matching System
- **Role Definitions**: Predefined job roles with required skills
- **Matching Algorithm**: Skill-based matching with percentage calculations
- **Gap Analysis**: Identification of missing skills for career development
- **Recommendations**: Personalized skill development suggestions

## Data Flow

### Resume Upload Process
1. User uploads resume file through drag-and-drop interface
2. File validation and size checking on client side
3. Secure upload to backend with authentication
4. Text extraction using appropriate parser (PDF/Word)
5. AI-powered skill extraction and categorization
6. Resume scoring and analysis
7. Data persistence to PostgreSQL
8. Real-time UI updates via TanStack Query

### Interview Question Generation
1. Skills extracted from resume analysis
2. OpenAI API call with structured prompts
3. Question categorization (Technical/Behavioral/Situational)
4. Difficulty level assignment (Easy/Intermediate/Advanced)
5. Storage in database with user association
6. Frontend display with filtering and search capabilities

### Job Matching Workflow
1. User resume skills compared against job role requirements
2. Percentage match calculation based on skill overlap
3. Skill gap identification and analysis
4. Recommendation generation for career development
5. Dashboard visualization of matches and opportunities

## External Dependencies

### Third-Party Services
- **Firebase**: User authentication and session management
- **OpenAI**: AI-powered text analysis and question generation
- **Neon**: Serverless PostgreSQL database hosting

### Key Libraries
- **Frontend**: React, TanStack Query, Wouter, React Hook Form, Zod
- **Backend**: Express, Drizzle ORM, Multer, pdf-parse, mammoth
- **UI**: Shadcn/ui, Radix UI, Tailwind CSS, Lucide icons
- **Development**: Vite, TypeScript, ESLint, PostCSS

### File Processing
- **PDF Parsing**: pdf-parse library for text extraction
- **Word Documents**: mammoth library for DOC/DOCX processing
- **File Validation**: MIME type checking and size limits
- **Error Handling**: Comprehensive error messages for unsupported formats

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR
- **Database**: Local PostgreSQL or Neon development instance
- **Environment Variables**: Separate configs for dev/staging/production

### Production Build
- **Frontend**: Vite build process generating optimized static assets
- **Backend**: ESBuild compilation for Node.js deployment
- **Database Migrations**: Drizzle Kit for schema management
- **Asset Serving**: Express static file serving for production

### Environment Configuration
- **Firebase**: Project-specific configuration with environment variables
- **OpenAI**: API key management through environment variables
- **Database**: Connection string configuration for different environments
- **CORS**: Environment-specific CORS policies

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 04, 2025. Initial setup