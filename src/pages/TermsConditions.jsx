import { motion, useScroll, useSpring } from 'framer-motion';

const Highlight = ({ children }) => (
  <span className="text-white font-medium relative px-1 after:absolute after:-bottom-[2px] after:left-0 after:w-full after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-accent/60 after:to-transparent">
    {children}
  </span>
);

const TermsConditions = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
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
            Terms of Service
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            <p className="text-secondaryText text-xl font-light mb-2">
              Clear expectations. Professional execution. Mutual respect.
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
              Creative Services
            </h2>
            <p>
              ARTIX MEDIA operates as a premium post-production partner. We provide high-end video editing, color grading, and motion design services exactly as outlined in our <Highlight>mutual project briefs</Highlight> or retainer agreements. Our focus is delivering uncompromising quality on every frame.
            </p>
          </motion.section>

          <motion.div variants={itemVariants} className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-heading font-bold text-white mb-6 tracking-tight flex items-center gap-4">
              <span className="text-accent/50 text-sm font-mono tracking-widest">02</span> 
              Financial Agreements
            </h2>
            <p>
              Professional work requires professional commitments. Specific <Highlight>payment schedules</Highlight> are detailed in your personalized project agreement. Standard project-based engagements require a <Highlight>50% upfront deposit</Highlight> to secure timeline scheduling and begin the post-production process.
            </p>
          </motion.section>

          <motion.div variants={itemVariants} className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-heading font-bold text-white mb-6 tracking-tight flex items-center gap-4">
              <span className="text-accent/50 text-sm font-mono tracking-widest">03</span> 
              Revision Architecture
            </h2>
            <p>
              We aim for perfection on the first delivery, but understand the necessity of refinement. All standard projects include <Highlight>two comprehensive rounds of revisions</Highlight> to ensure alignment with your vision. Subsequent revisions beyond the agreed scope are billed transparently at our standard hourly rate.
            </p>
          </motion.section>

          <motion.div variants={itemVariants} className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-heading font-bold text-white mb-6 tracking-tight flex items-center gap-4">
              <span className="text-accent/50 text-sm font-mono tracking-widest">04</span> 
              Intellectual Property Rights
            </h2>
            <p>
              Upon receipt of final payment, <Highlight>full ownership and distribution rights</Highlight> of the final rendered deliverables are transferred entirely to you. ARTIX MEDIA retains the non-exclusive right to showcase the finalized work within our professional portfolio to demonstrate our capabilities, unless a specific non-disclosure agreement is enacted.
            </p>
          </motion.section>

          <motion.div variants={itemVariants} className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <motion.section variants={itemVariants} className="pt-8 pb-12">
            <h2 className="text-2xl font-heading font-bold text-white mb-6 tracking-tight">
              Ready to collaborate or have questions?
            </h2>
            <p className="mb-8">
              We value clarity as much as we value creativity. Reach out if you need to discuss these terms or are ready to initiate a new project.
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

export default TermsConditions;
