import { Link } from 'react-router-dom';
import { Mail, Instagram, ArrowRight } from 'lucide-react';

const FooterLink = ({ to, children }) => (
  <Link to={to} className="group relative text-secondaryText hover:text-white transition-colors duration-500 w-fit flex items-center gap-3">
    <span className="w-0 h-px bg-accent opacity-0 transition-all duration-500 ease-[0.16,1,0.3,1] group-hover:w-4 group-hover:opacity-100"></span>
    <span className="transform transition-transform duration-500 ease-[0.16,1,0.3,1] group-hover:translate-x-1">{children}</span>
  </Link>
);

const FooterSocialLink = ({ href, icon: Icon, children }) => (
  <a href={href} target={href.startsWith('http') ? "_blank" : undefined} rel={href.startsWith('http') ? "noreferrer" : undefined} className="group relative text-secondaryText hover:text-white transition-colors duration-500 w-fit flex items-center gap-3">
    <Icon className="w-4 h-4 transition-transform duration-500 ease-[0.16,1,0.3,1] group-hover:scale-110 group-hover:text-accent" />
    <span className="transform transition-transform duration-500 ease-[0.16,1,0.3,1] group-hover:translate-x-1">{children}</span>
  </a>
);

const Footer = () => {
  return (
    <footer className="relative bg-deep pt-40 pb-12 overflow-hidden mt-0">
      {/* Cinematic Ambient Atmosphere */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] max-w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.06)_0%,_transparent_60%)] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 right-0 h-[500px] bg-gradient-to-t from-black/80 via-background/20 to-transparent pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6 relative z-10">
        <div className="flex flex-col tablet:flex-row justify-between items-start tablet:items-end mb-32 gap-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/5 text-secondaryText text-xs font-medium mb-8 tracking-wider uppercase backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.8)]"></span>
              Currently accepting new projects
            </div>
            <h2 className="text-5xl tablet:text-7xl font-heading font-bold text-white tracking-[-0.03em] leading-[1.1]">
              Footage in.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent/80 to-accent/40">Story out.</span>
            </h2>
          </div>
          <Link to="/contact" className="group inline-flex items-center gap-4 text-xl tablet:text-2xl font-medium text-white transition-all">
            <span className="relative overflow-hidden pb-1">
              <span className="relative z-10 transition-colors duration-500 group-hover:text-white/90">Start a Project</span>
              <span className="absolute left-0 bottom-0 w-full h-[1px] bg-white/10" />
              <span className="absolute left-0 bottom-0 w-full h-[2px] bg-accent -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-700 ease-[0.16,1,0.3,1]" />
            </span>
            <div className="w-12 h-12 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-sm flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-700 ease-[0.16,1,0.3,1]">
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 group-hover:scale-110 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 tablet:gap-8 mb-32 pt-16 border-t border-white/[0.03]">
          <div className="md:col-span-4 lg:col-span-5">
            <h3 className="text-3xl font-heading font-bold text-white mb-6 tracking-tight">ARTIX<span className="text-accent drop-shadow-[0_0_12px_rgba(139,92,246,0.6)]">.</span></h3>
            <p className="text-secondaryText text-lg leading-relaxed max-w-sm">
              We craft narratives that hook viewers in the first 3 seconds and hold them until the very end.
            </p>
          </div>
          <div className="md:col-span-8 lg:col-span-7 grid grid-cols-2 tablet:grid-cols-3 gap-8">
            <div className="flex flex-col space-y-5">
              <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent border-b border-white/5 pb-4 mb-2">Platform</h4>
              <FooterLink to="/portfolio">Portfolio</FooterLink>
              <FooterLink to="/services">Services</FooterLink>
              <FooterLink to="/case-studies">Case Studies</FooterLink>
              <FooterLink to="/about">About</FooterLink>
            </div>
            <div className="flex flex-col space-y-5">
              <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent border-b border-white/5 pb-4 mb-2">Contact Us</h4>
              <FooterSocialLink href="mailto:contactartixmedia@gmail.com" icon={Mail}>Email</FooterSocialLink>
              <FooterSocialLink href="https://instagram.com/ar.tix_media" icon={Instagram}>Instagram</FooterSocialLink>
              <FooterLink to="/contact">Contact Form</FooterLink>
            </div>
            <div className="flex flex-col space-y-5 col-span-2 tablet:col-span-1 mt-4 tablet:mt-0">
              <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent border-b border-white/5 pb-4 mb-2">Legal</h4>
              <FooterLink to="/privacy-policy">Privacy Policy</FooterLink>
              <FooterLink to="/terms-conditions">Terms of Service</FooterLink>
            </div>
          </div>
        </div>

        <div className="flex flex-col tablet:flex-row justify-between items-center pt-8 border-t border-white/[0.03] text-[10px] font-bold tracking-widest uppercase text-secondaryText/30">
          <p>© {new Date().getFullYear()} ARTIX MEDIA.</p>
          <p className="mt-4 tablet:mt-0">All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
