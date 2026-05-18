import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';

const navLinks = [
  { name: "Portfolio", path: "/portfolio" },
  { name: "Case Studies", path: "/case-studies" },
  { name: "Services", path: "/services" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" }
];

const LOGO_LETTERS = ["A", "R", "T", "I", "X"];

const AnimatedLogo = () => {
  const [replay, setReplay] = useState(0);

  const handleHover = () => {
    setReplay(prev => prev + 1);
  };

  return (
    <span
      onMouseEnter={handleHover}
      className="inline-flex items-end cursor-pointer select-none"
    >
      {LOGO_LETTERS.map((letter, i) => (
        <motion.span
          key={`${letter}-${i}-${replay}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: i * 0.07,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="font-heading font-bold tracking-tight text-white inline-block"
        >
          {letter}
        </motion.span>
      ))}
      <motion.span
        key={`dot-${replay}`}
        initial={{ opacity: 0, scale: 0, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: LOGO_LETTERS.length * 0.07 + 0.05,
          ease: [0.34, 1.56, 0.64, 1]
        }}
        className="text-accent inline-block"
      >
        .
      </motion.span>
    </span>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const linkRefs = useRef([]);
  const [dotStyle, setDotStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0
  });

  const activeIndex = navLinks.findIndex(link => {
    if (link.path === '/') return location.pathname === '/';
    return location.pathname.startsWith(link.path);
  });

  useEffect(() => {
    const activeEl = linkRefs.current[activeIndex];
    if (activeEl) {
      const { offsetLeft, offsetWidth } = activeEl;
      setDotStyle({
        left: offsetLeft + offsetWidth / 2 - 2,
        width: 4,
        opacity: 1
      });
    } else {
      setDotStyle(prev => ({ ...prev, opacity: 0 }));
    }
  }, [activeIndex]);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 border-b border-white/[0.04] ${
          isScrolled ? "bg-background/95 backdrop-blur-md" : "bg-background/60 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-6 h-20 flex items-center justify-between relative z-50">
          <Link to="/" className="text-2xl font-heading font-bold tracking-tight text-white group">
            <AnimatedLogo />
          </Link>
          
          <div className="hidden tablet:flex items-center gap-8 relative">
            {navLinks.map((link, i) => {
              const isActive = i === activeIndex;
              return (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  ref={(el) => (linkRefs.current[i] = el)}
                  className={`relative text-sm font-medium transition-colors duration-300 group ${
                    isActive ? "text-white" : "text-secondaryText hover:text-white"
                  }`}
                >
                  <span className="relative z-10">{link.name}</span>
                  {!isActive && (
                    <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-white/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-[0.22,1,0.36,1]" />
                  )}
                </Link>
              );
            })}

            <motion.span
              className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-accent pointer-events-none"
              animate={{
                left: dotStyle.left,
                opacity: dotStyle.opacity
              }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 30,
                mass: 0.8
              }}
              style={{ position: 'absolute' }}
            />
            
            <motion.div 
              className="ml-4 inline-block"
              whileHover={{ 
                scale: 1.02,
                filter: "brightness(1.05)",
                boxShadow: "0 0 25px rgba(139, 92, 246, 0.2)"
              }}
              whileTap={{ scale: 0.96 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 25, 
                mass: 0.5 
              }}
            >
              <Link 
                to="/contact" 
                onTouchEnd={(e) => e.currentTarget.blur()} 
                className="px-5 py-2.5 bg-accent text-white rounded-md text-sm font-semibold hover:bg-accent/95 transition-all ambient-glow block"
              >
                Start a Project
              </Link>
            </motion.div>
          </div>

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="tablet:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5 focus:outline-none z-50 relative"
            aria-label="Toggle Menu"
          >
            <motion.span 
              animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }} 
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-6 h-[2px] bg-white block rounded-full" 
            />
            <motion.span 
              animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} 
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-6 h-[2px] bg-white block rounded-full" 
            />
            <motion.span 
              animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }} 
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-6 h-[2px] bg-white block rounded-full" 
            />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* LAYER 1 — BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[998] bg-background/95 backdrop-blur-xl"
            />

            {/* LAYER 2 — MENU CONTENT */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="fixed inset-0 z-[999] flex flex-col items-center justify-center px-8"
            >
              {/* ATMOSPHERIC DETAIL */}
              <div 
                className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full pointer-events-none z-0 blur-[80px]"
                style={{ background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)" }}
              />

              <button
                onClick={() => setIsOpen(false)}
                onTouchEnd={(e) => e.currentTarget.blur()}
                className="absolute top-6 right-6 p-2 text-secondaryText hover:text-white transition-colors rounded-full"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center gap-2 w-full mb-12 relative z-10">
                {navLinks.map((link, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.07,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      className="w-full"
                    >
                      <Link
                        to={link.path}
                        className={`group relative text-[2.5rem] font-heading font-bold transition-colors duration-300 tracking-tight leading-tight py-2 block text-center ${
                          isActive ? "text-white" : "text-white/40 active:text-white/80"
                        }`}
                      >
                        {link.name}
                        {/* Always render dot to prevent layout shifts, hide with opacity */}
                        <span className={`block w-1.5 h-1.5 rounded-full bg-accent mx-auto mt-2 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="flex flex-col items-center gap-3 w-full max-w-[280px] relative z-10"
              >
                <Link
                  to="/contact"
                  className="w-full py-4 bg-accent text-white rounded-xl font-semibold text-center text-base active:bg-accent/80 transition-colors block"
                >
                  Start Your Project
                </Link>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold text-center block pt-4">
                  Currently accepting select projects.
                </p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
