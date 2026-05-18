import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const PacingSwipeSlider = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-16 mb-24 px-6 relative z-30 select-none">
      
      {/* Title & Editorial Context */}
      <div className="text-center mb-10">
        <span className="text-[10px] text-accent font-bold tracking-[0.2em] uppercase mb-3 block">
          Pacing Transformation Engine
        </span>
        <h3 className="text-2xl tablet:text-4xl font-heading font-bold text-white mb-4 tracking-[-0.02em]">
          Restructuring Algorithmic Momentum
        </h3>
        <p className="text-sm text-secondaryText max-w-xl mx-auto">
          Swipe the scanner line to compare a sluggish opening sequence against the continuous visual waves of the ARTIX retention structure.
        </p>
      </div>

      {/* Swipe Container */}
      <div
        ref={containerRef}
        className="w-full h-44 bg-[#0D0B14] rounded-2xl border border-white/[0.04] overflow-hidden relative cursor-ew-resize shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        
        {/* --- BEFORE STATE: Sluggish Raw Timeline (Left / Background) --- */}
        <div className="absolute inset-0 flex items-center justify-between px-6 sm:px-12 bg-gradient-to-r from-red-500/[0.03] to-transparent">
          <div className="w-full flex items-center justify-around opacity-30 grayscale pr-10">
            {/* Raw Scattered Gaps */}
            <div className="w-16 h-8 rounded border border-white/10 flex items-center justify-center">
              <span className="text-[8px] font-mono tracking-widest text-white/50">SLUGGISH</span>
            </div>
            <div className="w-28 h-8 rounded border border-white/10 flex items-center justify-center border-dashed">
              <span className="text-[8px] font-mono tracking-widest text-white/30">GAP (8s DROP)</span>
            </div>
            <div className="w-20 h-8 rounded border border-white/10 flex items-center justify-center">
              <span className="text-[8px] font-mono tracking-widest text-white/50">NO AUD-FX</span>
            </div>
            <div className="w-12 h-8 rounded border border-white/10 flex items-center justify-center border-dashed">
              <span className="text-[8px] font-mono tracking-widest text-white/30">GAP</span>
            </div>
          </div>
          <div className="absolute top-4 left-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500/80" />
            <span className="text-[8px] font-mono tracking-widest text-red-500/60 uppercase">Sluggish Raw Sequence</span>
          </div>
        </div>

        {/* --- AFTER STATE: Engineered ARTIX Edit Timeline (Right / Overlay Clipped) --- */}
        <div
          className="absolute inset-y-0 right-0 left-0 bg-gradient-to-r from-[#140E24] to-[#0A0A0E] flex items-center justify-between px-6 sm:px-12 select-none pointer-events-none"
          style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
        >
          <div className="w-full flex items-center justify-around pl-10">
            {/* Structured Continuous Wave */}
            <div className="w-20 h-9 rounded-md bg-accent/25 border border-accent/40 flex items-center justify-center relative overflow-hidden shadow-[0_0_12px_rgba(139,92,246,0.15)]">
              <span className="text-[9px] font-mono font-bold tracking-[0.15em] text-white">HOOK ACTIVE</span>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
            </div>
            <div className="w-24 h-9 rounded-md bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <span className="text-[9px] font-mono font-bold tracking-[0.15em] text-white/80">B-ROLL</span>
            </div>
            <div className="w-20 h-9 rounded-md bg-accent/15 border border-accent/25 flex items-center justify-center relative overflow-hidden">
              <span className="text-[9px] font-mono font-bold tracking-[0.15em] text-white/90">BUILD</span>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent/60" />
            </div>
            <div className="w-20 h-9 rounded-md bg-accent/30 border border-accent flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.25)]">
              <span className="text-[9px] font-mono font-bold tracking-[0.15em] text-white">PEAK FOCUS</span>
            </div>
          </div>
          <div className="absolute top-4 right-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent/80 animate-pulse" />
            <span className="text-[8px] font-mono tracking-widest text-accent uppercase">Artix Engineered Pacing (+108%)</span>
          </div>
        </div>

        {/* --- INTERACTIVE DRAGGABLE SCANNER LINE --- */}
        <div
          className="absolute inset-y-0 w-[1px] bg-gradient-to-b from-transparent via-accent to-transparent z-10 pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Scanner Handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-black border border-white/15 backdrop-blur-md flex items-center justify-center shadow-2xl pointer-events-auto cursor-ew-resize"
            style={{
              boxShadow: '0 0 10px rgba(139,92,246,0.3), inset 0 0 4px rgba(255,255,255,0.08)'
            }}
          >
            <div className="flex items-center gap-[3px]">
              <div className="w-[1px] h-3 bg-accent" />
              <div className="w-[1px] h-3 bg-accent/50" />
              <div className="w-[1px] h-3 bg-accent" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PacingSwipeSlider;
