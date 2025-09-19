import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Upload, Share2, Lock, Globe, Shield } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const Help = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                  <HelpCircle className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Help Center
              </h1>
              <p className="text-muted-foreground text-lg">
                Everything you need to know about secure file sharing
              </p>
            </div>

            <div className="space-y-6">
              {/* Getting Started */}
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-accent" />
                    Getting Started
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="account">
                      <AccordionTrigger>
                        How do I create an account?
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">
                          You can create an account in two ways:
                        </p>
                        <ol className="list-decimal list-inside mt-2 space-y-1 text-muted-foreground">
                          <li>
                            Click "Sign Up" and fill in your details with a
                            secure password
                          </li>
                          <li>
                            Use "Continue with Google" for quick registration
                          </li>
                        </ol>
                        <p className="text-muted-foreground mt-2">
                          Your password must contain at least 8 characters,
                          including uppercase, lowercase, numbers, and special
                          characters.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="upload">
                      <AccordionTrigger>
                        How do I upload files?
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">
                          There are two easy ways to upload files:
                        </p>
                        <ol className="list-decimal list-inside mt-2 space-y-1 text-muted-foreground">
                          <li>
                            Drag and drop files directly onto the upload area
                          </li>
                          <li>
                            Click "Choose Files" to browse and select files from
                            your device
                          </li>
                        </ol>
                        <p className="text-muted-foreground mt-2">
                          You can upload multiple files at once and choose their
                          access level before uploading.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* File Access Levels */}
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-accent" />
                    Understanding Access Levels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="private">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Private Files
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">
                          Private files are only accessible to you. They're
                          perfect for:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                          <li>Personal documents and files</li>
                          <li>Backup storage for important files</li>
                          <li>Documents you want to access from anywhere</li>
                        </ul>
                        <p className="text-muted-foreground mt-2">
                          Only you can view, download, or share these files.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="public">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Public Files
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">
                          Public files can be accessed by anyone with the share
                          link:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                          <li>No password or token required</li>
                          <li>Perfect for sharing with large groups</li>
                          <li>Can be accessed without an account</li>
                        </ul>
                        <p className="text-muted-foreground mt-2 text-amber-600">
                          <strong>Caution:</strong> Anyone with the link can
                          download these files.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="protected">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Protected Files
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">
                          Protected files require a special access token:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                          <li>A unique token is generated for each file</li>
                          <li>You share the token separately from the link</li>
                          <li>Perfect for confidential documents</li>
                          <li>Adds an extra layer of security</li>
                        </ul>
                        <p className="text-muted-foreground mt-2">
                          Recipients need both the link AND the token to access
                          the file.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Sharing Files */}
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-accent" />
                    Sharing Files
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="share-public">
                      <AccordionTrigger>
                        How do I share public files?
                      </AccordionTrigger>
                      <AccordionContent>
                        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                          <li>Upload a file with "Public" access level</li>
                          <li>Find the file in your Public files tab</li>
                          <li>Click the menu (⋯) and select "Copy Link"</li>
                          <li>Share the link with anyone you want</li>
                        </ol>
                        <p className="text-muted-foreground mt-2">
                          Recipients can access the file immediately without
                          creating an account.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="share-protected">
                      <AccordionTrigger>
                        How do I share protected files?
                      </AccordionTrigger>
                      <AccordionContent>
                        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                          <li>Upload a file with "Protected" access level</li>
                          <li>Note the generated access token for the file</li>
                          <li>Click "Share Token" to get the download link</li>
                          <li>
                            Send the link AND token to your recipient separately
                          </li>
                        </ol>
                        <p className="text-muted-foreground mt-2">
                          <strong>Security tip:</strong> Send the link and token
                          through different communication channels for maximum
                          security.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Security */}
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle>Security & Encryption</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="encryption">
                      <AccordionTrigger>
                        How secure are my files?
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">
                          Your files are protected with enterprise-grade
                          security:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                          <li>End-to-end encryption for all files</li>
                          <li>Secure storage on Google Cloud Platform</li>
                          <li>Encrypted file transmission</li>
                          <li>Regular security audits and monitoring</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="access-control">
                      <AccordionTrigger>
                        Who can access my files?
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li>
                            <strong>Private files:</strong> Only you can access
                            them
                          </li>
                          <li>
                            <strong>Public files:</strong> Anyone with the share
                            link
                          </li>
                          <li>
                            <strong>Protected files:</strong> Anyone with both
                            the link and token
                          </li>
                        </ul>
                        <p className="text-muted-foreground mt-2">
                          You have complete control over who can access your
                          files through the access level you choose.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>

            {/* Contact Support */}
            <Card className="card-professional mt-8">
              <CardHeader>
                <CardTitle>Still Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Can't find the answer you're looking for? Our support team is
                  here to help.
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p>Email: support@internee.pk</p>
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
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Help;
