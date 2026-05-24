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

const AG_STYLES = `
  :root{--ag-void:#02020a;--ag-deep:#07071a;--ag-panel:#0c0c22;--ag-border:rgba(130,100,255,0.1);--ag-accent:#8b5cf6;--ag-accent2:#a78bfa;--ag-star:rgba(255,255,255,0.4);--ag-text:#e2deff;--ag-muted:rgba(180,165,255,0.45);--ag-font-display:'General Sans',sans-serif;--ag-font-body:'Manrope',sans-serif;}
  .ag-root{font-family:var(--ag-font-body);background:var(--ag-void);color:var(--ag-text);position:relative;overflow-x:hidden;}
  .ag-stars{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
  .ag-star{position:absolute;border-radius:50%;background:var(--ag-star);animation:ag-twinkle var(--d,4s) ease-in-out infinite alternate;opacity:var(--o,0.3);}
  @keyframes ag-twinkle{from{opacity:var(--o,0.15);transform:scale(1);}to{opacity:calc(var(--o,0.15)*1.8);transform:scale(1.4);}}
  .ag-nebula{position:fixed;border-radius:50%;filter:blur(80px);pointer-events:none;z-index:0;animation:ag-drift 22s ease-in-out infinite alternate;opacity:0.55;}
  @keyframes ag-drift{0%{transform:translate(0,0) scale(1);}50%{transform:translate(-1.5%,2%) scale(1.03);}100%{transform:translate(1.5%,-1.5%) scale(0.98);}}
  .ag-card{position:relative;cursor:pointer;border-radius:20px;overflow:hidden;background:var(--ag-panel);border:1px solid var(--ag-border);transition:border-color 0.5s ease,box-shadow 0.5s ease,transform 0.5s cubic-bezier(0.23,1,0.32,1);will-change:transform;}
  .ag-card:hover{border-color:rgba(139,92,246,0.25);box-shadow:0 0 0 1px rgba(139,92,246,0.1),0 0 24px rgba(100,60,220,0.12),0 20px 40px rgba(0,0,0,0.45);transform:translateY(-4px) scale(1.005);}
  .ag-card-video{width:100%;height:100%;object-fit:cover;display:block;transition:opacity 0.7s ease,transform 0.7s cubic-bezier(0.23,1,0.32,1);transform:scale(1);will-change:transform,opacity;}
  .ag-card:hover .ag-card-video{transform:scale(1.02);}
  .ag-card-video.fading{opacity:0;filter:blur(4px);transform:scale(1);}
  .ag-card-video.visible{opacity:0.9;}
  .ag-card-gradient{position:absolute;inset:0;background:linear-gradient(to top,rgba(2,2,18,0.9) 0%,rgba(5,4,25,0.45) 45%,transparent 100%);transition:opacity 0.5s ease;opacity:0.65;}
  .ag-card:hover .ag-card-gradient{opacity:1;}
  .ag-card-meta{position:absolute;inset:0;padding:1.5rem;display:flex;flex-direction:column;justify-content:flex-end;transform:translateY(8px);transition:transform 0.5s cubic-bezier(0.23,1,0.32,1);}
  .ag-card:hover .ag-card-meta{transform:translateY(0);}
  .ag-card-eyebrow{font-family:var(--ag-font-display);font-size:9px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:var(--ag-accent2);margin-bottom:0.4rem;opacity:0;transition:opacity 0.4s ease,color 0.4s ease;}
  .ag-card:hover .ag-card-eyebrow{opacity:1;}
  .ag-card-title{font-family:var(--ag-font-display);font-size:1.15rem;font-weight:700;color:#fff;line-height:1.25;letter-spacing:-0.02em;margin:0 0 0.35rem;text-shadow:0 2px 12px rgba(0,0,0,0.8);}
  .ag-card-metric{font-size:0.7rem;font-weight:500;color:var(--ag-accent2);letter-spacing:0.04em;opacity:0;transform:translateY(4px);transition:opacity 0.35s ease 0.08s,transform 0.35s ease 0.08s;}
  .ag-card:hover .ag-card-metric{opacity:1;transform:translateY(0);}
  .ag-card-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.88);width:52px;height:52px;border-radius:50%;border:1px solid rgba(139,92,246,0.35);background:rgba(20,10,50,0.5);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.4s ease,transform 0.4s cubic-bezier(0.23,1,0.32,1);}
  .ag-card:hover .ag-card-play{opacity:1;transform:translate(-50%,-50%) scale(1);}
  .ag-tabs{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:0.25rem 0.1rem;}
  .ag-tab{position:relative;padding:0.5rem 1rem;font-family:var(--ag-font-display);font-size:0.78rem;font-weight:600;letter-spacing:0.04em;color:var(--ag-muted);background:transparent;border:none;cursor:pointer;transition:color 0.3s ease;outline:none;}
  .ag-tab:hover{color:#fff;}
  .ag-tab.active{color:#fff;}
  .ag-tab-underline{position:absolute;bottom:0;left:0;right:0;height:1.5px;background:linear-gradient(90deg,transparent,var(--ag-accent),transparent);border-radius:2px;}
  .ag-heading{font-family:var(--ag-font-display);font-weight:800;letter-spacing:-0.035em;line-height:1;color:#fff;}
  .ag-heading-glow{background:linear-gradient(135deg,#fff 30%,var(--ag-accent2) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
  .ag-subtext{font-family:var(--ag-font-body);color:var(--ag-muted);font-weight:300;font-style:italic;}
  .ag-modal-backdrop{position:fixed;inset:0;z-index:100;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,5,0.9);backdrop-filter:blur(20px);}
  @media(min-width:768px){.ag-modal-backdrop{align-items:center;padding:1rem;}}
  .ag-modal{background:var(--ag-deep);border:1px solid rgba(139,92,246,0.12);box-shadow:0 0 0 1px rgba(139,92,246,0.06),0 40px 100px rgba(0,0,0,0.75);border-radius:28px 28px 0 0;width:100%;height:92svh;overflow:hidden;display:flex;flex-direction:column;position:relative;}
  @media(min-width:768px){.ag-modal{border-radius:24px;max-width:1100px;height:auto;max-height:90vh;flex-direction:row;}}
  .ag-modal-video-side{position:relative;width:100%;height:100%;background:#000;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  @media(min-width:768px){.ag-modal-video-side{width:62%;height:auto;}}
  .ag-modal-video{width:100%;height:100%;display:block;object-fit:contain;}
  @media(min-width:768px){.ag-modal-video{height:75vh;}}
  .ag-modal-meta-side{display:none;flex-direction:column;padding:2.5rem 2rem 2rem;background:var(--ag-panel);border-left:1px solid rgba(139,92,246,0.08);position:relative;}
  @media(min-width:768px){.ag-modal-meta-side{display:flex;width:38%;}}
  .ag-modal-eyebrow{font-family:var(--ag-font-display);font-size:9px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:var(--ag-accent2);margin-bottom:0.6rem;}
  .ag-modal-title{font-family:var(--ag-font-display);font-size:1.65rem;font-weight:800;letter-spacing:-0.03em;color:#fff;line-height:1.15;margin-bottom:2rem;}
  .ag-modal-label{font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(160,140,255,0.5);margin-bottom:0.35rem;}
  .ag-modal-value{font-family:var(--ag-font-display);font-size:1rem;font-weight:600;color:#fff;margin-bottom:1.4rem;}
  .ag-modal-value.accent{color:var(--ag-accent2);}
  .ag-modal-desc{font-size:0.8rem;line-height:1.7;color:rgba(200,185,255,0.55);font-weight:300;margin-bottom:1.6rem;}
  .ag-modal-close-btn{width:100%;padding:0.85rem;background:rgba(139,92,246,0.07);border:1px solid rgba(139,92,246,0.18);border-radius:12px;color:var(--ag-text);font-family:var(--ag-font-display);font-size:0.8rem;font-weight:600;letter-spacing:0.04em;cursor:pointer;transition:background 0.25s ease,border-color 0.25s ease;margin-top:auto;}
  .ag-modal-close-btn:hover{background:rgba(139,92,246,0.14);border-color:rgba(139,92,246,0.35);}
  .ag-seek{width:100%;height:6px;background:rgba(139,92,246,0.18);border-radius:6px;cursor:pointer;position:relative;margin-bottom:1.5rem;transition:height 0.2s ease;}
  .ag-seek:hover{height:8px;}
  .ag-seek-fill{height:100%;background:linear-gradient(90deg,#8B5CF6,#C084FC);border-radius:6px;position:relative;box-shadow:0 0 8px rgba(139,92,246,0.5);}
  .ag-seek-thumb{position:absolute;right:-6px;top:50%;transform:translateY(-50%);width:12px;height:12px;background:#fff;border-radius:50%;opacity:1;box-shadow:0 0 10px rgba(139,92,246,0.8),0 2px 4px rgba(0,0,0,0.5);transition:opacity 0.2s ease,transform 0.2s ease;}
  .ag-seek:hover .ag-seek-thumb{transform:translateY(-50%) scale(1.2);}
  .ag-ctrl-btn{width:42px;height:42px;border-radius:12px;background:rgba(15,10,35,0.55);backdrop-filter:blur(12px) saturate(180%);border:1px solid rgba(139,92,246,0.28);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3),inset 0 1px 1px rgba(255,255,255,0.1);transition:all 0.3s cubic-bezier(0.16,1,0.3,1);}
  .ag-ctrl-btn:hover{background:rgba(139,92,246,0.18);border-color:rgba(139,92,246,0.55);box-shadow:0 0 15px rgba(139,92,246,0.25),inset 0 1px 1px rgba(255,255,255,0.2);transform:translateY(-2px);}
  .ag-ctrl-btn:active{transform:translateY(1px) scale(0.96);}
  .ag-video-controls{position:absolute;bottom:0;left:0;right:0;padding:1.5rem;background:linear-gradient(to top,rgba(0,0,10,0.96) 0%,transparent 100%);}
  .ag-mobile-overlay{position:absolute;inset:0;display:flex;flex-direction:column;pointer-events:none;}
  @media(min-width:768px){.ag-mobile-overlay{display:none;}}
  .ag-scrollbar::-webkit-scrollbar{width:3px;}
  .ag-scrollbar::-webkit-scrollbar-track{background:transparent;}
  .ag-scrollbar::-webkit-scrollbar-thumb{background:rgba(139,92,246,0.28);border-radius:4px;}
  .fixed.bottom-6.right-6.z-50,
  .fixed.bottom-24.right-6.z-50 {
    transition: opacity 0.4s ease, transform 0.4s ease !important;
  }
  body.ag-modal-open .fixed.bottom-6.right-6.z-50,
  body.ag-modal-open .fixed.bottom-24.right-6.z-50,
  body.ag-modal-open .fixed.bottom-44.right-6.z-50 {
    opacity: 0 !important;
    pointer-events: none !important;
  }
  @media(max-width:768px){
    .grid{gap:2.25rem !important;}
    .ag-card-meta{transform:translateY(0) !important;padding:1.25rem !important;}
    .ag-card-eyebrow{opacity:0.95 !important;}
    .ag-card-metric{display:none !important;}
    .fixed.bottom-6.right-6.z-50{bottom:1.25rem !important;right:1.25rem !important;}
    .fixed.bottom-24.right-6.z-50{bottom:5.25rem !important;right:1.25rem !important;}
    .fixed.bottom-6.right-6.z-50 button,
    .fixed.bottom-6.right-6.z-50 a,
    .fixed.bottom-24.right-6.z-50 button,
    .fixed.bottom-24.right-6.z-50 a{
      width: 46px !important;
      height: 46px !important;
    }
    .fixed.bottom-6.right-6.z-50 svg,
    .fixed.bottom-24.right-6.z-50 svg{
      width: 18px !important;
      height: 18px !important;
    }
  }
`;

