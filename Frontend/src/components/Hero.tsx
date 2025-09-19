import { Button } from "@/components/ui/button";
import { Shield, Lock, Cloud } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${heroBg})` }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy/80 via-navy/60 to-navy-light/80"></div>

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Main Hero Card */}
        <div className="card-professional max-w-4xl mx-auto p-12 rounded-2xl fade-in">
          {/* Logo/Icon Section */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                <Shield className="w-12 h-12 text-primary-foreground" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <Lock className="w-4 h-4 text-accent-foreground" />
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl font-bold text-foreground mb-6">
            Secure File <span className="text-neon">Share System</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
            Enterprise-grade file sharing with end-to-end encryption, secure
            cloud storage, and advanced access controls.
          </p>

          {/* Features List */}
          <div className="flex justify-center items-center gap-8 mb-10 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-accent" />
              <span>End-to-End Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-accent" />
              <span>Google Cloud Storage</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent" />
              <span>Advanced Security</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild variant="hero" size="xl" className="min-w-48">
              <Link to="/login">Get Started</Link>
            </Button>
            <Button
              asChild
              variant="professional"
              size="xl"
              className="min-w-48"
            >
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-4">
              Trusted by professionals worldwide
            </p>
            <div className="flex justify-center items-center gap-2 text-xs text-muted-foreground">
              <span>Built for</span>
              <a
                href="https://www.internee.pk/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent/80 font-semibold transition-colors"
              >
                Internee.pk
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
