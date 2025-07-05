import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ResumeUpload } from "@/components/resume-upload";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FileText, Download, Trash2, Eye } from "lucide-react";
import type { Resume } from "@shared/schema";

export default function Resumes() {
  const { toast } = useToast();

  const { data: resumes, isLoading } = useQuery<Resume[]>({
    queryKey: ['/api/resumes'],
  });

  const deleteResumeMutation = useMutation({
    mutationFn: (resumeId: number) => apiRequest("DELETE", `/api/resumes/${resumeId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Resume deleted",
        description: "The resume has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (resumeId: number) => {
    if (confirm("Are you sure you want to delete this resume?")) {
      deleteResumeMutation.mutate(resumeId);
    }
  };

  const handleDownload = async (resumeId: number, filename: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}/download`, {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary mb-2">My Resumes</h1>
          <p className="text-gray-600">Manage your uploaded resumes and view analysis results</p>
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload New Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResumeUpload />
          </CardContent>
        </Card>

        {/* Resumes List */}
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Resumes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : resumes && resumes.length > 0 ? (
              <div className="space-y-4">
                {resumes.map((resume) => (
                  <div key={resume.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <FileText className="text-red-500 h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-secondary mb-2">
                            {resume.filename}
                          </h3>
                          <div className="flex items-center space-x-4 mb-4">
                            <span className="text-sm text-gray-500">
                              Uploaded: {new Date(resume.createdAt).toLocaleDateString()}
                            </span>
                            <Badge variant="outline">
                              Overall Score: {resume.overallScore}/10
                            </Badge>
                            <Badge variant="outline">
                              Skills: {resume.extractedSkills?.length || 0}
                            </Badge>
                          </div>
                          
                          {/* Skills Preview */}
                          {resume.extractedSkills && resume.extractedSkills.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Extracted Skills:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {resume.extractedSkills.slice(0, 10).map((skill, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {resume.extractedSkills.length > 10 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{resume.extractedSkills.length - 10} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Score Breakdown */}
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Skill Match:</span>
                              <span className="ml-2 font-medium">
                                {resume.skillMatchPercentage}%
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Format Quality:</span>
                              <span className="ml-2 font-medium">
                                {resume.formatQuality}/10
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Keyword Density:</span>
                              <span className="ml-2 font-medium">
                                {resume.keywordDensity}/10
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(resume.id, resume.filename)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(resume.id)}
                          disabled={deleteResumeMutation.isPending}
                        >
                          {deleteResumeMutation.isPending ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes uploaded</h3>
                <p className="text-gray-500 mb-4">
                  Upload your first resume to get started with AI-powered analysis
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
