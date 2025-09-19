// Replace the content of X:\VS Code\Develop\Dev 3\secure-file-sharing-system\Frontend\src\pages\Dashboard.tsx
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  File,
  Download,
  Share2,
  Lock,
  Globe,
  Shield,
  User,
  Settings,
  LogOut,
  MoreHorizontal,
  Plus,
  FileText,
  Image as ImageIcon,
  Video,
  Archive,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { filesAPI, downloadFileFromBase64 } from "@/lib/api";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Eye, EyeOff } from "lucide-react";

interface UserFile {
  id: string;
  filename: string;
  mimeType: string;
  size: string | number;
  createdAt: string | Date | { toDate: () => Date };
  downloadCount?: number;
  accessLevel: "private" | "public" | "protected";
  shareableLink: string;
}

const DownloadModal = ({ fileId, onClose }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      const response = await filesAPI.downloadFile(fileId, password);
      downloadFileFromBase64(
        response.file.data,
        response.file.filename,
        response.file.mimeType
      );
      toast({
        title: "Download Started",
        description: "File download has started",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Download Failed",
        description:
          error instanceof Error ? error.message : "Failed to download file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="modal fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Enter Password</h3>
        <div className="password-input flex items-center mb-4">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword(!showPassword)}
            className="ml-2"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </Button>
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={handleDownload}>Download</Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [accessLevel, setAccessLevel] = useState<
    "private" | "public" | "protected"
  >("private");
  const [password, setPassword] = useState("");
  const [maxDownloads, setMaxDownloads] = useState("");
  const [expiryHours, setExpiryHours] = useState("");
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<UserFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const fetchFiles = useCallback(
    async (page = 1) => {
      try {
        const response = await filesAPI.getUserFiles(page, 50); // Use 50 as limit
        setFiles(response.files as UserFile[]);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch files",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchFiles(currentPage);
  }, [fetchFiles, currentPage]);

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
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("accessLevel", accessLevel);
        if (password && accessLevel === "protected") {
          formData.append("password", password);
        }
        if (maxDownloads) {
          formData.append("maxDownloads", maxDownloads);
        }
        if (expiryHours) {
          formData.append("expiryHours", expiryHours);
        }
        await filesAPI.upload(formData);
      }
      toast({
        title: "Upload Successful",
        description: `${selectedFiles.length} file(s) uploaded successfully`,
      });
      setSelectedFiles([]);
      setPassword("");
      setMaxDownloads("");
      setExpiryHours("");
      fetchFiles(currentPage); // Refresh the file list
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to upload files";
      toast({
        title: "Upload Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (fileId: string, needsPassword: boolean = false) => {
    if (needsPassword) {
      setSelectedFileId(fileId);
      setIsModalOpen(true);
    } else {
      downloadFile(fileId);
    }
  };

  const downloadFile = async (fileId: string) => {
    try {
      const response = await filesAPI.downloadFile(fileId);
      downloadFileFromBase64(
        response.file.data,
        response.file.filename,
        response.file.mimeType
      );
      toast({
        title: "Download Started",
        description: "File download has started",
      });
      fetchFiles(currentPage); // Refresh to update download count
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to download file";
      toast({
        title: "Download Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      await filesAPI.deleteFile(fileId);
      toast({
        title: "File Deleted",
        description: "File has been deleted successfully",
      });
      fetchFiles(currentPage); // Refresh the file list
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete file";
      toast({
        title: "Delete Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link || "").then(
      () => {
        toast({ title: "Success", description: "Link copied to clipboard!" });
      },
      () => {
        toast({
          title: "Error",
          description: "Failed to copy link to clipboard!",
          variant: "destructive",
        });
      }
    );
  };

  const getFileIcon = (type: string) => {
    if (type.includes("image")) return <ImageIcon className="w-5 h-5" />;
    if (type.includes("video")) return <Video className="w-5 h-5" />;
    if (type.includes("pdf")) return <FileText className="w-5 h-5" />;
    if (type.includes("zip") || type.includes("rar"))
      return <Archive className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const getAccessLevelBadge = (level: string) => {
    switch (level) {
      case "private":
        return (
          <Badge variant="secondary" className="gap-1">
            <Lock className="w-3 h-3" />
            Private
          </Badge>
        );
      case "public":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-green-500 text-green-400"
          >
            <Globe className="w-3 h-3" />
            Public
          </Badge>
        );
      case "protected":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-yellow-500 text-yellow-400"
          >
            <Shield className="w-3 h-3" />
            Protected
          </Badge>
        );
      default:
        return null;
    }
  };

  const privateFiles = files.filter((file) => file.accessLevel === "private");
  const publicFiles = files.filter((file) => file.accessLevel === "public");
  const protectedFiles = files.filter(
    (file) => file.accessLevel === "protected"
  );

  const handleLogout = async () => {
    await logout();
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchFiles(newPage);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loading-spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Manage your secure files</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user?.profile?.profilePicture}
                      alt="User"
                    />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                      {user?.profile?.firstName?.[0]}
                      {user?.profile?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Files
                  </CardTitle>
                  <CardDescription>
                    Drag and drop files or click to select
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Access Level
                    </label>
                    <Tabs
                      value={accessLevel}
                      onValueChange={(value) =>
                        setAccessLevel(
                          value as "private" | "public" | "protected"
                        )
                      }
                    >
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="private" className="text-xs">
                          Private
                        </TabsTrigger>
                        <TabsTrigger value="public" className="text-xs">
                          Public
                        </TabsTrigger>
                        <TabsTrigger value="protected" className="text-xs">
                          Protected
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  {accessLevel === "protected" && (
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-professional"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="maxDownloads" className="text-xs">
                        Max Downloads
                      </Label>
                      <Input
                        id="maxDownloads"
                        type="number"
                        placeholder="Unlimited"
                        value={maxDownloads}
                        onChange={(e) => setMaxDownloads(e.target.value)}
                        className="input-professional"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiryHours" className="text-xs">
                        Expires (hours)
                      </Label>
                      <Input
                        id="expiryHours"
                        type="number"
                        placeholder="Never"
                        value={expiryHours}
                        onChange={(e) => setExpiryHours(e.target.value)}
                        className="input-professional"
                      />
                    </div>
                  </div>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drop files here or click to browse
                    </p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button asChild variant="professional" size="sm">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Choose Files
                      </label>
                    </Button>
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        Selected Files:
                      </p>
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-muted rounded"
                        >
                          {getFileIcon(file.type)}
                          <span className="text-sm text-foreground truncate">
                            {file.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(1)}MB
                          </span>
                        </div>
                      ))}
                      <Button
                        variant="hero"
                        size="sm"
                        className="w-full"
                        onClick={handleUpload}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <div className="loading-spinner w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        {uploading ? "Uploading..." : "Upload Files"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle>Your Files</CardTitle>
                  <CardDescription>
                    Manage and share your uploaded files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="private">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="private">
                        Private ({privateFiles.length})
                      </TabsTrigger>
                      <TabsTrigger value="public">
                        Public ({publicFiles.length})
                      </TabsTrigger>
                      <TabsTrigger value="protected">
                        Protected ({protectedFiles.length})
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="private" className="space-y-4">
                      {privateFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors"
                        >
                          <div className="text-muted-foreground">
                            {getFileIcon(file.mimeType)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="font-medium text-foreground">
                              {file.filename}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{file.size}</span>
                              <span>
                                {typeof file.createdAt === "object" &&
                                "toDate" in file.createdAt
                                  ? new Date(
                                      file.createdAt.toDate()
                                    ).toLocaleDateString()
                                  : new Date(
                                      file.createdAt
                                    ).toLocaleDateString()}
                              </span>
                              {getAccessLevelBadge(file.accessLevel)}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleDownload(file.id)}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => copyLink(file.shareableLink)}
                              >
                                <Share2 className="mr-2 h-4 w-4" />
                                Copy Link
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(file.id)}
                                className="text-destructive"
                              >
                                <span className="mr-2">🗑️</span>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                      {privateFiles.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No private files yet. Upload your first file!
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="public" className="space-y-4">
                      {publicFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors"
                        >
                          <div className="text-muted-foreground">
                            {getFileIcon(file.mimeType)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="font-medium text-foreground">
                              {file.filename}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{file.size}</span>
                              <span>{file.downloadCount} downloads</span>
                              {getAccessLevelBadge(file.accessLevel)}
                            </div>
                            <p className="text-xs text-accent font-mono break-all">
                              {file.shareableLink}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleDownload(file.id)}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => copyLink(file.shareableLink)}
                              >
                                <Share2 className="mr-2 h-4 w-4" />
                                Copy Link
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(file.id)}
                                className="text-destructive"
                              >
                                <span className="mr-2">🗑️</span>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                      {publicFiles.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No public files yet. Upload files with public access!
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="protected" className="space-y-4">
                      {protectedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors"
                        >
                          <div className="text-muted-foreground">
                            {getFileIcon(file.mimeType)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="font-medium text-foreground">
                              {file.filename}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{file.size}</span>
                              <span>{file.downloadCount} downloads</span>
                              {getAccessLevelBadge(file.accessLevel)}
                            </div>
                            <p className="text-xs text-accent font-mono break-all">
                              {file.shareableLink}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleDownload(file.id, true)}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => copyLink(file.shareableLink)}
                              >
                                <Share2 className="mr-2 h-4 w-4" />
                                Copy Link
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(file.id)}
                                className="text-destructive"
                              >
                                <span className="mr-2">🗑️</span>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                      {protectedFiles.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No protected files yet. Upload files with password
                          protection!
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                  {/* Pagination Controls */}
                  {files.length > 0 && (
                    <div className="flex justify-center mt-4 gap-2">
                      <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {currentPage}
                      </span>
                      <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={files.length < 50} // Disable if less than limit
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {isModalOpen && selectedFileId && (
        <DownloadModal
          fileId={selectedFileId}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedFileId(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
