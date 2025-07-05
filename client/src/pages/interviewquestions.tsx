import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { HelpCircle, RefreshCw, Trash2 } from "lucide-react";
import type { InterviewQuestion } from "@shared/schema";

export default function InterviewQuestions() {
  const { toast } = useToast();

  const { data: questions, isLoading } = useQuery<InterviewQuestion[]>({
    queryKey: ['/api/interview-questions'],
    queryFn: () => apiRequest("GET", "/api/interview-questions").then(res => res.json()),
  });

  const deleteMutation = useMutation({
    mutationFn: (questionId: number) => apiRequest("DELETE", `/api/interview-questions/${questionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/interview-questions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Question deleted",
        description: "The interview question has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete question. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/interview-questions/generate"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/interview-questions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Questions generated",
        description: "New questions have been added based on your latest skills.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this question?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary mb-2">Interview Questions</h1>
          <p className="text-gray-600">Review and manage your AI-generated interview questions</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Generated Questions</CardTitle>
            <Button 
              variant="outline" 
              onClick={() => generateMutation.mutate()} 
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? <LoadingSpinner size="sm" /> : <><RefreshCw className="h-4 w-4 mr-2" /> Generate New</>}
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : questions && questions.length > 0 ? (
              <div className="space-y-4">
                {questions.map((q) => (
                  <div key={q.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Badge>{q.skill}</Badge>
                      <span className="text-sm text-gray-500">{q.difficulty}</span>
                    </div>
                    <p className="font-medium text-secondary mb-2">{q.question}</p>
                    <div className="text-sm text-gray-500 mb-4">Category: {q.category}</div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(q.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? <LoadingSpinner size="sm" /> : <><Trash2 className="h-4 w-4 mr-2" /> Delete</>}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <HelpCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                <p className="text-gray-500 mb-4">Click "Generate New" to create interview questions from your latest skills.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
