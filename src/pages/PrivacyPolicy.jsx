import { motion, useScroll, useSpring } from 'framer-motion';

const Highlight = ({ children }) => (
  <span className="text-white font-medium relative px-1 after:absolute after:-bottom-[2px] after:left-0 after:w-full after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-accent/60 after:to-transparent">
    {children}
  </span>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  }
};

const PrivacyPolicy = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="pt-20 pb-[calc(env(safe-area-inset-bottom)+3.5rem)] tablet:pt-32 tablet:pb-32 relative bg-background min-h-screen">
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-accent origin-left z-50 opacity-80"
        style={{ scaleX }}
      />
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/10 blur-[120px] pointer-events-none opacity-20" />
      
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <div className="mb-24">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl tablet:text-6xl font-heading font-bold text-white mb-6 text-editorial tracking-tight"
          >
            Privacy Policy
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            <p className="text-secondaryText text-xl font-light mb-2">
              ARTIX MEDIA values user privacy and transparent creative collaboration.
            </p>
            <p className="text-xs font-mono tracking-widest uppercase text-white/40">
              Last updated: May 2026
            </p>
          </motion.div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-16 text-secondaryText leading-loose text-lg font-light text-left"
        >
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-heading font-bold text-white mb-6 tracking-tight flex items-center gap-4">
              <span className="text-accent/50 text-sm font-mono tracking-widest">01</span> 
              Information We Collect
            </h2>
            <p>
              We believe in collecting only what is strictly necessary to deliver an exceptional creative experience. When you initiate a project or communicate with our team, we collect standard operational information including your name, professional email address, and specific project details required to execute your vision.
            </p>
          </motion.section>

          <motion.div variants={itemVariants} className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-heading font-bold text-white mb-6 tracking-tight flex items-center gap-4">
              <span className="text-accent/50 text-sm font-mono tracking-widest">02</span> 
              How We Use Your Information
            </h2>
            <p>
              The data you provide serves a single purpose: <Highlight>facilitating our collaboration</Highlight>. We utilize your information exclusively to respond to inquiries, manage file transfers, execute post-production services, and maintain <Highlight>secure communication</Highlight> regarding your creative deliverables.
            </p>
          </motion.section>

          <motion.div variants={itemVariants} className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-heading font-bold text-white mb-6 tracking-tight flex items-center gap-4">
              <span className="text-accent/50 text-sm font-mono tracking-widest">03</span> 
              Information Protection & Sharing
            </h2>
            <p>
              Trust is the foundation of every creative partnership. Your raw footage, project files, and <Highlight>personal information</Highlight> remain strictly under <Highlight>client confidentiality</Highlight>. We never sell, trade, or expose your personal information to third parties. Our operational infrastructure is designed to keep your creative assets secure.
            </p>
          </motion.section>

          <motion.div variants={itemVariants} className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-heading font-bold text-white mb-6 tracking-tight flex items-center gap-4">
              <span className="text-accent/50 text-sm font-mono tracking-widest">04</span> 
              Digital Security
            </h2>
            <p>
              We implement robust, industry-standard security protocols to protect your personal information and raw media against unauthorized access, alteration, or disclosure. We treat your digital footprint with the same care as we treat our own high-end productions.
            </p>
          </motion.section>

          <motion.div variants={itemVariants} className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <motion.section variants={itemVariants} className="pt-8 pb-12">
            <h2 className="text-2xl font-heading font-bold text-white mb-6 tracking-tight">
              Questions regarding privacy or collaboration?
            </h2>
            <p className="mb-8">
              Transparency is important to us. If you require further clarification on how we handle your data, our team is available to assist you.
            </p>
            <a 
              href="mailto:contactartixmedia@gmail.com" 
              className="inline-flex items-center gap-2 text-accent hover:text-white transition-colors duration-300 font-medium tracking-wide group"
            >
              Reach out directly to ARTIX MEDIA
              <span className="text-lg group-hover:translate-x-1 transition-transform duration-300">→</span>
            </a>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
