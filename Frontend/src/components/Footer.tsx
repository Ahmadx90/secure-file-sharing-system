import { Link } from "react-router-dom";
import { Shield, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Secure File Share
              </span>
            </div>
            <p className="text-muted-foreground text-sm mb-4 max-w-md">
              Enterprise-grade file sharing platform with end-to-end encryption,
              built for professionals who value security and privacy.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/help"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  Support
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/terms"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/security"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  Security
                </Link>
              </li>
              <li>
                <Link
                  to="/compliance"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright & Credits */}
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground mb-2">
                © 2024 Secure File Share System. All rights reserved.
              </p>
              <div className="flex items-center justify-center md:justify-start gap-1 text-sm">
                <span className="text-muted-foreground">Built </span>

                <span className="text-muted-foreground">by</span>
                <span className="text-accent font-semibold">Sameer</span>
                <span className="text-muted-foreground">for</span>
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

            {/* Additional Info */}
            <div className="text-center md:text-right">
              <p className="text-xs text-muted-foreground">
                Powered by Google Cloud Platform
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
