import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Target, TrendingUp } from "lucide-react";
import type { JobMatch, JobRole } from "@shared/schema";

interface JobMatchWithRole extends JobMatch {
  jobRole: JobRole;
}

export function JobMatcher() {
  const { data: jobMatches, isLoading } = useQuery<JobMatchWithRole[]>({
    queryKey: ['/api/job-matches/recent'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Job Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!jobMatches || jobMatches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Job Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Target className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No job matches yet</p>
            <p className="text-sm">Upload a resume to find matching job roles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 80) return "bg-yellow-500";
    if (percentage >= 70) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Job Matches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobMatches.slice(0, 3).map((match) => (
            <div key={match.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-secondary text-sm">
                  {match.jobRole.title}
                </h4>
                <Badge 
                  className={`text-white text-xs ${getMatchColor(match.matchPercentage)}`}
                >
                  {match.matchPercentage}%
                </Badge>
              </div>
              
              {match.jobRole.description && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                  {match.jobRole.description}
                </p>
              )}
              
              {match.jobRole.experienceLevel && (
                <div className="mb-3">
                  <Badge variant="outline" className="text-xs">
                    {match.jobRole.experienceLevel} Level
                  </Badge>
                </div>
              )}

              {match.missingSkills && match.missingSkills.length > 0 && (
                <div className="text-xs text-gray-600">
                  <p className="mb-1">Missing Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {match.missingSkills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="text-red-500 bg-red-50 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                    {match.missingSkills.length > 3 && (
                      <span className="text-gray-500 text-xs">
                        +{match.missingSkills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full mt-4 text-primary hover:text-blue-700"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          View All Matches →
        </Button>
      </CardContent>
    </Card>
  );
}