const STARS = Array.from({ length: 28 }, (_, i) => ({
  key: i,
  w: Math.random() * 1.5 + 0.5,
  top: Math.random() * 100,
  left: Math.random() * 100,
  o: (Math.random() * 0.25 + 0.08).toFixed(2),
  d: (Math.random() * 6 + 4).toFixed(1) + 's',
  delay: (Math.random() * 5).toFixed(1) + 's',
}));

const portfolioData = [
  { id: 1, title: "The Weight of Education", category: "Storytelling & Documentary", video: naadheStory, previewStart: 3, previewEnd: 8, description: "A silent, desaturated examination of institutional expectations. This edit prioritizes reflective pacing and subtle ambient sound to hold the viewer inside the psychological reality of academic pressure.", metric: "Storytelling & Documentary", style: "Social Commentary", retention: "Reflective Pace" },
  { id: 2, title: "Shadows Within Campus", category: "Storytelling & Documentary", video: raggingAwareness, previewStart: 5, previewEnd: 12, description: "An atmospheric investigation into the unseen culture of academic hazing. The narrative structure controls information pacing, letting tension build naturally through deliberate cuts.", metric: "Storytelling & Documentary", style: "Documentary", retention: "Atmospheric Tension" },
  { id: 3, title: "Fragments of Love", category: "Storytelling & Documentary", video: trueLoveRetention, previewStart: 4, previewEnd: 10, description: "A poetic, highly stylized mosaic of human connection. Structures visual memories as brief, vivid sequences to evoke nostalgia and emotional permanence.", metric: "Storytelling & Documentary", style: "Cinematic Essay", retention: "Nostalgia Arc" },
  { id: 4, title: "Precision at the Crease", category: "Sports & Performance", video: davidWarnerBat, previewStart: 2.5, previewEnd: 8, description: "A kinetic, analytical study of batting technique and body alignment. Employs crisp visual timing and synchronized typography to map split-second elite performance.", metric: "Sports & Performance", style: "Kinetic Analysis", retention: "Precision Timing" },
  { id: 5, title: "StumpMic Launch Teaser", category: "Sports & Performance", video: stumpmicLaunch, previewStart: 1.2, previewEnd: 6, description: "A high-tempo, rhythmic edit constructed for the StumpMic platform premiere. Features intense sound design and rapid frame delivery to communicate momentum.", metric: "Sports & Performance", style: "Kinetic Teaser", retention: "Rhythmic Impact" },
  { id: 6, title: "Built From Vision", category: "Social Commentary", video: wealthAffirmation, previewStart: 4.5, previewEnd: 11, description: "A striking typographic exploration of ambition and material reality. Fuses rich visual weight with sparse narration to craft an immersive motivational essay.", metric: "Social Commentary", style: "Typographic Essay", retention: "Motivational Pacing" },
  { id: 7, title: "The Umpire’s Call", category: "Sports & Performance", video: cricketUmpiring, previewStart: 3, previewEnd: 9, description: "A disciplined biographical study tracing the pressure and poise of professional officiating. Merges live-match tracking with slow, deliberate pacing.", metric: "Sports & Performance", style: "Sports Narrative", retention: "Disciplined Pace" },
  { id: 8, title: "The Silent Evidence", category: "Storytelling & Documentary", video: cinematicRetention, previewStart: 5, previewEnd: 12, description: "An experimental narrative built entirely around subtle spatial cues and silent cuts. Relies on negative space and visual flow to sustain psychological tension.", metric: "Storytelling & Documentary", style: "Experimental Flow", retention: "Visual Resonance" },
  { id: 9, title: "Echoes After Goodbye", category: "Social Commentary", video: heartbreakRetention, previewStart: 4.2, previewEnd: 9, description: "A poignant story structured as a psychological rewind. Controls the sequence order to slowly unpack the heavy architecture of grief and loss.", metric: "Social Commentary", style: "Psychological Rewind", retention: "Emotional Arc" },
  { id: 10, title: "Patterns of Attachment", category: "Social Commentary", video: trueLoveBehavior, previewStart: 3.5, previewEnd: 8, description: "An analytical documentary dissecting relationship psychology. Uses desaturated split screens and structured title cards to pace complex behavioral ideas.", metric: "Social Commentary", style: "Documentary Commentary", retention: "Behavioral Rhythm" }
];

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      video.currentTime = project.previewStart || 0.1;
      video.play().catch(() => { });
    }
  };

  const handleMouseLeave = (projectId) => {
    if (window.matchMedia("(max-width: 768px)").matches) return;
    const video = videoRefs[projectId];
    const project = portfolioData.find(p => p.id === projectId);

    if (video && project) {
      setFadingVideos(prev => ({ ...prev, [projectId]: true }));
      video.playbackRate = 0.5; // cinematic slowdown

      const timeoutId = setTimeout(() => {
        if (video) {
          video.pause();
          video.currentTime = project.previewStart || 0.1;
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
      video.play().catch(() => { });
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
      document.exitFullscreen().catch(() => { });
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

  const handleMuteToggle = async () => {
    const video = modalVideoRef.current;
    if (video) {
      if (isMuted) {
        // Unmute
        video.muted = false;
        video.volume = 1.0;
        console.log("Muted:", video.muted);
        console.log("Volume:", video.volume);
        try {
          await video.play();
          setIsMuted(false);
          setModalVideoPlaying(true);
        } catch (error) {
          console.log("Audio unmute playback call was blocked:", error);
        }
      } else {
        // Mute
        video.muted = true;
        console.log("Muted:", video.muted);
        console.log("Volume:", video.volume);
        setIsMuted(true);
      }
    }
  };

  const handleFullscreenToggle = useCallback(() => {
    const videoContainer = document.querySelector('.video-player-wrapper');
    if (!document.fullscreenElement && videoContainer) {
      videoContainer.requestFullscreen({ navigationUI: 'hide' }).catch(() => { });
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
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

  useEffect(() => {
    if (selectedProject) {
      document.body.classList.add('ag-modal-open');
    } else {
      document.body.classList.remove('ag-modal-open');
    }
    return () => {
      document.body.classList.remove('ag-modal-open');
    };
  }, [selectedProject]);

  return (
    <div className="ag-root pt-20 pb-20 tablet:pt-32 tablet:pb-48">
      <style>{AG_STYLES}</style>

      {/* Starfield — 28 restrained stars */}
      <div className="ag-stars" aria-hidden="true">
        {STARS.map(s => (
          <div key={s.key} className="ag-star" style={{
            width: s.w, height: s.w,
            top: `${s.top}%`, left: `${s.left}%`,
            '--o': s.o, '--d': s.d, animationDelay: s.delay,
          }} />
        ))}
      </div>

      {/* Nebula — reduced opacity/size */}
      <div className="ag-nebula" style={{ width: 550, height: 550, top: '-12%', right: '-15%', background: 'radial-gradient(circle,rgba(80,40,200,0.12) 0%,transparent 70%)' }} aria-hidden="true" />
      <div className="ag-nebula" style={{ width: 400, height: 400, bottom: '8%', left: '-10%', background: 'radial-gradient(circle,rgba(100,50,220,0.08) 0%,transparent 70%)', animationDuration: '26s', animationDelay: '-10s' }} aria-hidden="true" />

      <div className="max-w-[1280px] mx-auto px-6" style={{ position: 'relative', zIndex: 1 }}>

        {/* Heading */}
        <div className="text-center mb-24">
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="ag-heading ag-heading-glow text-4xl mobile:text-5xl tablet:text-7xl mb-6"
          >
            The edit speaks.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="ag-subtext text-xl max-w-2xl mx-auto"
          >
            Scroll through. Feel the difference.
          </motion.p>
        </div>

        {/* Tabs */}
        <motion.div layout initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.6 }} className="flex flex-wrap items-center justify-center mb-16 max-w-3xl mx-auto">
          <LayoutGroup>
            <div className="ag-tabs">
              {categories.map(cat => (
                <motion.button key={cat} whileTap={{ scale: 0.94 }} onClick={() => setActiveCategory(cat)} className={`ag-tab ${activeCategory === cat ? 'active' : ''}`}>
                  {cat}
                  {activeCategory === cat && (
                    <motion.div layoutId="ag-tab-underline" className="ag-tab-underline" initial={false} transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                  )}
                </motion.button>
              ))}
            </div>
          </LayoutGroup>
        </motion.div>

        {/* Grid */}
        <motion.div layout className={`grid mb-16 ${filteredProjects.length === 1 ? 'grid-cols-1 max-w-md mx-auto gap-10' :
          filteredProjects.length === 2 ? 'grid-cols-1 tablet:grid-cols-2 max-w-5xl mx-auto gap-12 tablet:gap-16' :
            'grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6 tablet:gap-10'
          }`}>
          <AnimatePresence>
            {filteredProjects.map((project, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 10 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
                key={project.id}
                className={`relative w-full aspect-[9/16] ${i % 3 === 1 ? 'desktop:translate-y-12' : ''} ${i % 2 === 1 ? 'tablet:translate-y-6 desktop:translate-y-0' : ''}`}
                style={{ perspective: 800 }}
              >
                <div
                  className="ag-card w-full h-full"
                  onClick={() => setSelectedProject(project)}
                  onMouseEnter={() => handleMouseEnter(project.id)}
                  onMouseLeave={() => handleMouseLeave(project.id)}
                >
                  <video
                    ref={el => videoRefs[project.id] = el}
                    src={project.video}
                    poster={project.poster}
                    muted playsInline preload="metadata"
                    onLoadedMetadata={(e) => {
                      const isMobile = window.matchMedia("(max-width: 768px)").matches;
                      if (!isMobile || !project.poster) {
                        e.target.currentTime = project.previewStart || 0.1;
                      }
                    }}
                    onTimeUpdate={(e) => {
                      if (window.matchMedia("(max-width: 768px)").matches) return;
                      const video = e.target;
                      if (project.previewEnd && video.currentTime >= project.previewEnd && !fadingVideos[project.id]) {
                        setFadingVideos(prev => ({ ...prev, [project.id]: true }));
                        video.playbackRate = 0.5;
                        const tid = setTimeout(() => {
                          if (video) { video.pause(); video.currentTime = project.previewStart || 0.1; video.playbackRate = 1.0; setFadingVideos(prev => ({ ...prev, [project.id]: false })); }
                        }, 700);
                        previewTimeoutsRef.current[project.id] = tid;
                      }
                    }}
                    className={`ag-card-video ${fadingVideos[project.id] ? 'fading' : 'visible'}`}
                  />
                  <div className="ag-card-gradient" />
                  <div className="ag-card-meta">
                    {isMobile ? (
                      <>
                        <span className="ag-card-eyebrow">{project.category}</span>
                        <h3 className="ag-card-title">{project.title}</h3>
                      </>
                    ) : (
                      <>
                        <span className="ag-card-eyebrow">{project.category}</span>
                        <h3 className="ag-card-title">{project.title}</h3>
                        <p className="ag-card-metric">{project.metric}</p>
                      </>
                    )}
                  </div>
                  <div className="ag-card-play">
                    <Play style={{ width: 18, height: 18, color: '#fff', marginLeft: 2 }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center text-sm italic mt-8" style={{ color: 'var(--ag-muted)', fontFamily: 'var(--ag-font-body)' }}>
          More work available on request.
        </motion.p>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="ag-modal-backdrop" onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 0.97, y: typeof window !== 'undefined' && window.innerWidth < 768 ? 100 : 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 0.97, y: typeof window !== 'undefined' && window.innerWidth < 768 ? 100 : 24, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              drag="y" dragConstraints={{ top: 0 }} dragElastic={0.2}
              onDragEnd={(e, info) => { if (info.offset.y > 100) handleCloseModal(); }}
              className="ag-modal"
            >
              {/* Video side */}
              <div className="ag-modal-video-side" onMouseEnter={handleModalMouseEnter} onMouseLeave={handleModalMouseLeave}>
                <div ref={fullscreenContainerRef} className="video-player-wrapper relative w-full flex items-center justify-center bg-black overflow-hidden">
                  <video
                    ref={modalVideoRef} src={selectedProject.video} muted={isMuted} playsInline preload="metadata"
                    className="ag-modal-video"
                    style={isFullscreen ? { height: '100vh', maxHeight: 'none' } : {}}
                    onClick={handleVideoClick}
                    onPlay={() => setModalVideoPlaying(true)}
                    onPause={() => setModalVideoPlaying(false)}
                    onEnded={() => setModalVideoPlaying(false)}
                  />
                  <motion.div animate={{ opacity: !modalVideoPlaying ? 1 : 0.1 }} transition={{ duration: 0.3 }} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to top,rgba(0,0,14,0.92) 0%,rgba(5,4,25,0.25) 40%,transparent 100%)' }} />
                  <motion.div animate={{ opacity: !modalVideoPlaying ? 0.8 : 0.03 }} transition={{ duration: 0.3 }} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at center,rgba(80,40,180,0.14) 0%,transparent 68%)' }} />

                  <AnimatePresence>
                    {!modalVideoPlaying && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }} onClick={handleModalPlay}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }} style={{ width: 80, height: 80, borderRadius: '50%', border: '1px solid rgba(139,92,246,0.4)', background: 'rgba(20,10,55,0.55)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(100,60,200,0.3)' }}>
                          <Play style={{ width: 32, height: 32, color: '#fff', marginLeft: 3, fill: 'rgba(255,255,255,0.2)' }} />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {showControls && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.22 }} className="hidden tablet:block ag-video-controls" style={{ zIndex: 50 }}>
                        <div ref={seekBarRef} className="ag-seek" onClick={handleSeekBarClick} onMouseDown={handleSeekBarMouseDown} onTouchStart={e => { e.preventDefault(); handleSeekBarMouseDown(e); }}>
                          <div className="ag-seek-fill" style={{ width: `${progress}%` }}><div className="ag-seek-thumb" /></div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', gap: '0.6rem' }}>
                            <button type="button" className="ag-ctrl-btn" onClick={modalVideoPlaying ? handleModalPause : handleModalPlay}>
                              {modalVideoPlaying ? <Pause style={{ width: 15, height: 15 }} /> : <Play style={{ width: 15, height: 15, marginLeft: 1 }} />}
                            </button>
                            <button type="button" className="ag-ctrl-btn" onClick={handleMuteToggle}>
                              {isMuted ? <VolumeX style={{ width: 15, height: 15 }} /> : <Volume2 style={{ width: 15, height: 15 }} />}
                            </button>
                          </div>
                          <button type="button" className="ag-ctrl-btn" onClick={handleFullscreenToggle}>
                            {isFullscreen ? <Minimize style={{ width: 15, height: 15 }} /> : <Maximize style={{ width: 15, height: 15 }} />}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Desktop meta */}
              <div className="ag-modal-meta-side">
                <button type="button" onClick={handleCloseModal} className="ag-ctrl-btn" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}>
                  <X style={{ width: 16, height: 16 }} />
                </button>
                <div className="ag-scrollbar" style={{ overflowY: 'auto', flex: 1, paddingRight: '0.25rem' }}>
                  <p className="ag-modal-eyebrow">{selectedProject.category}</p>
                  <h3 className="ag-modal-title">{selectedProject.title}</h3>
                  {selectedProject.description && (
                    <div style={{ marginBottom: '1.4rem' }}>
                      <p className="ag-modal-label">Description</p>
                      <p className="ag-modal-desc">{selectedProject.description}</p>
                    </div>
                  )}
                  <div><p className="ag-modal-label">Craft Discipline</p><p className="ag-modal-value">{selectedProject.style}</p></div>
                  <div><p className="ag-modal-label">Narrative Focus</p><p className="ag-modal-value accent">{selectedProject.retention}</p></div>
                </div>
                <button type="button" className="ag-modal-close-btn" onClick={handleCloseModal}>Close Preview</button>
              </div>

              {/* Mobile close */}
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} type="button" onClick={handleCloseModal} className="ag-ctrl-btn" style={{ position: 'absolute', top: 'max(1.5rem,env(safe-area-inset-top))', right: '1.25rem', zIndex: 60, display: 'flex' }}>
                <X style={{ width: 17, height: 17 }} />
              </motion.button>

              {/* Mobile overlay */}
              <AnimatePresence>
                {(showControls || !modalVideoPlaying) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="ag-mobile-overlay" style={{ zIndex: 40 }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,14,0.96) 0%,rgba(4,3,20,0.45) 50%,transparent 100%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem', paddingBottom: 'max(2rem,calc(env(safe-area-inset-bottom)+1rem))', justifyContent: 'flex-end', pointerEvents: 'none' }}>

                      {!modalVideoPlaying && (
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.3, delay: 0.08 }} style={{ pointerEvents: 'auto', marginTop: 'auto', marginBottom: '1.5rem', maxHeight: '45vh', overflowY: 'auto' }} className="ag-scrollbar">
                          <p className="ag-modal-eyebrow">{selectedProject.category}</p>
                          <h3 className="ag-modal-title" style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>{selectedProject.title}</h3>
                          {selectedProject.description && (
                            <div style={{ marginBottom: '1rem' }}>
                              <p className="ag-modal-label">Description</p>
                              <p className="ag-modal-desc">{selectedProject.description}</p>
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '2rem' }}>
                            <div><p className="ag-modal-label">Craft Discipline</p><p className="ag-modal-value" style={{ fontSize: '0.85rem' }}>{selectedProject.style}</p></div>
                            <div><p className="ag-modal-label">Narrative Focus</p><p className="ag-modal-value accent" style={{ fontSize: '0.85rem' }}>{selectedProject.retention}</p></div>
                          </div>
                        </motion.div>
                      )}

                      <div ref={mobileSeekBarRef} className="ag-seek" style={{ pointerEvents: 'auto', marginBottom: '1.25rem', marginTop: modalVideoPlaying ? 'auto' : '0' }} onClick={handleSeekBarClick} onMouseDown={handleSeekBarMouseDown} onTouchStart={e => { e.preventDefault(); handleSeekBarMouseDown(e); }}>
                        <div className="ag-seek-fill" style={{ width: `${progress}%` }}><div className="ag-seek-thumb" /></div>
                      </div>
                      <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                          <button type="button" className="ag-ctrl-btn" onClick={modalVideoPlaying ? handleModalPause : handleModalPlay}>
                            {modalVideoPlaying ? <Pause style={{ width: 15, height: 15 }} /> : <Play style={{ width: 15, height: 15, marginLeft: 1 }} />}
                          </button>
                          <button type="button" className="ag-ctrl-btn" onClick={handleMuteToggle}>
                            {isMuted ? <VolumeX style={{ width: 15, height: 15 }} /> : <Volume2 style={{ width: 15, height: 15 }} />}
                          </button>
                        </div>
                        <button type="button" className="ag-ctrl-btn" onClick={handleFullscreenToggle}>
                          {isFullscreen ? <Minimize style={{ width: 15, height: 15 }} /> : <Maximize style={{ width: 15, height: 15 }} />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Portfolio;
