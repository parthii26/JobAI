// src/pages/JobMatching.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Target, BarChart3, BookOpen, Settings } from "lucide-react";

export default function JobMatching() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/job-matches"],
  });

  return (
    <div className="min-h-screen p-8 bg-background">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Target className="text-primary h-6 w-6" /> Job Matching
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <p className="text-gray-600">Job matching results will be displayed here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// src/pages/SkillAnalysis.tsx
export function SkillAnalysis() {
  return (
    <div className="min-h-screen p-8 bg-background">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <BarChart3 className="text-primary h-6 w-6" /> Skill Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Skill insights and analysis will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// src/pages/LearningPath.tsx
export function LearningPath() {
  return (
    <div className="min-h-screen p-8 bg-background">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <BookOpen className="text-primary h-6 w-6" /> Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Recommended learning content will be shown here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// src/pages/Settings.tsx
export function SettingsPage() {
  return (
    <div className="min-h-screen p-8 bg-background">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Settings className="text-primary h-6 w-6" /> Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">User preferences and configuration will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
