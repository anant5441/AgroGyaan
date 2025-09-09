import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const quickLinks = [
    { name: "Home", href: "#home" },
    { name: "Feedback", href: "#feedback" },
    { name: "AI Assistant", href: "#ai-assistant" },
    { name: "Community", href: "#community" },
    { name: "Support", href: "#support" }
  ];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "#facebook", color: "hover:text-blue-600" },
    { name: "Twitter", icon: Twitter, href: "#twitter", color: "hover:text-blue-400" },
    { name: "Instagram", icon: Instagram, href: "#instagram", color: "hover:text-pink-500" },
    { name: "LinkedIn", icon: Linkedin, href: "#linkedin", color: "hover:text-blue-700" }
  ];

  return (
    <footer className="bg-gradient-to-b from-background to-muted/20 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                <span className="text-lg font-bold text-primary-foreground">🌱</span>
              </div>
              <span className="text-xl font-bold text-foreground">AGROGYAAN</span>
            </div>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              Empowering farmers with AI-driven insights and smart farming solutions. 
              Join thousands of farmers who are already transforming their agricultural practices with AGROGYAAN.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mr-2" />
                <span>contact@agrogyaan.com</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mr-2" />
                <span>+91 9876543210</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                <span>India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Connect With Us</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className={`p-2 rounded-lg bg-muted hover:bg-accent transition-colors ${social.color}`}
                    aria-label={social.name}
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
            <div className="pt-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Newsletter</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Get the latest updates on farming technology and market insights.
              </p>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="px-4 py-2 bg-gradient-primary text-primary-foreground text-sm rounded-md hover:opacity-90 transition-opacity">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2025 AGROGYAAN Agriculture Ecosystem. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#cookies" className="hover:text-primary transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}