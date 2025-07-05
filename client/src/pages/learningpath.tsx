// src/pages/LearningPath.tsx
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LearningItem {
  id: string;
  title: string;
  description: string;
  skillTag: string;
  link: string;
}

export function LearningPath() {
  const { data: resources, isLoading } = useQuery<LearningItem[]>({
    queryKey: ["/api/learning-path"],
  });

  return (
    <div className="min-h-screen p-8 bg-background">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <BookOpen className="text-primary h-6 w-6" />
            Personalized Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <LoadingSpinner />
            </div>
          ) : resources && resources.length > 0 ? (
            <div className="space-y-6">
              {resources.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 border rounded-lg p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-secondary mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <Badge variant="outline">{item.skillTag}</Badge>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => window.open(item.link, "_blank")}
                    >
                      Learn →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">
              No learning content available. Analyze skills or upload resumes to get suggestions.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
