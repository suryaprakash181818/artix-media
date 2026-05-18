import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import MagneticButton from '../components/ui/MagneticButton';

const TerminalLine = ({ text, delay, color }) => (
  <motion.p
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay }}
    className={`${color} leading-relaxed`}
  >
    {text}
  </motion.p>
);

// ─── Segment Definitions ──────────────────────────────────────────────────
const SEGMENTS = [
  {
    label: 'Hook',
    desktopW: 'w-24', mobileW: 80,
    baseOpacity: 0.75,
    activeBg: 'rgba(139,92,246,0.75)',
    inactiveBg: 'rgba(139,92,246,0.20)',
    pulse: true,    // HOOK gets occasional pulse
    isPeak: false,
  },
  {
    label: 'B-Roll',
    desktopW: 'w-40', mobileW: 110,
    baseOpacity: 0.40,
    activeBg: 'rgba(255,255,255,0.10)',
    inactiveBg: 'rgba(255,255,255,0.04)',
    pulse: false,
    isPeak: false,
  },
  {
    label: 'Build',
    desktopW: 'w-32', mobileW: 90,
    baseOpacity: 0.55,
    activeBg: 'rgba(139,92,246,0.55)',
    inactiveBg: 'rgba(139,92,246,0.14)',
    pulse: false,
    isPeak: false,
  },
  {
    label: 'Peak',
    desktopW: 'w-16', mobileW: 64,
    baseOpacity: 0.90,
    activeBg: 'rgba(139,92,246,1)',
    inactiveBg: 'rgba(139,92,246,0.35)',
    pulse: true,    // PEAK gets strongest pulse
    isPeak: true,
  },
  {
    label: 'CTA',
    desktopW: 'w-36',
    mobileW: 80,
    baseOpacity: 0.60,        // equal baseline — feels resolved, not disabled
    activeBg: 'rgba(139,92,246,0.38)',
    inactiveBg: 'rgba(139,92,246,0.14)',
    pulse: false,
    isPeak: false,
    isTerminal: true,         // subtle: no extra letter-spacing on activation
    mobileGhost: true,        // mobile: slightly de-emphasized but present
  },
];

// Dwell time each segment stays "active" (ms)
const DWELL = [2200, 3800, 2800, 1800, 2400];

// Proximity weight — active:1, immediate neighbor:0.5, further:0
function proximityWeight(i, active, total) {
  const dist = Math.min(Math.abs(i - active), total - Math.abs(i - active));
  if (dist === 0) return 1;
  if (dist === 1) return 0.50;
  return 0;
}

// Per-segment ambient breath phase offsets (Option 7 — aurora drift)
// Different durations + delays give each segment its own independent rhythm
const BREATH = [
  { duration: 4.0, delay: 0.0  },  // Hook
  { duration: 5.2, delay: 1.4  },  // B-Roll
  { duration: 3.8, delay: 0.7  },  // Build
  { duration: 4.6, delay: 2.1  },  // Peak
  { duration: 5.0, delay: 0.4  },  // CTA
];

