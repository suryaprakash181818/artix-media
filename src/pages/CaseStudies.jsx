import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import MagneticButton from '../components/ui/MagneticButton';

/* ─── Cinematic Label ──────────────────────────────────────────────────────── */
const Label = ({ children }) => (
  <span className="inline-block text-[10px] font-bold tracking-[0.25em] uppercase text-accent/70 mb-5">
    {children}
  </span>
);

/* ─── Atmospheric Divider ──────────────────────────────────────────────────── */
const AtmosphericDivider = () => (
  <div className="w-full flex items-center gap-6 my-24 tablet:my-40 px-0">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    <div className="w-1 h-1 rounded-full bg-accent/30 flex-shrink-0" />
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
  </div>
);

/* ─── Case Study 01 — Cinematic Documentary Edit ──────────────────────────
   Emotional register: heavy, immersive, restrained, atmospheric
   Layout: image-dominant left, sparse copy right, vertical breathing room
─────────────────────────────────────────────────────────────────────────────── */
const MudanammakluStudy = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['4%', '-4%']);

  return (
    <motion.article
      ref={containerRef}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      {/* Number marker */}
      <div className="mb-10 tablet:mb-16">
        <span className="text-[11px] font-mono tracking-[0.3em] text-white/15 uppercase">01 / 03</span>
      </div>

      <div className="flex flex-col laptop:flex-row laptop:items-start gap-12 laptop:gap-0">

        {/* Visual — 58% width, parallax scroll */}
        <div className="w-full laptop:w-[58%] laptop:pr-16 flex-shrink-0">
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden">
            {/* Subtle grain overlay */}
            <div
              className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay opacity-[0.15]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundSize: '180px',
              }}
            />
            {/* Cinematic top-bottom gradient */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-background/60 via-transparent to-background/20 pointer-events-none" />
            <motion.img
              style={{ y: imageY }}
              src="/cs-mudanammaklu.png"
              alt="Cinematic Documentary Edit — Investigative Long-Form Narrative"
              className="w-full h-[108%] object-cover object-center grayscale-[20%] scale-100"
            />
            {/* Letterbox bars */}
            <div className="absolute top-0 left-0 right-0 h-[6%] bg-background z-20" />
            <div className="absolute bottom-0 left-0 right-0 h-[6%] bg-background z-20" />
          </div>

          {/* Caption strip */}
          <div className="mt-4 flex items-center gap-4 opacity-40">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">
              Production Frame · Long-Form Cinematic Documentary
            </span>
          </div>
        </div>

        {/* Copy — 42% width, anchored right */}
        <div className="w-full laptop:w-[42%] laptop:pt-10 flex flex-col">
          <Label>Investigative Documentary Narrative</Label>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl tablet:text-5xl laptop:text-[3.25rem] font-heading font-bold text-white tracking-[-0.03em] leading-[1.08] mb-10"
            style={{ textWrap: 'balance' }}
          >
            Cinematic Documentary Edit
          </motion.h2>

          {/* First narrative block */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="pl-5 border-l border-white/[0.08] mb-10"
          >
            <p className="text-secondaryText text-base laptop:text-lg leading-[1.8] tracking-[0.005em]">
              A long-form investigative documentary constructed on restraint.
              The editorial rhythm mirrors the psychological weight of the subject —
              each cut measured against silence, each pause carrying intention.
            </p>
          </motion.div>

          {/* Second narrative block — visual silence, wider spacing */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="pl-5 border-l border-white/[0.08] mb-14"
          >
            <p className="text-secondaryText/70 text-sm laptop:text-base leading-[1.85]">
              Atmospheric sound design replaced conventional scoring.
              Visuals were given space to breathe — escalation earned, never imposed.
              The viewer is drawn into the story, not pushed through it.
            </p>
          </motion.div>

          {/* Craft disciplines — sparse, no metrics */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="border-t border-white/[0.05] pt-10 grid grid-cols-2 gap-y-5 gap-x-8"
          >
            {[
              'Narrative Architecture',
              'Atmospheric Sound Design',
              'Long-Form Pacing',
              'Controlled Visual Escalation',
              'Emotional Immersion',
              'Documentary Rhythm',
            ].map((craft) => (
              <div key={craft} className="flex items-start gap-2.5">
                <div className="w-[3px] h-[3px] rounded-full bg-accent/50 mt-[8px] flex-shrink-0" />
                <span className="text-[11px] font-medium tracking-[0.08em] text-white/40 uppercase leading-none">
                  {craft}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
};

/* ─── Case Study 02 — Education System Commentary ─────────────────────────
   Emotional register: reflective, ideological, emotionally grounded
   Layout: reversed — copy leads heavy left, image breathes right
─────────────────────────────────────────────────────────────────────────────── */
const NaadheStudy = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['-3%', '3%']);

  return (
    <motion.article
      ref={containerRef}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <div className="mb-10 tablet:mb-16">
        <span className="text-[11px] font-mono tracking-[0.3em] text-white/15 uppercase">02 / 03</span>
      </div>

      <div className="flex flex-col laptop:flex-row-reverse laptop:items-start gap-12 laptop:gap-0">

        {/* Visual — right side */}
        <div className="w-full laptop:w-[52%] laptop:pl-16 flex-shrink-0">
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden">
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-background/50 via-transparent to-transparent pointer-events-none" />
            {/* Sharp contrast overlay — differentiates from the documentary piece */}
            <div
              className="absolute inset-0 z-10 pointer-events-none mix-blend-multiply opacity-20"
              style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, transparent 60%)' }}
            />
            <motion.img
              style={{ y: imageY }}
              src="/cs-naadhe.png"
              alt="Education System Commentary — Social Commentary & Human Narrative"
              className="w-full h-[108%] object-cover object-center contrast-[1.08]"
            />
            <div className="absolute top-0 left-0 right-0 h-[5%] bg-background z-20" />
            <div className="absolute bottom-0 left-0 right-0 h-[5%] bg-background z-20" />
          </div>

          <div className="mt-4 flex items-center gap-4 opacity-40">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">
              Production Frame · Human Narrative & Social Commentary
            </span>
          </div>
        </div>

        {/* Copy — left side, heavier typographic presence */}
        <div className="w-full laptop:w-[48%] laptop:pt-10 flex flex-col">
          <Label>Social Commentary & Human Narrative</Label>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl tablet:text-5xl laptop:text-[3.25rem] font-heading font-bold text-white tracking-[-0.03em] leading-[1.08] mb-4"
            style={{ textWrap: 'balance' }}
          >
            Education System Commentary
          </motion.h2>

          {/* Provocation line — closer to title, sharp breathing */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="text-lg tablet:text-xl text-white/30 font-heading tracking-[-0.01em] mb-10 leading-snug"
          >
            On society, aspiration, and what we ask of our children.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1, delay: 0.35 }}
            className="pl-5 border-l border-white/[0.08] mb-10"
          >
            <p className="text-secondaryText text-base laptop:text-lg leading-[1.8]">
              This piece was built as an ideological argument, not a content piece.
              Each editorial sequence was designed to provoke reflection —
              to hold the viewer inside a feeling long enough for it to mean something.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="pl-5 border-l border-white/[0.08] mb-14"
          >
            <p className="text-secondaryText/60 text-sm laptop:text-base leading-[1.85]">
              Narrative escalation was paced with discipline —
              emotion introduced incrementally,
              resolution withheld until the viewer has earned it.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="border-t border-white/[0.05] pt-10 grid grid-cols-2 gap-y-5 gap-x-8"
          >
            {[
              'Narrative Escalation',
              'Ideological Sequencing',
              'Emotional Grounding',
              'Reflective Pacing',
              'Human Storytelling',
              'Societal Commentary',
            ].map((craft) => (
              <div key={craft} className="flex items-start gap-2.5">
                <div className="w-[3px] h-[3px] rounded-full bg-accent/50 mt-[8px] flex-shrink-0" />
                <span className="text-[11px] font-medium tracking-[0.08em] text-white/40 uppercase leading-none">
                  {craft}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
};

/* ─── Case Study 03 — The Umpire's Call ────────────────────────────────────
   Emotional register: aspirational, disciplined, momentum-driven
   Layout: full-width image bleeds, copy sits beneath in tight columns
─────────────────────────────────────────────────────────────────────────────── */
const CricketStudy = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['2%', '-2%']);

  return (
    <motion.article
      ref={containerRef}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <div className="mb-10 tablet:mb-16">
        <span className="text-[11px] font-mono tracking-[0.3em] text-white/15 uppercase">03 / 03</span>
      </div>

      {/* Full-width image — intentionally different layout from above studies */}
      <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden mb-12 tablet:mb-16">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-background/80 pointer-events-none" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-background/40 via-transparent to-background/40 pointer-events-none" />
        <motion.img
          style={{ y: imageY }}
          src="/cs-cricket.png"
          alt="The Umpire's Call — Passion, Discipline & Sports Identity"
          className="w-full h-[112%] object-cover object-center saturate-[1.1]"
        />
      </div>

      {/* Copy — two column grid, asymmetric */}
      <div className="grid grid-cols-1 tablet:grid-cols-12 gap-10 tablet:gap-x-6">
        <div className="tablet:col-span-3 min-w-0">
          <Label>Passion, Discipline &amp; Sports Identity</Label>
          <h2 className="text-3xl tablet:text-4xl font-heading font-bold text-white tracking-[-0.03em] leading-[1.1] break-words">
            The Umpire's Call
          </h2>
        </div>

        <div className="tablet:col-span-1" />

        <div className="tablet:col-span-4 flex flex-col justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, delay: 0.25 }}
            className="pl-5 border-l border-white/[0.08]"
          >
            <p className="text-secondaryText text-base laptop:text-lg leading-[1.8]">
              A reel about what it means to pursue something with complete commitment.
              Umpiring as discipline, as identity, as a lifelong decision.
              The edit was built to match that energy — kinetic, precise, forward-moving.
              Every cut timed to the momentum of conviction.
            </p>
          </motion.div>
        </div>

        <div className="tablet:col-span-1" />

        <div className="tablet:col-span-3 flex flex-col justify-end">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="border-t border-white/[0.05] pt-8 grid grid-cols-1 gap-y-5"
          >
            {[
              'Athletic Momentum',
              'Disciplined Pacing',
              'Aspirational Framing',
              'Precision Editing',
              'Sports Identity',
            ].map((craft) => (
              <div key={craft} className="flex items-start gap-2.5">
                <div className="w-[3px] h-[3px] rounded-full bg-accent/50 mt-[8px] flex-shrink-0" />
                <span className="text-[11px] font-medium tracking-[0.08em] text-white/40 uppercase leading-none">
                  {craft}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
};

/* ─── Page ──────────────────────────────────────────────────────────────────── */
const CaseStudies = () => {
  return (
    <div className="relative pt-24 pb-20 tablet:pt-40 tablet:pb-40">
      <div className="max-w-[1200px] mx-auto px-6">

        {/* ── Page Header ────────────────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-24 tablet:mb-40"
        >
          <Label>Editorial Archive</Label>
          <h1 className="text-4xl tablet:text-6xl laptop:text-[5.5rem] font-heading font-bold text-white tracking-[-0.04em] leading-[1.02] max-w-3xl mb-8">
            Cinematic work.<br />
            <span className="text-white/30">Three pieces.</span>
          </h1>
          <p className="text-[#9D95B0] text-lg tablet:text-xl max-w-xl leading-[1.75] font-light">
            Every reel solves attention differently.
          </p>
        </motion.header>

        {/* ── Studies ────────────────────────────────────────────────────── */}
        <MudanammakluStudy />
        <AtmosphericDivider />
        <NaadheStudy />
        <AtmosphericDivider />
        <CricketStudy />

        {/* ── Closing CTA ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-32 tablet:mt-56 border-t border-white/[0.04] pt-20 tablet:pt-32 flex flex-col tablet:flex-row tablet:items-end tablet:justify-between gap-12"
        >
          <div className="max-w-xl">
            <h2 className="text-3xl tablet:text-5xl font-heading font-bold text-white tracking-[-0.03em] leading-tight mb-6">
              Your story deserves this level of intention.
            </h2>
            <p className="text-secondaryText text-base leading-relaxed">
              We take a limited number of projects each season.
            </p>
          </div>
          <div className="flex-shrink-0">
            <MagneticButton>
              <Link
                to="/contact"
                className="inline-flex items-center gap-3 px-10 py-5 bg-accent text-white rounded-full font-bold text-base transition-all ambient-glow accent-hover"
              >
                Begin a Conversation <ArrowRight className="w-4 h-4" />
              </Link>
            </MagneticButton>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default CaseStudies;
