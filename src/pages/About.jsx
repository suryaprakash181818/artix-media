import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Zap, Target, TrendingUp, MonitorPlay } from 'lucide-react';
import TeamSection from '../components/TeamSection';

const reasons = [
  { icon: Zap, title: "Fast Turnaround", desc: "We respect your upload schedule. Consistent delivery without sacrificing quality." },
  { icon: Target, title: "Retention-focused", desc: "Every cut, zoom, and sound effect serves a single purpose: keeping viewers hooked." },
  { icon: TrendingUp, title: "Trend-aware", desc: "We study the algorithms and know exactly what visual hooks are working right now." },
  { icon: MonitorPlay, title: "Platform Optimized", desc: "Whether it's TikTok, Shorts, or YouTube, we format and export perfectly for the platform." }
];

const faqs = [
  { q: "What is your typical turnaround time?", a: "For short-form content (Reels/TikToks), typically 24-48 hours. For long-form YouTube videos, it depends on complexity but usually ranges from 3 to 5 days." },
  { q: "How many revisions are included?", a: "We include 2 rounds of revisions on all standard projects to ensure you're 100% happy with the final result." },
  { q: "How do we communicate and share files?", a: "We use a combination of secure cloud storage (Google Drive/Dropbox) for files and Frame.io for precise, frame-accurate feedback. Communication is handled via Slack, Discord, or Email based on your preference." },
  { q: "Do you offer bulk discounts for monthly retainers?", a: "Yes. Our monthly retainer packages are custom-built for creators needing a consistent volume of edits, offering a better per-video rate than one-off projects." }
];

const About = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      <div className="pt-20 pb-14 tablet:pt-32 tablet:pb-32">
        <div className="max-w-[1280px] mx-auto px-6">
        
        {/* Editorial Opening */}
        <div className="mb-32 flex flex-col laptop:flex-row justify-between items-start gap-12 laptop:gap-24">
          <div className="w-full laptop:w-1/2">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-editorial text-6xl tablet:text-8xl font-heading text-white tracking-[-0.04em] leading-[1.05]"
            >
              Built<br />different.
            </motion.h1>
          </div>
          <div className="w-full laptop:w-1/2 pt-4 laptop:pt-8">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl tablet:text-3xl text-secondaryText leading-relaxed tracking-[-0.01em] font-light"
            >
              Not a marketplace. Not a template shop. A focused editing studio that treats your content like it matters.
            </motion.p>
          </div>
        </div>

        {/* Reasons Grid with intentional asymmetry */}
        <div className="grid grid-cols-1 tablet:grid-cols-12 gap-6 mb-32">
          {/* Reason 1: Reliability - Tight, straightforward */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            className="tablet:col-span-5 bg-surface p-10 tablet:p-12 rounded-[2rem] border border-white/[0.04] accent-hover flex flex-col justify-end min-h-[300px]"
          >
            <Zap className="w-8 h-8 text-accent mb-auto" />
            <div>
              <h3 className="text-2xl font-heading font-bold text-white mb-4 tracking-[-0.01em]">Fast Turnaround</h3>
              <p className="text-secondaryText text-base leading-relaxed max-w-sm">We respect your upload schedule. Consistent delivery without sacrificing quality.</p>
            </div>
          </motion.div>

          {/* Reason 2: Obsession - Massive typography, dominant */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: 0.1 }}
            className="tablet:col-span-7 bg-deep p-10 tablet:p-16 rounded-[2rem] border border-accentBorder relative overflow-hidden group min-h-[300px] flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accentGlow via-transparent to-transparent opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none" />
            <Target className="w-10 h-10 text-white mb-8 relative z-10" />
            <div className="relative z-10">
              <h3 className="text-4xl tablet:text-5xl font-heading font-bold text-white mb-6 tracking-[-0.02em] leading-tight">Retention-focused</h3>
              <p className="text-secondaryText text-lg leading-relaxed max-w-md">Every cut, zoom, and sound effect serves a single purpose: keeping viewers hooked.</p>
            </div>
          </motion.div>

          {/* Reason 3: Intelligence - Bento style */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: 0.2 }}
            className="tablet:col-span-8 bg-surface p-10 tablet:p-14 rounded-[2rem] border border-white/[0.04] accent-hover min-h-[300px] flex flex-col justify-center"
          >
            <div className="flex items-start gap-8 flex-col tablet:flex-row">
              <TrendingUp className="w-12 h-12 text-accent shrink-0" />
              <div>
                <h3 className="text-3xl font-heading font-bold text-white mb-4 tracking-[-0.01em]">Trend-aware</h3>
                <p className="text-secondaryText text-lg leading-relaxed max-w-lg">We study the algorithms and know exactly what visual hooks are working right now.</p>
              </div>
            </div>
          </motion.div>

          {/* Reason 4: Precision - Clean, technical */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: 0.3 }}
            className="tablet:col-span-4 bg-surface p-10 rounded-[2rem] border border-white/[0.04] accent-hover flex flex-col justify-between min-h-[300px]"
          >
            <MonitorPlay className="w-6 h-6 text-secondaryText mb-8" />
            <div>
              <h3 className="text-xl font-heading font-bold text-white mb-3 tracking-[-0.01em] uppercase">Platform Optimized</h3>
              <p className="text-secondaryText text-sm leading-relaxed">Whether it's TikTok, Shorts, or YouTube, we format and export perfectly for the platform.</p>
            </div>
          </motion.div>
        </div>

        {/* Cinematic Pause */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.5 }}
          className="py-32 my-10 flex justify-center text-center relative"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none" />
          <p className="text-3xl tablet:text-5xl font-heading font-bold text-white italic tracking-[-0.02em] bg-background px-8 relative z-10">
            Every edit is a choice. We make the right ones.
          </p>
        </motion.div>

        {/* FAQ Editorial Section */}
        <div className="max-w-4xl mx-auto mb-32">
          <div className="mb-16">
            <h2 className="text-4xl tablet:text-5xl font-heading font-bold text-white tracking-[-0.02em]">Questions worth asking.</h2>
          </div>
          
          <div className="border-t border-white/[0.04]">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ delay: i * 0.1 }}
                  className="border-b border-white/[0.04]"
                >
                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full py-8 text-left flex justify-between items-center group focus:outline-none"
                  >
                    <span className="font-heading font-bold text-2xl tablet:text-3xl text-white group-hover:text-accent transition-colors duration-300 tracking-[-0.01em] pr-8">
                      {faq.q}
                    </span>
                    <ChevronDown className={`w-8 h-8 text-secondaryText shrink-0 transition-transform duration-500 ease-[0.16,1,0.3,1] ${isOpen ? 'rotate-180 text-accent' : ''}`} />
                  </motion.button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pb-8 pl-6 border-l-2 border-accent mb-8">
                          <p className="text-secondaryText text-lg tablet:text-xl leading-relaxed font-light">
                            {faq.a}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        </div>
      </div>

      <TeamSection />
    </>
  );
};

export default About;
