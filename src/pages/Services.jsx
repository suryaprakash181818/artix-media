import { motion } from 'framer-motion';
import { Scissors, Video, Sparkles, Volume2, Type, Image as ImageIcon } from 'lucide-react';

const services = [
  { icon: Scissors, title: "Short-form Editing", desc: "High-retention Reels, TikToks, and Shorts optimized for infinite scrolling." },
  { icon: Video, title: "Long-form Editing", desc: "Engaging YouTube videos and documentaries that keep viewers hooked." },
  { icon: Sparkles, title: "Motion Graphics", desc: "Custom animations, lower thirds, and visual effects to elevate production value." },
  { icon: Volume2, title: "Sound Design", desc: "Immersive audio mixing and SFX that add depth to your visuals." },
  { icon: Type, title: "Captions & Subtitles", desc: "Dynamic, stylized captions designed for silent viewing and accessibility." },
  { icon: ImageIcon, title: "Thumbnail Design", desc: "High-CTR custom thumbnails that grab attention in crowded feeds." }
];

const processSteps = [
  { num: "01", title: "Submit Footage", desc: "Upload your raw files to our secure cloud folder." },
  { num: "02", title: "Editing Process", desc: "We craft the narrative, pace the cuts, and add effects." },
  { num: "03", title: "Revisions", desc: "Review via Frame.io and request any tweaks." },
  { num: "04", title: "Final Delivery", desc: "Download your high-res, platform-ready video." }
];

const Services = () => {
  return (
    <div className="pt-20 pb-14 tablet:pt-32 tablet:pb-32">
      <div className="max-w-[1280px] mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-32 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent opacity-[0.05] blur-[100px] pointer-events-none" />
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-editorial text-5xl tablet:text-7xl font-heading text-white mb-6 tracking-[-0.03em]"
          >
            What we do.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-secondaryText max-w-2xl mx-auto tracking-wide"
          >
            Six disciplines. One obsession: retention.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6 mb-32">
          {services.map((service, i) => {
            const isLarge = i === 0 || i === 3;
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-surface border border-white/[0.04] rounded-[2rem] group relative overflow-hidden accent-hover flex flex-col justify-between ${
                  isLarge ? 'tablet:col-span-2 p-12 min-h-[340px]' : 'p-10 min-h-[280px]'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accentSoft to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center mb-8 relative z-10 transition-transform duration-500 origin-left">
                  <service.icon className={`text-accent group-hover:text-white transition-colors duration-500 ${isLarge ? 'w-8 h-8' : 'w-6 h-6'}`} />
                </div>
                <div className="relative z-10">
                  <h3 className={`font-heading font-bold text-white mb-4 tracking-[-0.01em] ${isLarge ? 'text-4xl' : 'text-2xl'}`}>
                    {service.title}
                  </h3>
                  <p className={`text-secondaryText leading-relaxed ${isLarge ? 'text-lg max-w-lg' : 'text-sm max-w-sm'}`}>
                    {service.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Breathing Space */}
        <div className="h-40 w-full flex items-center justify-center mb-32">
          <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        </div>

        {/* Workflow */}
        <div className="mb-40">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-heading font-bold text-white mb-4 tracking-[-0.02em]">How it works.</h2>
          </div>
          
          <div className="grid grid-cols-1 tablet:grid-cols-4 gap-12 tablet:gap-8 relative">
            <div className="hidden tablet:block absolute top-6 left-20 right-20 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
            {processSteps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: i * 0.1 }}
                className="relative z-10 flex flex-col items-center tablet:items-start text-center tablet:text-left group"
              >
                <div className="text-xs font-bold tracking-[0.2em] text-accent mb-6 font-mono bg-background px-2 -ml-2">
                  {step.num}
                </div>
                <h4 className="text-xl font-heading font-bold text-white mb-3 tracking-[-0.01em] group-hover:text-accent transition-colors">{step.title}</h4>
                <p className="text-secondaryText text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="mt-32 text-center"
        >
          <div className="mb-20">
            <h2 className="text-4xl tablet:text-5xl font-heading font-bold text-white mb-6 tracking-[-0.02em]">Straightforward pricing.</h2>
            <p className="text-lg text-secondaryText max-w-2xl mx-auto">No hidden fees. No confusion. Just work that performs.</p>
          </div>
          
          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
            
            <div className="bg-surface border border-white/[0.04] p-10 tablet:p-12 rounded-[2rem] text-left accent-hover transition-all h-fit">
              <h3 className="text-2xl font-heading font-bold text-white mb-4 tracking-[-0.01em]">Project Based</h3>
              <p className="text-secondaryText text-base mb-10 leading-relaxed max-w-sm">Perfect for one-off videos, campaigns, or pilot episodes.</p>
              <p className="text-white font-medium text-xl">Starting at ₹15,000/video</p>
            </div>
            
            <div className="bg-deep border border-accentBorder p-12 tablet:p-16 rounded-[2rem] text-left transition-all relative overflow-hidden ambient-glow shadow-accent/20 scale-100 tablet:scale-105 z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-accentGlow via-transparent to-transparent opacity-50 pointer-events-none" />
              <div className="relative z-10">
                <h3 className="text-3xl font-heading font-bold text-white mb-4 tracking-[-0.01em]">Monthly Retainer</h3>
                <p className="text-secondaryText text-lg mb-12 leading-relaxed max-w-sm">Dedicated editing partner for consistent creators and brands.</p>
                <p className="text-accent font-bold text-2xl">Custom Quoted</p>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Services;
