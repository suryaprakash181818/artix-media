import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Play, Pause, X, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import trueLoveRetention from '../assets/videos/true-love-retention-edit.mp4';
import davidWarnerBat from '../assets/videos/david-warner-bat-analysis.mp4';
import stumpmicLaunch from '../assets/videos/stumpmicwithsandeep-launch-teaser.mp4';
import wealthAffirmation from '../assets/videos/wealth-affirmation-shortform.mp4';
import cricketUmpiring from '../assets/videos/cricket-umpiring-career-reel.mp4';
import cinematicRetention from '../assets/videos/cinematic-retention-edit-01.mp4';
import heartbreakRetention from '../assets/videos/heartbreak-retention-story.mp4';
import trueLoveBehavior from '../assets/videos/true-love-behavior-analysis.mp4';
import naadheStory from '../assets/videos/naadhe.mp4';
import raggingAwareness from '../assets/videos/ragging video.mp4';
const categories = ["All", "Storytelling & Documentary", "Social Commentary", "Sports & Performance"];

const portfolioData = [
  { id: 1, title: "The Weight of Education", category: "Storytelling & Documentary", video: naadheStory, previewStart: 2, previewEnd: 8, description: "A silent, desaturated examination of institutional expectations. This edit prioritizes reflective pacing and subtle ambient sound to hold the viewer inside the psychological reality of academic pressure.", metric: "Storytelling & Documentary", style: "Social Commentary", retention: "Reflective Pace" },
  { id: 2, title: "Shadows Within Campus", category: "Storytelling & Documentary", video: raggingAwareness, previewStart: 5, previewEnd: 12, description: "An atmospheric investigation into the unseen culture of academic hazing. The narrative structure controls information pacing, letting tension build naturally through deliberate cuts.", metric: "Storytelling & Documentary", style: "Documentary", retention: "Atmospheric Tension" },
  { id: 3, title: "Fragments of Love", category: "Storytelling & Documentary", video: trueLoveRetention, previewStart: 3, previewEnd: 10, description: "A poetic, highly stylized mosaic of human connection. Structures visual memories as brief, vivid sequences to evoke nostalgia and emotional permanence.", metric: "Storytelling & Documentary", style: "Cinematic Essay", retention: "Nostalgia Arc" },
  { id: 4, title: "Precision at the Crease", category: "Sports & Performance", video: davidWarnerBat, previewStart: 1, previewEnd: 8, description: "A kinetic, analytical study of batting technique and body alignment. Employs crisp visual timing and synchronized typography to map split-second elite performance.", metric: "Sports & Performance", style: "Kinetic Analysis", retention: "Precision Timing" },
  { id: 5, title: "StumpMic Launch Teaser", category: "Sports & Performance", video: stumpmicLaunch, previewStart: 0, previewEnd: 6, description: "A high-tempo, rhythmic edit constructed for the StumpMic platform premiere. Features intense sound design and rapid frame delivery to communicate momentum.", metric: "Sports & Performance", style: "Kinetic Teaser", retention: "Rhythmic Impact" },
  { id: 6, title: "Built From Vision", category: "Social Commentary", video: wealthAffirmation, previewStart: 4, previewEnd: 11, description: "A striking typographic exploration of ambition and material reality. Fuses rich visual weight with sparse narration to craft an immersive motivational essay.", metric: "Social Commentary", style: "Typographic Essay", retention: "Motivational Pacing" },
  { id: 7, title: "The Umpire’s Call", category: "Sports & Performance", video: cricketUmpiring, previewStart: 2, previewEnd: 9, description: "A disciplined biographical study tracing the pressure and poise of professional officiating. Merges live-match tracking with slow, deliberate pacing.", metric: "Sports & Performance", style: "Sports Narrative", retention: "Disciplined Pace" },
  { id: 8, title: "The Silent Evidence", category: "Storytelling & Documentary", video: cinematicRetention, previewStart: 5, previewEnd: 12, description: "An experimental narrative built entirely around subtle spatial cues and silent cuts. Relies on negative space and visual flow to sustain psychological tension.", metric: "Storytelling & Documentary", style: "Experimental Flow", retention: "Visual Resonance" },
  { id: 9, title: "Echoes After Goodbye", category: "Social Commentary", video: heartbreakRetention, previewStart: 3, previewEnd: 9, description: "A poignant story structured as a psychological rewind. Controls the sequence order to slowly unpack the heavy architecture of grief and loss.", metric: "Social Commentary", style: "Psychological Rewind", retention: "Emotional Arc" },
  { id: 10, title: "Patterns of Attachment", category: "Social Commentary", video: trueLoveBehavior, previewStart: 2, previewEnd: 8, description: "An analytical documentary dissecting relationship psychology. Uses desaturated split screens and structured title cards to pace complex behavioral ideas.", metric: "Social Commentary", style: "Documentary Commentary", retention: "Behavioral Rhythm" }
];

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalVideoPlaying, setModalVideoPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [fadingVideos, setFadingVideos] = useState({});
  const videoRefs = {};
  const modalVideoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const seekBarRef = useRef(null);
  const mobileSeekBarRef = useRef(null);
  const fullscreenContainerRef = useRef(null);
  const previewTimeoutsRef = useRef({});

  const filteredProjects = activeCategory === "All" 
    ? portfolioData 
    : portfolioData.filter(p => p.category === activeCategory);

  const handleMouseEnter = (projectId) => {
    if (window.matchMedia("(max-width: 768px)").matches) return;
    
    if (previewTimeoutsRef.current[projectId]) {
      clearTimeout(previewTimeoutsRef.current[projectId]);
      previewTimeoutsRef.current[projectId] = null;
    }
    
    const video = videoRefs[projectId];
    const project = portfolioData.find(p => p.id === projectId);
    
    if (video && project) {
      setFadingVideos(prev => ({ ...prev, [projectId]: false }));
      video.playbackRate = 1.0;
      video.currentTime = project.previewStart || 0;
      video.play().catch(() => {});
    }
  };

  const handleMouseLeave = (projectId) => {
    const video = videoRefs[projectId];
    const project = portfolioData.find(p => p.id === projectId);
    
    if (video && project) {
      setFadingVideos(prev => ({ ...prev, [projectId]: true }));
      video.playbackRate = 0.5; // cinematic slowdown
      
      const timeoutId = setTimeout(() => {
        if (video) {
          video.pause();
          video.currentTime = project.previewStart || 0;
          video.playbackRate = 1.0;
          setFadingVideos(prev => ({ ...prev, [projectId]: false }));
        }
      }, 700);
      
      previewTimeoutsRef.current[projectId] = timeoutId;
    }
  };

  const handleModalPlay = () => {
    const video = modalVideoRef.current;
    if (video) {
      video.play().catch(() => {});
      setModalVideoPlaying(true);
    }
  };

  const handleModalPause = () => {
    const video = modalVideoRef.current;
    if (video) {
      video.pause();
    }
    setModalVideoPlaying(false);
  };

  const handleCloseModal = () => {
    const video = modalVideoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    setSelectedProject(null);
    setModalVideoPlaying(false);
    setShowControls(false);
    setIsMuted(true);
    setIsFullscreen(false);
    setProgress(0);
    setIsDragging(false);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleVideoClick = () => {
    const isTouchDevice = window.matchMedia('(hover: none)').matches;
    if (isTouchDevice && !showControls) {
      setShowControls(true);
      startControlsTimeout();
      return;
    }

    if (modalVideoPlaying) {
      handleModalPause();
    } else {
      handleModalPlay();
    }
  };

  const handleMuteToggle = () => {
    const video = modalVideoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  const handleFullscreenToggle = useCallback(() => {
    const videoContainer = document.querySelector('.video-player-wrapper');
    if (!document.fullscreenElement && videoContainer) {
      videoContainer.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  const handleProgressUpdate = useCallback(() => {
    const video = modalVideoRef.current;
    if (video && video.duration && !isDragging) {
      const newProgress = (video.currentTime / video.duration) * 100;
      setProgress(newProgress);
    }
  }, [isDragging]);

  const clearControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const startControlsTimeout = () => {
    clearControlsTimeout();
    controlsTimeoutRef.current = setTimeout(() => {
      if (modalVideoPlaying) {
        setShowControls(false);
      }
    }, 2500);
  };

  const handleModalMouseEnter = () => {
    clearControlsTimeout();
    setShowControls(true);
  };

  const handleModalMouseLeave = () => {
    if (modalVideoPlaying) {
      startControlsTimeout();
    }
  };

  const handleSeekBarInteraction = useCallback((clientX) => {
    const seekBar = seekBarRef.current || mobileSeekBarRef.current;
    const video = modalVideoRef.current;
    if (seekBar && video && video.duration) {
      const rect = seekBar.getBoundingClientRect();
      let percent = (clientX - rect.left) / rect.width;
      percent = Math.max(0, Math.min(1, percent));
      video.currentTime = percent * video.duration;
      setProgress(percent * 100);
    }
  }, []);

  const handleSeekBarClick = (e) => {
    handleSeekBarInteraction(e.clientX ?? e.touches?.[0]?.clientX);
  };

  const handleSeekBarMouseMove = useCallback((e) => {
    if (isDragging) {
      if (e.type === 'touchmove' && e.cancelable) e.preventDefault();
      handleSeekBarInteraction(e.clientX ?? e.touches?.[0]?.clientX);
    }
  }, [isDragging, handleSeekBarInteraction]);

  const handleSeekBarMouseDown = (e) => {
    setIsDragging(true);
    handleSeekBarInteraction(e.clientX ?? e.touches?.[0]?.clientX);
    clearControlsTimeout();
  };

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (modalVideoPlaying) {
      startControlsTimeout();
    }
  }, [modalVideoPlaying]);

  useEffect(() => {
    if (modalVideoPlaying && modalVideoRef.current) {
      progressIntervalRef.current = setInterval(handleProgressUpdate, 50);
      startControlsTimeout();
    } else if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      clearControlsTimeout();
    };
  }, [modalVideoPlaying, handleProgressUpdate]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => handleSeekBarMouseMove(e);
    const handleMouseUpGlobal = () => handleMouseUp();
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUpGlobal);
      document.addEventListener('touchmove', handleMouseMove, { passive: false });
      document.addEventListener('touchend', handleMouseUpGlobal);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUpGlobal);
    };
  }, [isDragging, handleSeekBarMouseMove, handleMouseUp]);

  return (
    <div className="pt-20 pb-20 tablet:pt-32 tablet:pb-48">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl mobile:text-5xl tablet:text-7xl font-heading font-bold text-white mb-6 text-editorial tracking-[-0.03em]"
          >
            The edit speaks.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-secondaryText max-w-2xl mx-auto"
          >
            Scroll through. Feel the difference.
          </motion.p>
        </div>

        <motion.div 
          layout
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6 mb-16 max-w-3xl mx-auto"
        >
          <LayoutGroup>
            {categories.map((cat) => (
              <motion.button
                whileTap={{ scale: 0.95 }}
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="relative py-2 text-sm font-medium transition-colors duration-300 group focus:outline-none"
              >
                <span className={`relative z-10 transition-colors duration-300 ${activeCategory === cat ? 'text-white' : 'text-secondaryText group-hover:text-white'}`}>
                  {cat}
                </span>
                {activeCategory === cat && (
                  <motion.div 
                    layoutId="portfolio-tab"
                    initial={false}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-accent ambient-glow"
                  />
                )}
              </motion.button>
            ))}
          </LayoutGroup>
        </motion.div>

        <motion.div layout className={`grid mb-16 ${
          filteredProjects.length === 1 ? 'grid-cols-1 max-w-md mx-auto gap-10' :
          filteredProjects.length === 2 ? 'grid-cols-1 tablet:grid-cols-2 max-w-5xl mx-auto gap-12 tablet:gap-16' :
          'grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6 tablet:gap-10'
        }`}>
          <AnimatePresence>
            {filteredProjects.map((project, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                whileTap={{ scale: 0.98 }}
                key={project.id}
                className={`group relative w-full aspect-[9/16] ${
                  i % 3 === 1 ? 'desktop:translate-y-12' : ''
                } ${
                  i % 2 === 1 ? 'tablet:translate-y-6 desktop:translate-y-0' : ''
                }`}
              >
                {/* Ambient Cinematic Glow */}
                <div className="absolute -inset-2 rounded-[2.5rem] bg-accent/15 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 hidden tablet:block pointer-events-none z-0" />
                
                {/* Card Container */}
                <div
                  onClick={() => setSelectedProject(project)}
                  onMouseEnter={() => handleMouseEnter(project.id)}
                  onMouseLeave={() => handleMouseLeave(project.id)}
                  className="relative rounded-3xl overflow-hidden cursor-pointer w-full h-full bg-black z-10 border border-white/[0.04] group-hover:border-accent/20 transition-all duration-700"
                >
                <video
                  ref={el => videoRefs[project.id] = el}
                  src={project.video}
                  muted
                  playsInline
                  preload="metadata"
                  onTimeUpdate={(e) => {
                    const video = e.target;
                    if (project.previewEnd && video.currentTime >= project.previewEnd && !fadingVideos[project.id]) {
                      setFadingVideos(prev => ({ ...prev, [project.id]: true }));
                      video.playbackRate = 0.5;
                      
                      const timeoutId = setTimeout(() => {
                        if (video) {
                          video.pause();
                          video.currentTime = project.previewStart || 0;
                          video.playbackRate = 1.0;
                          setFadingVideos(prev => ({ ...prev, [project.id]: false }));
                        }
                      }, 700);
                      
                      previewTimeoutsRef.current[project.id] = timeoutId;
                    }
                  }}
                  className={`w-full h-full object-cover object-center transition-all duration-700 ease-[0.16,1,0.3,1] group-hover:scale-105 ${fadingVideos[project.id] ? 'opacity-0 blur-sm scale-100' : 'opacity-90 group-hover:opacity-100 blur-0'}`}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-700" />
                
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]">
                    <span className="inline-block text-[10px] font-bold tracking-[0.2em] uppercase text-white/70 mb-3 drop-shadow-md">
                      {project.category}
                    </span>
                    <h3 className="text-2xl font-heading font-bold text-white mb-2 tracking-[-0.01em]">{project.title}</h3>
                    <p className="text-accent text-sm font-medium tracking-wide">
                      {project.metric}
                    </p>
                  </div>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100 backdrop-blur-md bg-white/5">
                  <Play className="w-5 h-5 text-white ml-1 fill-white/20" />
                </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          className="text-center text-sm text-secondaryText italic mt-8"
        >
          More work available on request.
        </motion.p>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] flex items-end tablet:items-center justify-center tablet:p-4 bg-black/95 backdrop-blur-xl"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{
                scale: typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 0.98,
                y: typeof window !== 'undefined' && window.innerWidth < 768 ? 100 : 20,
                opacity: 0
              }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{
                scale: typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 0.98,
                y: typeof window !== 'undefined' && window.innerWidth < 768 ? 100 : 20,
                opacity: 0
              }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (info.offset.y > 100) {
                  handleCloseModal();
                }
              }}
              className="bg-black tablet:bg-surface border-t tablet:border border-white/[0.04] rounded-t-3xl tablet:rounded-[2rem] w-full tablet:max-w-6xl h-[92svh] tablet:h-auto tablet:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col tablet:flex-row relative"
            >
              <motion.div
                className="w-full h-full tablet:w-2/3 bg-black relative flex items-center justify-center"
                onMouseEnter={handleModalMouseEnter}
                onMouseLeave={handleModalMouseLeave}
              >
                <motion.div
                  ref={fullscreenContainerRef}
                  className="video-player-wrapper relative w-full flex items-center justify-center bg-black overflow-hidden"
                >
                  <video
                    ref={modalVideoRef}
                    src={selectedProject.video}
                    muted={isMuted}
                    playsInline
                    preload="metadata"
                    className={`w-full object-contain object-center transition-all duration-300 ${isFullscreen ? 'h-screen' : 'max-h-[60svh] tablet:h-[75vh]'}`}
                    onClick={handleVideoClick}
                    onPlay={() => setModalVideoPlaying(true)}
                    onPause={() => setModalVideoPlaying(false)}
                    onEnded={() => setModalVideoPlaying(false)}
                  />

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: !modalVideoPlaying ? 1 : 0.15 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/95 via-black/35 to-transparent tablet:from-black/95 tablet:via-transparent tablet:to-black/10"
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: !modalVideoPlaying ? 1 : 0.05 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.15)_0%,_transparent_70%)]"
                  />

                  <AnimatePresence>
                    {!modalVideoPlaying && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/40 z-10"
                        onClick={handleModalPlay}
                      >
                        <motion.div
                          className="w-24 h-24 rounded-full border-2 border-accent/40 flex items-center justify-center backdrop-blur-md bg-accent/10 shadow-[0_0_40px_rgba(139,92,246,0.3)]"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Play className="w-10 h-10 text-white ml-1 fill-white/30" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {showControls && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        transition={{ duration: 0.25 }}
                        className="hidden tablet:block absolute bottom-0 left-0 right-0 p-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] tablet:pb-5 bg-gradient-to-t from-black/95 via-black/80 to-transparent z-50"
                      >
                        <div
                          ref={seekBarRef}
                          className="w-full h-1.5 bg-white/15 rounded-full mb-8 cursor-pointer group"
                          onClick={handleSeekBarClick}
                          onMouseDown={handleSeekBarMouseDown}
                          onTouchStart={(e) => {
                            e.preventDefault();
                            handleSeekBarMouseDown(e);
                          }}
                        >
                          <motion.div
                            className="h-full bg-accent rounded-full relative shadow-[0_0_8px_rgba(139,92,246,0.35)]"
                            style={{ width: `${progress}%` }}
                          >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                          </motion.div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <motion.button
                              type="button"
                              onClick={modalVideoPlaying ? handleModalPause : handleModalPlay}
                              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {modalVideoPlaying ? (
                                <Pause className="w-4 h-4 text-white" />
                              ) : (
                                <Play className="w-4 h-4 text-white ml-0.5" />
                              )}
                            </motion.button>
                            <motion.button
                              type="button"
                              onClick={handleMuteToggle}
                              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {isMuted ? (
                                <VolumeX className="w-4 h-4 text-white" />
                              ) : (
                                <Volume2 className="w-4 h-4 text-white" />
                              )}
                            </motion.button>
                          </div>
                          <motion.button
                            type="button"
                            onClick={handleFullscreenToggle}
                            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {isFullscreen ? (
                              <Minimize className="w-4 h-4 text-white" />
                            ) : (
                              <Maximize className="w-4 h-4 text-white" />
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>

              <div className="absolute inset-0 tablet:relative w-full tablet:w-1/3 flex flex-col pointer-events-none tablet:pointer-events-auto z-40 tablet:z-auto tablet:bg-surface">
                
                {/* --- DESKTOP METADATA (Static) --- */}
                <div className="hidden tablet:flex flex-col h-full p-10 justify-start pb-10">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="absolute top-6 right-6 p-2 text-secondaryText hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors focus:outline-none z-50"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="mt-auto tablet:mt-0 max-h-[50vh] tablet:max-h-none overflow-y-auto custom-scrollbar pr-2 tablet:pr-0">
                    <span className="text-accent text-[10px] tablet:text-xs font-bold tracking-[0.2em] uppercase mb-2 tablet:mb-4 tablet:mt-4 block drop-shadow-md">
                      {selectedProject.category}
                    </span>
                    <h3 className="text-2xl tablet:text-3xl font-heading font-bold text-white mb-6 tablet:mb-10 tracking-[-0.02em] leading-tight drop-shadow-lg">
                      {selectedProject.title}
                    </h3>

                    <div className="space-y-4 tablet:space-y-6 flex-grow">
                      {selectedProject.description && (
                        <div>
                          <p className="text-[9px] tablet:text-[10px] text-white/70 tablet:text-secondaryText/60 font-bold tracking-[0.2em] uppercase mb-1 tablet:mb-2 drop-shadow-md">Description</p>
                          <p className="text-white/90 tablet:text-secondaryText text-xs tablet:text-sm leading-relaxed pr-2 tablet:pr-4 drop-shadow-md">{selectedProject.description}</p>
                        </div>
                      )}
                      <div className="flex gap-6 tablet:block tablet:space-y-6">
                        <div>
                          <p className="text-[9px] tablet:text-[10px] text-white/70 tablet:text-secondaryText/60 font-bold tracking-[0.2em] uppercase mb-1 tablet:mb-2 drop-shadow-md">Craft Discipline</p>
                          <p className="text-white text-sm tablet:text-lg font-medium tracking-[-0.01em] drop-shadow-md">{selectedProject.style}</p>
                        </div>
                        <div>
                          <p className="text-[9px] tablet:text-[10px] text-white/70 tablet:text-secondaryText/60 font-bold tracking-[0.2em] uppercase mb-1 tablet:mb-2 drop-shadow-md">Narrative Focus</p>
                          <p className="text-accent text-sm tablet:text-lg font-medium tracking-[-0.01em] drop-shadow-md">{selectedProject.retention}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-full py-4 bg-white/[0.03] hover:bg-white/[0.06] text-white text-sm font-semibold rounded-xl mt-12 transition-colors border border-white/[0.05]"
                  >
                    Close Preview
                  </button>
                </div>

                {/* --- MOBILE CLOSE BUTTON — always visible on mobile --- */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  type="button"
                  onClick={handleCloseModal}
                  className="absolute top-[max(1.5rem,env(safe-area-inset-top))] right-5 p-3 text-white bg-black/50 backdrop-blur-sm rounded-full focus:outline-none pointer-events-auto z-50 tablet:hidden"
                >
                  <X className="w-6 h-6" />
                </motion.button>

                {/* --- MOBILE METADATA (Animated OTT Style) --- */}
                <AnimatePresence>
                  {!modalVideoPlaying && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex flex-col tablet:hidden pointer-events-none"
                    >
                      {/* Mobile Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />

                      <div className="relative z-10 flex flex-col h-full p-6 justify-end pb-[max(2rem,env(safe-area-inset-bottom)+1rem)] pointer-events-none">
                        
                        {/* Animated Metadata Content */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="pointer-events-auto mt-auto max-h-[45vh] overflow-y-auto custom-scrollbar pr-2 mb-6"
                        >
                          <span className="text-accent text-[10px] font-bold tracking-[0.2em] uppercase mb-3 block drop-shadow-md">
                            {selectedProject.category}
                          </span>
                          <h3 className="text-2xl font-heading font-bold text-white mb-6 tracking-[-0.02em] leading-tight drop-shadow-lg">
                            {selectedProject.title}
                          </h3>

                          <div className="space-y-6 flex-grow">
                            {selectedProject.description && (
                              <div>
                                <p className="text-[9px] text-white/70 font-bold tracking-[0.2em] uppercase mb-2 drop-shadow-md">Description</p>
                                <p className="text-white/90 text-xs leading-relaxed pr-2 drop-shadow-md">{selectedProject.description}</p>
                              </div>
                            )}
                            <div className="flex gap-6">
                              <div>
                                <p className="text-[9px] text-white/70 font-bold tracking-[0.2em] uppercase mb-2 drop-shadow-md">Craft Discipline</p>
                                <p className="text-white text-sm font-medium tracking-[-0.01em] drop-shadow-md">{selectedProject.style}</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-white/70 font-bold tracking-[0.2em] uppercase mb-2 drop-shadow-md">Narrative Focus</p>
                                <p className="text-accent text-sm font-medium tracking-[-0.01em] drop-shadow-md">{selectedProject.retention}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>

                        {/* Mobile Integrated Progress Bar */}
                        <div
                          ref={mobileSeekBarRef}
                          className="pointer-events-auto w-full h-1.5 bg-white/15 rounded-full mb-6 cursor-pointer group"
                          onClick={handleSeekBarClick}
                          onMouseDown={handleSeekBarMouseDown}
                          onTouchStart={(e) => {
                            e.preventDefault();
                            handleSeekBarMouseDown(e);
                          }}
                        >
                          <motion.div
                            className="h-full bg-accent rounded-full relative shadow-[0_0_8px_rgba(139,92,246,0.35)]"
                            style={{ width: `${progress}%` }}
                          >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                          </motion.div>
                        </div>

                        {/* Mobile Playback Controls */}
                        <div className="pointer-events-auto flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <motion.button
                              type="button"
                              onClick={modalVideoPlaying ? handleModalPause : handleModalPlay}
                              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {modalVideoPlaying ? (
                                <Pause className="w-4 h-4 text-white" />
                              ) : (
                                <Play className="w-4 h-4 text-white ml-0.5" />
                              )}
                            </motion.button>
                            <motion.button
                              type="button"
                              onClick={handleMuteToggle}
                              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {isMuted ? (
                                <VolumeX className="w-4 h-4 text-white" />
                              ) : (
                                <Volume2 className="w-4 h-4 text-white" />
                              )}
                            </motion.button>
                          </div>
                          <motion.button
                            type="button"
                            onClick={handleFullscreenToggle}
                            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {isFullscreen ? (
                              <Minimize className="w-4 h-4 text-white" />
                            ) : (
                              <Maximize className="w-4 h-4 text-white" />
                            )}
                          </motion.button>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Portfolio;
