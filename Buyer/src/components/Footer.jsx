import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Heart, Leaf, Users, MapPin } from 'lucide-react';

const Footer = () => {
  const footerLinks = [
    { label: 'About', href: '#',icon: Users },
    { label: 'Contact', href: '#', icon: MapPin },
    { label: 'Terms', href: '#', icon: null },
    { label: 'Privacy', href: '#',  icon: null },
  ];

  const socialLinks = [
    { label: 'Facebook', href: '#' },
    { label: 'Twitter', href: '#' },
    { label: 'Instagram', href: '#' },
    { label: 'LinkedIn', href: '#' },
  ];

  return (
    <footer className="bg-gradient-to-br from-background-soft via-card to-background border-t border-border/30 mt-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-primary opacity-10 rounded-full blur-3xl" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-gradient-accent opacity-10 rounded-full blur-2xl" />
      
      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Main footer content */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow animate-glow">
                <span className="text-primary-foreground font-bold text-2xl">🌾</span>
              </div>
              <div>
                <span className="text-primary font-bold text-2xl">AGROGYAAN</span>
                <p className="text-muted-foreground text-sm">Farm to Table</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Connecting farmers directly to buyers for fresh, quality produce. 
              Building sustainable agricultural communities across India.
            </p>
            <div className="flex items-center gap-2 text-sm text-primary">
              <Heart className="w-4 h-4 fill-current animate-pulse" />
              <span>Supporting local farmers</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Leaf className="w-4 h-4 text-primary" />
              Quick Links
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {footerLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1"
                >
                  {link.icon && <link.icon className="w-4 h-4 group-hover:text-accent transition-colors" />}
                  <span className="font-medium">{link.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Connect section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Stay Connected</h4>
            <p className="text-muted-foreground text-sm">
              Follow us for updates on fresh produce, farming tips, and community stories.
            </p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 rounded-xl text-sm font-medium text-foreground transition-all duration-300 hover:shadow-soft hover:-translate-y-0.5"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <Separator className="my-8 bg-gradient-to-r from-transparent via-border to-transparent" />
        
        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 AGROGYAAN. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-accent fill-current animate-pulse" />
              <span>for farmers</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-muted-foreground">
              Serving <span className="text-primary font-semibold">10,000+</span> farmers nationwide
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
