import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Database } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                  <Shield className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground text-lg">
                Your privacy and data security are our top priorities
              </p>
            </div>

            <div className="space-y-6">
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-accent" />
                    Data Collection & Usage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    We collect only the minimum necessary information to provide
                    our secure file sharing services:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      • <strong>Account Information:</strong> Name, email
                      address, and encrypted password
                    </li>
                    <li>
                      • <strong>File Metadata:</strong> File names, sizes,
                      upload dates, and access levels
                    </li>
                    <li>
                      • <strong>Usage Analytics:</strong> Anonymous usage
                      statistics to improve our service
                    </li>
                    <li>
                      • <strong>Security Logs:</strong> Access logs for security
                      monitoring and audit purposes
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-accent" />
                    Data Storage & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Your data is protected with enterprise-grade security
                    measures:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      • <strong>End-to-End Encryption:</strong> All files are
                      encrypted before upload and during storage
                    </li>
                    <li>
                      • <strong>Google Cloud Platform:</strong> Stored in
                      secure, compliant data centers
                    </li>
                    <li>
                      • <strong>Access Controls:</strong> Strict access controls
                      and authentication mechanisms
                    </li>
                    <li>
                      • <strong>Regular Audits:</strong> Continuous security
                      monitoring and vulnerability assessments
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-accent" />
                    Third-Party Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    We use trusted third-party services to provide our platform:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      • <strong>Google Cloud Storage:</strong> For secure file
                      storage and delivery
                    </li>
                    <li>
                      • <strong>Firebase Authentication:</strong> For secure
                      user authentication
                    </li>
                    <li>
                      • <strong>Google OAuth:</strong> For optional social login
                      functionality
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-professional">
                <CardHeader>
                  <CardTitle>Your Rights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    You have complete control over your data:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      • <strong>Access:</strong> Request a copy of all your
                      stored data
                    </li>
                    <li>
                      • <strong>Modification:</strong> Update or correct your
                      personal information
                    </li>
                    <li>
                      • <strong>Deletion:</strong> Delete your account and all
                      associated data
                    </li>
                    <li>
                      • <strong>Portability:</strong> Export your files and data
                      at any time
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-professional">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    For any privacy-related questions or concerns, please
                    contact us:
                  </p>
                  <div className="space-y-2 text-muted-foreground">
                    <p>Email: privacy@internee.pk</p>
                    <p>Email: ahmadsameer0990@gmail.com</p>
                    <p>
                      Built by Sameer for{" "}
                      <a
                        href="https://www.internee.pk/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent/80"
                      >
                        Internee.pk
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12 p-6 border border-border rounded-lg bg-muted/20">
              <p className="text-sm text-muted-foreground">
                Last updated: January 2024 | This privacy policy is effective
                immediately and will remain in effect except with respect to any
                changes in its provisions in the future.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