// ─── Segment Component ─────────────────────────────────────────────────────
// Both desktop and mobile looping tracks share this component.
// Shimmer is driven externally via `shimmerRef` by the rAF scanner loop.
const TimelineSegment = ({ seg, idx, isMobile, segRef, shimmerRef }) => {
  const breath  = BREATH[idx] ?? BREATH[0];
  const isGhost = isMobile && seg.mobileGhost;
  const baseOp  = seg.baseOpacity;
  const ghostOp = 0.28; // mobile ghost slightly brighter than before

  // Desktop: use desktopW class. Mobile: fixed pixel width via style.
  const widthClass = isMobile ? 'flex-shrink-0' : `${seg.desktopW} flex-shrink-0`;
  const widthStyle = isMobile
    ? { width: seg.mobileW }
    : {};

  return (
    <motion.div
      ref={segRef}
      className={`${widthClass} h-10 rounded-md flex items-center justify-center
        cursor-default select-none relative overflow-hidden`}
      style={{ ...widthStyle, backgroundColor: seg.inactiveBg }}
      animate={{
        opacity: isGhost
          ? [ghostOp - 0.04, ghostOp + 0.04, ghostOp - 0.04]
          : [baseOp - 0.05, baseOp + 0.05, baseOp - 0.05],
      }}
      transition={{
        opacity: isGhost
          ? { repeat: Infinity, repeatType: 'mirror', duration: 6.0, ease: 'easeInOut' }
          : { repeat: Infinity, repeatType: 'mirror', duration: breath.duration, delay: breath.delay, ease: 'easeInOut' },
      }}
    >
      {/* Scanner shimmer — opacity driven by rAF proximity scan, zero re-renders */}
      <div
        ref={shimmerRef}
        aria-hidden
        style={{
          position: 'absolute', inset: 0,
          opacity: 0,
          background: seg.isPeak
            ? 'linear-gradient(108deg, transparent 15%, rgba(255,255,255,0.18) 50%, transparent 85%)'
            : seg.isTerminal
            ? 'linear-gradient(108deg, transparent 20%, rgba(255,255,255,0.08) 50%, transparent 80%)'
            : 'linear-gradient(108deg, transparent 18%, rgba(255,255,255,0.11) 50%, transparent 82%)',
          pointerEvents: 'none',
          willChange: 'opacity',
        }}
      />

      <span
        className="relative z-10 text-[10px] font-bold tracking-[0.20em] uppercase text-white"
        style={{ opacity: isGhost ? 0.35 : baseOp }}
      >
        {seg.label}
      </span>
    </motion.div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────
const RetentionTimeline = () => {
  const cycleRef = useRef(null); // kept for potential future mobile activeIdx use

  // Desktop scanner refs: 2 copies × 5 segments = indices 0–9
  const railRef      = useRef(null);
  const segRefs      = useRef([]);
  const shimmerRefs  = useRef([]);

  // Mobile scanner refs: 2 copies × 5 segments = indices 0–9 (separate arrays)
  const mobileRailRef    = useRef(null);
  const mobileSegRefs    = useRef([]);
  const mobileShimRefs   = useRef([]);

  const rafRef = useRef(null);

  // rAF scanner — scans BOTH desktop and mobile refs
  // Only visible track's elements have non-zero rects; hidden ones score dist=∞ → t=0
  useEffect(() => {
    const scanTrack = (railEl, segs, shims) => {
      if (!railEl) return;
      const railRect = railEl.getBoundingClientRect();
      if (railRect.width === 0) return; // track is hidden (display:none)
      const centerX = railRect.left + railRect.width * 0.5;
      const innerR  = 55;
      const outerR  = 120;

      segs.forEach((el, i) => {
        const shimmer = shims[i];
        if (!el || !shimmer) return;
        const rect   = el.getBoundingClientRect();
        const segCtr = rect.left + rect.width * 0.5;
        const dist   = Math.abs(segCtr - centerX);
        let t = 0;
        if (dist <= innerR) {
          t = 1;
        } else if (dist < outerR) {
          const ratio = (dist - innerR) / (outerR - innerR);
          t = 1 - ratio * ratio;
        }
        const seg  = SEGMENTS[i % SEGMENTS.length];
        const maxT = seg?.isTerminal ? 0.75 : 1.0;
        shimmer.style.opacity = (t * maxT).toFixed(3);
      });
    };

    const scan = () => {
      scanTrack(railRef.current,       segRefs.current,     shimmerRefs.current);
      scanTrack(mobileRailRef.current, mobileSegRefs.current, mobileShimRefs.current);
      rafRef.current = requestAnimationFrame(scan);
    };

    rafRef.current = requestAnimationFrame(scan);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.6 }}
      className="w-full max-w-3xl mx-auto mt-10 mb-8 relative"
    >
      {/* ── Rail ─────────────────────────────────────────────── */}
      <div
        ref={railRef}
        className="relative w-full bg-deep border border-white/5 rounded-xl overflow-hidden
          before:absolute before:left-0 before:top-0 before:bottom-0 before:w-10 tablet:before:w-16
          before:bg-gradient-to-r before:from-deep before:to-transparent before:z-20 before:pointer-events-none
          after:absolute after:right-0 after:top-0 after:bottom-0 after:w-10 tablet:after:w-16
          after:bg-gradient-to-l after:from-deep after:to-transparent after:z-20 after:pointer-events-none"
      >
        {/* ── Fixed Scanner Line — never moves ─────────────── */}
        <div
          aria-hidden
          className="absolute top-0 bottom-0 z-10 pointer-events-none hidden tablet:block"
          style={{
            left: '50%',
            width: '1px',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(to bottom, transparent 0%, rgba(139,92,246,0.55) 25%, rgba(139,92,246,0.55) 75%, transparent 100%)',
            boxShadow: '0 0 6px rgba(139,92,246,0.35), 0 0 14px rgba(139,92,246,0.12)',
          }}
        />

        {/* ── Fixed Scanner Line (mobile) ──────────────────────── */}
        <div
          aria-hidden
          className="absolute top-0 bottom-0 z-10 pointer-events-none tablet:hidden"
          style={{
            left: '50%',
            width: '1px',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(to bottom, transparent 0%, rgba(139,92,246,0.45) 25%, rgba(139,92,246,0.45) 75%, transparent 100%)',
            boxShadow: '0 0 5px rgba(139,92,246,0.28)',
          }}
        />

        {/* ── MOBILE Looping Track — tighter justify-around spacing ── */}
        <div
          ref={mobileRailRef}
          className="flex tablet:hidden animate-timeline-mobile w-[200%] h-16 items-center"
        >
          {[0, 1].map(clone => (
            <div key={clone} className="flex shrink-0 w-1/2 h-16 items-center justify-around">
              {SEGMENTS.map((seg, i) => {
                const refIdx = clone * SEGMENTS.length + i;
                return (
                  <TimelineSegment
                    key={`m${clone}-${seg.label}`}
                    idx={i}
                    seg={seg}
                    isMobile={true}
                    segRef={el => { mobileSegRefs.current[refIdx] = el; }}
                    shimmerRef={el => { mobileShimRefs.current[refIdx] = el; }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* ── DESKTOP Looping Track — blocks scroll through fixed line ── */}
        <div className="hidden tablet:flex animate-timeline w-[200%] h-16 items-center">
          {[0, 1].map(clone => (
            <div key={clone} className="flex shrink-0 w-1/2 h-16 items-center justify-evenly">
              {SEGMENTS.map((seg, i) => {
                const refIdx = clone * SEGMENTS.length + i;
                return (
                  <TimelineSegment
                    key={`${clone}-${seg.label}`}
                    idx={i}
                    seg={seg}
                    isMobile={false}
                    segRef={el => { segRefs.current[refIdx] = el; }}
                    shimmerRef={el => { shimmerRefs.current[refIdx] = el; }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <p className="text-secondaryText/60 text-xs italic mt-5">— crafted for retention</p>
    </motion.div>
  );
};



const Home = () => {
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ["0px", "-60px"]);

  return (
    <div className="w-full">
      <style>
        {`
          @keyframes scrollTimeline {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-timeline {
            animation: scrollTimeline 28s linear infinite;
          }
          /* Mobile: slightly faster — smaller viewport makes 28s feel too slow */
          @keyframes scrollTimelineMobile {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-timeline-mobile {
            animation: scrollTimelineMobile 20s linear infinite;
          }
        `}

      </style>

      {/* Hero Section */}
      <section className="cinematic-section min-h-[100svh] flex flex-col items-center justify-center px-6 pt-20">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.img style={{ y: yBg }} src="/hero-bg.png" alt="Video Editing Timeline" className="w-full h-[120%] object-cover opacity-30 object-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent opacity-50" />
        </div>
        
        <div className="relative z-10 w-full max-w-[1000px] mx-auto text-center mt-[-5vh] flex-grow flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-card border border-white/10 text-accent text-sm font-medium mb-8 mx-auto"
          >
            <span className="w-2 h-2 rounded-full bg-accent/80"></span>
            Accepting new projects
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-editorial text-4xl mobile:text-5xl tablet:text-6xl desktop:text-7xl font-heading text-white mb-6"
          >
            Your footage deserves an edit that <br className="hidden tablet:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent/60">stops the scroll.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg tablet:text-xl text-secondaryText max-w-2xl mx-auto mb-10"
          >
            We edit with one obsession — keeping your audience watching longer than they planned.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
          >
            <MagneticButton>
              <Link to="/contact" aria-label="Start your project" className="w-full sm:w-auto px-8 py-4 bg-accent text-white rounded-lg font-semibold flex items-center justify-center gap-2 ambient-glow accent-hover">
                Start a Project <ArrowRight className="w-4 h-4" />
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link to="/portfolio" aria-label="View Portfolio" className="w-full sm:w-auto px-8 py-4 glass-layer text-white rounded-lg font-semibold flex items-center justify-center gap-2 accent-hover">
                <Play className="w-4 h-4" /> View Our Work
              </Link>
            </MagneticButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full max-w-2xl mx-auto mt-6 mb-12 text-left"
          >
            {/* Window Shell */}
            <div className="group/window rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_16px_48px_rgba(0,0,0,0.55),0_0_32px_rgba(139,92,246,0.04)] sm:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_32px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(139,92,246,0.06)] ring-1 ring-white/[0.04] sm:ring-white/[0.05]"
              style={{
                background: "linear-gradient(165deg, rgba(20,14,36,0.98) 0%, rgba(11,11,11,0.99) 100%)",
              }}
            >

              {/* Title Bar */}
              <div className="relative flex items-center gap-0 px-3 sm:px-4 h-8 sm:h-10 border-b border-white/[0.05]"
                style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)" }}
              >
                <div className="flex items-center gap-[6px] sm:gap-[7px] mr-3 sm:mr-4">
                  <motion.div
                    className="w-[9px] h-[9px] sm:w-[11px] sm:h-[11px] rounded-full cursor-pointer"
                    style={{ background: "radial-gradient(circle at 40% 35%, #e57575 0%, #c0433f 100%)" }}
                    whileHover={{ scale: 1.15, filter: "brightness(1.25)" }}
                    transition={{ duration: 0.15 }}
                  />
                  <motion.div
                    className="w-[9px] h-[9px] sm:w-[11px] sm:h-[11px] rounded-full cursor-pointer"
                    style={{ background: "radial-gradient(circle at 40% 35%, #e5c46e 0%, #b8860b 100%)" }}
                    whileHover={{ scale: 1.15, filter: "brightness(1.25)" }}
                    transition={{ duration: 0.15 }}
                  />
                  <motion.div
                    className="w-[9px] h-[9px] sm:w-[11px] sm:h-[11px] rounded-full cursor-pointer"
                    style={{ background: "radial-gradient(circle at 40% 35%, #70c472 0%, #3d8b40 100%)" }}
                    whileHover={{ scale: 1.15, filter: "brightness(1.25)" }}
                    transition={{ duration: 0.15 }}
                  />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/50" />
                  <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.18em] text-white/30 uppercase select-none">
                    artix-edit-engine
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-2 sm:gap-3">
                  <div className="w-10 sm:w-16 h-[2px] sm:h-[3px] rounded-full bg-white/[0.06]" />
                  <div className="w-6 sm:w-8 h-[2px] sm:h-[3px] rounded-full bg-accent/20" />
                </div>
              </div>

              {/* Tab Bar */}
              <div className="flex items-center gap-0 px-3 sm:px-4 h-7 sm:h-8 border-b border-white/[0.04]"
                style={{ background: "rgba(255,255,255,0.01)" }}
              >
                <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 h-full border-b-2 border-accent/60">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent/70" />
                  <span className="text-[9px] font-mono tracking-widest text-white/40 uppercase">retention.log</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 sm:px-3 h-full border-b border-transparent">
                  <span className="text-[9px] font-mono tracking-widest text-white/20 uppercase">timeline.seq</span>
                </div>
              </div>

              {/* Terminal Body */}
              <div className="px-4 py-3 sm:px-6 sm:py-5 font-mono text-[11px] sm:text-xs leading-relaxed space-y-2 sm:space-y-2.5">
                <TerminalLine delay={0.7}  color="text-white/20"       text="&#x25B8; Initializing ARTIX Edit Engine v2.1..." />
                <TerminalLine delay={1.2}  color="text-white/35"       text="&#x25B8; Analyzing raw footage structure..." />
                <TerminalLine delay={1.8}  color="text-white/35"       text="&#x25B8; Mapping retention drop-off points..." />
                <TerminalLine delay={2.4}  color="text-accent/75"      text="&#x25B8; Applying cinematic cut sequence..." />
                <TerminalLine delay={3.0}  color="text-white/35"       text="&#x25B8; Injecting sound design layers..." />
                <TerminalLine delay={3.6}  color="text-accent/75"      text="&#x25B8; Optimizing for platform algorithm..." />
                <TerminalLine delay={4.2}  color="text-emerald-400/70" text="&#x25B8; SUCCESS: Edit ready. Retention engineered." />
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between px-4 sm:px-5 py-1.5 sm:py-2 border-t border-white/[0.04]"
                style={{ background: "rgba(255,255,255,0.01)" }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400/70"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  />
                  <span className="text-[9px] font-mono tracking-widest text-white/20 uppercase">Engine Active</span>
                </div>
                <span className="text-[9px] font-mono tracking-widest text-white/15 uppercase">v2.1.0 &middot; build 412</span>
              </div>
            </div>
          </motion.div>
          {/* Cinematic Timeline Interaction */}
          <RetentionTimeline />
        </div>
        
        <div className="absolute bottom-12 left-0 right-0 z-20 text-center">
          <p className="text-sm text-secondaryText italic tracking-wide">Trusted by creators who take their content seriously.</p>
        </div>

        <div className="section-fade z-10" />
      </section>

      {/* The ARTIX Difference */}
      <section className="cinematic-section bg-background pt-20 pb-28 border-t border-white/[0.03]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-accent opacity-[0.05] blur-[100px] pointer-events-none" />
        
        <div className="max-w-[1000px] mx-auto px-6 relative z-10">
          <div className="max-w-2xl mb-16">
            <span className="text-[10px] text-accent font-bold tracking-[0.2em] uppercase mb-4 block">
              The Philosophy
            </span>
            <motion.h2 
              initial={{ opacity: 0.4 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, amount: 0.1 }}
              className="text-3xl tablet:text-5xl font-heading font-bold text-white leading-[1.15] tracking-[-0.02em]"
            >
              Editing is directing attention.
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5 }}
              className="p-8 bg-surface rounded-2xl border border-white/[0.03] hover:border-accent/15 transition-all duration-300 group"
            >
              <h3 className="text-xl font-heading font-bold text-white mb-3 tracking-[-0.01em]">Pacing</h3>
              <p className="text-secondaryText text-sm leading-relaxed">
                We use precise drop-off metrics to engineer cuts that stop the scroll and sustain viewer focus.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="p-8 bg-surface rounded-2xl border border-white/[0.03] hover:border-accent/15 transition-all duration-300 group sm:translate-y-6"
            >
              <h3 className="text-xl font-heading font-bold text-white mb-3 tracking-[-0.01em]">Sound</h3>
              <p className="text-secondaryText text-sm leading-relaxed">
                We build rich, detailed audio environments that carry narrative momentum across transitions.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action Bottom */}
      <section className="cinematic-section bg-background pb-28 pt-20 border-t border-white/[0.03]">
        <div className="max-w-[1000px] mx-auto px-6 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl tablet:text-4xl font-heading font-bold text-white mb-4 tracking-[-0.02em]">
              Every frame is an active decision.
            </h2>
            <p className="text-sm tablet:text-base text-secondaryText mb-10 max-w-xl mx-auto">
              We ensure every decision serves your audience momentum.
            </p>
            <MagneticButton>
              <Link to="/contact" className="inline-flex items-center justify-center gap-4 px-8 py-4 bg-accent text-white rounded-xl text-base font-bold accent-hover ambient-glow transition-all group">
                Start Your Project <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </MagneticButton>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
