import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { auth } from "@/lib/firebase";

interface UploadResponse {
  success: boolean;
  resumeId: number;
  message: string;
}

export function ResumeUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append('resume', file);

      const token = await auth.currentUser?.getIdToken();

      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch('/api/resumes/upload', {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setUploadingFile(null);
      setUploadProgress(0);
      toast({
        title: "Resume uploaded successfully!",
        description: "Your resume is being processed for skill extraction.",
      });
    },
    onError: (error: Error) => {
      setUploadingFile(null);
      setUploadProgress(0);
      toast({
        title: "Upload failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOC, or DOCX file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingFile(file.name);
    setUploadProgress(0);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    uploadMutation.mutate(file);
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  if (uploadingFile) {
    return (
      <div className="border-2 border-primary rounded-lg p-8 text-center">
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              Processing {uploadingFile}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Extracting skills and analyzing content...
            </p>
            <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragActive
            ? "border-primary bg-blue-50"
            : "border-gray-300 hover:border-primary hover:bg-gray-50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className="h-12 w-12 text-gray-400" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop your resume here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse (PDF, DOC, DOCX)
            </p>
            <Button 
              type="button"
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                "Choose File"
              )}
            </Button>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx"
        onChange={handleFileInput}
      />

      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <div className="flex items-center">
          <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
          <span>Supported formats: PDF, DOC, DOCX</span>
        </div>
        <div className="flex items-center">
          <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
          <span>Maximum file size: 10MB</span>
        </div>
        <div className="flex items-center">
          <AlertCircle className="h-3 w-3 text-blue-500 mr-2" />
          <span>Files are processed securely and automatically deleted after analysis</span>
        </div>
      </div>
    </div>
  );
}
