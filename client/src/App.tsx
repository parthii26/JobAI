import { Switch, Route } from "wouter";
import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "@/lib/firebase";
import { User } from "firebase/auth";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Resumes from "@/pages/resumes";
import JobMatching from "@/pages/JobMatching";
import InterviewQuestions from "@/pages/interviewquestions";
import { LearningPath } from "@/pages/Learningpath";
import { SkillAnalysis } from "@/pages/skillanalysis";
import { SettingsPage } from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/resumes">
        <ProtectedRoute component={Resumes} />
      </Route>
      <Route path="/jobmatching">
        <ProtectedRoute component={JobMatching} />
      </Route>
      <Route path="/skillanalysis">
        <ProtectedRoute component={SkillAnalysis} />
      </Route>
      <Route path="/learningpath">
        <ProtectedRoute component={LearningPath} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={SettingsPage} />
      </Route>
      <Route path="/interviewquestions">
        <ProtectedRoute component={InterviewQuestions} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
