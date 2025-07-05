// src/pages/SkillAnalysis.tsx
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function SkillAnalysis() {
  const { data: skills, isLoading } = useQuery<string[]>({
    queryKey: ["/api/skills/analysis"],
  });

  return (
    <div className="min-h-screen p-8 bg-background">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <BarChart3 className="text-primary h-6 w-6" />
            Skill Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <LoadingSpinner />
            </div>
          ) : skills && skills.length > 0 ? (
            <div className="space-y-4">
              <p className="text-gray-600">Identified skills from your resumes:</p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center">
              No skills available. Upload a resume to start analysis.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
