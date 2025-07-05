import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResumeUpload } from "@/components/resume-upload";
import { SkillDisplay } from "@/components/skill-display";
import { JobMatcher } from "@/components/job-matcher";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { signOut } from "@/lib/auth";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Brain, FileText, Settings, Bell, ChevronDown,
  BarChart3, Target, BookOpen, Upload,
  HelpCircle, Star
} from "lucide-react";
import type { Resume, InterviewQuestion, JobMatch } from "@shared/schema";

interface DashboardStats {
  resumeCount: number;
  skillCount: number;
  questionCount: number;
  averageScore: number;
}

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: recentResumes, isLoading: resumesLoading } = useQuery<Resume[]>({
    queryKey: ['/api/resumes/recent'],
  });

  const { data: recentQuestions, isLoading: questionsLoading } = useQuery<InterviewQuestion[]>({
    queryKey: ['/api/interview-questions/recent'],
  });

  const generateQuestions = useMutation({
    mutationFn: () => apiRequest("POST", "/api/interview-questions/generate"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/interview-questions/recent'] });
      toast({
        title: "Success",
        description: "New interview questions generated.",
      });
    },
    onError: () => {
      toast({
        title: "Failed",
        description: "Could not generate new questions.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) navigate("/");
      else setCurrentUser(user);
    });
    return () => unsubscribe();
  }, [navigate]);

  const getInitials = (name?: string) =>
    name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mr-3">
              <Brain className="text-white h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-secondary">AI Interview Prep</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm"><Bell className="h-4 w-4" /></Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {getInitials(currentUser.displayName || "User")}
                </span>
              </div>
              <span className="text-sm font-medium text-textDark">
                {currentUser.displayName || currentUser.email}
              </span>
              <Button variant="ghost" size="sm" onClick={async () => {
                await signOut(); navigate("/");
              }}>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white h-screen shadow-sm">
          <nav className="mt-6 px-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start text-primary bg-blue-50">
              <BarChart3 className="mr-3 h-4 w-4" /> Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start text-gray-600 hover:bg-gray-50" onClick={() => navigate("/resumes")}> <FileText className="mr-3 h-4 w-4" /> My Resumes </Button>
            <Button variant="ghost" className="w-full justify-start text-gray-600 hover:bg-gray-50" onClick={() => navigate("/interviewquestions")}> <HelpCircle className="mr-3 h-4 w-4" /> Interview Questions </Button>
            <Button variant="ghost" className="w-full justify-start text-gray-600 hover:bg-gray-50" onClick={() => navigate("/jobmatching")}> <Target className="mr-3 h-4 w-4" /> Job Matching </Button>
            <Button variant="ghost" className="w-full justify-start text-gray-600 hover:bg-gray-50" onClick={() => navigate("/skillanalysis")}> <BarChart3 className="mr-3 h-4 w-4" /> Skill Analysis </Button>
            <Button variant="ghost" className="w-full justify-start text-gray-600 hover:bg-gray-50" onClick={() => navigate("/learningpath")}> <BookOpen className="mr-3 h-4 w-4" /> Learning Path </Button>
            <Button variant="ghost" className="w-full justify-start text-gray-600 hover:bg-gray-50" onClick={() => navigate("/settings")}> <Settings className="mr-3 h-4 w-4" /> Settings </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">Welcome Back, {currentUser.displayName?.split(" ")[0] || "User"}!</h1>
          <p className="text-gray-600 mb-8">Here's your career development progress overview</p>

          {/* Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[{
              title: "Resumes Uploaded",
              value: stats?.resumeCount || 0,
              icon: <FileText className="text-primary h-5 w-5" />, bg: "bg-blue-100"
            }, {
              title: "Skills Identified",
              value: stats?.skillCount || 0,
              icon: <Settings className="text-accent h-5 w-5" />, bg: "bg-green-100"
            }, {
              title: "Questions Generated",
              value: stats?.questionCount || 0,
              icon: <HelpCircle className="text-purple-600 h-5 w-5" />, bg: "bg-purple-100"
            }, {
              title: "Average Score",
              value: (stats?.averageScore || 0).toFixed(1),
              icon: <Star className="text-yellow-600 h-5 w-5" />, bg: "bg-yellow-100"
            }].map((card, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                      <p className="text-3xl font-bold text-secondary">
                        {statsLoading ? <LoadingSpinner size="sm" /> : card.value}
                      </p>
                    </div>
                    <div className={`w-12 h-12 ${card.bg} rounded-lg flex items-center justify-center`}>
                      {card.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader><CardTitle>Upload New Resume</CardTitle></CardHeader>
              <CardContent><ResumeUpload /></CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Recent Resumes</CardTitle></CardHeader>
              <CardContent>
                {resumesLoading ? (
                  <div className="py-4 flex justify-center"><LoadingSpinner /></div>
                ) : recentResumes?.length ? (
                  <div className="space-y-3">
                    {recentResumes.slice(0, 3).map((r) => (
                      <div key={r.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="text-red-500 mr-3 h-4 w-4" />
                          <div>
                            <p className="font-medium">{r.filename}</p>
                            <p className="text-sm text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{r.overallScore}/10</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Upload className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                    No resumes uploaded
                  </div>
                )}
                <Button variant="ghost" className="w-full mt-4" onClick={() => navigate("/resumes")}>View All Resumes →</Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2"><SkillDisplay /></div>
            <div><JobMatcher /></div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Interview Questions</CardTitle>
                <Button onClick={() => generateQuestions.mutate()} disabled={generateQuestions.isPending}>
                  {generateQuestions.isPending ? <LoadingSpinner size="sm" /> : "Generate New Questions"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {questionsLoading ? (
                <div className="py-4 flex justify-center"><LoadingSpinner /></div>
              ) : recentQuestions?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recentQuestions.slice(0, 4).map((q) => (
                    <div key={q.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <Badge>{q.skill}</Badge>
                        <span className="text-xs text-gray-500">{q.difficulty}</span>
                      </div>
                      <p className="text-sm font-medium text-secondary mb-1 line-clamp-3">{q.question}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{q.category}</span>
                        <Button variant="ghost" size="sm">Save</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <HelpCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>No questions yet</p>
                </div>
              )}
              <Button variant="ghost" className="w-full mt-4 text-primary hover:text-blue-700" onClick={() => navigate("/interviewquestions")}>
                View All Questions →
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
