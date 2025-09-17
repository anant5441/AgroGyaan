import React from 'react';
import { Separator } from '@/components/ui/separator';

const Footer = () => {
  const footerLinks = [
    { label: 'About', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Privacy', href: '#' },
  ];

  return (
    <footer className="bg-gradient-to-r from-[#CADCAE] to-[#E1E9C9] border-t border-border/50 mt-8">
      AGROGYAAN
    </footer>
  );
};

export default Footer;
