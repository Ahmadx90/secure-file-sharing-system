import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Shield,
  Download,
  Lock,
  File,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { filesAPI, downloadFileFromBase64 } from "@/lib/api";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

interface FileInfo {
  filename: string;
  size: string | number;
  createdAt: string | Date;
  accessLevel: "public" | "protected" | "private";
  owner?: { name?: string };
  // Add other properties as needed
}

const FileDownload = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [error, setError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        const response = await filesAPI.getFileInfo(fileId);
        setFileInfo(response.file);
      } catch (err) {
        setError("File not found or access denied");
      } finally {
        setInitialLoading(false);
      }
    };
    if (fileId) {
      fetchFileInfo();
    }
  }, [fileId]);

  const handleDownload = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await filesAPI.downloadFile(fileId, password || null);
      downloadFileFromBase64(
        response.file.data,
        response.file.filename,
        response.file.mimeType
      );

      toast({
        title: "Download Started",
        description: "File download has started successfully",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download file");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="loading-spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error && !fileInfo) {
    return (
      <div className="min-h-screen bg-gradient-hero flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <Card className="card-professional shadow-card max-w-md w-full">
            <CardHeader className="text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <CardTitle className="text-destructive">File Not Found</CardTitle>
              <CardDescription>
                The requested file could not be found or you don't have
                permission to access it.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const requiresPassword = fileInfo?.accessLevel === "protected";

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <Card className="card-professional shadow-card">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                  <Shield className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Secure File Download
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Download shared file securely
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* File Information */}
              {fileInfo && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg border border-border">
                    <File className="w-8 h-8 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {fileInfo.filename}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{fileInfo.size}</span>
                        <span>
                          {new Date(fileInfo.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Access Level Badge */}
                  <div className="flex justify-center">
                    {fileInfo.accessLevel === "public" ? (
                      <Badge
                        variant="outline"
                        className="gap-1 border-green-500 text-green-400"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Public File
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="gap-1 border-yellow-500 text-yellow-400"
                      >
                        <Lock className="w-3 h-3" />
                        Protected File
                      </Badge>
                    )}
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    Shared by{" "}
                    <span className="font-medium">
                      {fileInfo.owner?.name || "Anonymous"}
                    </span>
                  </div>
                </div>
              )}

              {requiresPassword && (
                <div className="space-y-4">
                  <div className="text-center">
                    <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      This file is protected. Please enter the password to
                      download.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-foreground font-medium"
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter file password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-professional"
                    />
                    {error && (
                      <p className="text-destructive text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {error}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <Button
                onClick={handleDownload}
                variant="hero"
                size="lg"
                className="w-full"
                disabled={loading || (requiresPassword && !password.trim())}
              >
                {loading ? (
                  <div className="loading-spinner w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {loading ? "Downloading..." : "Download File"}
              </Button>

              {/* Security Notice */}
              <div className="text-center text-xs text-muted-foreground border-t border-border pt-4">
                <p>🔒 This download is secured with end-to-end encryption</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FileDownload;
