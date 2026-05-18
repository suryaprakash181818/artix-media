import { useState } from 'react';
import { motion } from 'framer-motion';

import khanish from "../assets/khanish.jpg"
import surya from "../assets/surya.jpg"
import geethika from "../assets/geethika.jpg"

const TEAM = [
  {
    id: 'khanish',
    name: 'Khanish',
    role: 'Founder & Creative Director',
    description: '“Crafting edits designed to hold attention beyond the first second.”',
    image: khanish
  },
  {
    id: 'surya',
    name: 'Surya',
    role: 'Head of Post-Production',
    description: '“Turning raw footage into stories that feel cinematic.”',
    image: surya
  },
  {
    id: 'geethika',
    name: 'Geethika',
    role: 'CEO & Client Strategist',
    description: '“Understanding brands. Building relationships. Delivering impact.”',
    image: geethika
  }
];

const TeamCard = ({ member, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.8, delay: index * 0.2, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative overflow-hidden rounded-[32px] h-[520px] bg-deep border border-white/[0.04]"
      style={{
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
      }}
    >
      {/* Full-bleed background image */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={member.image}
          alt={member.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: member.name === "Khanish"
              ? `translateX(-9%) translateY(-32%) scale(${isHovered ? 1.65 : 1.60})`
              : member.name === "Surya"
                ? `translateX(9%) translateY(-48%) scale(${isHovered ? 1.95 : 1.92})`
                : `translateY(-8%) scale(${isHovered ? 1.50 : 1.45})`,
            objectPosition: 'center center',
            transformOrigin: 'center center',
            transition: 'transform 0.7s cubic-bezier(0.25, 1, 0.5, 1), filter 0.5s ease',
            filter: 'grayscale(20%) contrast(1.05) brightness(0.9)',
          }}
          onError={(e) => {
            e.target.src = `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop`;
          }}
        />
        {/* Cinematic bottom gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, transparent 45%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.75) 78%, rgba(0,0,0,0.95) 92%, rgba(0,0,0,1.0) 100%)'
          }}
        />
        {/* Accent hover overlay */}
        <div className="absolute inset-0 bg-accent/5 mix-blend-overlay opacity-0 transition-opacity duration-700 group-hover:opacity-100 pointer-events-none" />
      </div>

      {/* Hover Glow Border */}
      <div className="absolute inset-0 border border-white/0 rounded-[32px] transition-colors duration-500 group-hover:border-accent/30 pointer-events-none" />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ boxShadow: 'inset 0 0 40px rgba(139,92,246,0.1)' }} />

      {/* Content — absolute bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-[2] p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
        >
          <h3 className="text-2xl tablet:text-3xl font-heading font-bold text-white mb-1 tracking-tight">
            {member.name}
          </h3>
          <p className="text-accent text-[10px] tablet:text-xs font-semibold tracking-[0.15em] uppercase mb-5 flex items-center gap-1.5">
            <span className="text-accent select-none text-xs">✦</span>
            <span>{member.role}</span>
          </p>
          <div className="h-[1px] w-8 bg-white/10 mb-5 transition-all duration-500 group-hover:w-full group-hover:bg-accent/40" />
          <p className="text-white/80 text-sm leading-relaxed font-light transition-all duration-500 opacity-80 group-hover:opacity-100">
            {member.description}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

const TeamSection = () => {
  return (
    <section className="relative pt-6 pb-24 tablet:pt-8 tablet:pb-32 bg-background overflow-hidden border-t border-white/[0.03]">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16 tablet:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[10px] font-bold text-accent tracking-[0.25em] uppercase mb-6 block">
              THE PEOPLE BEHIND ARTIX
            </span>
            <h2 className="text-4xl tablet:text-5xl desktop:text-6xl font-heading font-bold text-white mb-6 tracking-tight leading-tight">
              A small team. <br className="hidden tablet:block" />Big obsession.
            </h2>
            <p className="text-base tablet:text-xl text-secondaryText leading-relaxed font-light max-w-2xl mx-auto">
              Three minds. One vision.<br />
              Obsessed with cinematic storytelling and edits that hold attention.
            </p>
          </motion.div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 tablet:grid-cols-3 gap-6 tablet:gap-8 max-w-5xl mx-auto">
          {TEAM.map((member, index) => (
            <TeamCard key={member.id} member={member} index={index} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default TeamSection;
