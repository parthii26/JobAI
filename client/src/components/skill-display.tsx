import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Settings, Code, Users } from "lucide-react";
import type { Resume } from "@shared/schema";

interface SkillsData {
  technicalSkills: string[];
  softSkills: string[];
  totalSkillsCount: number;
}

export function SkillDisplay() {
  const { data: skillsData, isLoading } = useQuery<SkillsData>({
    queryKey: ['/api/skills/overview'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Extracted Skills Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!skillsData || skillsData.totalSkillsCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Extracted Skills Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Settings className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No skills extracted yet</p>
            <p className="text-sm">Upload a resume to see your skills analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extracted Skills Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Technical Skills */}
        {skillsData.technicalSkills.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Code className="h-4 w-4 text-primary mr-2" />
                <span className="text-sm font-medium text-gray-700">Technical Skills</span>
              </div>
              <span className="text-sm text-gray-500">
                {skillsData.technicalSkills.length} identified
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {skillsData.technicalSkills.map((skill, index) => (
                <Badge key={index} className="bg-blue-100 text-primary hover:bg-blue-200">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Soft Skills */}
        {skillsData.softSkills.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-accent mr-2" />
                <span className="text-sm font-medium text-gray-700">Soft Skills</span>
              </div>
              <span className="text-sm text-gray-500">
                {skillsData.softSkills.length} identified
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {skillsData.softSkills.map((skill, index) => (
                <Badge key={index} className="bg-green-100 text-accent hover:bg-green-200">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Skills Summary */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Skills Identified:</span>
            <span className="font-semibold text-secondary">
              {skillsData.totalSkillsCount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
